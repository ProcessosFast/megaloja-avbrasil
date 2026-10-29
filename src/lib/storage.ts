// Estado editável + persistência.
// Ordem de prioridade: /api/state (Upstash Redis na Vercel, compartilhado entre todos) >
// window.claude (artifact db, quando embutido como artifact) > localStorage (só este navegador).
import { useCallback, useEffect, useRef, useState } from "react";
import type { Status } from "@/data/projeto";

const LOCAL_KEY = "mega-loja-av-brasil";
// Marca que as alterações deste navegador já foram somadas ao banco.
const MIGRADO_KEY = "mega-loja-av-brasil:migrado";
const API = "/api/state";
const INTERVALO_SYNC = 15_000;

export interface AcaoPatch {
  s?: Status;
  r?: string;
  // Prazo definido pelo site (só para ações sem prazo nos dados base).
  p?: string;
  atualizadoEm?: string;
}

export interface DecisaoPatch {
  status?: string;
  data?: string;
  atualizadoEm?: string;
}

// Decisão criada manualmente pelo usuário (não faz parte dos dados base do projeto).
export interface DecisaoCustom {
  titulo: string;
  aprovador: string;
  prazo: string;
  descricao: string;
  impacto: string;
  status: string;
  data: string;
  criadoEm: string;
  atualizadoEm?: string;
}

export type EstadoAcoes = Record<string, AcaoPatch>;
export type EstadoDecisoes = Record<string, DecisaoPatch>;
export type EstadoDecisoesCustom = Record<string, DecisaoCustom>;

export interface Estado {
  acoes: EstadoAcoes;
  decisoes: EstadoDecisoes;
  decisoesCustom: EstadoDecisoesCustom;
}

type Colecao = "acoes" | "decisoes" | "decisoesCustom";
const COLECOES: Colecao[] = ["acoes", "decisoes", "decisoesCustom"];
type Modo = "carregando" | "online" | "local";

interface ClaudeCollection {
  onSnapshot: (
    cb: (snap: { docs: { id: string; data: () => unknown }[] }) => void,
    onError?: (e: { code?: string }) => void,
  ) => void;
  doc: (id: string) => {
    set: (data: unknown, opts?: { merge?: boolean }) => Promise<void>;
    delete: () => Promise<void>;
  };
}

interface ClaudeDb {
  collection: (name: string) => ClaudeCollection;
}

declare global {
  interface Window {
    claude?: {
      use: (capability: string) => Promise<unknown>;
    };
  }
}

function estadoVazio(): Estado {
  return { acoes: {}, decisoes: {}, decisoesCustom: {} };
}

function lerLocal(): Estado {
  try {
    const s = JSON.parse(localStorage.getItem(LOCAL_KEY) || "null");
    if (s) return { acoes: s.acoes || {}, decisoes: s.decisoes || {}, decisoesCustom: s.decisoesCustom || {} };
  } catch {
    // ignora estado local corrompido
  }
  return estadoVazio();
}

function gravarLocal(estado: Estado) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(estado));
  } catch {
    // navegador sem localStorage; o banco continua valendo
  }
}

type Patches = Partial<Record<Colecao, Record<string, unknown>>>;

async function lerApi(): Promise<Estado> {
  const r = await fetch(API, { cache: "no-store" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const d = (await r.json()) as Partial<Estado>;
  return { acoes: d.acoes || {}, decisoes: d.decisoes || {}, decisoesCustom: d.decisoesCustom || {} };
}

async function gravarApi(patches: Patches) {
  const r = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patches }),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
}

// Registros que só existem neste navegador (ou que aqui são mais recentes) e ainda não estão no banco.
function pendentesLocais(local: Estado, remoto: Estado): Patches | null {
  const patches: Patches = {};
  let algum = false;
  for (const col of COLECOES) {
    for (const [id, dados] of Object.entries(local[col])) {
      const r = remoto[col][id] as { atualizadoEm?: string } | undefined;
      const l = dados as { atualizadoEm?: string };
      if (!r || (l.atualizadoEm && (!r.atualizadoEm || l.atualizadoEm > r.atualizadoEm))) {
        (patches[col] ??= {})[id] = dados;
        algum = true;
      }
    }
  }
  return algum ? patches : null;
}

export function useEstado() {
  const [estado, setEstado] = useState<Estado>(lerLocal);
  const [modo, setModo] = useState<Modo>("carregando");
  const [podeEditar, setPodeEditar] = useState(true);
  const dbRef = useRef<ClaudeDb | null>(null);
  const apiRef = useRef(false);
  // Muda a cada gravação local, para descartar leituras do banco que começaram antes dela.
  const versaoRef = useRef(0);
  const estadoRef = useRef(estado);
  estadoRef.current = estado;

  useEffect(() => {
    let cancelado = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    async function sincronizar() {
      const versao = versaoRef.current;
      try {
        const remoto = await lerApi();
        if (!cancelado && versao === versaoRef.current) {
          setEstado(remoto);
          gravarLocal(remoto);
        }
      } catch {
        // sem conexão no momento; tenta de novo no próximo ciclo
      }
    }

    function aoVoltar() {
      if (document.visibilityState === "visible") sincronizar();
    }

    async function iniciarApi(): Promise<boolean> {
      try {
        let remoto = await lerApi();
        if (cancelado) return true;

        if (!localStorage.getItem(MIGRADO_KEY)) {
          const pendentes = pendentesLocais(lerLocal(), remoto);
          if (pendentes) {
            await gravarApi(pendentes);
            remoto = await lerApi();
          }
          localStorage.setItem(MIGRADO_KEY, "1");
        }
        if (cancelado) return true;

        apiRef.current = true;
        setEstado(remoto);
        gravarLocal(remoto);
        setModo("online");
        timer = setInterval(sincronizar, INTERVALO_SYNC);
        document.addEventListener("visibilitychange", aoVoltar);
        return true;
      } catch {
        return false;
      }
    }

    async function iniciarClaude(): Promise<boolean> {
      try {
        if (!window.claude) throw new Error("sem window.claude");
        const db = (await window.claude.use("db")) as ClaudeDb | undefined;
        if (!db || cancelado) throw new Error("db indisponível");
        dbRef.current = db;

        const user = (await window.claude.use("user")) as { can: (p: string) => Promise<boolean> } | undefined;
        if (user) {
          const pode = await user.can("data.write");
          if (pode === false && !cancelado) setPodeEditar(false);
        }

        const falha = (e: { code?: string }) => {
          if (e && (e.code === "revoked" || e.code === "not_granted")) setPodeEditar(false);
        };

        for (const col of COLECOES) {
          db.collection(col).onSnapshot((snap) => {
            const o: Record<string, unknown> = {};
            snap.docs.forEach((x) => {
              o[x.id] = x.data();
            });
            if (!cancelado) setEstado((prev) => ({ ...prev, [col]: o }));
          }, falha);
        }

        if (!cancelado) setModo("online");
        return true;
      } catch {
        return false;
      }
    }

    async function iniciar() {
      if (await iniciarApi()) return;
      if (await iniciarClaude()) return;
      if (!cancelado) {
        setEstado(lerLocal());
        setModo("local");
      }
    }

    iniciar();
    return () => {
      cancelado = true;
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", aoVoltar);
    };
  }, []);

  const salvar = useCallback(
    async (col: Colecao, id: string, patch: AcaoPatch | DecisaoPatch | Partial<DecisaoCustom>) => {
      const antes = estadoRef.current[col][id];
      const novo = { ...(antes || {}), ...patch, atualizadoEm: new Date().toISOString() };

      setEstado((prev) => {
        const proximo: Estado = { ...prev, [col]: { ...prev[col], [id]: novo } };
        if (modo !== "online" || apiRef.current) gravarLocal(proximo);
        return proximo;
      });
      versaoRef.current++;

      if (apiRef.current) {
        try {
          await gravarApi({ [col]: { [id]: novo } });
        } catch {
          // falha de escrita remota; estado local já foi atualizado
        }
      } else if (dbRef.current) {
        try {
          await dbRef.current.collection(col).doc(id).set(patch, { merge: true });
        } catch {
          // falha de escrita remota; estado local já foi atualizado
        }
      }
    },
    [modo],
  );

  const remover = useCallback(
    async (col: Colecao, id: string) => {
      setEstado((prev) => {
        const alvo = { ...prev[col] };
        delete alvo[id];
        const proximo: Estado = { ...prev, [col]: alvo };
        if (modo !== "online" || apiRef.current) gravarLocal(proximo);
        return proximo;
      });
      versaoRef.current++;

      if (apiRef.current) {
        try {
          await gravarApi({ [col]: { [id]: null } });
        } catch {
          // falha de escrita remota; estado local já foi atualizado
        }
      } else if (dbRef.current) {
        try {
          await dbRef.current.collection(col).doc(id).delete();
        } catch {
          // falha de escrita remota; estado local já foi atualizado
        }
      }
    },
    [modo],
  );

  return { estado, modo, podeEditar, salvar, remover };
}
