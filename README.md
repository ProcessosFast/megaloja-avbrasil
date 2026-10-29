# MEGA LOJA AV BRASIL — Dashboard de implantação

Dashboard de acompanhamento da implantação e mudança da MEGA LOJA AV BRASIL.
React + TypeScript + Vite + Tailwind CSS + shadcn/ui + Recharts.

**Publicado em:** https://megaloja-avbrasil.vercel.app

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Gera os arquivos estáticos em `dist/`.

## Publicação

O push para `main` dispara o deploy automático na Vercel.

## Banco de dados compartilhado (Upstash Redis na Vercel)

Status das ações e decisões ficam salvos no Upstash Redis, via a função
`api/state.js` (hashes `ml:acoes`, `ml:decisoes`, `ml:decisoesCustom`).
O site lê o banco ao abrir, a cada 15 segundos e ao voltar para a aba.

Para ligar: na Vercel, **Storage > Upstash for Redis** (pode ser o mesmo banco
dos outros portais) **> Connect Project > megaloja-avbrasil** e faça um
redeploy. Teste em https://megaloja-avbrasil.vercel.app/api/state.

Sem o banco conectado o app funciona normalmente, só que sem sincronizar entre
visitantes (fallback automático para `localStorage`). Quando o banco é ligado,
as alterações que cada navegador tinha salvas localmente são somadas a ele na
primeira visita.

## Estrutura

- `src/data/projeto.ts` — dados do projeto (ações, decisões, pessoal, recursos)
- `src/lib/dominio.ts` — regras de negócio (situação, prazos, filtros)
- `api/state.js` — API do banco (função serverless da Vercel)
- `src/lib/storage.ts` — persistência do estado editável (Upstash via /api/state, com fallback local)
- `src/components/*Tab.tsx` — uma aba por seção do dashboard
- `legacy/INDEX.html` — versão anterior em HTML/CSS/JS puro, mantida como referência
