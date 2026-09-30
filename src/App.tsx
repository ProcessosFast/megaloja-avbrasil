import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CronogramaTab } from "@/components/CronogramaTab";
import { DashboardTab } from "@/components/DashboardTab";
import { DecisoesTab } from "@/components/DecisoesTab";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { PessoalTab } from "@/components/PessoalTab";
import { PlanoTab } from "@/components/PlanoTab";
import { RecursosTab } from "@/components/RecursosTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import type { Status } from "@/data/projeto";
import { DECISOES, PROJETO } from "@/data/projeto";
import { acoesAtuais, decisoesPendentesCount } from "@/lib/dominio";
import type { DecisaoCustom } from "@/lib/storage";
import { useEstado } from "@/lib/storage";

const OPCAO_PENDENTE_CUSTOM = "Aguardando decisão";

const TAB_CLASS =
  "h-auto rounded-md border border-transparent px-4 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:border-border hover:bg-accent hover:text-foreground data-active:border-primary data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none after:hidden";

export default function App() {
  const { estado, modo, podeEditar, salvar, remover } = useEstado();
  const [aba, setAba] = useState("dashboard");

  const acoes = useMemo(() => acoesAtuais(estado.acoes), [estado.acoes]);
  const decPendentes = useMemo(() => {
    const base = decisoesPendentesCount(estado.decisoes);
    const custom = Object.values(estado.decisoesCustom).filter(
      (x) => (x.status || OPCAO_PENDENTE_CUSTOM) === OPCAO_PENDENTE_CUSTOM,
    ).length;
    return base + custom;
  }, [estado.decisoes, estado.decisoesCustom]);
  const atrasadas = acoes.filter((x) => x.sit === "Atrasado").length;

  const atualizadoLabel =
    modo === "carregando"
      ? "Carregando…"
      : modo === "online"
        ? "Sincronizado"
        : `Base de ${new Date(PROJETO.atualizadoEm).toLocaleDateString("pt-BR")} · alterações salvas neste navegador`;

  function handleAcaoUpdate(id: string, patch: { s?: Status; r?: string }) {
    salvar("acoes", id, patch);
    toast.success("Alteração salva");
  }

  function handleDecisao(id: string, status: string) {
    const base = DECISOES.find((x) => x.id === id);
    if (base) {
      const pend = status === base.opcoes[0];
      salvar("decisoes", id, { status, data: pend ? "" : new Date().toISOString() });
    } else {
      const pend = status === OPCAO_PENDENTE_CUSTOM;
      salvar("decisoesCustom", id, { status, data: pend ? "" : new Date().toISOString() });
    }
    toast.success("Decisão registrada");
  }

  function handleCriarDecisao(dados: Omit<DecisaoCustom, "status" | "data" | "criadoEm">) {
    const id = `custom-${Date.now().toString(36)}`;
    salvar("decisoesCustom", id, {
      ...dados,
      status: OPCAO_PENDENTE_CUSTOM,
      data: "",
      criadoEm: new Date().toISOString(),
    });
    toast.success("Ponto de decisão adicionado");
  }

  function handleExcluirDecisao(id: string) {
    remover("decisoesCustom", id);
    toast.success("Ponto de decisão removido");
  }

  return (
    <div className="min-h-screen bg-background">
      <Header atualizadoLabel={atualizadoLabel} />
      <Hero />

      <main className="w-full px-4 pb-16 sm:px-6 lg:px-10">
        <Tabs value={aba} onValueChange={setAba}>
          <TabsList className="mb-6 h-auto flex-wrap gap-1.5 rounded-lg border border-border bg-card p-1.5">
            <TabsTrigger value="dashboard" className={TAB_CLASS}>
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="cronograma" className={TAB_CLASS}>
              Cronograma
            </TabsTrigger>
            <TabsTrigger value="plano" className={TAB_CLASS}>
              Plano de ação{atrasadas > 0 && ` (${atrasadas})`}
            </TabsTrigger>
            <TabsTrigger value="decisoes" className={TAB_CLASS}>
              Decisões{decPendentes > 0 && ` (${decPendentes})`}
            </TabsTrigger>
            <TabsTrigger value="pessoal" className={TAB_CLASS}>
              Quadro de pessoal
            </TabsTrigger>
            <TabsTrigger value="recursos" className={TAB_CLASS}>
              Recursos e equipamentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab acoes={acoes} decisoesPendentes={decPendentes} />
          </TabsContent>
          <TabsContent value="cronograma">
            <CronogramaTab acoes={acoes} />
          </TabsContent>
          <TabsContent value="plano">
            <PlanoTab acoes={acoes} podeEditar={podeEditar} onUpdate={handleAcaoUpdate} />
          </TabsContent>
          <TabsContent value="decisoes">
            <DecisoesTab
              acoes={acoes}
              estadoDecisoes={estado.decisoes}
              decisoesCustom={estado.decisoesCustom}
              podeEditar={podeEditar}
              onDecidir={handleDecisao}
              onCriarDecisao={handleCriarDecisao}
              onExcluirDecisao={handleExcluirDecisao}
            />
          </TabsContent>
          <TabsContent value="pessoal">
            <PessoalTab />
          </TabsContent>
          <TabsContent value="recursos">
            <RecursosTab />
          </TabsContent>
        </Tabs>
      </main>

      <Toaster />
    </div>
  );
}
