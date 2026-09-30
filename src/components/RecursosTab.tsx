import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RecursoLinha } from "@/data/projeto";
import { RECURSOS } from "@/data/projeto";
import { fmt } from "@/lib/dominio";

function Quadro({ list }: { list: RecursoLinha[] }) {
  if (list.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        <b className="text-foreground">Aguardando os equipamentos da loja.</b> Informe recurso,
        quantidade, uso, data necessária e fornecedor (ex.: veículos, paleteiras, carrinhos,
        embalagens usados pela loja).
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Recurso</TableHead>
          <TableHead className="text-right">Qtd</TableHead>
          <TableHead>Uso</TableHead>
          <TableHead>Data necessária</TableHead>
          <TableHead>Fornecedor</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.map((x, i) => (
          <TableRow key={i}>
            <TableCell>{x.rc}</TableCell>
            <TableCell className="text-right">{x.q}</TableCell>
            <TableCell>{x.uso}</TableCell>
            <TableCell>{fmt(x.dt)}</TableCell>
            <TableCell className={x.forn ? undefined : "text-muted-foreground"}>
              {x.forn || "A definir"}
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{x.s}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function RecursosTab() {
  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold">Recursos e equipamentos</h2>

      <div className="space-y-2">
        <h3 className="font-heading text-lg font-bold">Expedição</h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <Quadro list={RECURSOS.expedicao} />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-heading text-lg font-bold">Loja</h3>
        <div className="overflow-x-auto">
          <Quadro list={RECURSOS.loja} />
        </div>
      </div>
    </div>
  );
}
