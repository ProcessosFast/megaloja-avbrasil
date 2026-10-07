// Relatório para exportação (PDF via impressão do navegador).
// Gera um HTML independente com o estado atual do portal e abre em nova aba.
import { DECISOES, FRENTES, PROJETO } from "@/data/projeto";
import type { AcaoComEstado } from "@/lib/dominio";
import { d, decisaoAtual, diff, fmt, hoje } from "@/lib/dominio";
import type { EstadoDecisoes, EstadoDecisoesCustom } from "@/lib/storage";

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const SIT_CLASSE: Record<string, string> = {
  "Concluído": "ok",
  "No prazo": "neutro",
  "Atenção": "warn",
  "Atrasado": "late",
  "Sem prazo": "neutro",
  "Suspensa": "susp",
  "Cancelada": "susp",
};

function dataHora(isoStr: string): string {
  if (!isoStr) return "—";
  const x = new Date(isoStr);
  return isNaN(x.getTime()) ? isoStr : x.toLocaleDateString("pt-BR");
}

function tag(texto: string, classe: string): string {
  return `<span class="tag ${classe}">${esc(texto)}</span>`;
}

interface DadosRelatorio {
  acoes: AcaoComEstado[];
  estadoDecisoes: EstadoDecisoes;
  decisoesCustom: EstadoDecisoesCustom;
}

export function montarRelatorio({ acoes, estadoDecisoes, decisoesCustom }: DadosRelatorio): string {
  const emissao = new Date();
  const contar = (data: string, nome: string) => {
    const falta = diff(d(data), hoje);
    return falta > 0 ? `${falta} dias para a ${nome}` : falta === 0 ? `${nome} é hoje` : `${-falta} dias após a ${nome}`;
  };
  const contagem = contar(PROJETO.mudanca, "Mudança DCS");
  const contagemLojas = contar(PROJETO.mudancaLojas, "Mudança lojas Ramos e Realengo");

  const ativas = acoes.filter((x) => x.sit !== "Suspensa" && x.sit !== "Cancelada");
  const conc = acoes.filter((x) => x.s === "Concluído").length;
  const and = acoes.filter((x) => x.s === "Em andamento").length;
  const late = acoes.filter((x) => x.sit === "Atrasado");
  const warn = acoes.filter((x) => x.sit === "Atenção").length;
  const susp = acoes.filter((x) => x.sit === "Suspensa");
  const pct = ativas.length ? Math.round(((conc + and * 0.5) / ativas.length) * 100) : 0;

  const decBase = DECISOES.map((x) => {
    const a = decisaoAtual(x, estadoDecisoes);
    return { titulo: a.titulo, aprovador: a.aprovador, prazo: a.prazo, status: a.status, data: a.data, pend: a.status === a.opcoes[0], impacto: a.impacto };
  });
  const decCustom = Object.values(decisoesCustom).map((x) => {
    const status = x.status || "Aguardando decisão";
    return { titulo: x.titulo, aprovador: x.aprovador, prazo: x.prazo, status, data: x.data, pend: status === "Aguardando decisão", impacto: x.impacto };
  });
  const decisoes = [...decBase, ...decCustom];
  const decPend = decisoes.filter((x) => x.pend).length;

  const criticas = acoes.filter((x) => x.critico && x.s !== "Concluído");

  const prox = acoes
    .filter((x) => x.s !== "Concluído" && x.sit !== "Suspensa" && x.sit !== "Cancelada" && x.p && diff(d(x.p), hoje) >= 0 && diff(d(x.p), hoje) <= 7)
    .sort((a, b) => d(a.p).getTime() - d(b.p).getTime());

  const kpis: [string, string, string?][] = [
    ["Ações concluídas", `${conc}/${acoes.length}`],
    ["Em andamento", String(and)],
    ["Atrasadas", String(late.length), late.length ? "late" : undefined],
    ["Em atenção", String(warn)],
    ["Suspensas", String(susp.length)],
    ["Decisões pendentes", String(decPend)],
    ["Progresso geral", `${pct}%`],
  ];

  const linhaAcao = (x: AcaoComEstado) => `
    <tr>
      <td>${esc(x.a)}${x.marco ? ' <strong class="marco">MARCO</strong>' : ""}${x.critico && x.s !== "Concluído" ? ' <strong class="marco">MÁXIMA ATENÇÃO</strong>' : ""}</td>
      <td class="c">${fmt(x.i)}</td>
      <td class="c">${fmt(x.p)}</td>
      <td>${esc(x.r || "—")}</td>
      <td>${esc(x.s)}</td>
      <td>${tag(x.sit, SIT_CLASSE[x.sit] || "neutro")}</td>
      <td class="obs">${esc(x.o || "")}</td>
    </tr>`;

  const listaCurta = (titulo: string, itens: AcaoComEstado[], vazio: string) => `
    <div class="bloco">
      <h3>${titulo}</h3>
      ${
        itens.length
          ? `<ul>${itens.map((x) => `<li><span class="data">${fmt(x.p)}</span> ${esc(x.a)} <span class="muted">· ${esc(x.f)}${x.r ? ` · ${esc(x.r)}` : ""}</span></li>`).join("")}</ul>`
          : `<p class="muted">${vazio}</p>`
      }
    </div>`;

  const frentes = FRENTES.map((fr) => {
    const it = acoes.filter((x) => x.f === fr);
    if (!it.length) return "";
    const ok = it.filter((x) => x.s === "Concluído").length;
    return `
      <section class="frente">
        <h3>${esc(fr)} <span class="muted">· ${ok}/${it.length} concluídas</span></h3>
        <table>
          <thead><tr><th>Ação</th><th>Início</th><th>Prazo</th><th>Responsável</th><th>Status</th><th>Situação</th><th>Observações</th></tr></thead>
          <tbody>${it.map(linhaAcao).join("")}</tbody>
        </table>
      </section>`;
  }).join("");

  const decClasse = (x: (typeof decisoes)[number]) =>
    x.pend ? "neutro" : x.status.startsWith("Suspens") ? "warn" : /n[ãa]o |reprovad/i.test(x.status) ? "late" : "ok";

  const tabDecisoes = `
    <table>
      <thead><tr><th>Decisão</th><th>Decide</th><th>Prazo</th><th>Status</th><th>Registrada em</th><th>Impacto</th></tr></thead>
      <tbody>${decisoes
        .map(
          (x) => `
        <tr>
          <td>${esc(x.titulo)}</td>
          <td>${esc(x.aprovador || "—")}</td>
          <td class="c">${fmt(x.prazo)}</td>
          <td>${tag(x.status, decClasse(x))}</td>
          <td class="c">${x.pend ? "—" : dataHora(x.data)}</td>
          <td class="obs">${esc(x.impacto || "")}</td>
        </tr>`,
        )
        .join("")}</tbody>
    </table>`;

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Relatório · Implantação MEGA LOJA AV BRASIL · ${emissao.toLocaleDateString("pt-BR")}</title>
<style>
  @page { size: A4 landscape; margin: 12mm; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #fff; color: #111; font: 12px/1.45 "Segoe UI", Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .pagina { max-width: 1100px; margin: 0 auto; padding: 24px 16px 40px; }
  .barra { display: flex; justify-content: flex-end; gap: 8px; margin-bottom: 16px; }
  .barra button { font: 600 13px "Segoe UI", Arial, sans-serif; padding: 8px 16px; border-radius: 6px; border: 1px solid #C41E3A; background: #C41E3A; color: #fff; cursor: pointer; }
  .barra button.sec { background: #fff; color: #C41E3A; }
  header { border-bottom: 3px solid #C41E3A; padding-bottom: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
  .marca { font: 800 13px "Segoe UI", Arial, sans-serif; color: #C41E3A; letter-spacing: .08em; text-transform: uppercase; }
  h1 { font-size: 22px; margin: 4px 0 0; }
  h2 { font-size: 15px; margin: 22px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #ddd; text-transform: uppercase; letter-spacing: .04em; color: #C41E3A; }
  h3 { font-size: 13px; margin: 14px 0 6px; }
  .meta { text-align: right; color: #555; }
  .meta strong { display: block; font-size: 16px; color: #111; }
  .kpis { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
  .kpi { border: 1px solid #ddd; border-radius: 6px; padding: 8px 10px; }
  .kpi span { display: block; color: #666; font-size: 10.5px; text-transform: uppercase; letter-spacing: .03em; }
  .kpi b { font-size: 20px; }
  .kpi.late b { color: #b3121f; }
  .duas { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .bloco ul { margin: 0; padding-left: 18px; }
  .bloco li { margin: 2px 0; }
  .data { font-weight: 700; }
  .muted { color: #777; font-weight: 400; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { background: #f3f3f3; text-align: left; font-weight: 700; padding: 5px 6px; border-bottom: 1px solid #ccc; }
  td { padding: 5px 6px; border-bottom: 1px solid #eee; vertical-align: top; }
  td.c { text-align: center; white-space: nowrap; }
  td.obs { color: #444; max-width: 280px; }
  tr { page-break-inside: avoid; }
  .frente { page-break-inside: auto; }
  .tag { display: inline-block; padding: 1px 7px; border-radius: 10px; font-size: 10.5px; font-weight: 600; white-space: nowrap; }
  .tag.ok { background: #e3f4e8; color: #1c7a3a; }
  .tag.warn { background: #fff3d6; color: #9a6400; }
  .tag.late { background: #fde4e4; color: #b3121f; }
  .tag.neutro { background: #eee; color: #444; }
  .tag.susp { background: #eee; color: #555; border: 1px dashed #888; }
  .marco { color: #C41E3A; font-size: 10px; }
  .critico { border: 2px solid #b3121f; border-radius: 6px; padding: 8px 12px; background: #fff5f5; }
  .critico ul { margin: 0; padding-left: 18px; }
  .critico li { margin: 4px 0; }
  footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #ddd; color: #777; font-size: 10.5px; display: flex; justify-content: space-between; }
  @media print { .barra { display: none; } .pagina { padding: 0; max-width: none; } h2 { page-break-after: avoid; } }
  @media (max-width: 760px) { .kpis { grid-template-columns: repeat(2, 1fr); } .duas { grid-template-columns: 1fr; } table { font-size: 10px; } }
</style>
</head>
<body>
<div class="pagina">
  <div class="barra">
    <button class="sec" onclick="window.close()">Fechar</button>
    <button onclick="window.print()">Salvar PDF / Imprimir</button>
  </div>

  <header>
    <div>
      <div class="marca">Fast Sistemas Construtivos · Projeto de implantação</div>
      <h1>Relatório de status · MEGA LOJA AV BRASIL</h1>
      <div class="muted">Mudança da DCS em ${fmt(PROJETO.mudanca)} · Mudança das lojas Ramos e Realengo até ${fmt(PROJETO.mudancaLojas)} · período ${fmt(PROJETO.inicio)} a ${fmt(PROJETO.fim)}</div>
    </div>
    <div class="meta">
      <strong>${contagem}</strong>
      <strong>${contagemLojas}</strong>
      Emitido em ${emissao.toLocaleDateString("pt-BR")} às ${emissao.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
    </div>
  </header>

  <h2>Resumo</h2>
  <div class="kpis">
    ${kpis.map(([l, v, c]) => `<div class="kpi ${c || ""}"><span>${l}</span><b>${v}</b></div>`).join("")}
  </div>

  ${
    criticas.length
      ? `<h2>Pendentes · Máxima atenção</h2>
  <div class="critico"><ul>${criticas
    .map((x) => `<li><strong>${esc(x.a)}</strong> <span class="muted">· ${esc(x.s)}${x.p ? ` · prazo ${fmt(x.p)}` : " · sem prazo"}</span>${x.o ? `<div class="muted">${esc(x.o)}</div>` : ""}</li>`)
    .join("")}</ul></div>`
      : ""
  }

  <h2>Pontos de atenção</h2>
  <div class="duas">
    ${listaCurta("Atrasadas", late, "Nenhuma ação atrasada.")}
    ${listaCurta("Vencem nos próximos 7 dias", prox, "Nenhum vencimento nos próximos 7 dias.")}
  </div>
  ${susp.length ? listaCurta("Suspensas temporariamente", susp, "") : ""}

  <h2>Decisões</h2>
  ${tabDecisoes}

  <h2>Plano de ação por frente</h2>
  ${frentes}

  <footer>
    <span>Fast Sistemas Construtivos · Implantação MEGA LOJA AV BRASIL</span>
    <span>Gerado a partir do portal megaloja-avbrasil.vercel.app</span>
  </footer>
</div>
</body>
</html>`;
}

export function abrirRelatorio(dados: DadosRelatorio): boolean {
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.open();
  w.document.write(montarRelatorio(dados));
  w.document.close();
  return true;
}
