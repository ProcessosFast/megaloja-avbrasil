import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ATENCAO, FRENTES } from "@/data/projeto";
import type { AcaoComEstado } from "@/lib/dominio";
import { d, diff, fmt, hoje } from "@/lib/dominio";
import { SITUACAO_BADGE } from "@/lib/situacao-ui";

interface DashboardTabProps {
  acoes: AcaoComEstado[];
  decisoesPendentes: number;
}

export function DashboardTab({ acoes, decisoesPendentes }: DashboardTabProps) {
  const tot = acoes.filter((x) => x.sit !== "Cancelada").length;
  const conc = acoes.filter((x) => x.s === "Concluído").length;
  const and = acoes.filter((x) => x.s === "Em andamento").length;
  const late = acoes.filter((x) => x.sit === "Atrasado").length;
  const warn = acoes.filter((x) => x.sit === "Atenção").length;
  const pct = tot ? Math.round(((conc + and * 0.5) / tot) * 100) : 0;
  const semResp = acoes.filter((x) => !x.r && x.s !== "Concluído").length;

  const chartData = FRENTES.map((fr) => {
    const it = acoes.filter((x) => x.f === fr);
    const n = it.length;
    const ok = it.filter((x) => x.s === "Concluído").length;
    const lt = it.filter((x) => x.sit === "Atrasado").length;
    const dg = it.filter((x) => x.s === "Em andamento" && x.sit !== "Atrasado").length;
    const td = n - ok - lt - dg;
    return { frente: fr, "Concluído": ok, "Em andamento": dg, "Não iniciado": td, "Atrasado": lt };
  });

  const prox = acoes
    .filter((x) => x.s !== "Concluído" && x.sit !== "Suspensa" && x.sit !== "Cancelada" && diff(d(x.p), hoje) >= 0 && diff(d(x.p), hoje) <= 7)
    .sort((a, b) => d(a.p).getTime() - d(b.p).getTime());
  const criticas = acoes.filter((x) => x.critico && x.s !== "Concluído");
  const lista = [...acoes.filter((x) => x.sit === "Atrasado"), ...prox];

  const kpis = [
    { label: "Ações concluídas", value: `${conc}/${tot}` },
    { label: "Em andamento", value: and },
    { label: "Atrasadas", value: late, tone: late > 0 ? "text-destructive" : undefined },
    { label: "Em atenção", value: warn },
    { label: "Decisões pendentes", value: decisoesPendentes },
    { label: "Progresso geral", value: `${pct}%` },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className={`text-2xl font-bold ${k.tone ?? "text-foreground"}`}>{k.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{k.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {criticas.length > 0 && (
        <Card className="border-2 border-destructive">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Pendentes · Máxima atenção</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {criticas.map((x) => (
                <li key={x.id} className="flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium">{x.a}</div>
                    {x.o && <div className="text-xs text-muted-foreground">{x.o}</div>}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-muted-foreground">{x.p ? fmt(x.p) : "Sem prazo"}</span>
                    <Badge className={SITUACAO_BADGE[x.sit]}>{x.s}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Andamento por frente</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="frente" width={92} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Concluído" stackId="a" fill="var(--status-ok)" />
                <Bar dataKey="Em andamento" stackId="a" fill="var(--status-doing)" />
                <Bar dataKey="Não iniciado" stackId="a" fill="var(--status-todo)" />
                <Bar dataKey="Atrasado" stackId="a" fill="var(--destructive)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vencendo nos próximos 7 dias</CardTitle>
          </CardHeader>
          <CardContent>
            {lista.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nada vencendo nos próximos 7 dias.</p>
            ) : (
              <ul className="space-y-2">
                {lista.map((x) => (
                  <li key={x.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate">{x.a}</span>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-muted-foreground">{fmt(x.p)}</span>
                      <Badge className={SITUACAO_BADGE[x.sit]}>{x.sit}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {(ATENCAO.length > 0 || semResp > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pontos de atenção</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            {ATENCAO.map((t) => (
              <p key={t}>{t}</p>
            ))}
            {semResp > 0 && <p>{semResp} ação(ões) sem responsável definido.</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
