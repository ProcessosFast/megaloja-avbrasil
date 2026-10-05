import { PROJETO } from "@/data/projeto";
import { d, diff, fmt, hoje } from "@/lib/dominio";

function Contagem({ data, titulo }: { data: string; titulo: string }) {
  const falta = diff(d(data), hoje);
  const jaPassou = falta < 0;
  const valor = Math.abs(falta);
  const label = jaPassou ? (valor === 1 ? "dia após" : "dias após") : falta === 1 ? "dia" : "dias";

  return (
    <div
      aria-live="polite"
      className="flex h-32 w-36 shrink-0 flex-col items-center justify-center rounded-lg border-2 border-primary bg-card px-2 text-center"
    >
      {falta === 0 ? (
        <span className="font-heading text-xl font-bold leading-none text-primary">É hoje</span>
      ) : (
        <>
          <span className="font-heading text-4xl font-bold leading-none text-primary">{valor}</span>
          <span className="mt-1 text-[10px] font-semibold uppercase leading-tight tracking-wide text-muted-foreground">
            {label}
          </span>
        </>
      )}
      <span className="mt-1.5 text-[11px] font-bold uppercase leading-tight tracking-wide text-foreground">
        {titulo}
      </span>
      <span className="text-[10px] font-semibold text-muted-foreground">{fmt(data)}</span>
    </div>
  );
}

export function Hero() {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-10">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          MEGA LOJA AV BRASIL
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Implantação da MEGA LOJA AV BRASIL e mudança completa da operação: contrato, adequação
          estrutural, layout, transporte, estoque e fiscal. Mudança da DCS programada para 16/10, com
          sábado 17/10 reservado para contingência. Mudança das lojas Ramos e Realengo até 26/10.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Contagem data={PROJETO.mudanca} titulo="Mudança DCS" />
        <Contagem data={PROJETO.mudancaLojas} titulo="Mudança lojas Ramos e Realengo" />
      </div>
    </div>
  );
}
