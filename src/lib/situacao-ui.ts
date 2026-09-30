import type { Situacao } from "@/lib/dominio";

export const SITUACAO_BADGE: Record<Situacao, string> = {
  "Concluído": "bg-status-ok-soft text-status-ok border-transparent",
  "No prazo": "bg-secondary text-secondary-foreground border-transparent",
  "Atenção": "bg-status-warn-soft text-status-warn border-transparent",
  "Atrasado": "bg-status-late-soft text-destructive border-transparent",
  "Sem prazo": "bg-muted text-muted-foreground border-transparent",
};
