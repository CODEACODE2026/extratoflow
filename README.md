# ExtratoFlow

Sistema web administrativo para importar extratos bancarios em PDF, revisar movimentacoes, vincular descricoes e controlar numeros de nota.

## Stack

- Monorepo npm workspaces
- API: Node.js, TypeScript, Express, Prisma e MySQL
- Web: React, TypeScript e Vite
- Autenticacao: JWT em cookie HttpOnly
- Upload: PDF privado em `apps/api/uploads/private`

## Estrutura

```text
apps/
  api/  # API HTTP, auth, Prisma, parser PDF e regras de negocio
  web/  # Frontend administrativo em React/Vite
```

## Requisitos

- Node.js 20+
- npm 10+
- MySQL 8+

## Configuracao

Crie os arquivos `.env` a partir dos exemplos:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Variaveis principais:

- `DATABASE_URL`: conexao MySQL da API
- `JWT_SECRET`: segredo forte para assinar a sessao
- `WEB_ORIGIN`: origem permitida para CORS
- `VITE_API_URL`: URL publica da API para o frontend
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`: usuario inicial criado pelo seed

Nao use os valores de exemplo em producao.

## Instalacao

```bash
npm install
npm run prisma:generate
npm run prisma:validate
```

Com o MySQL configurado e migrations aplicadas, crie o admin inicial:

```bash
npm run prisma:seed
```

## Desenvolvimento

Em terminais separados:

```bash
npm run dev:api
npm run dev:web
```

URLs locais:

- Web: `http://localhost:5173`
- API health: `http://localhost:3333/api/v1/health`

## Validacao

```bash
npm run test:parser
npm run typecheck
npm run build
```

## Scripts Principais

| Comando | Uso |
| --- | --- |
| `npm run dev:api` | Inicia API local |
| `npm run dev:web` | Inicia Web local |
| `npm run typecheck` | Typecheck de todos os workspaces |
| `npm run build` | Build de API e Web |
| `npm run prisma:generate` | Gera Prisma Client |
| `npm run prisma:validate` | Valida schema Prisma |
| `npm run prisma:seed` | Cria/atualiza usuario admin inicial |
| `npm run test:parser` | Executa smoke test do parser textual |

## Fluxos Implementados

- Login, logout e sessao atual
- Usuarios e perfis admin/operator/viewer
- Descricoes padrao
- Upload de PDF textual
- Revisao e confirmacao de importacao
- Historico de importacoes e detalhe de erro
- Movimentacoes com filtros, edicao e nota individual
- Lancamento mensal em massa com previa e confirmacao
- Dashboard financeiro com indicadores mensais
- Auditoria de acoes criticas no backend

## Limitacoes Conhecidas

- OCR para PDF escaneado esta fora do MVP.
- QA ponta a ponta real depende de MySQL configurado, migrations aplicadas e usuario admin criado.
- A suite automatizada ainda e minima; existe smoke test para o parser textual.

## Deploy

Veja [deploy.md](deploy.md).
