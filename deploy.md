# Deploy - ExtratoFlow

Guia base para publicar o ExtratoFlow em uma VPS Linux com Node.js, MySQL, Nginx e HTTPS.

## 1. Preparar Servidor

Requisitos:

- Node.js 20+
- npm 10+
- MySQL 8+
- Nginx
- Certificado HTTPS
- Processo gerenciado por systemd, PM2 ou equivalente

## 2. Variaveis de Ambiente

Crie `.env` na raiz, `apps/api/.env` e `apps/web/.env` a partir dos exemplos versionados.

API:

```env
NODE_ENV=production
API_PORT=3333
WEB_ORIGIN=https://app.seudominio.com
DATABASE_URL="mysql://usuario:senha@localhost:3306/extratoflow"
JWT_SECRET="troque_por_um_segredo_forte"
AUTH_COOKIE_NAME=extratoflow_token
ADMIN_NAME="Administrador"
ADMIN_EMAIL="admin@seudominio.com"
ADMIN_PASSWORD="troque_esta_senha"
```

Web:

```env
VITE_API_URL=https://api.seudominio.com/api/v1
```

Nunca versionar `.env` com valores reais.

## 3. Banco de Dados

```bash
npm install
npm run prisma:generate
npm run prisma:validate
```

Aplicar migrations conforme o fluxo definido para o ambiente:

```bash
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
```

Criar ou atualizar o admin inicial:

```bash
npm run prisma:seed
```

## 4. Build

```bash
npm run test:parser
npm run typecheck
npm run build
```

Artefatos:

- API compilada em `apps/api/dist`
- Web compilada em `apps/web/dist`

## 5. Subir API

Exemplo com processo Node:

```bash
npm run start:api
```

Recomendado em producao:

- criar service systemd ou PM2
- manter `NODE_ENV=production`
- manter uploads em disco persistente
- proteger `apps/api/uploads/private`

## 6. Servir Web

Servir `apps/web/dist` via Nginx.

Exemplo de bloco Nginx para SPA:

```nginx
server {
  listen 80;
  server_name app.seudominio.com;

  root /var/www/extratoflow/apps/web/dist;
  index index.html;

  location / {
    try_files $uri /index.html;
  }
}
```

## 7. Proxy da API

Exemplo Nginx para API:

```nginx
server {
  listen 80;
  server_name api.seudominio.com;

  location / {
    proxy_pass http://127.0.0.1:3333;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Ativar HTTPS antes de uso real.

## 8. Checklist de Release

- `npm run test:parser` passou
- `npm run typecheck` passou
- `npm run build` passou
- `npm run prisma:validate` passou
- migrations aplicadas
- `npm run prisma:seed` executado com senha segura
- `.env` revisado sem valores de exemplo
- API responde `/api/v1/health`
- Web carrega via HTTPS
- Login admin testado
- Upload de PDF textual testado
- Permissoes admin/operator/viewer revisadas
- `git status` revisado antes do commit

## 9. Riscos Pendentes

- OCR nao incluso no MVP.
- Sem suite E2E automatizada completa.
- QA real depende de dados e banco configurados.
