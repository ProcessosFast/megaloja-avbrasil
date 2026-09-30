import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DECISOES } from "@/data/projeto";
import type { AcaoComEstado } from "@/lib/dominio";
import { decisaoAtual, diff, d, fmt, hoje } from "@/lib/dominio";
import { SITUACAO_BADGE } from "@/lib/situacao-ui";
import type { EstadoDecisoes } from "@/lib/storage";

interface DecisoesTabProps {
  acoes: AcaoComEstado[];
  estadoDecisoes: EstadoDecisoes;
  podeEditar: boolean;
  onDecidir: (id: string, status: string) => void;
}

export function DecisoesTab({ acoes, estadoDecisoes, podeEditar, onDecidir }: DecisoesTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-2xl font-bold">Decisões</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tudo o que precisa ser decidido antes de seguir com a execução. Registre a decisão no
          próprio cartão; a data é gravada automaticamente.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {DECISOES.map((base) => {
          const x = decisaoAtual(base, estadoDecisoes);
          const pend = x.status === x.opcoes[0];
          const negativa = !pend && x.negativas.includes(x.status);
          const rel = x.acoes.map((id) => acoes.find((a) => a.id === id)).filter(Boolean) as AcaoComEstado[];
          const vencido = pend && x.prazo && diff(d(x.prazo), hoje) < 0;

          return (
            <Card key={x.id}>
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
                <h3 className="font-heading text-xl font-bold">{x.titulo}</h3>
                <p className="text-sm text-muted-foreground">{x.descricao}</p>

                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                  <dt className="text-muted-foreground">Decide</dt>
                  <dd>{x.aprovador}</dd>
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
                      <dd>{new Date(x.data).toLocaleDateString("pt-BR")}</dd>
                    </>
                  )}
                  <dt className="text-muted-foreground">Impacto</dt>
                  <dd>{x.impacto}</dd>
                  {rel.length > 0 && (
                    <>
                      <dt className="text-muted-foreground">Ações ligadas</dt>
                      <dd className="space-y-1">
                        {rel.map((a) => (
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
                  <Select
                    value={x.status}
                    onValueChange={(v) => v && onDecidir(x.id, v)}
                    disabled={!podeEditar}
                  >
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
        })}
      </div>
    </div>
  );
}
