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

const BAR_CLASS: Record<string, string> = {
  "Não iniciado": "bg-status-todo",
  "Em andamento": "bg-status-doing",
  "Concluído": "bg-status-ok",
  "Atenção": "bg-status-warn",
  "Atrasado": "bg-destructive",
};

function barClass(x: AcaoComEstado): string {
  if (x.s === "Concluído") return BAR_CLASS["Concluído"];
  if (x.sit === "Atrasado") return BAR_CLASS["Atrasado"];
  if (x.sit === "Atenção") return BAR_CLASS["Atenção"];
  if (x.s === "Em andamento") return BAR_CLASS["Em andamento"];
  return BAR_CLASS["Não iniciado"];
}

interface CronogramaTabProps {
  acoes: AcaoComEstado[];
}

export function CronogramaTab({ acoes }: CronogramaTabProps) {
  const [fFrente, setFFrente] = useState<string>("");
  const [fSit, setFSit] = useState<string>("");

  const dias = useMemo(() => {
    const out: Date[] = [];
    const fim = d(PROJETO.fim);
    for (let t = d(PROJETO.inicio); diff(t, fim) <= 0; t = new Date(t.getTime() + 86400000)) {
      out.push(t);
    }
    return out;
  }, []);

  const hojeIso = iso(new Date());
  const feriados = new Set(PROJETO.feriados);

  const filtradas = acoes.filter(
    (x) => (!fFrente || x.f === fFrente) && (!fSit || x.sit === fSit),
  );

  const gridTemplateColumns = `220px repeat(${dias.length}, minmax(28px, 1fr))`;

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

      <div className="overflow-x-auto rounded-lg border border-border">
        <div className="grid min-w-max" style={{ gridTemplateColumns }}>
          <div
            className="sticky left-0 z-10 border-b border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
            style={{ gridColumn: 1, gridRow: 1 }}
          >
            Ação
          </div>
          {dias.map((t, i) => {
            const isoT = iso(t);
            const isHoje = isoT === hojeIso;
            const isFeriado = feriados.has(isoT);
            const isWeekend = t.getDay() === 0 || t.getDay() === 6;
            return (
              <div
                key={isoT}
                style={{ gridColumn: i + 2, gridRow: 1 }}
                className={`border-b border-l border-border px-1 py-1 text-center text-[10px] leading-tight ${
                  isHoje
                    ? "bg-primary/10 font-bold text-primary"
                    : isFeriado
                      ? "bg-holiday text-muted-foreground"
                      : isWeekend
                        ? "bg-weekend text-muted-foreground"
                        : "text-muted-foreground"
                }`}
              >
                <div>{WD[t.getDay()]}</div>
                <div>{String(t.getDate()).padStart(2, "0")}</div>
              </div>
            );
          })}

          {filtradas.map((x, i) => {
            const startCol = 2 + diff(d(x.i), dias[0]);
            const span = diff(d(x.p), d(x.i)) + 1;
            const gridRow = i + 2; // linha 1 = cabeçalho de dias
            return (
              <div key={x.id} className="contents">
                <div
                  className="truncate border-b border-border px-2 py-1.5 text-xs text-foreground"
                  style={{ gridColumn: 1, gridRow }}
                  title={x.a}
                >
                  {x.a}
                </div>
                <div
                  className={`my-1.5 h-3 rounded-full ${barClass(x)} ${x.marco ? "ring-2 ring-primary ring-offset-1" : ""}`}
                  style={{ gridColumnStart: startCol, gridColumnEnd: `span ${span}`, gridRow }}
                  title={`${x.a} · ${x.sit}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <LegendDot className="bg-status-todo" label="Não iniciado" />
        <LegendDot className="bg-status-doing" label="Em andamento" />
        <LegendDot className="bg-status-ok" label="Concluído" />
        <LegendDot className="bg-status-warn" label="Atenção (vence em até 2 dias)" />
        <LegendDot className="bg-destructive" label="Atrasado · Dia da mudança" />
        <LegendDot className="bg-holiday" label="Feriado 12/10" />
      </div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${className}`} />
      {label}
    </span>
  );
}
