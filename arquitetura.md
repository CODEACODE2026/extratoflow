# Arquitetura

## Projeto
ExtratoFlow

## Fontes
- `discovery.md`
- `master-prompt.md`
- `requisitos.md`
- `/opt/codeacode/ai-office/templates/arquitetura.md`
- `/opt/codeacode/ai-office/knowledge/backend.md`
- `/opt/codeacode/ai-office/knowledge/frontend.md`
- `/opt/codeacode/ai-office/project-library/erp.md`
- `/opt/codeacode/ai-office/quality-gates/backend.md`
- `/opt/codeacode/ai-office/quality-gates/project-ready.md`

## Nivel do projeto
- Nivel: Nivel 2.
- Justificativa: o projeto e um sistema web administrativo com login, CRUDs, upload de PDF, processamento de arquivo, banco relacional, filtros, dashboard e fluxo financeiro mensal. Nao ha necessidade inicial de IA, WebSocket, Redis, multi-tenant ou arquitetura SaaS.

## Stack recomendada
- frontend: React + TypeScript + Vite.
- backend: Node.js + TypeScript + Express.
- banco: MySQL.
- ORM/migrations: Prisma.
- autenticacao: JWT em cookie HttpOnly ou sessao segura no backend.
- upload: Multer ou equivalente, salvando PDFs em pasta privada no servidor.
- parser PDF: extracao de texto com biblioteca Node para PDF textual; OCR fica fora do MVP ate confirmacao de PDF escaneado.
- validacao: schemas de entrada no backend.
- infra: VPS Linux, Node em processo gerenciado, MySQL, Nginx como reverse proxy e HTTPS.

## Visao geral
Arquitetura em monorepo simples com duas aplicacoes:
- `apps/api`: backend HTTP, regras de negocio, parser de PDF, acesso ao banco e autenticacao.
- `apps/web`: frontend administrativo, telas, filtros, formularios e consumo da API.

O backend e a fonte de verdade para permissoes, status, regras de nota, importacao e deduplicacao. O frontend nao deve decidir regras criticas sozinho.

## Modulos
- Auth:
  - login;
  - logout;
  - usuario autenticado;
  - protecao de rotas.
- Usuarios:
  - CRUD de usuarios;
  - perfis;
  - status ativo/inativo.
- Descricoes:
  - CRUD de descricoes padrao;
  - tipo sugerido;
  - status ativo/inativo.
- Importacoes:
  - upload de PDF;
  - registro da importacao;
  - chamada do parser;
  - armazenamento do arquivo privado;
  - historico de importacoes.
- Parser de extrato:
  - extracao de texto;
  - leitura por linhas;
  - identificacao de datas;
  - regra `PIX CREDITO DE`;
  - extracao de pagador;
  - extracao de valor;
  - ignorar `Saldo do Dia`;
  - retorno de movimentacoes candidatas para revisao.
- Movimentacoes:
  - CRUD;
  - filtros;
  - vinculo de descricao;
  - status pendente/transmitido;
  - numero da nota.
- Lancamento de notas:
  - lancamento individual;
  - lancamento em massa por mes;
  - confirmacao antes de aplicar;
  - auditoria da alteracao.
- Dashboard/relatorios:
  - totais por mes;
  - entradas;
  - saidas;
  - pendentes;
  - transmitidos.
- Auditoria:
  - registro de acoes criticas;
  - importacoes;
  - alteracao de nota/status;
  - exclusoes/inativacoes.

## Estrutura de pastas
```text
extratoflow/
  apps/
    api/
      src/
        config/
        database/
          prisma/
          migrations/
        http/
          middlewares/
          routes/
          server.ts
        modules/
          auth/
            auth.controller.ts
            auth.service.ts
            auth.routes.ts
          users/
          descriptions/
          imports/
          statement-parser/
          transactions/
          invoices/
          dashboard/
          audit/
        shared/
          errors/
          validation/
          storage/
          permissions/
      uploads/
        private/
      package.json
      tsconfig.json
      .env.example
    web/
      src/
        app/
        components/
        features/
          auth/
          dashboard/
          imports/
          transactions/
          descriptions/
          users/
          invoices/
        lib/
          api/
          auth/
          formatters/
        styles/
        types/
      package.json
      tsconfig.json
  docs/
  discovery.md
  master-prompt.md
  requisitos.md
  arquitetura.md
```

Observacao: a estrutura de codigo so deve ser criada em tarefa tecnica propria, apos aprovacao. Este documento apenas define o alvo arquitetural.

## API e contratos
Padrao geral:
- rotas versionadas em `/api/v1`;
- respostas JSON previsiveis;
- erros com `message`, `code` e detalhes quando util;
- listas com paginacao;
- filtros enviados por query string;
- operacoes criticas protegidas por permissao.

### Auth
- `POST /api/v1/auth/login`
  - entrada: login/email e senha.
  - saida: usuario autenticado e cookie/token.
- `POST /api/v1/auth/logout`
  - encerra sessao.
- `GET /api/v1/auth/me`
  - retorna usuario autenticado.

### Usuarios
- `GET /api/v1/users`
- `POST /api/v1/users`
- `GET /api/v1/users/:id`
- `PUT /api/v1/users/:id`
- `PATCH /api/v1/users/:id/status`

### Descricoes padrao
- `GET /api/v1/descriptions`
- `POST /api/v1/descriptions`
- `GET /api/v1/descriptions/:id`
- `PUT /api/v1/descriptions/:id`
- `PATCH /api/v1/descriptions/:id/status`

### Importacoes
- `POST /api/v1/imports/pdf`
  - recebe PDF;
  - salva arquivo privado;
  - executa parser;
  - retorna movimentacoes candidatas para revisao.
- `GET /api/v1/imports`
  - lista historico de importacoes.
- `GET /api/v1/imports/:id`
  - detalha importacao.
- `POST /api/v1/imports/:id/confirm`
  - salva movimentacoes revisadas.

### Movimentacoes
- `GET /api/v1/transactions`
  - filtros: mes, data_inicio, data_fim, tipo, status, pagador, descricao, valor_min, valor_max.
- `POST /api/v1/transactions`
- `GET /api/v1/transactions/:id`
- `PUT /api/v1/transactions/:id`
- `DELETE /api/v1/transactions/:id` ou inativacao, conforme decisao final.
- `PATCH /api/v1/transactions/:id/description`
- `PATCH /api/v1/transactions/:id/invoice-number`

### Lancamento de notas
- `POST /api/v1/invoices/bulk-prepare`
  - recebe mes, filtros e numero da nota;
  - retorna lista de movimentacoes que seriam afetadas.
- `POST /api/v1/invoices/bulk-apply`
  - aplica numero da nota nas movimentacoes confirmadas;
  - muda status para transmitido;
  - registra auditoria.

### Dashboard
- `GET /api/v1/dashboard/summary`
  - filtros: mes, ano.
  - retorna totais de entrada, saida, pendente e transmitido.
- `GET /api/v1/dashboard/monthly`
  - resumo mensal.

## Banco de dados
Banco relacional MySQL com migrations versionadas.

### Tabelas iniciais
```text
users
- id
- name
- email
- password_hash
- role
- status
- created_at
- updated_at

descriptions
- id
- name
- suggested_type
- status
- created_at
- updated_at

imports
- id
- file_original_name
- file_storage_path
- file_mime_type
- file_size
- status
- user_id
- total_lines_read
- total_transactions_detected
- total_transactions_saved
- error_message
- created_at
- updated_at

transactions
- id
- import_id
- payment_date
- type
- payer_name
- description_text
- description_id
- amount
- invoice_number
- status
- source
- raw_text
- dedup_hash
- created_at
- updated_at

audit_logs
- id
- user_id
- entity
- entity_id
- action
- summary
- created_at
```

### Relacionamentos
- `imports.user_id` referencia `users.id`.
- `transactions.import_id` referencia `imports.id`, opcional para movimentacoes manuais.
- `transactions.description_id` referencia `descriptions.id`, opcional.
- `audit_logs.user_id` referencia `users.id`.

### Enums sugeridos
- `users.role`: `admin`, `operator`, `viewer`.
- `users.status`: `active`, `inactive`.
- `descriptions.status`: `active`, `inactive`.
- `imports.status`: `processing`, `review_required`, `confirmed`, `failed`.
- `transactions.type`: `entry`, `exit`.
- `transactions.status`: `pending`, `transmitted`.
- `transactions.source`: `pdf_import`, `manual`.

### Indices recomendados
- `transactions.payment_date`.
- `transactions.status`.
- `transactions.type`.
- `transactions.payer_name`.
- `transactions.description_id`.
- `transactions.invoice_number`.
- `transactions.dedup_hash`.
- indice composto para filtros mensais: `payment_date`, `status`, `type`.

## Autenticacao e permissoes
- Senhas sempre com hash.
- Rotas internas protegidas por middleware de autenticacao.
- Permissoes validadas no backend.
- Perfis iniciais:
  - `admin`: acesso total.
  - `operator`: operacao financeira e importacao.
  - `viewer`: consulta e relatorios.
- Arquivos PDF nao devem ficar em pasta publica.
- `.env` deve guardar segredos e configuracoes sensiveis.
- `.env.example` deve listar variaveis sem valores reais.

## Estrategia do parser de PDF
O parser deve ser um modulo isolado para evitar espalhar regra de banco/extrato pelo sistema.

### Fase 1: PDF textual
- Extrair texto do PDF.
- Normalizar quebras de linha e espacos.
- Percorrer linhas mantendo a data corrente.
- Detectar linhas com data `DD/MM/AAAA`.
- Detectar `PIX CREDITO DE`.
- Extrair pagador apos `PIX CREDITO DE:`.
- Extrair valor em reais.
- Ignorar linhas contendo `Saldo do Dia`.
- Retornar movimentacoes candidatas com:
  - data;
  - tipo;
  - pagador;
  - descricao sugerida;
  - valor;
  - texto bruto;
  - alertas de confianca.

### Fase 2: revisao humana
- Nenhuma movimentacao extraida deve ser salva definitivamente sem passar pela tela de revisao.
- Linhas com baixa confianca devem aparecer marcadas para correcao.
- Usuario pode editar dados antes de confirmar.

### Fase futura: OCR
- Se o PDF real for imagem/escaneado, criar tarefa separada para OCR.
- OCR nao entra no MVP sem confirmacao do arquivo original.

## Fluxo de importacao
1. Usuario envia PDF.
2. Backend valida tipo e tamanho do arquivo.
3. Backend salva arquivo em pasta privada.
4. Backend registra importacao.
5. Backend extrai texto.
6. Parser gera movimentacoes candidatas.
7. API retorna dados para tela de revisao.
8. Usuario corrige/descarta linhas.
9. Usuario confirma.
10. Backend salva movimentacoes com status `pending` e `invoice_number` vazio.
11. Backend registra auditoria.

## Fluxo de numero da nota
### Individual
1. Usuario abre movimentacao.
2. Usuario informa numero da nota.
3. Backend valida permissao.
4. Backend salva numero da nota.
5. Backend altera status para `transmitted`.
6. Backend registra auditoria.

### Em massa
1. Usuario escolhe mes e filtros.
2. Usuario informa numero da nota.
3. Backend retorna previa das movimentacoes afetadas.
4. Usuario confirma.
5. Backend atualiza as movimentacoes selecionadas.
6. Backend altera status para `transmitted`.
7. Backend registra auditoria.

## Frontend
Aplicacao administrativa com navegacao lateral ou superior, foco em uso operacional.

### Areas principais
- Login.
- Dashboard.
- Importar extrato.
- Revisar importacao.
- Movimentacoes.
- Descricoes.
- Usuarios.
- Lancamento mensal.
- Historico de importacoes.

### Padroes de tela
- Tabelas com filtros compactos.
- Acoes principais visiveis.
- Estados de carregamento, vazio, erro e sucesso.
- Confirmacao para exclusao e lancamento em massa.
- Paginas densas, claras e sem hero marketing.
- Icones em acoes administrativas.

## Integracoes externas
- Nenhuma integracao externa obrigatoria no MVP.
- Banco via API, emissao fiscal, OCR e exportacoes avancadas ficam para fases futuras.

## Riscos tecnicos
- PDF pode ser escaneado, exigindo OCR.
- Layout do extrato pode variar entre bancos ou ate entre periodos.
- Saidas podem nao ter padrao suficiente para extracao automatica confiavel.
- Importacao duplicada pode gerar registros repetidos se o hash de deduplicacao nao for bem definido.
- Lancamento em massa precisa de confirmacao clara para evitar atualizar registros errados.
- Arquivos de extrato contem dados sensiveis e precisam ficar fora de acesso publico.

## Limites do MVP
- Suportar primeiro o layout de extrato enviado pelo cliente.
- Priorizar PDF textual.
- Nao emitir nota fiscal.
- Nao transmitir nota fiscal.
- Nao integrar com banco via API.
- Nao implementar OCR sem nova aprovacao.
- Nao implementar multiempresa.
- Nao implementar SaaS/multi-tenant.
- Nao implementar mobile nativo.

## Quality Gates
- `quality-gates/project-ready.md`
- `quality-gates/backend.md` quando houver backend
- Antes de DEV:
  - discovery, master prompt, requisitos e arquitetura aprovados;
  - UX definida;
  - direcao criativa definida;
  - tarefas pequenas criadas;
  - primeira tarefa tecnica aprovada pelo usuario.

## Proxima tarefa recomendada
Tarefa 4: criar `ux.md`, definindo jornada principal, telas prioritarias, estados de interface e fluxo de importacao/revisao/lancamento de nota.

## Criterio para avancar
Arquitetura proporcional ao problema, rastreavel aos requisitos e pronta para UX/UI antes de qualquer implementacao tecnica.
