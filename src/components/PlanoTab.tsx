import { useId, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { FRENTES, STATUS, type Status } from "@/data/projeto";
import type { AcaoComEstado, Situacao } from "@/lib/dominio";
import { fmt } from "@/lib/dominio";
import { SITUACAO_BADGE } from "@/lib/situacao-ui";
import type { AcaoCustom } from "@/lib/storage";

const SITUACOES: Situacao[] = ["No prazo", "Atenção", "Atrasado", "Concluído", "Sem prazo", "Suspensa", "Cancelada"];

interface PlanoTabProps {
  acoes: AcaoComEstado[];
  podeEditar: boolean;
  onUpdate: (id: string, patch: { s?: Status; r?: string; p?: string }) => void;
  onCriar: (dados: Omit<AcaoCustom, "s" | "criadoEm">) => void;
  onExcluir: (id: string) => void;
}

// Ignora anos incompletos enquanto a pessoa digita (ex.: 0002-10-20).
const dataValida = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && v >= "2020";

export function PlanoTab({ acoes, podeEditar, onUpdate, onCriar, onExcluir }: PlanoTabProps) {
  const [formAberto, setFormAberto] = useState(false);
  const [pFrente, setPFrente] = useState("");
  const [pSit, setPSit] = useState("");

  // Pendências de máxima atenção ainda abertas sobem para o topo.
  const urgente = (x: AcaoComEstado) => (x.critico && x.s !== "Concluído" ? 0 : 1);
  const filtradas = acoes
    .filter((x) => (!pFrente || x.f === pFrente) && (!pSit || x.sit === pSit))
    .sort((a, b) => urgente(a) - urgente(b));
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
        <div className="flex flex-wrap gap-2">
          {podeEditar && (
            <Button size="sm" variant={formAberto ? "outline" : "default"} onClick={() => setFormAberto((v) => !v)}>
              {formAberto ? "Cancelar" : "+ Nova ação"}
            </Button>
          )}
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

      {formAberto && (
        <NovaAcaoForm
          onCriar={(dados) => {
            onCriar(dados);
            setFormAberto(false);
          }}
        />
      )}

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
              <TableRow key={x.id} className={x.critico && x.s !== "Concluído" ? "bg-destructive/5" : undefined}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={x.s === "Concluído"}
                    disabled={!podeEditar || x.fixo}
                    onChange={(e) => onUpdate(x.id, { s: e.target.checked ? "Concluído" : "Não iniciado" })}
                    aria-label={`Marcar "${x.a}" como concluída`}
                  />
                </TableCell>
                <TableCell>{x.f}</TableCell>
                <TableCell className="max-w-xs whitespace-normal">
                  {x.a}
                  {x.custom && <Badge className="ml-2 bg-secondary text-secondary-foreground">Incluída pelo site</Badge>}
                  {x.marco && <Badge className="ml-2 bg-primary text-primary-foreground">Marco</Badge>}
                  {x.critico && x.s !== "Concluído" && (
                    <Badge className="ml-2 bg-destructive text-white">Pendente · Máxima atenção</Badge>
                  )}
                </TableCell>
                <TableCell>{fmt(x.i)}</TableCell>
                <TableCell>
                  {x.prazoEditavel ? (
                    <Input
                      type="date"
                      key={x.p}
                      defaultValue={x.p}
                      disabled={!podeEditar}
                      aria-label={`Prazo de "${x.a}"`}
                      className="h-8 w-36"
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v !== x.p && (v === "" || dataValida(v))) onUpdate(x.id, { p: v });
                      }}
                    />
                  ) : (
                    fmt(x.p)
                  )}
                </TableCell>
                <TableCell>
                  <Input
                    defaultValue={x.r}
                    disabled={!podeEditar}
                    placeholder="—"
                    className="h-8 w-32"
                    maxLength={80}
                    onBlur={(e) => {
                      const v = e.target.value.trim().slice(0, 80);
                      // Ação incluída pelo site não pode ficar sem responsável.
                      if (x.custom && !v) {
                        e.target.value = x.r;
                        return;
                      }
                      if (v !== x.r) onUpdate(x.id, { r: v });
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={x.s}
                    onValueChange={(v) => v && onUpdate(x.id, { s: v as Status })}
                    disabled={!podeEditar || x.fixo}
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
                <TableCell className="max-w-xs whitespace-normal text-muted-foreground">
                  {x.o}
                  {x.custom && podeEditar && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Excluir a ação "${x.a}" do plano?`)) onExcluir(x.id);
                      }}
                      className="ml-2 text-xs underline-offset-2 hover:text-destructive hover:underline"
                    >
                      Excluir
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Situação calculada automaticamente pela data do dia: <b>Atrasado</b> quando o prazo passou
        sem conclusão; <b>Atenção</b> quando faltam até 2 dias para o prazo; <b>No prazo</b> nos
        demais casos. Ações sem prazo definido no plano podem ter o prazo preenchido direto na
        coluna <b>Prazo</b>. Para incluir uma ação nova, use <b>+ Nova ação</b>: ela só é salva
        com data de início e responsável preenchidos.
      </p>
    </div>
  );
}

function NovaAcaoForm({ onCriar }: { onCriar: (dados: Omit<AcaoCustom, "s" | "criadoEm">) => void }) {
  const formId = useId();
  const [frente, setFrente] = useState<string>("Diversos");
  const [acao, setAcao] = useState("");
  const [inicio, setInicio] = useState("");
  const [prazo, setPrazo] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [obs, setObs] = useState("");

  const faltando = [
    !acao.trim() && "ação",
    !dataValida(inicio) && "data de início",
    !responsavel.trim() && "responsável",
  ].filter(Boolean) as string[];
  const prazoInvalido = !!prazo && (!dataValida(prazo) || prazo < inicio);
  const pode = faltando.length === 0 && !prazoInvalido;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pode) return;
    onCriar({
      f: frente,
      a: acao.trim().slice(0, 200),
      i: inicio,
      p: prazo,
      r: responsavel.trim().slice(0, 80),
      o: obs.trim().slice(0, 500),
    });
  }

  return (
    <Card>
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[12rem_1fr]">
            <div>
              <label htmlFor={`${formId}-frente`} className="text-xs font-medium text-muted-foreground">
                Frente
              </label>
              <Select value={frente} onValueChange={(v) => v && setFrente(v)}>
                <SelectTrigger id={`${formId}-frente`} className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FRENTES.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor={`${formId}-acao`} className="text-xs font-medium text-muted-foreground">
                Ação *
              </label>
              <Input
                id={`${formId}-acao`}
                value={acao}
                onChange={(e) => setAcao(e.target.value)}
                placeholder="O que precisa ser feito"
                className="mt-1"
                maxLength={200}
                required
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor={`${formId}-inicio`} className="text-xs font-medium text-muted-foreground">
                Início *
              </label>
              <Input
                id={`${formId}-inicio`}
                type="date"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <label htmlFor={`${formId}-prazo`} className="text-xs font-medium text-muted-foreground">
                Prazo
              </label>
              <Input
                id={`${formId}-prazo`}
                type="date"
                value={prazo}
                min={inicio || undefined}
                onChange={(e) => setPrazo(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor={`${formId}-resp`} className="text-xs font-medium text-muted-foreground">
                Responsável *
              </label>
              <Input
                id={`${formId}-resp`}
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                placeholder="Quem executa"
                className="mt-1"
                maxLength={80}
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor={`${formId}-obs`} className="text-xs font-medium text-muted-foreground">
              Observação
            </label>
            <Textarea
              id={`${formId}-obs`}
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              className="mt-1"
              rows={2}
              maxLength={500}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={!pode}>
              Incluir no plano
            </Button>
            {!pode && (
              <span className="text-xs text-muted-foreground">
                {faltando.length > 0
                  ? `Para salvar, preencha: ${faltando.join(", ")}.`
                  : "O prazo não pode ser antes da data de início."}
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
