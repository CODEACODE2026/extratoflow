# Tarefas

## Projeto
ExtratoFlow

## Fontes
- `discovery.md`
- `master-prompt.md`
- `requisitos.md`
- `arquitetura.md`
- `ux.md`
- `direcao-criativa.md`
- `/opt/codeacode/ai-office/templates/codex-task.md`
- `/opt/codeacode/ai-office/quality-gates/project-ready.md`
- `/opt/codeacode/ai-office/quality-gates/backend.md`
- `/opt/codeacode/ai-office/quality-gates/ui-review.md`

## Regra geral
Nenhuma tarefa tecnica deve pedir para criar o sistema inteiro. Cada etapa deve ter escopo pequeno, arquivos permitidos, arquivos proibidos, contexto minimo, criterio de conclusao e validacao.

## Status documental
- Tarefa 1: discovery e master prompt - concluida.
- Tarefa 2: requisitos - concluida.
- Tarefa 3: arquitetura - concluida.
- Tarefa 4: UX - concluida.
- Tarefa 5: direcao criativa - concluida.
- Tarefa 6: tarefas economicas - concluida neste arquivo.

## Plano de execucao tecnica

### Tarefa 7 - Estrutura inicial do monorepo
Objetivo:
- Criar a estrutura inicial do projeto em `apps/api` e `apps/web`, com configuracoes base, scripts, TypeScript e arquivos de ambiente exemplo.

Arquivos permitidos:
- `package.json`
- `package-lock.json`
- `.gitignore`
- `README.md`
- `apps/api/**`
- `apps/web/**`
- `.env.example`

Arquivos proibidos:
- documentos ja aprovados, exceto se o usuario pedir ajuste;
- qualquer arquivo fora de `/opt/codeacode/repos/extratoflow`.

Contexto necessario:
- `arquitetura.md`
- `direcao-criativa.md`
- `requisitos.md`

Criterio de conclusao:
- projeto com estrutura inicial criada;
- scripts basicos documentados;
- backend e frontend com TypeScript configurado;
- nenhum modulo de negocio implementado ainda.

Validacao:
- instalar dependencias;
- rodar typecheck/build inicial quando houver scripts.

### Tarefa 8 - Backend base, healthcheck e padrao de erro
Objetivo:
- Criar API Express basica, healthcheck, middlewares essenciais, tratamento de erro e carregamento de variaveis de ambiente.

Arquivos permitidos:
- `apps/api/src/**`
- `apps/api/package.json`
- `apps/api/tsconfig.json`
- `apps/api/.env.example`

Arquivos proibidos:
- `apps/web/**`
- documentos aprovados.

Contexto necessario:
- `arquitetura.md`
- `/opt/codeacode/ai-office/knowledge/backend.md`
- `/opt/codeacode/ai-office/quality-gates/backend.md`

Criterio de conclusao:
- servidor inicia;
- rota de healthcheck responde;
- erros seguem formato padrao.

Validacao:
- `npm run typecheck` ou equivalente;
- `npm run build` quando existir;
- teste manual do healthcheck.

### Tarefa 9 - Banco, Prisma e schema inicial
Objetivo:
- Configurar Prisma e criar schema inicial com users, descriptions, imports, transactions e audit_logs.

Arquivos permitidos:
- `apps/api/prisma/**`
- `apps/api/src/database/**`
- `apps/api/package.json`
- `apps/api/.env.example`

Arquivos proibidos:
- frontend;
- modulos de API ainda nao aprovados.

Contexto necessario:
- `arquitetura.md`
- `requisitos.md`

Criterio de conclusao:
- schema Prisma representa as entidades aprovadas;
- migrations configuradas;
- `.env.example` possui variaveis sem segredo real.

Validacao:
- `npx prisma validate`;
- gerar client Prisma quando aplicavel.

### Tarefa 10 - Autenticacao e usuarios
Objetivo:
- Implementar login, logout, usuario autenticado, protecao de rotas e CRUD basico de usuarios.

Arquivos permitidos:
- `apps/api/src/modules/auth/**`
- `apps/api/src/modules/users/**`
- `apps/api/src/shared/permissions/**`
- `apps/api/src/http/**`
- `apps/api/prisma/**` apenas se ajuste pequeno for necessario.

Arquivos proibidos:
- frontend;
- parser de PDF;
- movimentacoes.

Contexto necessario:
- `requisitos.md`
- `arquitetura.md`
- `quality-gates/backend.md`

Criterio de conclusao:
- login funcional;
- rotas protegidas;
- senha com hash;
- perfis admin/operator/viewer respeitados no backend.

Validacao:
- typecheck/build;
- testar login e rota protegida.

### Tarefa 11 - CRUD de descricoes
Objetivo:
- Implementar backend do cadastro de descricoes padrao.

Arquivos permitidos:
- `apps/api/src/modules/descriptions/**`
- `apps/api/src/http/routes/**`
- `apps/api/prisma/**` apenas se ajuste pequeno for necessario.

Arquivos proibidos:
- frontend;
- parser;
- movimentacoes.

Contexto necessario:
- `requisitos.md`
- `arquitetura.md`

Criterio de conclusao:
- criar, listar, editar e inativar descricoes;
- validar nome e tipo sugerido;
- permissao aplicada.

Validacao:
- typecheck/build;
- testes manuais de endpoints.

### Tarefa 12 - Backend de movimentacoes
Objetivo:
- Implementar CRUD de movimentacoes, filtros e regra de status pendente/transmitido ao informar numero da nota.

Arquivos permitidos:
- `apps/api/src/modules/transactions/**`
- `apps/api/src/http/routes/**`
- `apps/api/src/shared/validation/**`
- `apps/api/prisma/**` apenas se ajuste pequeno for necessario.

Arquivos proibidos:
- frontend;
- upload/parser;
- dashboard.

Contexto necessario:
- `requisitos.md`
- `arquitetura.md`

Criterio de conclusao:
- CRUD de movimentacoes funcional;
- filtros principais implementados;
- status muda para transmitted quando invoice_number for informado;
- remover nota retorna a pending se essa regra estiver mantida.

Validacao:
- typecheck/build;
- testes manuais de filtros e alteracao de status.

### Tarefa 13 - Upload e parser inicial de PDF
Objetivo:
- Implementar upload de PDF textual, registro de importacao e parser inicial do modelo observado.

Arquivos permitidos:
- `apps/api/src/modules/imports/**`
- `apps/api/src/modules/statement-parser/**`
- `apps/api/src/shared/storage/**`
- `apps/api/uploads/**`
- `apps/api/package.json`

Arquivos proibidos:
- frontend;
- OCR;
- integracao bancaria;
- emissao fiscal.

Contexto necessario:
- `discovery.md`
- `requisitos.md`
- `arquitetura.md`

Criterio de conclusao:
- aceitar PDF;
- salvar arquivo privado;
- extrair texto quando PDF for textual;
- detectar `PIX CREDITO DE`;
- ignorar `Saldo do Dia`;
- retornar movimentacoes candidatas para revisao;
- nao salvar definitivamente sem confirmacao.

Validacao:
- typecheck/build;
- teste com arquivo PDF textual de exemplo quando disponivel.

### Tarefa 14 - Confirmacao de importacao
Objetivo:
- Salvar movimentacoes revisadas pelo usuario apos importacao.

Arquivos permitidos:
- `apps/api/src/modules/imports/**`
- `apps/api/src/modules/transactions/**`
- `apps/api/src/modules/audit/**`

Arquivos proibidos:
- frontend;
- mudancas grandes no parser.

Contexto necessario:
- `requisitos.md`
- `arquitetura.md`
- `ux.md`

Criterio de conclusao:
- endpoint confirma importacao;
- movimentacoes entram como pending;
- invoice_number fica vazio;
- auditoria registra acao.

Validacao:
- typecheck/build;
- teste manual do fluxo upload -> confirmacao.

### Tarefa 15 - Lancamento de nota individual e em massa
Objetivo:
- Implementar casos de uso de nota individual, previa em massa e aplicacao em massa por mes.

Arquivos permitidos:
- `apps/api/src/modules/invoices/**`
- `apps/api/src/modules/transactions/**`
- `apps/api/src/modules/audit/**`

Arquivos proibidos:
- frontend;
- parser;
- usuarios.

Contexto necessario:
- `requisitos.md`
- `arquitetura.md`
- `ux.md`

Criterio de conclusao:
- atualizar nota individual;
- preparar previa de lancamento em massa;
- aplicar nota em massa somente apos confirmacao;
- status muda para transmitted;
- auditoria registra alteracoes.

Validacao:
- typecheck/build;
- testes manuais de nota individual e em massa.

### Tarefa 16 - Dashboard backend
Objetivo:
- Implementar endpoints de resumo financeiro e indicadores mensais.

Arquivos permitidos:
- `apps/api/src/modules/dashboard/**`
- `apps/api/src/http/routes/**`

Arquivos proibidos:
- frontend;
- mudancas em regras de importacao ou nota.

Contexto necessario:
- `requisitos.md`
- `arquitetura.md`

Criterio de conclusao:
- resumo por mes;
- totais de entrada, saida, pendente e transmitido;
- resposta documentada.

Validacao:
- typecheck/build;
- teste manual dos endpoints.

### Tarefa 17 - Frontend base e design system
Objetivo:
- Criar shell visual, rotas, layout autenticado, componentes base e estilos conforme direcao criativa.

Arquivos permitidos:
- `apps/web/src/**`
- `apps/web/package.json`
- `apps/web/tsconfig.json`

Arquivos proibidos:
- backend;
- documentos aprovados.

Contexto necessario:
- `direcao-criativa.md`
- `ux.md`
- `arquitetura.md`
- `/opt/codeacode/ai-office/quality-gates/ui-review.md`

Criterio de conclusao:
- app frontend inicia;
- layout base com sidebar/topbar;
- componentes base criados: botao, input, badge, card, modal, toast, tabela base;
- estados visuais base definidos.

Validacao:
- typecheck/build;
- verificacao visual em desktop e mobile.

### Tarefa 18 - Login frontend
Objetivo:
- Implementar tela de login integrada a API.

Arquivos permitidos:
- `apps/web/src/features/auth/**`
- `apps/web/src/lib/api/**`
- `apps/web/src/app/**`

Arquivos proibidos:
- backend, exceto se ajuste pequeno aprovado;
- telas financeiras.

Contexto necessario:
- `ux.md`
- `direcao-criativa.md`
- `arquitetura.md`

Criterio de conclusao:
- login funcional;
- erros visiveis;
- loading e sessao expirada tratados;
- usuario autenticado entra no dashboard.

Validacao:
- typecheck/build;
- teste manual login valido/invalido.

### Tarefa 19 - Dashboard frontend
Objetivo:
- Implementar dashboard financeiro com indicadores, atalhos e estados.

Arquivos permitidos:
- `apps/web/src/features/dashboard/**`
- `apps/web/src/components/**`
- `apps/web/src/lib/api/**`

Arquivos proibidos:
- backend, exceto ajuste pequeno aprovado.

Contexto necessario:
- `ux.md`
- `direcao-criativa.md`
- `requisitos.md`

Criterio de conclusao:
- indicadores aparecem por periodo;
- atalhos para importar PDF e lancamento mensal;
- estados loading, empty e error.

Validacao:
- typecheck/build;
- verificacao visual desktop/mobile.

### Tarefa 20 - Descricoes frontend
Objetivo:
- Implementar telas de listagem, cadastro e edicao de descricoes.

Arquivos permitidos:
- `apps/web/src/features/descriptions/**`
- `apps/web/src/components/**`
- `apps/web/src/lib/api/**`

Arquivos proibidos:
- backend, exceto ajuste pequeno aprovado.

Contexto necessario:
- `ux.md`
- `direcao-criativa.md`

Criterio de conclusao:
- CRUD visual de descricoes;
- validacao visual;
- empty/loading/error/success.

Validacao:
- typecheck/build;
- teste manual do CRUD.

### Tarefa 21 - Movimentacoes frontend
Objetivo:
- Implementar listagem, filtros, edicao e nota individual nas movimentacoes.

Arquivos permitidos:
- `apps/web/src/features/transactions/**`
- `apps/web/src/components/**`
- `apps/web/src/lib/api/**`

Arquivos proibidos:
- backend, exceto ajuste pequeno aprovado;
- importacao frontend.

Contexto necessario:
- `ux.md`
- `direcao-criativa.md`
- `requisitos.md`

Criterio de conclusao:
- tabela de movimentacoes;
- filtros principais;
- badges de status/tipo;
- edicao de movimentacao;
- nota individual.

Validacao:
- typecheck/build;
- verificacao visual desktop/mobile;
- teste manual de filtros.

### Tarefa 22 - Importacao e revisao frontend
Objetivo:
- Implementar tela de upload de PDF e revisao da importacao.

Arquivos permitidos:
- `apps/web/src/features/imports/**`
- `apps/web/src/components/**`
- `apps/web/src/lib/api/**`

Arquivos proibidos:
- backend, exceto ajuste pequeno aprovado.

Contexto necessario:
- `ux.md`
- `direcao-criativa.md`
- `requisitos.md`

Criterio de conclusao:
- upload de PDF;
- feedback de processamento;
- tabela editavel de revisao;
- descartar linha;
- confirmar importacao;
- estados de erro de PDF.

Validacao:
- typecheck/build;
- teste manual do fluxo com PDF textual.

### Tarefa 23 - Lancamento mensal frontend
Objetivo:
- Implementar tela de lancamento em massa por mes com previa e confirmacao.

Arquivos permitidos:
- `apps/web/src/features/invoices/**`
- `apps/web/src/components/**`
- `apps/web/src/lib/api/**`

Arquivos proibidos:
- backend, exceto ajuste pequeno aprovado.

Contexto necessario:
- `ux.md`
- `direcao-criativa.md`
- `requisitos.md`

Criterio de conclusao:
- selecionar mes;
- aplicar filtros;
- informar numero da nota;
- visualizar previa;
- confirmar aplicacao em massa;
- feedback de sucesso/erro.

Validacao:
- typecheck/build;
- teste manual de previa e confirmacao.

### Tarefa 24 - Usuarios frontend
Objetivo:
- Implementar telas de usuarios e perfis.

Arquivos permitidos:
- `apps/web/src/features/users/**`
- `apps/web/src/components/**`
- `apps/web/src/lib/api/**`

Arquivos proibidos:
- backend, exceto ajuste pequeno aprovado.

Contexto necessario:
- `ux.md`
- `direcao-criativa.md`
- `requisitos.md`

Criterio de conclusao:
- listar usuarios;
- criar/editar usuario;
- status ativo/inativo;
- perfil admin/operator/viewer.

Validacao:
- typecheck/build;
- teste manual.

### Tarefa 25 - Historico de importacoes frontend
Objetivo:
- Implementar tela de historico de importacoes e detalhes de erro.

Arquivos permitidos:
- `apps/web/src/features/imports/**`
- `apps/web/src/components/**`
- `apps/web/src/lib/api/**`

Arquivos proibidos:
- backend, exceto ajuste pequeno aprovado.

Contexto necessario:
- `ux.md`
- `direcao-criativa.md`

Criterio de conclusao:
- listar importacoes;
- mostrar status, usuario, arquivo, totais e erro;
- acesso ao detalhe.

Validacao:
- typecheck/build;
- teste manual.

### Tarefa 26 - QA funcional
Objetivo:
- Validar fluxos principais ponta a ponta e registrar `qa-report.md`.

Arquivos permitidos:
- `qa-report.md`
- ajustes pequenos em codigo somente se aprovados em tarefa separada.

Arquivos proibidos:
- refatoracoes;
- novas funcionalidades.

Contexto necessario:
- todos os documentos do projeto;
- quality gates aplicaveis.

Criterio de conclusao:
- relatorio de QA criado;
- fluxos principais testados;
- falhas listadas.

Validacao:
- login;
- CRUD descricoes;
- upload PDF;
- revisao;
- movimentacoes;
- nota individual;
- nota em massa;
- dashboard.

### Tarefa 27 - Ajustes finais apos QA
Objetivo:
- Corrigir problemas encontrados no QA, uma correcao pequena por vez.

Arquivos permitidos:
- definidos conforme cada bug.

Arquivos proibidos:
- areas fora do bug.

Contexto necessario:
- `qa-report.md`;
- arquivo/tela/modulo afetado.

Criterio de conclusao:
- bug corrigido;
- validacao repetida.

Validacao:
- teste especifico do bug;
- typecheck/build quando aplicavel.

### Tarefa 28 - Preparacao para GitHub e deploy
Objetivo:
- Preparar README, scripts, variaveis de ambiente, instrucoes de deploy e commit final.

Arquivos permitidos:
- `README.md`
- `deploy.md`
- `.env.example`
- `package.json`
- arquivos de configuracao de build/deploy aprovados.

Arquivos proibidos:
- segredos reais;
- mudancas funcionais sem aprovacao.

Contexto necessario:
- `arquitetura.md`
- `quality-gates/release.md`

Criterio de conclusao:
- instrucoes de ambiente;
- instrucoes de build;
- instrucoes de deploy;
- checklist final.

Validacao:
- build/typecheck final;
- checagem de segredos;
- git status revisado.

## Primeira tarefa tecnica sugerida

# Tarefa para Codex

## Projeto
ExtratoFlow

## Tarefa
Tarefa 7 - Estrutura inicial do monorepo

## Objetivo
Criar somente a estrutura inicial do projeto em `apps/api` e `apps/web`, com configuracoes base, scripts, TypeScript e arquivos de ambiente exemplo. Nao implementar regras de negocio, telas finais, parser, login ou banco ainda.

## Arquivos Permitidos
- `/opt/codeacode/repos/extratoflow/package.json`
- `/opt/codeacode/repos/extratoflow/package-lock.json`
- `/opt/codeacode/repos/extratoflow/.gitignore`
- `/opt/codeacode/repos/extratoflow/README.md`
- `/opt/codeacode/repos/extratoflow/apps/api/**`
- `/opt/codeacode/repos/extratoflow/apps/web/**`

## Arquivos Proibidos
- `/opt/codeacode/repos/extratoflow/discovery.md`
- `/opt/codeacode/repos/extratoflow/master-prompt.md`
- `/opt/codeacode/repos/extratoflow/requisitos.md`
- `/opt/codeacode/repos/extratoflow/arquitetura.md`
- `/opt/codeacode/repos/extratoflow/ux.md`
- `/opt/codeacode/repos/extratoflow/direcao-criativa.md`
- qualquer arquivo fora de `/opt/codeacode/repos/extratoflow`

## Contexto Necessario
Ler somente:
- `/opt/codeacode/repos/extratoflow/arquitetura.md`
- `/opt/codeacode/repos/extratoflow/direcao-criativa.md`
- `/opt/codeacode/repos/extratoflow/requisitos.md`

## Bibliotecas Necessarias
- `/opt/codeacode/ai-office/knowledge/backend.md`
- `/opt/codeacode/ai-office/knowledge/frontend.md`

## Quality Gates
- `/opt/codeacode/ai-office/quality-gates/project-ready.md`
- `/opt/codeacode/ai-office/quality-gates/backend.md` apenas para a base da API
- `/opt/codeacode/ai-office/quality-gates/ui-review.md` apenas para base visual se houver tela inicial

## Criterio de Conclusao
- Monorepo inicial criado.
- `apps/api` configurado com Node.js, TypeScript e Express base.
- `apps/web` configurado com React, TypeScript e Vite.
- Scripts basicos documentados.
- `.env.example` criado sem segredos reais.
- Nenhuma regra de negocio implementada.

## Validacao
- Instalar dependencias.
- Rodar typecheck/build disponivel.
- Confirmar que nenhum documento aprovado foi alterado.

## Regra de Economia
Executar somente esta tarefa.
Nao refatorar fora do escopo.
Nao recriar projeto.
Nao alterar arquitetura sem aprovacao.
Mostrar plano antes de alterar arquivos.

## Criterio para avancar
Tarefas quebradas e primeira tarefa tecnica pronta para aprovacao do usuario.
