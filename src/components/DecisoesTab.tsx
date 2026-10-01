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
import { Textarea } from "@/components/ui/textarea";
import { DECISOES } from "@/data/projeto";
import type { AcaoComEstado } from "@/lib/dominio";
import { diff, d, fmt, hoje } from "@/lib/dominio";
import { decisaoAtual } from "@/lib/dominio";
import { SITUACAO_BADGE } from "@/lib/situacao-ui";
import type { DecisaoCustom, EstadoDecisoes, EstadoDecisoesCustom } from "@/lib/storage";

const OPCOES_CUSTOM = ["Aguardando decisão", "Aprovada", "Reprovada"];
const NEGATIVAS_CUSTOM = ["Reprovada"];

// x.data pode ser "YYYY-MM-DD" (data sem hora, ex.: dataInicial) ou um timestamp ISO completo
// (quando alguém registra a decisão pelo site). new Date("YYYY-MM-DD") interpreta como UTC
// meia-noite, o que pode exibir o dia errado em fusos atrás de UTC — por isso o tratamento à parte.
function formatarDataDecidida(data: string): string {
  if (!data.includes("T")) return fmt(data);
  return new Date(data).toLocaleDateString("pt-BR");
}

interface DecisaoView {
  id: string;
  titulo: string;
  aprovador: string;
  prazo: string;
  descricao: string;
  impacto: string;
  status: string;
  data: string;
  opcoes: string[];
  negativas: string[];
  img?: string;
  acoesLigadas: AcaoComEstado[];
  removivel: boolean;
}

interface DecisoesTabProps {
  acoes: AcaoComEstado[];
  estadoDecisoes: EstadoDecisoes;
  decisoesCustom: EstadoDecisoesCustom;
  podeEditar: boolean;
  onDecidir: (id: string, status: string) => void;
  onCriarDecisao: (dados: Omit<DecisaoCustom, "status" | "data" | "criadoEm">) => void;
  onExcluirDecisao: (id: string) => void;
}

export function DecisoesTab({
  acoes,
  estadoDecisoes,
  decisoesCustom,
  podeEditar,
  onDecidir,
  onCriarDecisao,
  onExcluirDecisao,
}: DecisoesTabProps) {
  const [formAberto, setFormAberto] = useState(false);

  const decisoesBase: DecisaoView[] = DECISOES.map((base) => {
    const x = decisaoAtual(base, estadoDecisoes);
    return {
      id: x.id,
      titulo: x.titulo,
      aprovador: x.aprovador,
      prazo: x.prazo,
      descricao: x.descricao,
      impacto: x.impacto,
      status: x.status,
      data: x.data,
      opcoes: x.opcoes,
      negativas: x.negativas,
      img: x.img,
      acoesLigadas: x.acoes.map((id) => acoes.find((a) => a.id === id)).filter(Boolean) as AcaoComEstado[],
      removivel: false,
    };
  });

  const decisoesManuais: DecisaoView[] = Object.entries(decisoesCustom).map(([id, x]) => ({
    id,
    titulo: x.titulo,
    aprovador: x.aprovador,
    prazo: x.prazo,
    descricao: x.descricao,
    impacto: x.impacto,
    status: x.status || OPCOES_CUSTOM[0],
    data: x.data,
    opcoes: OPCOES_CUSTOM,
    negativas: NEGATIVAS_CUSTOM,
    acoesLigadas: [],
    removivel: true,
  }));

  const todasDecisoes = [...decisoesBase, ...decisoesManuais];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-bold">Decisões</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tudo o que precisa ser decidido antes de seguir com a execução. Registre a decisão no
            próprio cartão; a data é gravada automaticamente.
          </p>
        </div>
        {podeEditar && (
          <Button variant={formAberto ? "outline" : "default"} onClick={() => setFormAberto((v) => !v)}>
            {formAberto ? "Cancelar" : "+ Novo ponto de decisão"}
          </Button>
        )}
      </div>

      {formAberto && (
        <NovaDecisaoForm
          onCriar={(dados) => {
            onCriarDecisao(dados);
            setFormAberto(false);
          }}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {todasDecisoes.map((x) => (
          <DecisaoCard
            key={x.id}
            x={x}
            podeEditar={podeEditar}
            onDecidir={onDecidir}
            onExcluir={onExcluirDecisao}
          />
        ))}
      </div>
    </div>
  );
}

function DecisaoCard({
  x,
  podeEditar,
  onDecidir,
  onExcluir,
}: {
  x: DecisaoView;
  podeEditar: boolean;
  onDecidir: (id: string, status: string) => void;
  onExcluir: (id: string) => void;
}) {
  const pend = x.status === x.opcoes[0];
  const negativa = !pend && x.negativas.includes(x.status);
  const vencido = pend && x.prazo && diff(d(x.prazo), hoje) < 0;

  return (
    <Card>
      {x.img === "img-fachada" && (
        <figure className="overflow-hidden rounded-t-lg border-b border-border">
          <img
            src={`${import.meta.env.BASE_URL}fachada.jpg`}
            alt="Proposta de layout da fachada · MEGA LOJA AV BRASIL"
            className="w-full object-cover"
          />
        </figure>
      )}
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <Badge
            className={
              pend
                ? "bg-secondary text-secondary-foreground"
                : negativa
                  ? "bg-status-late-soft text-destructive"
                  : "bg-status-ok-soft text-status-ok"
            }
          >
            {x.status}
          </Badge>
          {x.removivel && podeEditar && (
            <button
              type="button"
              onClick={() => onExcluir(x.id)}
              className="text-xs text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
            >
              Excluir
            </button>
          )}
        </div>
        <h3 className="font-heading text-xl font-bold">{x.titulo}</h3>
        <p className="text-sm text-muted-foreground">{x.descricao}</p>

        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Decide</dt>
          <dd>{x.aprovador || "—"}</dd>
          <dt className="text-muted-foreground">Prazo</dt>
          <dd>
            {x.prazo ? (
              <>
                {fmt(x.prazo)}
                {vencido && <span className="ml-1 text-destructive">vencido</span>}
              </>
            ) : (
              <span className="text-destructive">A definir</span>
            )}
          </dd>
          {x.data && (
            <>
              <dt className="text-muted-foreground">Decidido em</dt>
              <dd>{formatarDataDecidida(x.data)}</dd>
            </>
          )}
          <dt className="text-muted-foreground">Impacto</dt>
          <dd>{x.impacto || "—"}</dd>
          {x.acoesLigadas.length > 0 && (
            <>
              <dt className="text-muted-foreground">Ações ligadas</dt>
              <dd className="space-y-1">
                {x.acoesLigadas.map((a) => (
                  <div key={a.id} className="flex items-center gap-2">
                    <span>{a.a}</span>
                    <Badge className={SITUACAO_BADGE[a.sit]}>{a.sit}</Badge>
                  </div>
                ))}
              </dd>
            </>
          )}
        </dl>

        <label className="block text-xs font-medium text-muted-foreground">
          Registrar decisão
          <Select value={x.status} onValueChange={(v) => v && onDecidir(x.id, v)} disabled={!podeEditar}>
            <SelectTrigger className="mt-1 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {x.opcoes.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </CardContent>
    </Card>
  );
}

function NovaDecisaoForm({
  onCriar,
}: {
  onCriar: (dados: Omit<DecisaoCustom, "status" | "data" | "criadoEm">) => void;
}) {
  const formId = useId();
  const [titulo, setTitulo] = useState("");
  const [aprovador, setAprovador] = useState("");
  const [prazo, setPrazo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [impacto, setImpacto] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) return;
    onCriar({ titulo: titulo.trim(), aprovador: aprovador.trim(), prazo, descricao: descricao.trim(), impacto: impacto.trim() });
  }

  return (
    <Card>
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor={`${formId}-titulo`} className="text-xs font-medium text-muted-foreground">
              Título *
            </label>
            <Input
              id={`${formId}-titulo`}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="O que precisa ser decidido"
              className="mt-1"
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor={`${formId}-aprovador`} className="text-xs font-medium text-muted-foreground">
                Quem decide
              </label>
              <Input
                id={`${formId}-aprovador`}
                value={aprovador}
                onChange={(e) => setAprovador(e.target.value)}
                placeholder="Ex.: Diretoria"
                className="mt-1"
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
                onChange={(e) => setPrazo(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <label htmlFor={`${formId}-descricao`} className="text-xs font-medium text-muted-foreground">
              Descrição
            </label>
            <Textarea
              id={`${formId}-descricao`}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="O que precisa ser avaliado"
              className="mt-1"
              rows={2}
            />
          </div>
          <div>
            <label htmlFor={`${formId}-impacto`} className="text-xs font-medium text-muted-foreground">
              Impacto
            </label>
            <Textarea
              id={`${formId}-impacto`}
              value={impacto}
              onChange={(e) => setImpacto(e.target.value)}
              placeholder="O que essa decisão afeta"
              className="mt-1"
              rows={2}
            />
          </div>
          <Button type="submit" disabled={!titulo.trim()}>
            Adicionar decisão
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
