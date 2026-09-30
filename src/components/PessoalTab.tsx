import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PessoalLinha } from "@/data/projeto";
import { PESSOAL } from "@/data/projeto";

function Quadro({ list }: { list: PessoalLinha[] }) {
  if (list.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        <b className="text-foreground">Aguardando o quadro da loja.</b> Informe função,
        quantidade, alocação (origem, destino ou reserva) e papel de cada pessoa da loja no dia
        16/10.
      </div>
    );
  }

  const t = list.reduce(
    (a, x) => ({ q: a.q + x.q, o: a.o + x.o, d: a.d + x.d, r: a.r + x.r }),
    { q: 0, o: 0, d: 0, r: 0 },
  );
  const dif = t.o + t.d + t.r - t.q;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Função</TableHead>
          <TableHead>Equipe</TableHead>
          <TableHead className="text-right">Qtd</TableHead>
          <TableHead className="text-right">Origem</TableHead>
          <TableHead className="text-right">Destino</TableHead>
          <TableHead className="text-right">Reserva</TableHead>
          <TableHead>Papel no dia</TableHead>
          <TableHead>Checagem</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.map((x, i) => {
          const df = x.o + x.d + x.r - x.q;
          return (
            <TableRow key={i} className={df ? "bg-status-late-soft/40" : undefined}>
              <TableCell>{x.fn}</TableCell>
              <TableCell>{x.eq}</TableCell>
              <TableCell className="text-right">{x.q}</TableCell>
              <TableCell className="text-right">{x.o}</TableCell>
              <TableCell className="text-right">{x.d}</TableCell>
              <TableCell className="text-right">{x.r}</TableCell>
              <TableCell>{x.papel}</TableCell>
              <TableCell>
                <Badge className={df ? "bg-status-late-soft text-destructive" : "bg-status-ok-soft text-status-ok"}>
                  {df
                    ? `${df > 0 ? "+" : ""}${df} alocado${Math.abs(df) > 1 ? "s" : ""}${df > 0 ? " a mais" : " a menos"}`
                    : "OK"}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
        <TableRow className="font-medium">
          <TableCell>Total</TableCell>
          <TableCell />
          <TableCell className="text-right">{t.q}</TableCell>
          <TableCell className="text-right">{t.o}</TableCell>
          <TableCell className="text-right">{t.d}</TableCell>
          <TableCell className="text-right">{t.r}</TableCell>
          <TableCell />
          <TableCell>
            <Badge className={dif ? "bg-status-late-soft text-destructive" : "bg-status-ok-soft text-status-ok"}>
              {dif ? `Diferença ${dif > 0 ? "+" : ""}${dif}` : "OK"}
            </Badge>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

export function PessoalTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Quadro de pessoal da mudança · 16/10</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Quadro atual mantido; necessidade real reavaliada no decorrer. A alocação é sugestão e
          pode ser ajustada. Qtd deve ser igual a Origem + Destino + Reserva.
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="font-heading text-lg font-bold">Expedição</h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <Quadro list={PESSOAL.expedicao} />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-heading text-lg font-bold">Loja</h3>
        <div className="overflow-x-auto">
          <Quadro list={PESSOAL.loja} />
        </div>
      </div>
    </div>
  );
}
