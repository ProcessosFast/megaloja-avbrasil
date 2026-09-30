// Dados do projeto — portados de legacy/INDEX.html (linhas 394-474).
// Alterações feitas na página ficam salvas à parte (ver src/lib/storage.ts).

export interface Projeto {
  atualizadoEm: string;
  mudanca: string;
  inicio: string;
  fim: string;
  feriados: string[];
}

export const PROJETO: Projeto = {
  atualizadoEm: "2026-09-30",
  mudanca: "2026-10-16",
  inicio: "2026-09-28",
  fim: "2026-10-17",
  feriados: ["2026-10-12"],
};

export const STATUS = ["Não iniciado", "Em andamento", "Concluído"] as const;
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
}

export const ACOES: Acao[] = [
  { id: "a19", f: "Contratual", a: "Assinar contrato de locação do galpão da MEGA LOJA AV BRASIL", i: "2026-10-01", p: "2026-10-01", r: "", s: "Não iniciado", o: "Prazo de assinatura 01/10" },
  { id: "a01", f: "Estrutural", a: "Alinhar com o time interno de engenharia a avaliação da viga", i: "2026-09-28", p: "2026-10-02", r: "", s: "Não iniciado", o: "Laudo e ART antes de qualquer intervenção. Resultado vai para a aba Decisões", dec: "viga" },
  { id: "a02", f: "Estrutural", a: "Contratar manutenção do telhado (retirada de goteiras)", i: "2026-09-28", p: "2026-10-02", r: "", s: "Não iniciado", o: "Exigir equipe em conformidade com a NR-35" },
  { id: "a03", f: "Estrutural", a: "Alugar andaime", i: "2026-09-28", p: "2026-10-02", r: "", s: "Não iniciado", o: "Entrega até 05/10" },
  { id: "a04", f: "Layout", a: "Definir layout em duas versões (com e sem remoção da viga)", i: "2026-09-28", p: "2026-10-02", r: "", s: "Não iniciado", o: "Curva A perto da expedição. Versão final depende da decisão da viga", dec: "layout" },
  { id: "a05", f: "Transporte", a: "Reservar 2 carretas e 2 trucks para 16/10", i: "2026-09-28", p: "2026-10-02", r: "", s: "Não iniciado", o: "Caminhão fechado ou sider para as placas" },
  { id: "a06", f: "Transporte", a: "Alugar 1 empilhadeira para o novo galpão", i: "2026-09-28", p: "2026-10-02", r: "", s: "Não iniciado", o: "Entrega no dia 15/10. Atenção ao feriado de 12/10" },
  { id: "a07", f: "Fiscal", a: "Alinhar notas fiscais de transferência com o fiscal/contábil", i: "2026-09-28", p: "2026-10-02", r: "", s: "Não iniciado", o: "Uma nota por carga" },
  { id: "a08", f: "Estrutural", a: "Executar manutenção do telhado", i: "2026-10-05", p: "2026-10-07", r: "", s: "Não iniciado", o: "" },
  { id: "a09", f: "Estrutural", a: "Executar intervenção na viga (se liberada)", i: "2026-10-05", p: "2026-10-07", r: "", s: "Não iniciado", o: "Somente com laudo aprovado. Se não liberar, usar layout sem remoção", dec: "viga" },
  { id: "a10", f: "Estrutural", a: "Retirar andaime", i: "2026-10-08", p: "2026-10-08", r: "", s: "Não iniciado", o: "" },
  { id: "a11", f: "Layout", a: "Montar almoxarifado", i: "2026-10-08", p: "2026-10-14", r: "", s: "Não iniciado", o: "" },
  { id: "a12", f: "Layout", a: "Marcar layout no piso do novo galpão (se possível)", i: "2026-10-13", p: "2026-10-14", r: "", s: "Não iniciado", o: "12/10 é feriado" },
  { id: "a13", f: "Estoque", a: "Pré-montar paletes no almoxarifado em Japeri", i: "2026-10-13", p: "2026-10-14", r: "", s: "Não iniciado", o: "" },
  { id: "a14", f: "Fiscal", a: "Confirmar emissão das notas", i: "2026-10-15", p: "2026-10-15", r: "", s: "Não iniciado", o: "" },
  { id: "a15", f: "Transporte", a: "Receber empilhadeira alugada no novo galpão", i: "2026-10-15", p: "2026-10-15", r: "", s: "Não iniciado", o: "" },
  { id: "a16", f: "Transporte", a: "Confirmar horários de chegada escalonados dos veículos", i: "2026-10-15", p: "2026-10-15", r: "", s: "Não iniciado", o: "Evitar fila na doca" },
  { id: "a17", f: "Estoque", a: "Mudança", i: "2026-10-16", p: "2026-10-16", r: "", s: "Não iniciado", o: "Ver aba Quadro de pessoal", marco: true },
  { id: "a18", f: "Estoque", a: "Contingência e conferência final", i: "2026-10-17", p: "2026-10-17", r: "", s: "Não iniciado", o: "Sábado reservado para atrasos" },
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
}

// O primeiro item de "opcoes" é o estado pendente; "negativas" pintam de vermelho.
export const DECISOES: Decisao[] = [
  {
    id: "viga",
    titulo: "Liberação da intervenção na viga",
    aprovador: "Time interno de engenharia (laudo e ART)",
    prazo: "2026-10-02",
    opcoes: ["Aguardando avaliação", "Liberada", "Não liberada"],
    negativas: [],
    descricao: "Avaliar se a viga pode sofrer intervenção. Nenhuma intervenção acontece sem laudo e ART.",
    impacto: "Define se a intervenção de 05 a 07/10 acontece e qual versão de layout será usada. Se não liberar, segue o layout sem remoção.",
    acoes: ["a01", "a09"],
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

export const FRENTES = ["Contratual", "Estrutural", "Layout", "Transporte", "Fiscal", "Estoque"] as const;
