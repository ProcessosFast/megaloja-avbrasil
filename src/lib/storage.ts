// Estado editável + persistência.
// Ordem de prioridade: Supabase (compartilhado entre todos os visitantes) >
// window.claude (artifact db, quando embutido como artifact) > localStorage (só este navegador).
import { useCallback, useEffect, useRef, useState } from "react";
import type { Status } from "@/data/projeto";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

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
  localStorage.setItem(LOCAL_KEY, JSON.stringify(estado));
}

interface LinhaEstado {
  colecao: Colecao;
  id: string;
  dados: AcaoPatch | DecisaoPatch | DecisaoCustom;
}

export function useEstado() {
  const [estado, setEstado] = useState<Estado>(() => (supabase ? estadoVazio() : lerLocal()));
  const [modo, setModo] = useState<Modo>("carregando");
  const [podeEditar, setPodeEditar] = useState(true);
  const dbRef = useRef<ClaudeDb | null>(null);
  const estadoRef = useRef(estado);
  estadoRef.current = estado;

  useEffect(() => {
    let cancelado = false;
    let canal: RealtimeChannel | null = null;

    async function iniciarSupabase(): Promise<boolean> {
      if (!supabase) return false;
      try {
        const { data, error } = await supabase.from("estado").select("colecao,id,dados");
        if (error) throw error;
        if (cancelado) return true;

        const novo = estadoVazio();
        for (const row of (data ?? []) as LinhaEstado[]) {
          if (COLECOES.includes(row.colecao)) {
            (novo[row.colecao] as Record<string, unknown>)[row.id] = row.dados;
          }
        }
        setEstado(novo);
        setModo("online");

        canal = supabase
          .channel("estado-sync")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "estado" },
            (payload) => {
              const linha = (payload.new ?? payload.old) as LinhaEstado | undefined;
              if (!linha || !COLECOES.includes(linha.colecao)) return;
              setEstado((prev) => {
                const alvo = { ...prev[linha.colecao] } as Record<string, unknown>;
                if (payload.eventType === "DELETE") {
                  delete alvo[linha.id];
                } else {
                  alvo[linha.id] = (payload.new as LinhaEstado).dados;
                }
                return { ...prev, [linha.colecao]: alvo };
              });
            },
          )
          .subscribe();

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
      if (await iniciarSupabase()) return;
      if (await iniciarClaude()) return;
      if (!cancelado) {
        setEstado(lerLocal());
        setModo("local");
      }
    }

    iniciar();
    return () => {
      cancelado = true;
      if (canal && supabase) supabase.removeChannel(canal);
    };
  }, []);

  const salvar = useCallback(
    async (col: Colecao, id: string, patch: AcaoPatch | DecisaoPatch | Partial<DecisaoCustom>) => {
      const antes = estadoRef.current[col][id];
      const novo = { ...(antes || {}), ...patch, atualizadoEm: new Date().toISOString() };

      setEstado((prev) => {
        const proximo: Estado = { ...prev, [col]: { ...prev[col], [id]: novo } };
        if (modo !== "online") gravarLocal(proximo);
        return proximo;
      });

      if (supabase) {
        try {
          await supabase.from("estado").upsert(
            { colecao: col, id, dados: novo, atualizado_em: new Date().toISOString() },
            { onConflict: "colecao,id" },
          );
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
        if (modo !== "online") gravarLocal(proximo);
        return proximo;
      });

      if (supabase) {
        try {
          await supabase.from("estado").delete().eq("colecao", col).eq("id", id);
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
