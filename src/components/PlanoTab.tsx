import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FRENTES, STATUS, type Status } from "@/data/projeto";
import type { AcaoComEstado, Situacao } from "@/lib/dominio";
import { fmt } from "@/lib/dominio";
import { SITUACAO_BADGE } from "@/lib/situacao-ui";

const SITUACOES: Situacao[] = ["No prazo", "Atenção", "Atrasado", "Concluído", "Sem prazo", "Suspensa"];

interface PlanoTabProps {
  acoes: AcaoComEstado[];
  podeEditar: boolean;
  onUpdate: (id: string, patch: { s?: Status; r?: string }) => void;
}

export function PlanoTab({ acoes, podeEditar, onUpdate }: PlanoTabProps) {
  const [pFrente, setPFrente] = useState("");
  const [pSit, setPSit] = useState("");

  const filtradas = acoes.filter(
    (x) => (!pFrente || x.f === pFrente) && (!pSit || x.sit === pSit),
  );
  const feitas = acoes.filter((x) => x.s === "Concluído").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-bold">Plano de ação</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {feitas}/{acoes.length} ações concluídas
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={pFrente || "all"} onValueChange={(v) => setPFrente(v === "all" || !v ? "" : v)}>
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
          <Select value={pSit || "all"} onValueChange={(v) => setPSit(v === "all" || !v ? "" : v)}>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">Feito</TableHead>
              <TableHead>Frente</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead>Observação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.map((x) => (
              <TableRow key={x.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={x.s === "Concluído"}
                    disabled={!podeEditar}
                    onChange={(e) => onUpdate(x.id, { s: e.target.checked ? "Concluído" : "Não iniciado" })}
                    aria-label={`Marcar "${x.a}" como concluída`}
                  />
                </TableCell>
                <TableCell>{x.f}</TableCell>
                <TableCell className="max-w-xs whitespace-normal">
                  {x.a}
                  {x.marco && <Badge className="ml-2 bg-primary text-primary-foreground">Marco</Badge>}
                </TableCell>
                <TableCell>{fmt(x.i)}</TableCell>
                <TableCell>{fmt(x.p)}</TableCell>
                <TableCell>
                  <Input
                    defaultValue={x.r}
                    disabled={!podeEditar}
                    placeholder="—"
                    className="h-8 w-32"
                    maxLength={80}
                    onBlur={(e) => {
                      const v = e.target.value.trim().slice(0, 80);
                      if (v !== x.r) onUpdate(x.id, { r: v });
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={x.s}
                    onValueChange={(v) => v && onUpdate(x.id, { s: v as Status })}
                    disabled={!podeEditar}
                  >
                    <SelectTrigger size="sm" className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge className={SITUACAO_BADGE[x.sit]}>{x.sit}</Badge>
                </TableCell>
                <TableCell className="max-w-xs whitespace-normal text-muted-foreground">{x.o}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Situação calculada automaticamente pela data do dia: <b>Atrasado</b> quando o prazo passou
        sem conclusão; <b>Atenção</b> quando faltam até 2 dias para o prazo; <b>No prazo</b> nos
        demais casos.
      </p>
    </div>
  );
}
