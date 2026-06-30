# Master Prompt

## Projeto
ExtratoFlow

## Missao do projeto
Construir um sistema web administrativo para importar extratos bancarios em PDF, extrair movimentacoes financeiras, revisar dados importados, vincular descricoes padrao, controlar numero de nota e atualizar status de pendente para transmitido.

## Contexto resumido
O cliente precisa automatizar parte do fechamento financeiro mensal. O sistema deve receber PDFs de extrato bancario, capturar nome do pagador, descricao, valor, data e tipo de movimentacao, mantendo o numero da nota em branco ate que a nota seja lancada.

Quando o numero da nota for informado, o status deve mudar de pendente para transmitido. Esse lancamento deve existir tanto de forma individual quanto em massa para movimentacoes de determinado mes.

O cliente enviou uma imagem do extrato. A primeira versao do parser deve considerar esse modelo como padrao inicial: datas por dia, entradas como PIX CREDITO DE, nome do pagador apos o texto da operacao, valor na coluna direita e linhas de Saldo do Dia ignoradas.

## Tipo e nivel
- Tipo: Sistema web administrativo financeiro.
- Nivel: Nivel 2.
- Justificativa: exige login, CRUDs, filtros, banco de dados, upload de PDF, processamento de extrato, revisao de dados importados e fluxo operacional mensal. Nao exige, no MVP, IA, WhatsApp, WebSocket, Redis ou multi-tenant.

## Fontes obrigatorias
- `discovery.md`
- `/opt/codeacode/ai-office/project-library/erp.md`
- `/opt/codeacode/ai-office/quality-gates/project-ready.md`
- `/opt/codeacode/ai-office/knowledge/ux.md` nas fases de UX
- `/opt/codeacode/ai-office/knowledge/ui.md` nas fases de direcao visual
- `/opt/codeacode/ai-office/component-library/forms.md` nas fases de interface
- `/opt/codeacode/ai-office/component-library/dashboard.md` nas fases de interface

## Escopo aprovado
Inclui:
- Sistema com login e senha.
- Importacao de PDF de extrato bancario.
- Parser inicial para o modelo de extrato enviado pelo cliente.
- Captura de entradas com nome do pagador, valor, data e tipo.
- Captura de saidas com descricao, valor, data e tipo.
- Ignorar linhas de saldo/totais que nao sao movimentacoes.
- Tela de revisao dos dados importados.
- Cadastro de descricoes padrao.
- Vinculo de descricoes padrao com movimentacoes.
- Edicao manual de descricao por movimentacao.
- CRUD de movimentacoes.
- CRUD de descricoes.
- CRUD de usuarios.
- Filtros por mes, data, tipo, status, pagador, descricao e valor.
- Campo numero da nota inicialmente em branco.
- Status inicial pendente.
- Mudanca para transmitido quando numero da nota for informado.
- Lancamento individual de numero da nota.
- Lancamento em massa por mes.
- Interface moderna, com icones, voltada para produtividade administrativa.

Nao inclui:
- Criar o sistema inteiro em uma unica tarefa.
- Integracao com API bancaria no MVP.
- Emissao de nota fiscal pelo sistema.
- Transmissao fiscal real.
- OCR ate confirmar que o PDF original e escaneado.
- Suporte universal para extratos de todos os bancos.
- Multiempresa/multi-tenant no MVP.

## Fluxo oficial
Gerente de Projetos -> Prompt Specialist -> Analista -> Arquiteto -> UX Lead -> Diretor Criativo UI -> Validacao do Usuario -> DEV -> UI Reviewer -> QA -> DevOps.

## Regras para Codex
- Executar apenas tarefas pequenas e aprovadas.
- Ler somente fontes necessarias para a tarefa atual.
- Nao alterar arquivos fora do escopo permitido.
- Mostrar plano antes de editar arquivos.
- Nao refatorar fora do escopo.
- Nao recriar arquitetura sem aprovacao.
- Nao implementar o sistema inteiro em uma etapa.
- Preservar os documentos de planejamento como fonte de verdade.

## Entregas esperadas
- `requisitos.md`
- `arquitetura.md`
- `ux.md`
- `direcao-criativa.md`
- `tarefas.md`
- Estrutura inicial do projeto somente depois de aprovacao especifica.
- Implementacao tecnica em tarefas pequenas, aprovadas uma por vez.
- QA funcional antes de entrega.
- Preparacao para GitHub/deploy no final.

## Regras de negocio conhecidas
- Todo lancamento importado comeca com status pendente.
- Todo lancamento importado comeca com numero da nota em branco.
- O status muda para transmitido quando o numero da nota e informado.
- O usuario pode informar numero da nota individualmente.
- O usuario pode informar numero da nota em massa por mes.
- Descricoes padrao podem ser cadastradas e vinculadas depois da importacao.
- A descricao vinculada pode ser alterada por movimentacao.
- O parser deve ignorar Saldo do Dia.
- O parser deve tratar PIX CREDITO DE como entrada no modelo inicial.

## Tarefa atual concluida
Tarefa 1: discovery e master prompt.

Arquivos produzidos:
- `discovery.md`
- `master-prompt.md`

## Proxima tarefa proposta
Tarefa 2: requisitos detalhados.

Objetivo da proxima tarefa:
- Transformar o discovery em requisitos funcionais, requisitos nao funcionais, regras de negocio, entidades iniciais e criterios de aceite.

## Criterio para avancar
Master prompt pronto para validacao do usuario e suficiente para o Analista criar `requisitos.md` na proxima tarefa.
