import { PROJETO } from "@/data/projeto";
import { d, diff, hoje } from "@/lib/dominio";

export function Hero() {
  const falta = diff(d(PROJETO.mudanca), hoje);
  const ddayLabel =
    falta > 0 ? `D-${falta}` : falta === 0 ? "É hoje" : `${Math.abs(falta)} dia(s) após a mudança`;

  return (
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6">
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
        className="rounded-lg border border-border bg-card px-5 py-3 text-center font-heading text-2xl font-bold text-primary"
      >
        {ddayLabel}
      </div>
    </div>
  );
}
