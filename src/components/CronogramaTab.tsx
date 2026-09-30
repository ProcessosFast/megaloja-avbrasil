import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FRENTES, PROJETO } from "@/data/projeto";
import type { AcaoComEstado, Situacao } from "@/lib/dominio";
import { d, diff, iso } from "@/lib/dominio";

const WD = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const SITUACOES: Situacao[] = ["No prazo", "Atenção", "Atrasado", "Concluído"];
const LABEL_COL = "minmax(230px,300px)";

// Estilo de barra por situação — portado de legacy/INDEX.html (.task.b-*, linhas 136-142).
function barClass(x: AcaoComEstado): string {
  if (x.marco) return "bg-[repeating-linear-gradient(45deg,var(--primary)_0_8px,var(--foreground)_8px_16px)]";
  if (x.s === "Concluído") return "bg-status-ok";
  if (x.sit === "Atrasado") return "bg-destructive";
  if (x.sit === "Atenção") return "border-2 border-status-warn bg-status-warn-soft";
  if (x.s === "Em andamento") return "bg-status-doing";
  return "border-2 border-status-todo bg-status-todo-soft";
}

interface DayMeta {
  date: Date;
  isoT: string;
  isHoje: boolean;
  isFeriado: boolean;
  isWeekend: boolean;
}

function cellTint(day: DayMeta): string {
  if (day.isHoje) return "bg-primary/10";
  if (day.isFeriado) return "bg-holiday";
  if (day.isWeekend) return "bg-weekend";
  return "";
}

interface CronogramaTabProps {
  acoes: AcaoComEstado[];
}

export function CronogramaTab({ acoes }: CronogramaTabProps) {
  const [fFrente, setFFrente] = useState<string>("");
  const [fSit, setFSit] = useState<string>("");

  const dias = useMemo<DayMeta[]>(() => {
    const out: DayMeta[] = [];
    const fim = d(PROJETO.fim);
    const hojeIso = iso(new Date());
    const feriados = new Set(PROJETO.feriados);
    for (let t = d(PROJETO.inicio); diff(t, fim) <= 0; t = new Date(t.getTime() + 86400000)) {
      const isoT = iso(t);
      out.push({
        date: t,
        isoT,
        isHoje: isoT === hojeIso,
        isFeriado: feriados.has(isoT),
        isWeekend: t.getDay() === 0 || t.getDay() === 6,
      });
    }
    return out;
  }, []);

  const filtradas = acoes.filter(
    (x) => (!fFrente || x.f === fFrente) && (!fSit || x.sit === fSit),
  );

  const grupos = FRENTES.map((fr) => ({
    frente: fr,
    itens: filtradas.filter((x) => x.f === fr),
  })).filter((g) => g.itens.length > 0);

  type Linha =
    | { tipo: "grupo"; frente: string; row: number }
    | { tipo: "item"; acao: AcaoComEstado; row: number };

  const linhas: Linha[] = [];
  let cursor = 2; // linha 1 = cabeçalho de dias
  for (const g of grupos) {
    linhas.push({ tipo: "grupo", frente: g.frente, row: cursor });
    cursor++;
    for (const item of g.itens) {
      linhas.push({ tipo: "item", acao: item, row: cursor });
      cursor++;
    }
  }

  const gridTemplateColumns = `${LABEL_COL} repeat(${dias.length}, minmax(30px, 1fr))`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-2xl font-bold">Cronograma</h2>
        <div className="flex gap-2">
          <Select value={fFrente || "all"} onValueChange={(v) => setFFrente(v === "all" || !v ? "" : v)}>
            <SelectTrigger size="sm" className="w-44">
              <SelectValue placeholder="Todas as frentes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as frentes</SelectItem>
              {FRENTES.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={fSit || "all"} onValueChange={(v) => setFSit(v === "all" || !v ? "" : v)}>
            <SelectTrigger size="sm" className="w-44">
              <SelectValue placeholder="Todas as situações" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as situações</SelectItem>
              {SITUACOES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="max-h-[70vh] overflow-auto rounded-lg border border-border">
        <div className="grid min-w-max" style={{ gridTemplateColumns, gridAutoRows: "minmax(42px, auto)" }}>
          {/* Cabeçalho */}
          <div
            className="sticky top-0 left-0 z-30 flex items-end border-r border-b-2 border-foreground bg-background px-3 py-1.5 text-xs text-muted-foreground"
            style={{ gridColumn: 1, gridRow: 1 }}
          >
            Ação
          </div>
          {dias.map((day, i) => (
            <div
              key={day.isoT}
              style={{ gridColumn: i + 2, gridRow: 1 }}
              className={`sticky top-0 z-20 border-b-2 border-foreground px-1 py-1.5 text-center text-xs leading-tight ${cellTint(day)} ${
                day.isFeriado ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              <span className="block text-[11px] text-muted-foreground">{WD[day.date.getDay()]}</span>
              <span className="block font-heading text-base font-bold leading-none">
                {String(day.date.getDate()).padStart(2, "0")}
              </span>
            </div>
          ))}

          {/* Linhas: grupos por frente + ações, com sombreamento de dia por trás das barras */}
          {linhas.map((linha) => {
            if (linha.tipo === "grupo") {
              return (
                <div
                  key={`g-${linha.frente}`}
                  className="sticky left-0 border-t border-border bg-background px-3 pt-3 pb-1 font-heading text-lg font-bold"
                  style={{ gridColumn: "1 / -1", gridRow: linha.row }}
                >
                  {linha.frente}
                </div>
              );
            }

            const x = linha.acao;
            const startCol = 2 + diff(d(x.i), dias[0].date);
            const span = diff(d(x.p), d(x.i)) + 1;
            return (
              <div key={x.id} className="contents">
                <div
                  className="sticky left-0 z-10 flex min-h-[42px] flex-col justify-center border-r border-b border-border bg-background px-3 py-1.5 text-xs text-foreground"
                  style={{ gridColumn: 1, gridRow: linha.row }}
                  title={x.a}
                >
                  <span className="truncate">{x.a}</span>
                  {x.r && <span className="truncate text-[11px] text-muted-foreground">{x.r}</span>}
                </div>
                {dias.map((day, i) => (
                  <div
                    key={x.id + day.isoT}
                    style={{ gridColumn: i + 2, gridRow: linha.row }}
                    className={`border-b border-l border-dashed border-border ${cellTint(day)}`}
                  />
                ))}
                <div
                  className={`z-[1] my-2.5 h-[18px] self-center rounded-[3px] ${barClass(x)}`}
                  style={{ gridColumnStart: startCol, gridColumnEnd: `span ${span}`, gridRow: linha.row, marginInline: 3 }}
                  title={`${x.a} · ${x.sit}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <LegendDot className="border-2 border-status-todo bg-status-todo-soft rounded-[3px]" label="Não iniciado" />
        <LegendDot className="bg-status-doing rounded-[3px]" label="Em andamento" />
        <LegendDot className="bg-status-ok rounded-[3px]" label="Concluído" />
        <LegendDot className="border-2 border-status-warn bg-status-warn-soft rounded-[3px]" label="Atenção (vence em até 2 dias)" />
        <LegendDot className="bg-destructive rounded-[3px]" label="Atrasado · Dia da mudança" />
        <LegendDot className="bg-holiday rounded-[3px]" label="Feriado 12/10" />
      </div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-4 ${className}`} />
      {label}
    </span>
  );
}
