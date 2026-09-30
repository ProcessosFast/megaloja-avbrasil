// Funções puras de domínio — portadas de legacy/INDEX.html (linhas 474-501, 690-694).
import type { Acao, Decisao, Status } from "@/data/projeto";
import { ACOES, DECISOES } from "@/data/projeto";
import type { EstadoAcoes, EstadoDecisoes } from "@/lib/storage";

export const DAY = 86400000;

export const d = (s: string): Date => {
  const [y, m, dd] = s.split("-").map(Number);
  return new Date(y, m - 1, dd);
};

export const fmt = (s: string): string => {
  const x = d(s);
  return String(x.getDate()).padStart(2, "0") + "/" + String(x.getMonth() + 1).padStart(2, "0");
};

export const hoje = (() => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
})();

export const diff = (a: Date, b: Date): number => Math.round((a.getTime() - b.getTime()) / DAY);

export const iso = (t: Date): string =>
  t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");

export type Situacao = "Concluído" | "No prazo" | "Atenção" | "Atrasado";

export interface AcaoComEstado extends Acao {
  sit: Situacao;
}

export function situacao(x: { s: Status; p: string }): Situacao {
  if (x.s === "Concluído") return "Concluído";
  const falta = diff(d(x.p), hoje);
  if (falta < 0) return "Atrasado";
  if (falta <= 2) return "Atenção";
  return "No prazo";
}

export function acoesAtuais(estAcoes: EstadoAcoes): AcaoComEstado[] {
  return ACOES.map((x) => {
    const o = estAcoes[x.id] || {};
    const m: Acao = { ...x, s: o.s ?? x.s, r: o.r ?? x.r };
    return { ...m, sit: situacao(m) };
  });
}

export interface DecisaoAtual extends Decisao {
  status: string;
  data: string;
}

export function decisaoAtual(x: Decisao, estDecisoes: EstadoDecisoes): DecisaoAtual {
  const o = estDecisoes[x.id] || {};
  return { ...x, status: o.status || x.opcoes[0], data: o.data || "" };
}

export function decPendente(x: Decisao, estDecisoes: EstadoDecisoes): boolean {
  return decisaoAtual(x, estDecisoes).status === x.opcoes[0];
}

export function decisoesPendentesCount(estDecisoes: EstadoDecisoes): number {
  return DECISOES.filter((x) => decPendente(x, estDecisoes)).length;
}

export const pillClass: Record<Situacao, string> = {
  "Concluído": "s-ok",
  "No prazo": "s-prazo",
  "Atenção": "s-warn",
  "Atrasado": "s-late",
};
