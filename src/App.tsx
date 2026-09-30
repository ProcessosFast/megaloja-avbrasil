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
import { useEstado } from "@/lib/storage";

export default function App() {
  const { estado, modo, podeEditar, salvar } = useEstado();
  const [aba, setAba] = useState("dashboard");

  const acoes = useMemo(() => acoesAtuais(estado.acoes), [estado.acoes]);
  const decPendentes = useMemo(() => decisoesPendentesCount(estado.decisoes), [estado.decisoes]);
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
    if (!base) return;
    const pend = status === base.opcoes[0];
    salvar("decisoes", id, { status, data: pend ? "" : new Date().toISOString() });
    toast.success("Decisão registrada");
  }

  return (
    <div className="min-h-screen bg-background">
      <Header atualizadoLabel={atualizadoLabel} />
      <Hero />

      <main className="mx-auto max-w-6xl px-4 pb-16">
        <Tabs value={aba} onValueChange={setAba}>
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
            <TabsTrigger value="decisoes">
              Decisões{decPendentes > 0 && ` (${decPendentes})`}
            </TabsTrigger>
            <TabsTrigger value="pessoal">Quadro de pessoal</TabsTrigger>
            <TabsTrigger value="plano">
              Plano de ação{atrasadas > 0 && ` (${atrasadas})`}
            </TabsTrigger>
            <TabsTrigger value="recursos">Recursos e equipamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab acoes={acoes} estadoDecisoes={estado.decisoes} />
          </TabsContent>
          <TabsContent value="cronograma">
            <CronogramaTab acoes={acoes} />
          </TabsContent>
          <TabsContent value="decisoes">
            <DecisoesTab
              acoes={acoes}
              estadoDecisoes={estado.decisoes}
              podeEditar={podeEditar}
              onDecidir={handleDecisao}
            />
          </TabsContent>
          <TabsContent value="pessoal">
            <PessoalTab />
          </TabsContent>
          <TabsContent value="plano">
            <PlanoTab acoes={acoes} podeEditar={podeEditar} onUpdate={handleAcaoUpdate} />
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
