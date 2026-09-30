# MEGA LOJA AV BRASIL — Dashboard de implantação

Dashboard de acompanhamento da implantação e mudança da MEGA LOJA AV BRASIL.
React + TypeScript + Vite + Tailwind CSS + shadcn/ui + Recharts.

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

O push para `main` dispara `.github/workflows/deploy.yml`, que builda o
projeto e publica `dist/` no GitHub Pages automaticamente.

## Estrutura

- `src/data/projeto.ts` — dados do projeto (ações, decisões, pessoal, recursos)
- `src/lib/dominio.ts` — regras de negócio (situação, prazos, filtros)
- `src/lib/storage.ts` — persistência do estado editável (localStorage)
- `src/components/*Tab.tsx` — uma aba por seção do dashboard
- `legacy/INDEX.html` — versão anterior em HTML/CSS/JS puro, mantida como referência
