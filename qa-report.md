# QA Report - ExtratoFlow

Data: 2026-06-30
Responsavel: JADE / Code a Code
Escopo: Tarefa 26 - QA funcional dos fluxos principais do MVP.

## Ambiente Validado

- Projeto: `/opt/codeacode/repos/extratoflow`
- Node: ambiente local da VPS
- API local: `http://localhost:3333/api/v1`
- Web local: `http://localhost:5173`
- Banco real: nao configurado neste ambiente local durante a validacao
- Observacao: fluxos que dependem de persistencia real no MySQL foram avaliados por contrato HTTP protegido, build/typecheck e validacoes mockadas executadas nas tarefas de frontend.

## Comandos Executados

| Comando | Resultado |
| --- | --- |
| `npm run typecheck` | Passou |
| `npm run build` | Passou |
| `npm run prisma:validate --workspace @extratoflow/api` | Passou |
| `curl http://localhost:3333/api/v1/health` | HTTP 200 |
| `curl http://localhost:5173/` | HTTP 200 |

## Testes HTTP Executados

| Fluxo | Evidencia | Resultado |
| --- | --- | --- |
| Healthcheck API | `GET /api/v1/health` | HTTP 200 |
| Sessao sem cookie | `GET /api/v1/auth/me` | HTTP 401 esperado |
| Dashboard protegido | `GET /api/v1/dashboard/summary` | HTTP 401 esperado |
| Descricoes protegidas | `GET /api/v1/descriptions` | HTTP 401 esperado |
| Movimentacoes protegidas | `GET /api/v1/transactions` | HTTP 401 esperado |
| Importacoes protegidas | `GET /api/v1/imports` | HTTP 401 esperado |
| Usuarios protegidos | `GET /api/v1/users` | HTTP 401 esperado |
| Login sem campos | `POST /api/v1/auth/login` com body vazio | HTTP 400 esperado |
| Upload PDF sem login | `POST /api/v1/imports/pdf` sem cookie | HTTP 401 esperado |

## Parser de Extrato

Entrada textual validada:

```text
29/04/2026 PIX CREDITO DE: JOAO SILVA + R$ 30,00
29/04/2026 TARIFA BANCARIA - R$ 10,00
Saldo do Dia R$ 20,00
```

Resultado:

- 3 linhas lidas
- 1 entrada PIX detectada
- 1 saida negativa detectada
- 1 linha de saldo ignorada

Status: passou.

## Validacao Visual

| Tela | Desktop | Mobile | Resultado |
| --- | --- | --- | --- |
| Login real sem sessao | Screenshot gerado | Screenshot gerado | Passou |
| Dashboard autenticado mockado | Validado na Tarefa 19 | Validado na Tarefa 19 | Passou |
| Descricoes mockado | Validado na Tarefa 20 | Validado na Tarefa 20 | Passou |
| Movimentacoes mockado | Validado na Tarefa 21 | Validado na Tarefa 21 | Passou |
| Importacao/revisao mockado | Validado na Tarefa 22 | Validado na Tarefa 22 | Passou |
| Lancamento mensal mockado | Validado na Tarefa 23 | Validado na Tarefa 23 | Passou |
| Usuarios mockado | Validado na Tarefa 24 | Validado na Tarefa 24 | Passou |
| Historico de importacoes mockado | Validado na Tarefa 25 | Validado na Tarefa 25 | Passou |

## Matriz Funcional

| Fluxo | Status QA | Observacao |
| --- | --- | --- |
| Login frontend | Parcial | Tela, validacao de campos e contrato HTTP validados. Login real exige MySQL e usuario cadastrado. |
| Dashboard | Parcial | Integracao frontend e endpoints protegidos validados. Dados reais exigem MySQL. |
| CRUD descricoes | Parcial | Fluxo frontend validado com API mockada e rota protegida validada. Persistencia real exige MySQL. |
| Upload PDF | Parcial | Protecao sem login validada, parser textual validado. Upload real exige login e banco. |
| Revisao de importacao | Parcial | UI de revisao e confirmacao validada com API mockada. Persistencia real exige MySQL. |
| Movimentacoes | Parcial | Listagem/filtros/edicao/nota individual validados com API mockada. Persistencia real exige MySQL. |
| Nota individual | Parcial | Frontend e contrato mockado validados. Aplicacao real exige MySQL e usuario admin/operator. |
| Nota em massa | Parcial | Previa/confirmacao validadas com API mockada. Aplicacao real exige MySQL e movimentacoes pendentes. |
| Usuarios/perfis | Parcial | CRUD visual e contratos mockados validados. CRUD real exige usuario admin e MySQL. |
| Historico de importacoes | Parcial | Listagem/detalhe/status/erro validados com API mockada. Dados reais exigem MySQL. |

## Falhas e Limitacoes Encontradas

### QA-001 - Banco MySQL/DATABASE_URL ausente no ambiente local

Impacto: bloqueia validacao ponta a ponta real de login, CRUDs, upload com registro, confirmacao de importacao, movimentacoes, notas, dashboard e usuarios.

Severidade: alta para QA final de producao, baixa para continuidade de desenvolvimento local enquanto os contratos e telas seguem validados.

Evidencia: tarefas anteriores ja registraram erro de login real por `DATABASE_URL` ausente; nesta rodada os testes reais foram limitados a rotas sem autenticacao e contratos mockados.

Acao recomendada: configurar MySQL, aplicar migrations, criar usuario admin seed e repetir QA ponta a ponta real.

### QA-002 - Projeto ainda nao possui suite automatizada de testes funcionais

Impacto: validacao depende de comandos manuais, screenshots e mocks locais.

Severidade: media.

Acao recomendada: criar suite minima de testes na etapa de ajustes finais ou pos-MVP, cobrindo services criticos, parser e fluxos web principais.

## Parecer

O MVP esta tecnicamente consistente para seguir para ajustes finais: typecheck, build e schema Prisma passam; API e Web sobem localmente; rotas protegidas bloqueiam acesso anonimo; parser inicial funciona; telas principais foram validadas em desktop/mobile com dados mockados.

Nao considero o QA ponta a ponta real concluido enquanto o MySQL nao estiver configurado com migrations e usuario admin. A proxima etapa deve tratar os ajustes finais e, quando houver banco, repetir os fluxos reais autenticados.

## Ajustes Pos-QA Aplicados

Data: 2026-06-30

- QA-001: adicionado seed de usuario admin em `apps/api/prisma/seed.ts` e script `npm run prisma:seed --workspace @extratoflow/api`.
- QA-001: adicionadas variaveis `ADMIN_NAME`, `ADMIN_EMAIL` e `ADMIN_PASSWORD` nos arquivos `.env.example`.
- QA-002: adicionado smoke test do parser em `apps/api/scripts/parser-smoke.ts` e script `npm run test:parser --workspace @extratoflow/api`.

Validacao dos ajustes:

- `npm run test:parser --workspace @extratoflow/api` passou.
- `npm run typecheck` passou.
- `npm run build` passou.
- `npm run prisma:validate --workspace @extratoflow/api` passou.

Limitacao restante:

- `npm run prisma:seed --workspace @extratoflow/api` ainda depende de MySQL acessivel via `DATABASE_URL`.
