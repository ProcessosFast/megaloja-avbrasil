// Dados do projeto — portados de legacy/INDEX.html (linhas 394-474).
// Alterações feitas na página ficam salvas à parte (ver src/lib/storage.ts).

export interface Projeto {
  atualizadoEm: string;
  mudanca: string;
  mudancaLojas: string;
  inicio: string;
  fim: string;
  feriados: string[];
}

export const PROJETO: Projeto = {
  atualizadoEm: "2026-10-05",
  mudanca: "2026-10-16",
  mudancaLojas: "2026-10-26",
  inicio: "2026-09-28",
  fim: "2026-10-26",
  feriados: ["2026-10-12"],
};

export const STATUS = ["Não iniciado", "Em andamento", "Concluído", "Suspenso temporariamente", "Cancelado"] as const;
export type Status = (typeof STATUS)[number];

export interface Acao {
  id: string;
  f: string;
  a: string;
  i: string;
  p: string;
  r: string;
  s: Status;
  o: string;
  marco?: boolean;
  dec?: string;
  // Status definitivo: o que estiver salvo pelo site não sobrescreve.
  fixo?: boolean;
  // Pendência crítica: destacada como "Máxima atenção" em todo o portal.
  critico?: boolean;
}

export const ACOES: Acao[] = [
  { id: "a19", f: "Contratual", a: "Assinar contrato de locação do galpão da MEGA LOJA AV BRASIL", i: "2026-10-01", p: "2026-10-01", r: "", s: "Concluído", o: "Contrato assinado", fixo: true },
  // Viga, laudo e layout — mesmo assunto, em sequência: avaliação/laudo -> retirada da viga -> layout.
  { id: "a01", f: "Viga e layout", a: "Alinhar com o time interno de engenharia a avaliação da viga", i: "2026-09-28", p: "2026-10-02", r: "", s: "Suspenso temporariamente", o: "SUSPENSA TEMPORARIAMENTE — a parte da viga ficará para depois. LAUDO antes de qualquer intervenção", dec: "viga" },
  { id: "a32", f: "Viga e layout", a: "Laudo pericial do Glauco · viga", i: "", p: "", r: "Glauco", s: "Não iniciado", o: "A retirada da viga está suspensa dependendo deste laudo", dec: "viga" },
  { id: "a09", f: "Viga e layout", a: "Retirar viga, elevar piso em 50cm e construir rampas de acesso e saída", i: "2026-10-05", p: "2026-10-07", r: "", s: "Suspenso temporariamente", o: "SUSPENSA TEMPORARIAMENTE — depende do laudo pericial do Glauco. Rampa de subida e rampa de descida (desnível de 50cm) para dar altura suficiente à carreta passar. Somente com laudo aprovado.", dec: "viga" },
  { id: "a04", f: "Viga e layout", a: "Definir layout em duas versões (com e sem remoção da viga)", i: "2026-09-28", p: "2026-10-08", r: "", s: "Em andamento", o: "Aguardando validação do Joselio; Josiel irá enviar hoje, 07/10. Curva A perto da expedição. Versão final depende da decisão da viga", dec: "layout" },
  { id: "a11", f: "Viga e layout", a: "Montar almoxarifado", i: "2026-10-07", p: "2026-10-14", r: "", s: "Em andamento", o: "Layout montado; será enviado hoje, 07/10, para o Joselio aprovar" },
  { id: "a12", f: "Viga e layout", a: "Marcar layout no piso do novo galpão (se possível)", i: "2026-10-13", p: "2026-10-14", r: "", s: "Em andamento", o: "Layout em montagem; será enviado hoje, 07/10, para avaliação. 12/10 é feriado" },
  { id: "a02", f: "Estrutural", a: "Contratar manutenção do telhado (retirada de goteiras)", i: "2026-10-08", p: "2026-10-08", r: "", s: "Não iniciado", o: "A depender da visita do Osias em 08/10" },
  { id: "a03", f: "Estrutural", a: "Alugar andaime", i: "2026-09-28", p: "2026-10-02", r: "", s: "Cancelado", o: "CANCELADO — será utilizada a empilhadeira com cinto de segurança", fixo: true },
  { id: "a05", f: "Transporte", a: "Reservar 2 carretas e 2 trucks para 16/10", i: "2026-09-28", p: "2026-10-02", r: "", s: "Concluído", o: "Caminhão fechado ou sider para as placas", fixo: true },
  { id: "a06", f: "Transporte", a: "Alugar 1 empilhadeira para o novo galpão", i: "2026-09-28", p: "2026-10-02", r: "", s: "Concluído", o: "Empilhadeira chegou em 07/10", fixo: true },
  { id: "a07", f: "Fiscal", a: "Alinhar notas fiscais de transferência com o fiscal/contábil", i: "2026-09-28", p: "2026-10-02", r: "", s: "Concluído", o: "Uma nota por carga", fixo: true },
  { id: "a08", f: "Estrutural", a: "Executar manutenção do telhado", i: "2026-10-05", p: "2026-10-13", r: "", s: "Não iniciado", o: "Estrutura pronta até 13/10" },
  { id: "a31", f: "Estrutural", a: "Visita do Osias (pedreiro) para ver a manutenção do telhado", i: "2026-10-08", p: "2026-10-08", r: "Osias", s: "Não iniciado", o: "Remarcada para 08/10 devido à altura; serviços por terceiro" },
  { id: "a10", f: "Estrutural", a: "Retirar andaime", i: "2026-10-13", p: "2026-10-13", r: "", s: "Cancelado", o: "CANCELADO — sem andaime (aluguel cancelado)", fixo: true },
  { id: "a13", f: "Estoque", a: "Pré-montar paletes no almoxarifado em Japeri", i: "2026-10-07", p: "2026-10-16", r: "", s: "Em andamento", o: "Início 07/10, finalização 16/10" },
  { id: "a14", f: "Fiscal", a: "Confirmar emissão das notas", i: "2026-10-15", p: "2026-10-15", r: "", s: "Não iniciado", o: "" },
  { id: "a15", f: "Transporte", a: "Receber empilhadeira alugada no novo galpão", i: "2026-10-07", p: "2026-10-07", r: "", s: "Concluído", o: "Empilhadeira chegou em 07/10 (antes previsto para 15/10)", fixo: true },
  { id: "a16", f: "Transporte", a: "Confirmar horários de chegada escalonados dos veículos", i: "2026-10-15", p: "2026-10-15", r: "", s: "Não iniciado", o: "Evitar fila na doca" },
  { id: "a17", f: "Estoque", a: "Mudança da DCS · 16/10", i: "2026-10-16", p: "2026-10-16", r: "", s: "Não iniciado", o: "Ver aba Quadro de pessoal", marco: true },
  { id: "a18", f: "Estoque", a: "Contingência e conferência final", i: "2026-10-17", p: "2026-10-17", r: "", s: "Não iniciado", o: "Sábado reservado para atrasos" },
  // Pendências avulsas — sem data definida ainda (ver Cronograma: aparecem como "Sem data definida").
  { id: "a21", f: "Diversos", a: "Frente final galpão", i: "", p: "", r: "", s: "Não iniciado", o: "" },
  { id: "a22", f: "Diversos", a: "E-mail Ramos e Realengo", i: "", p: "", r: "Ramos e Realengo", s: "Não iniciado", o: "" },
  { id: "a24", f: "Diversos", a: "Blindex frente loja", i: "", p: "", r: "", s: "Não iniciado", o: "" },
  { id: "a27", f: "Diversos", a: "Instalação de rede e wireless", i: "", p: "", r: "Plínio", s: "Não iniciado", o: "Depende do layout das salas" },
  { id: "a29", f: "Diversos", a: "Limpeza do galpão com 10 faxineiros", i: "2026-10-05", p: "2026-10-13", r: "", s: "Em andamento", o: "Limpeza pronta até 13/10" },
  { id: "a30", f: "Diversos", a: "Mudança de Realengo e Ramos", i: "2026-10-26", p: "2026-10-26", r: "Ramos e Realengo", s: "Não iniciado", o: "Realengo e Ramos precisam se mudar até 26/10", marco: true },
  { id: "a39", f: "Diversos", a: "Mudança de Bonsucesso", i: "", p: "", r: "", s: "Não iniciado", o: "Sem data definida ainda", marco: true },
  // Legalização do imóvel — pendências críticas, em sequência.
  { id: "a40", f: "Legalização", a: "1) Pedido de viabilidade na Prefeitura", i: "", p: "", r: "", s: "Não iniciado", o: "", critico: true },
  { id: "a41", f: "Legalização", a: "2) Avaliação da CET-RIO para imóvel acima de 6 mil m²", i: "", p: "", r: "", s: "Não iniciado", o: "Nota: algumas alterações podem ocorrer. A Casa do Montador, por exemplo, exige CET-RIO; outras não vão exigir certidão do Corpo de Bombeiros. Essas exigências podem variar.", critico: true },
  { id: "a42", f: "Legalização", a: "3) Pagamento de taxa e liberação do Alvará de Funcionamento", i: "", p: "", r: "", s: "Não iniciado", o: "", critico: true },
  { id: "a43", f: "Legalização", a: "4) Inscrição Municipal e pagamento da taxa de inscrição", i: "", p: "", r: "", s: "Não iniciado", o: "", critico: true },
  { id: "a44", f: "Legalização", a: "5) Liberação no Estado para emissão de NF-e e NFC-e", i: "", p: "", r: "", s: "Não iniciado", o: "", critico: true },
  { id: "a33", f: "Diversos", a: "Limpeza e teste de todos os A.C.", i: "", p: "", r: "", s: "Não iniciado", o: "" },
  { id: "a34", f: "Diversos", a: "Chaves e portas abertas", i: "", p: "", r: "", s: "Não iniciado", o: "" },
  { id: "a35", f: "Diversos", a: "Teste de todas as instalações elétricas", i: "", p: "", r: "", s: "Não iniciado", o: "" },
  { id: "a36", f: "Diversos", a: "Organizar todas as chaves", i: "", p: "", r: "", s: "Não iniciado", o: "" },
  { id: "a37", f: "Diversos", a: "Criar cópias das chaves e identificá-las", i: "", p: "", r: "", s: "Não iniciado", o: "" },
  { id: "a38", f: "Diversos", a: "Montar um claviculário", i: "", p: "", r: "", s: "Não iniciado", o: "" },
];

export interface Decisao {
  id: string;
  titulo: string;
  aprovador: string;
  prazo: string;
  opcoes: string[];
  negativas: string[];
  descricao: string;
  impacto: string;
  acoes: string[];
  img?: string;
  // Estado já conhecido de início (quando a decisão já foi tomada antes de alguém clicar no site).
  estadoInicial?: string;
  dataInicial?: string;
}

// O primeiro item de "opcoes" é o estado pendente; "negativas" pintam de vermelho.
export const DECISOES: Decisao[] = [
  {
    id: "viga",
    titulo: "Liberação da intervenção na viga",
    aprovador: "Time interno de engenharia (laudo)",
    prazo: "2026-10-02",
    opcoes: ["Aguardando avaliação", "Liberada", "Não liberada", "Suspensa temporariamente"],
    negativas: [],
    descricao:
      "Avaliar se a viga pode sofrer intervenção. Nenhuma intervenção acontece sem laudo. Solução definida: a viga pode ser retirada; o piso sobe 50cm, com uma rampa de acesso e outra de saída (desnível de 50cm) para dar altura suficiente à carreta passar.",
    impacto: "SUSPENSA TEMPORARIAMENTE: a retirada da viga depende do laudo pericial do Glauco. Define se a intervenção acontece e qual versão de layout será usada. Se não liberar, segue o layout sem remoção.",
    acoes: ["a01", "a32", "a09"],
    estadoInicial: "Suspensa temporariamente",
    dataInicial: "2026-10-05",
  },
  {
    id: "layout",
    titulo: "Versão final do layout do novo galpão",
    aprovador: "A definir",
    prazo: "2026-10-02",
    opcoes: ["Aguardando decisão", "Com remoção da viga", "Sem remoção da viga"],
    negativas: [],
    descricao: "Escolher entre as duas versões de layout, com a curva A perto da expedição. Depende da decisão da viga.",
    impacto: "Orienta a montagem do almoxarifado (a partir de 08/10) e a marcação do piso (13 e 14/10).",
    acoes: ["a04", "a11", "a12"],
  },
  {
    id: "fachada",
    titulo: "Layout da fachada",
    aprovador: "Diretoria",
    prazo: "",
    opcoes: ["Aguardando aprovação", "Aprovada", "Aprovada com ajustes", "Reprovada"],
    negativas: ["Reprovada"],
    img: "img-fachada",
    descricao:
      "Fachada com Fast Sistemas Construtivos (drywall, steel frame, acústica) e Fast Homes (casas modulares, chalés, projetos personalizados), faixa de marcas parceiras e vitrines no térreo.",
    impacto: "Produção e instalação de letreiros dependem de fornecedor externo; a contratação só começa após a aprovação.",
    acoes: [],
  },
];

export interface PessoalLinha {
  fn: string;
  eq: string;
  q: number;
  o: number;
  d: number;
  r: number;
  papel: string;
}

// Quadro de pessoal do dia 16/10 — Qtd deve ser igual a Origem + Destino + Reserva
export const PESSOAL: { expedicao: PessoalLinha[]; loja: PessoalLinha[] } = {
  expedicao: [
    { fn: "Supervisor", eq: "Mudança", q: 1, o: 0, d: 1, r: 0, papel: "Coordena a descarga e o endereçamento no novo galpão" },
    { fn: "Encarregado", eq: "Loja/DCS", q: 1, o: 1, d: 0, r: 0, papel: "Coordena o carregamento e a sequência dos veículos" },
    { fn: "Conferente", eq: "Loja/DCS", q: 1, o: 0, d: 1, r: 0, papel: "Confere cada carga contra o inventário de fechamento" },
    { fn: "Operador de empilhadeira", eq: "Mudança", q: 1, o: 0, d: 1, r: 0, papel: "Opera a empilhadeira alugada no novo galpão" },
    { fn: "Operador de empilhadeira", eq: "Loja/DCS", q: 2, o: 1, d: 0, r: 1, papel: "Origem + revezamento" },
    { fn: "Ajudante", eq: "Mudança", q: 2, o: 0, d: 2, r: 0, papel: "Descarga e posicionamento" },
    { fn: "Ajudante", eq: "Loja/DCS", q: 4, o: 3, d: 1, r: 2, papel: "Amarração, lona, descarga e revezamento" },
  ],
  loja: [],
};

export interface RecursoLinha {
  rc: string;
  q: number;
  uso: string;
  dt: string;
  forn: string;
  s: Status;
}

export const RECURSOS: { expedicao: RecursoLinha[]; loja: RecursoLinha[] } = {
  expedicao: [
    { rc: "Carreta", q: 2, uso: "Transporte do estoque", dt: "2026-10-16", forn: "", s: "Não iniciado" },
    { rc: "Truck", q: 2, uso: "Transporte do estoque", dt: "2026-10-16", forn: "", s: "Não iniciado" },
    { rc: "Empilhadeira (aluguel)", q: 1, uso: "Recebimento no novo galpão", dt: "2026-10-15", forn: "", s: "Não iniciado" },
    { rc: "Andaime (aluguel)", q: 1, uso: "Manutenção do telhado e viga", dt: "2026-10-05", forn: "", s: "Não iniciado" },
  ],
  loja: [],
};

export const ATENCAO: string[] = [
  "12/10 (segunda) é feriado: tudo que depende de terceiros precisa estar fechado até 09/10.",
];

export const FRENTES = ["Legalização", "Contratual", "Viga e layout", "Estrutural", "Transporte", "Fiscal", "Estoque", "Diversos"] as const;
