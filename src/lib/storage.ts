// Estado editável + persistência — portado de legacy/INDEX.html (linhas 486-556, 503-524).
// Tenta window.claude (artifact db) quando disponível; senão cai para localStorage.
import { useCallback, useEffect, useRef, useState } from "react";
import type { Status } from "@/data/projeto";

const LOCAL_KEY = "mega-loja-av-brasil";

export interface AcaoPatch {
  s?: Status;
  r?: string;
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
  localStorage.setItem(LOCAL_KEY, JSON.stringify(estado));
}

export function useEstado() {
  const [estado, setEstado] = useState<Estado>(() => lerLocal());
  const [modo, setModo] = useState<Modo>("carregando");
  const [podeEditar, setPodeEditar] = useState(true);
  const dbRef = useRef<ClaudeDb | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function iniciar() {
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

        db.collection("acoes").onSnapshot((snap) => {
          const o: EstadoAcoes = {};
          snap.docs.forEach((x) => {
            o[x.id] = x.data() as AcaoPatch;
          });
          if (!cancelado) setEstado((prev) => ({ ...prev, acoes: o }));
        }, falha);

        db.collection("decisoes").onSnapshot((snap) => {
          const o: EstadoDecisoes = {};
          snap.docs.forEach((x) => {
            o[x.id] = x.data() as DecisaoPatch;
          });
          if (!cancelado) setEstado((prev) => ({ ...prev, decisoes: o }));
        }, falha);

        db.collection("decisoesCustom").onSnapshot((snap) => {
          const o: EstadoDecisoesCustom = {};
          snap.docs.forEach((x) => {
            o[x.id] = x.data() as DecisaoCustom;
          });
          if (!cancelado) setEstado((prev) => ({ ...prev, decisoesCustom: o }));
        }, falha);

        if (!cancelado) setModo("online");
      } catch {
        if (!cancelado) {
          setEstado(lerLocal());
          setModo("local");
        }
      }
    }

    iniciar();
    return () => {
      cancelado = true;
    };
  }, []);

  const salvar = useCallback(
    async (col: Colecao, id: string, patch: AcaoPatch | DecisaoPatch | Partial<DecisaoCustom>) => {
      setEstado((prev) => {
        const alvo = prev[col];
        const antes = alvo[id];
        const novo = { ...(antes || {}), ...patch, atualizadoEm: new Date().toISOString() };
        const proximo: Estado = { ...prev, [col]: { ...alvo, [id]: novo } };
        if (modo !== "online") gravarLocal(proximo);
        return proximo;
      });

      if (dbRef.current) {
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
        if (modo !== "online") gravarLocal(proximo);
        return proximo;
      });

      if (dbRef.current) {
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
