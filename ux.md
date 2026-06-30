# UX

## Projeto
ExtratoFlow

## Fontes
- `discovery.md`
- `master-prompt.md`
- `requisitos.md`
- `arquitetura.md`
- `/opt/codeacode/ai-office/templates/ux.md`
- `/opt/codeacode/ai-office/knowledge/ux.md`
- `/opt/codeacode/ai-office/knowledge/frontend.md`
- `/opt/codeacode/ai-office/component-library/forms.md`
- `/opt/codeacode/ai-office/component-library/dashboard.md`
- `/opt/codeacode/ai-office/inspiration/dashboards.md`
- `/opt/codeacode/ai-office/quality-gates/ui-review.md`

## Publico-alvo
- Administrador: precisa controlar usuarios, descricoes, importacoes, movimentacoes, notas e permissoes.
- Operador financeiro: precisa importar extrato, revisar dados, ajustar descricoes, filtrar movimentacoes e lancar numero da nota.
- Gestor/consulta: precisa acompanhar totais, status e pendencias sem entrar no detalhe operacional pesado.

## Principio de experiencia
ExtratoFlow deve parecer uma ferramenta de trabalho financeiro: claro, rapido, confiavel e denso na medida certa. A interface deve reduzir erro humano em importacao e lancamento de nota, deixando sempre visivel o que esta pendente, o que foi transmitido e quais registros serao afetados antes de uma acao em massa.

## Jornada principal
1. Usuario acessa o sistema pela tela de login.
2. Usuario entra no dashboard financeiro.
3. Dashboard mostra periodo atual, pendencias e atalhos para importar PDF ou lancar notas.
4. Usuario abre Importar Extrato.
5. Usuario envia o PDF.
6. Sistema valida o arquivo e processa o extrato.
7. Usuario acessa a tela de Revisao da Importacao.
8. Usuario confere linhas detectadas, corrige dados, vincula descricoes e descarta linhas invalidas.
9. Usuario confirma a importacao.
10. Sistema salva movimentacoes com numero da nota vazio e status `pendente`.
11. Usuario consulta Movimentacoes com filtros.
12. Usuario informa numero da nota individualmente ou abre Lancamento em Massa.
13. No lancamento em massa, usuario escolhe mes, filtros e numero da nota.
14. Sistema mostra previa dos registros afetados.
15. Usuario confirma.
16. Sistema atualiza numero da nota e status para `transmitido`.
17. Usuario retorna ao dashboard e confere reducao das pendencias.

## Fluxos criticos
### Login
- Ponto de entrada: URL do sistema.
- Acao principal: informar login/email e senha.
- Dados necessarios: login/email e senha.
- Erros possiveis: credenciais invalidas, usuario inativo, sessao expirada.
- Saida esperada: abrir dashboard autenticado.
- Proximo passo natural: importar extrato ou revisar pendencias.

### Importacao de PDF
- Ponto de entrada: botao "Importar extrato" no dashboard ou menu lateral.
- Acao principal: selecionar arquivo PDF.
- Dados necessarios: arquivo PDF valido.
- Erros possiveis: arquivo invalido, arquivo muito grande, PDF sem texto selecionavel, falha de leitura.
- Saida esperada: tela de revisao com movimentacoes candidatas.
- Proximo passo natural: revisar e confirmar movimentacoes.

### Revisao da importacao
- Ponto de entrada: importacao processada.
- Acao principal: validar, corrigir ou descartar movimentacoes.
- Dados necessarios: data, pagador/descricao, valor, tipo e descricao padrao quando aplicavel.
- Erros possiveis: linha incompleta, valor nao reconhecido, data invalida, duplicidade suspeita.
- Saida esperada: movimentacoes salvas como pendentes.
- Proximo passo natural: abrir lista de movimentacoes filtrada pelo mes importado.

### Movimentacoes e filtros
- Ponto de entrada: menu Movimentacoes ou cards do dashboard.
- Acao principal: consultar, filtrar, editar e acompanhar status.
- Dados necessarios: periodo, tipo, status, pagador, descricao ou valor.
- Erros possiveis: nenhum resultado, filtro amplo demais, falha de carregamento.
- Saida esperada: lista clara com status, numero da nota e acoes.
- Proximo passo natural: lancar nota individual ou em massa.

### Lancamento individual de nota
- Ponto de entrada: acao em uma movimentacao.
- Acao principal: informar numero da nota.
- Dados necessarios: numero da nota.
- Erros possiveis: numero vazio, permissao negada, movimentacao ja transmitida.
- Saida esperada: status muda para `transmitido`.
- Proximo passo natural: continuar na lista ou voltar ao dashboard.

### Lancamento em massa por mes
- Ponto de entrada: menu Lancamento Mensal ou acao em Movimentacoes.
- Acao principal: aplicar numero da nota em varias movimentacoes.
- Dados necessarios: mes, filtros, numero da nota e confirmacao.
- Erros possiveis: nenhum registro selecionado, registros ja transmitidos, permissao negada, filtro errado.
- Saida esperada: movimentacoes selecionadas recebem numero da nota e status `transmitido`.
- Proximo passo natural: revisar resultado no dashboard ou relatorio.

### Exclusao/inativacao
- Ponto de entrada: tabela de movimentacoes, usuarios ou descricoes.
- Acao principal: excluir ou inativar registro.
- Dados necessarios: confirmacao explicita.
- Erros possiveis: registro transmitido, registro em uso, permissao negada.
- Saida esperada: registro removido/inativado de forma rastreavel.
- Proximo passo natural: permanecer na lista com feedback de sucesso.

## Telas prioritarias
### Login
- Campos: login/email, senha.
- Acoes: entrar.
- Estados: carregando, erro, usuario inativo, sessao expirada.
- Observacao: tela simples, sem distracao visual.

### Dashboard financeiro
- Conteudo principal:
  - periodo atual;
  - total de entradas;
  - total de saidas;
  - total pendente;
  - total transmitido;
  - alertas de importacoes com erro;
  - atalho para importar PDF;
  - atalho para lancamento mensal.
- UX: mostrar primeiro o que exige acao, especialmente pendencias.

### Importar extrato
- Conteudo principal:
  - area de upload;
  - requisitos do arquivo;
  - historico recente;
  - feedback de processamento.
- UX: deixar claro se o PDF precisa ter texto selecionavel.

### Revisar importacao
- Conteudo principal:
  - tabela editavel;
  - status de confianca por linha;
  - data;
  - tipo;
  - pagador/descricao;
  - valor;
  - descricao padrao;
  - acao descartar;
  - resumo de linhas detectadas, corrigidas e descartadas.
- UX: esta e a tela mais critica; deve reduzir erro antes de salvar.

### Movimentacoes
- Conteudo principal:
  - filtros compactos;
  - tabela;
  - status;
  - numero da nota;
  - tipo;
  - data;
  - pagador;
  - descricao;
  - valor;
  - acoes por linha.
- UX: tabela precisa ser rapida de escanear e nao pode depender apenas de cor.

### Descricoes
- Conteudo principal:
  - lista de descricoes;
  - criar/editar descricao;
  - tipo sugerido;
  - status.
- UX: cadastro rapido, com poucos campos.

### Usuarios
- Conteudo principal:
  - lista de usuarios;
  - criar/editar usuario;
  - perfil;
  - status.
- UX: acoes sensiveis devem exigir permissao.

### Lancamento mensal
- Conteudo principal:
  - seletor de mes;
  - filtros;
  - numero da nota;
  - previa de registros afetados;
  - confirmacao.
- UX: nao permitir aplicar em massa sem previa clara.

### Historico de importacoes
- Conteudo principal:
  - arquivo;
  - data;
  - usuario;
  - status;
  - totais;
  - erro quando houver;
  - acesso aos detalhes.
- UX: ajudar a diagnosticar falhas de PDF.

## Estados obrigatorios
- loading:
  - login em andamento;
  - upload/processamento de PDF;
  - carregamento de tabelas;
  - aplicacao de nota em massa;
  - salvamento de formulario.
- vazio:
  - nenhuma movimentacao no periodo;
  - nenhum PDF importado;
  - nenhuma descricao cadastrada;
  - nenhum usuario alem do admin inicial;
  - nenhum registro encontrado com os filtros.
- erro:
  - login invalido;
  - permissao negada;
  - PDF invalido;
  - PDF sem texto extraivel;
  - falha de API;
  - falha ao salvar;
  - duplicidade suspeita.
- sucesso:
  - login realizado;
  - PDF processado;
  - importacao confirmada;
  - descricao salva;
  - movimentacao atualizada;
  - numero da nota aplicado;
  - lancamento em massa concluido.
- permissao:
  - tela bloqueada por perfil;
  - acao escondida ou desabilitada quando usuario nao pode executar;
  - mensagem clara quando permissao expirar ou sessao cair.
- confirmacao:
  - excluir/inativar;
  - descartar linha da importacao;
  - confirmar importacao;
  - aplicar numero da nota em massa;
  - editar movimentacao ja transmitida, se permitido.

## Regras de usabilidade
- Manter periodo/mes sempre visivel em dashboard, filtros e lancamento mensal.
- Usar filtros compactos e persistentes na tela de movimentacoes.
- Mostrar status com texto e cor, nunca apenas cor.
- Exibir valores monetarios no formato brasileiro.
- Exibir datas no formato DD/MM/AAAA.
- Acoes frequentes devem ficar proximas da tabela.
- Acoes destrutivas devem ter confirmacao.
- Em importacao, preservar dados editados se uma linha tiver erro.
- Em lancamento em massa, sempre mostrar previa antes de confirmar.
- Mensagens de erro devem explicar o que o usuario pode fazer.
- Tabelas devem ter paginacao e overflow controlado.
- Labels de formulario devem ficar sempre visiveis.
- Botao principal deve ser evidente, mas sem parecer tela comercial.

## Pontos de friccao
- PDF escaneado pode frustrar o usuario se o erro nao for explicado.
- Revisao de muitas linhas pode ficar cansativa se a tabela nao for editavel e densa.
- Lancamento em massa pode gerar medo de atualizar registros errados.
- Filtros demais podem poluir a tela se nao forem bem agrupados.
- Descricoes padrao podem gerar confusao se o usuario nao entender que pode alterar por movimentacao.
- Status pendente/transmitido precisa ficar muito claro para evitar retrabalho.
- Movimentacoes duplicadas apos reimportacao precisam ser sinalizadas antes de salvar.

## Recomendacoes para UI
- Direcao visual deve ser administrativa premium, nao landing page.
- Usar layout com navegacao clara, preferencialmente sidebar compacta em desktop.
- Priorizar tabela bem desenhada, filtros compactos e acoes visiveis.
- Dashboard deve ser operacional, com cards pequenos e indicadores acionaveis.
- Usar badges para `pendente` e `transmitido`.
- Usar iconografia discreta em importacao, filtros, editar, salvar, excluir, confirmar e nota.
- Evitar cards decorativos em excesso.
- Evitar textos grandes em telas densas.
- Usar cores por funcao: sucesso, alerta, erro, neutro, entrada e saida.
- Tela de revisao deve parecer uma etapa de conferencia, com resumo no topo e tabela editavel abaixo.
- Modal de confirmacao da nota em massa deve destacar quantidade de registros afetados, periodo e numero da nota.

## Checklist de usabilidade
- Usuario sabe qual e a proxima acao no dashboard?
- Importacao explica claramente quais arquivos sao aceitos?
- Erros de PDF sao compreensiveis?
- Revisao permite corrigir sem perder progresso?
- Salvar importacao exige confirmacao suficiente?
- Movimentacoes mostram status, nota, valor e data sem confusao?
- Filtros principais estao acessiveis sem ocupar a tela inteira?
- Lancamento em massa mostra previa antes de aplicar?
- Acoes criticas tem confirmacao?
- Usuarios sem permissao recebem bloqueio claro?
- Estados vazio, loading, erro e sucesso estao previstos?
- Interface funciona bem em desktop/notebook e de forma aceitavel em tablet?

## Criterio para avancar
Fluxos claros, estados previstos e experiencia pronta para direcao criativa.

Proxima tarefa recomendada: Tarefa 5 - criar `direcao-criativa.md`, definindo linguagem visual, componentes, hierarquia, cores funcionais e padrao premium do sistema.
