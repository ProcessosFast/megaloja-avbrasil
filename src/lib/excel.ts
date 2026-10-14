// Exportação do plano de ação em Excel (.xlsx).
// A biblioteca ExcelJS só é carregada quando o usuário clica em exportar.
import type { AcaoComEstado } from "@/lib/dominio";
import { iso } from "@/lib/dominio";

// Data em UTC para o Excel não deslocar o dia por causa do fuso.
const dataExcel = (s: string): Date => {
  const [y, m, dd] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, dd));
};

// Cores da situação, iguais às etiquetas do portal.
const COR_SITUACAO: Record<string, string> = {
  "Concluído": "FFD1FADF",
  "Atenção": "FFFEF0C7",
  "Atrasado": "FFFEE4E2",
  "Suspensa": "FFEAECF0",
  "Cancelada": "FFEAECF0",
};

export async function exportarPlanoExcel(acoes: AcaoComEstado[]): Promise<void> {
  const { default: ExcelJS } = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  wb.creator = "Portal MEGA LOJA AV BRASIL";
  wb.created = new Date();

  const ws = wb.addWorksheet("Plano de ação", { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = [
    { header: "Frente", key: "f", width: 16 },
    { header: "Ação", key: "a", width: 60 },
    { header: "Início", key: "i", width: 12, style: { numFmt: "dd/mm/yyyy" } },
    { header: "Prazo", key: "p", width: 12, style: { numFmt: "dd/mm/yyyy" } },
    { header: "Responsável", key: "r", width: 28 },
    { header: "Status", key: "s", width: 24 },
    { header: "Situação", key: "sit", width: 14 },
    { header: "Máxima atenção", key: "critico", width: 15 },
    { header: "Observação", key: "o", width: 80 },
  ];

  // Mesma ordem da aba Plano de ação: pendências críticas abertas no topo.
  const urgente = (x: AcaoComEstado) => (x.critico && x.s !== "Concluído" ? 0 : 1);
  const ordenadas = [...acoes].sort((a, b) => urgente(a) - urgente(b));

  for (const x of ordenadas) {
    const row = ws.addRow({
      f: x.f,
      a: x.a,
      i: x.i ? dataExcel(x.i) : null,
      p: x.p ? dataExcel(x.p) : null,
      r: x.r,
      s: x.s,
      sit: x.sit,
      critico: x.critico ? "Sim" : "",
      o: x.o,
    });
    row.alignment = { vertical: "top", wrapText: true };
    const cor = COR_SITUACAO[x.sit];
    if (cor) row.getCell("sit").fill = { type: "pattern", pattern: "solid", fgColor: { argb: cor } };
    if (x.critico && x.s !== "Concluído") row.getCell("critico").font = { bold: true, color: { argb: "FFD21217" } };
  }

  const cab = ws.getRow(1);
  cab.font = { bold: true, color: { argb: "FFFFFFFF" } };
  cab.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD21217" } };
  cab.alignment = { vertical: "middle" };
  cab.height = 20;
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columns.length } };

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `plano-de-acao-mega-loja-av-brasil-${iso(new Date())}.xlsx`;
  // Alguns navegadores só baixam se o link estiver na página.
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
