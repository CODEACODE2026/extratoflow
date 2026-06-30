# Requisitos

## Projeto
ExtratoFlow

## Fontes
- `discovery.md`
- `master-prompt.md`
- `/opt/codeacode/ai-office/templates/requisitos.md`
- `/opt/codeacode/ai-office/project-library/erp.md`
- `/opt/codeacode/ai-office/knowledge/backend.md`
- `/opt/codeacode/ai-office/knowledge/ux.md`
- `/opt/codeacode/ai-office/quality-gates/project-ready.md`

## Resumo
ExtratoFlow e um sistema web administrativo para importar PDF de extrato bancario, extrair movimentacoes financeiras, revisar dados importados, vincular descricoes padrao, controlar numero de nota e atualizar status dos lancamentos.

O MVP deve resolver o fluxo operacional de fechamento mensal: importar extrato, revisar movimentacoes, manter lancamentos pendentes, preencher numero de nota individualmente ou em massa e marcar registros como transmitidos.

## Usuarios
- Administrador: acessa todas as areas, gerencia usuarios, descricoes, importacoes, movimentacoes e lancamento de notas.
- Operador financeiro: importa extratos, revisa movimentacoes, ajusta descricoes, filtra registros e lanca numero de nota.
- Gestor/consulta: consulta dashboards, filtros e relatorios, sem necessariamente alterar dados sensiveis.

## Requisitos funcionais
- RF01: O sistema deve permitir login com usuario e senha.
- RF02: O sistema deve permitir logout.
- RF03: O sistema deve permitir cadastro, edicao, listagem e inativacao de usuarios.
- RF04: O sistema deve permitir cadastro, edicao, listagem e inativacao de descricoes padrao.
- RF05: O sistema deve permitir upload de arquivo PDF de extrato bancario.
- RF06: O sistema deve registrar cada importacao de PDF com data, usuario responsavel, nome do arquivo e status da importacao.
- RF07: O sistema deve extrair movimentacoes do PDF conforme o modelo inicial enviado pelo cliente.
- RF08: O sistema deve identificar datas no formato DD/MM/AAAA.
- RF09: O sistema deve classificar `PIX CREDITO DE` como entrada.
- RF10: O sistema deve extrair o nome do pagador a partir do texto apos `PIX CREDITO DE:`.
- RF11: O sistema deve extrair valor da movimentacao, preservando sinal e moeda.
- RF12: O sistema deve ignorar linhas de saldo, como `Saldo do Dia`.
- RF13: O sistema deve exibir uma tela de revisao antes de salvar as movimentacoes importadas.
- RF14: O sistema deve permitir editar pagador, descricao, valor, data e tipo na revisao.
- RF15: O sistema deve permitir descartar uma movimentacao antes de salvar.
- RF16: O sistema deve salvar movimentacoes importadas com numero da nota em branco.
- RF17: O sistema deve salvar movimentacoes importadas com status inicial `pendente`.
- RF18: O sistema deve permitir criar movimentacao manualmente.
- RF19: O sistema deve permitir editar movimentacao existente.
- RF20: O sistema deve permitir excluir ou inativar movimentacao, conforme decisao da arquitetura.
- RF21: O sistema deve permitir vincular uma descricao padrao a uma movimentacao.
- RF22: O sistema deve permitir alterar a descricao vinculada de uma movimentacao.
- RF23: O sistema deve permitir filtrar movimentacoes por mes.
- RF24: O sistema deve permitir filtrar movimentacoes por intervalo de datas.
- RF25: O sistema deve permitir filtrar movimentacoes por tipo: entrada ou saida.
- RF26: O sistema deve permitir filtrar movimentacoes por status: pendente ou transmitido.
- RF27: O sistema deve permitir filtrar movimentacoes por pagador.
- RF28: O sistema deve permitir filtrar movimentacoes por descricao.
- RF29: O sistema deve permitir filtrar movimentacoes por valor.
- RF30: O sistema deve permitir informar numero da nota em uma movimentacao individual.
- RF31: Ao informar numero da nota em uma movimentacao individual, o sistema deve alterar o status para `transmitido`.
- RF32: O sistema deve permitir informar numero da nota em massa para movimentacoes de um mes.
- RF33: O lancamento em massa deve permitir revisar a lista de movimentacoes afetadas antes de confirmar.
- RF34: Ao confirmar lancamento em massa, o sistema deve preencher numero da nota nas movimentacoes selecionadas.
- RF35: Ao confirmar lancamento em massa, o sistema deve alterar status das movimentacoes selecionadas para `transmitido`.
- RF36: O sistema deve exibir resumo financeiro com totais de entrada, saida, pendentes e transmitidos.
- RF37: O sistema deve exibir indicadores por mes no dashboard.
- RF38: O sistema deve permitir consultar historico de importacoes.
- RF39: O sistema deve sinalizar possiveis erros de leitura no PDF para revisao manual.
- RF40: O sistema deve impedir acesso de usuarios nao autenticados as telas internas.

## Regras de negocio
- RN01: Toda movimentacao importada deve iniciar com status `pendente`.
- RN02: Toda movimentacao importada deve iniciar com numero da nota vazio.
- RN03: Status so deve mudar para `transmitido` quando houver numero da nota informado.
- RN04: Remover o numero da nota de uma movimentacao deve retornar o status para `pendente`, salvo se o usuario confirmar regra diferente.
- RN05: `PIX CREDITO DE` deve ser tratado como entrada no modelo inicial do extrato.
- RN06: Linhas de `Saldo do Dia` nao devem gerar movimentacoes.
- RN07: Valores positivos devem ser tratados como entrada quando o texto do extrato confirmar entrada.
- RN08: Saidas devem possuir tipo `saida` e descricao obrigatoria antes de salvar.
- RN09: Movimentacoes sem descricao podem ficar pendentes de revisao antes de serem salvas definitivamente, conforme desenho da tela de revisao.
- RN10: Descricoes padrao devem poder ser reutilizadas em varias movimentacoes.
- RN11: A descricao vinculada a uma movimentacao pode ser diferente da descricao padrao original.
- RN12: Lancamento em massa por mes deve afetar somente movimentacoes selecionadas pelo usuario.
- RN13: Por padrao, lancamento em massa deve priorizar movimentacoes com status `pendente`.
- RN14: O usuario deve confirmar antes de aplicar numero da nota em massa.
- RN15: O sistema deve evitar salvar duplicidades obvias ao importar o mesmo PDF novamente, quando houver dados suficientes para comparar data, valor, pagador, tipo e origem da importacao.
- RN16: Exclusoes devem exigir confirmacao quando afetarem movimentacoes ja transmitidas.
- RN17: Arquivos de extrato devem ser tratados como dados sensiveis.

## Telas ou interfaces
- Login.
- Dashboard financeiro.
- Importar extrato PDF.
- Revisar importacao.
- Historico de importacoes.
- Movimentacoes.
- Cadastro de movimentacao.
- Cadastro de descricoes.
- Cadastro de usuarios.
- Lancamento individual de numero da nota.
- Lancamento em massa por mes.
- Relatorios/filtros.
- Configuracoes basicas do sistema.

## Estados obrigatorios de interface
- Carregando login.
- Login invalido.
- Sessao expirada.
- Lista vazia.
- Upload em andamento.
- PDF importado com sucesso.
- PDF com erro de leitura.
- Revisao com inconsistencias.
- Salvamento em andamento.
- Acao concluida.
- Confirmacao antes de exclusao.
- Confirmacao antes de lancamento em massa.
- Acesso bloqueado por permissao.

## Dados principais
- Usuario:
  - id;
  - nome;
  - email ou login;
  - senha_hash;
  - perfil;
  - status;
  - criado_em;
  - atualizado_em.
- DescricaoPadrao:
  - id;
  - nome;
  - tipo sugerido;
  - status;
  - criado_em;
  - atualizado_em.
- Importacao:
  - id;
  - arquivo_nome;
  - arquivo_caminho;
  - usuario_id;
  - status;
  - total_linhas_lidas;
  - total_movimentacoes_detectadas;
  - total_movimentacoes_salvas;
  - mensagem_erro;
  - criado_em.
- Movimentacao:
  - id;
  - importacao_id;
  - data_pagamento;
  - tipo;
  - pagador_nome;
  - descricao_texto;
  - descricao_padrao_id;
  - valor;
  - numero_nota;
  - status;
  - origem;
  - hash_deduplicacao;
  - criado_em;
  - atualizado_em.
- Auditoria/Historico:
  - id;
  - usuario_id;
  - entidade;
  - entidade_id;
  - acao;
  - dados_resumidos;
  - criado_em.

## Integracoes
- Upload local de PDF pelo sistema.
- Banco de dados para usuarios, descricoes, importacoes e movimentacoes.
- Nao ha integracao externa obrigatoria no MVP.

## Permissoes
- Administrador:
  - gerenciar usuarios;
  - gerenciar descricoes;
  - importar PDFs;
  - revisar e salvar importacoes;
  - gerenciar movimentacoes;
  - lancar numero da nota;
  - usar lancamento em massa;
  - consultar dashboard e relatorios.
- Operador financeiro:
  - importar PDFs;
  - revisar e salvar importacoes;
  - gerenciar movimentacoes;
  - gerenciar descricoes, se autorizado;
  - lancar numero da nota;
  - usar lancamento em massa;
  - consultar dashboard e relatorios.
- Gestor/consulta:
  - consultar dashboard;
  - consultar movimentacoes;
  - usar filtros e relatorios;
  - sem permissao padrao para alterar dados.

## Relatorios
- Listagem de movimentacoes por periodo.
- Listagem de movimentacoes por mes.
- Listagem por status: pendente ou transmitido.
- Listagem por tipo: entrada ou saida.
- Totais de entrada por mes.
- Totais de saida por mes.
- Total pendente por mes.
- Total transmitido por mes.
- Relatorio de movimentacoes sem numero da nota.
- Relatorio de importacoes realizadas.

## Requisitos nao funcionais
- seguranca:
  - senhas devem ser armazenadas com hash;
  - arquivos PDF devem ficar protegidos de acesso publico direto;
  - rotas internas devem exigir autenticacao;
  - permissoes devem ser validadas no backend;
  - logs nao devem expor senhas ou dados sensiveis desnecessarios.
- performance:
  - listas devem ter paginacao;
  - filtros recorrentes devem ser considerados na modelagem;
  - importacao de PDF deve dar feedback visual ao usuario;
  - o sistema deve suportar crescimento mensal de movimentacoes sem degradar o uso basico.
- disponibilidade:
  - sistema previsto para VPS;
  - falha na importacao nao deve derrubar o sistema;
  - erros devem ser registrados de forma consultavel.
- responsividade:
  - interface deve funcionar em desktop e notebook como prioridade;
  - telas principais devem ser usaveis em tablet;
  - mobile pode ser responsivo basico no MVP, sem priorizar operacao intensa.
- manutencao:
  - regras de importacao devem ficar isoladas para permitir novos layouts de banco;
  - entidades e filtros devem ser documentados;
  - alteracoes de regra devem ser feitas em tarefas pequenas;
  - projeto deve manter separacao clara entre importacao, movimentacoes, descricoes e usuarios.

## Fora do escopo
- API bancaria.
- Integracao fiscal real.
- Emissao de nota fiscal.
- Transmissao de nota fiscal.
- OCR obrigatorio antes de confirmar o formato real dos PDFs.
- Suporte a multiplos bancos no MVP.
- Multiempresa.
- Multi-tenant/SaaS.
- Aplicativo mobile nativo.
- Automacao por WhatsApp.
- WebSocket ou notificacoes em tempo real.

## Riscos e duvidas
- Confirmar o banco e o tipo exato de extrato que sera suportado primeiro.
- Confirmar se o PDF original possui texto selecionavel.
- Confirmar se saidas aparecem com padrao textual suficiente para extracao automatica.
- Confirmar se o lancamento em massa aplica somente entradas, somente pagadores ou tambem saidas.
- Confirmar se o mesmo numero da nota pode ser aplicado a varias movimentacoes do mes.
- Confirmar se usuarios terao perfis desde o MVP ou se comecara apenas com administrador.
- Confirmar se movimentacoes transmitidas podem ser editadas.
- Confirmar se exclusao fisica sera permitida ou se deve ser inativacao/log.
- Confirmar regra final de duplicidade ao importar PDF repetido.
- Confirmar se o sistema precisa exportar Excel/PDF de relatorios no MVP.

## Criterios de aceite do MVP
- Usuario autenticado consegue importar um PDF do modelo inicial.
- Sistema detecta movimentacoes de entrada `PIX CREDITO DE` no modelo inicial.
- Sistema ignora `Saldo do Dia`.
- Usuario consegue revisar dados antes de salvar.
- Movimentacoes salvas ficam com numero da nota vazio e status `pendente`.
- Usuario consegue cadastrar e vincular descricoes padrao.
- Usuario consegue filtrar movimentacoes por mes, status, tipo, pagador e descricao.
- Usuario consegue informar numero da nota individualmente e ver status mudar para `transmitido`.
- Usuario consegue aplicar numero da nota em massa por mes apos confirmacao.
- Usuario consegue consultar dashboard com totais basicos.
- Usuario sem login nao acessa telas internas.

## Criterio para avancar
Requisitos rastreaveis ao discovery e aprovados para arquitetura.

Proxima tarefa recomendada: Tarefa 3 - criar `arquitetura.md` com modelagem inicial, modulos, rotas, estrutura do projeto e estrategia do parser de PDF.
