import { PROJETO } from "@/data/projeto";
import { d, diff, hoje } from "@/lib/dominio";

export function Hero() {
  const falta = diff(d(PROJETO.mudanca), hoje);
  const jaPassou = falta < 0;
  const ddayValor = jaPassou ? Math.abs(falta) : falta;
  const ddayLabel = falta === 0 ? "É hoje" : jaPassou ? "dias após a mudança" : "dias para a mudança";

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-10">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          MEGA LOJA AV BRASIL
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Implantação da MEGA LOJA AV BRASIL e mudança completa da operação: contrato, adequação
          estrutural, layout, transporte, estoque e fiscal. Mudança programada para 16/10, com
          sábado 17/10 reservado para contingência.
        </p>
      </div>
      <div
        aria-live="polite"
        className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-lg border-2 border-primary bg-card text-center"
      >
        {falta === 0 ? (
          <span className="font-heading text-xl font-bold leading-none text-primary">É hoje</span>
        ) : (
          <>
            <span className="font-heading text-4xl font-bold leading-none text-primary">{ddayValor}</span>
            <span className="mt-1.5 px-1 text-[10px] font-semibold uppercase leading-tight tracking-wide text-muted-foreground">
              {ddayLabel}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
