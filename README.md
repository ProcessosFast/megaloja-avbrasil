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

## Banco de dados compartilhado (Supabase)

Sem configurar isso, cada visitante só vê as próprias alterações (salvas no
`localStorage` do navegador dele). Para que status e decisões fiquem
visíveis para todo mundo:

1. Crie um projeto grátis em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode:

   ```sql
   create table estado (
     colecao text not null,
     id text not null,
     dados jsonb not null default '{}'::jsonb,
     atualizado_em timestamptz not null default now(),
     primary key (colecao, id)
   );

   alter table estado enable row level security;
   create policy "leitura publica" on estado for select using (true);
   create policy "escrita publica" on estado for all using (true) with check (true);
   alter publication supabase_realtime add table estado;
   ```

3. Em **Project Settings > API**, copie a **Project URL** e a chave **anon public**.
4. Localmente, copie `.env.example` para `.env` e preencha as duas variáveis.
5. Na Vercel, adicione as mesmas variáveis em **Project Settings > Environment
   Variables** (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) e faça um redeploy.

Sem essas variáveis o app funciona normalmente, só que sem sincronizar entre
visitantes (fallback automático para `localStorage`).

## Estrutura

- `src/data/projeto.ts` — dados do projeto (ações, decisões, pessoal, recursos)
- `src/lib/dominio.ts` — regras de negócio (situação, prazos, filtros)
- `src/lib/storage.ts` — persistência do estado editável (Supabase, com fallback local)
- `src/components/*Tab.tsx` — uma aba por seção do dashboard
- `legacy/INDEX.html` — versão anterior em HTML/CSS/JS puro, mantida como referência
