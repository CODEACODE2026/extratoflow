# Discovery

## Identificacao
- Projeto: ExtratoFlow
- Tipo: Sistema web administrativo para importacao, leitura e conciliacao de extratos bancarios em PDF
- Nivel: Nivel 2
- Responsavel: JADE / Code a Code
- Data: 2026-06-27

## Contexto
O cliente precisa de um sistema moderno, com login e senha, para importar PDF de extrato bancario e transformar os lancamentos do banco em registros financeiros organizados.

Hoje o processo desejado envolve capturar dados do extrato, revisar as informacoes importadas, vincular descricoes padrao, controlar status pendente/transmitido e lancar numero de nota depois do fechamento mensal.

O cliente enviou uma imagem de referencia do extrato. O layout observado possui movimentacoes agrupadas por data, linhas de PIX CREDITO DE, nome do pagador apos o texto da operacao, valores na coluna direita e linhas de Saldo do Dia que devem ser ignoradas pelo parser.

## Objetivo
Criar um sistema administrativo que reduza trabalho manual na leitura de extratos bancarios, permitindo importar movimentacoes de PDF, revisar os dados extraidos, classificar entradas e saidas, vincular descricoes, controlar notas e atualizar status dos lancamentos.

## Publico
- Usuarios principais: equipe administrativa/financeira responsavel por fechamento mensal e emissao de notas.
- Usuarios secundarios: gestores que precisam consultar movimentacoes, filtros e status.
- Decisor/aprovador: cliente Code a Code.

## Escopo inicial
Inclui:
- Login e senha para acesso ao sistema.
- Importacao de PDF de extrato bancario.
- Leitura inicial baseada no modelo de extrato enviado pelo cliente.
- Captura de dados de entrada:
  - nome de quem pagou;
  - valor;
  - data de pagamento;
  - tipo entrada.
- Captura de dados de saida:
  - descricao;
  - valor;
  - data;
  - tipo saida.
- Ignorar linhas de saldo, como Saldo do Dia.
- Cadastro de descricoes padrao.
- Vinculo entre descricao padrao e movimentacao importada.
- Possibilidade de alterar descricao apos a importacao.
- CRUD de movimentacoes importadas.
- Campo numero da nota inicialmente em branco.
- Status inicial pendente.
- Alteracao automatica do status para transmitido quando o numero da nota for informado.
- Lancamento individual de numero de nota.
- Lancamento em massa de numero de nota para todos os pagadores/movimentacoes de um mes.
- CRUD de usuarios, descricoes e movimentacoes.
- Filtros por mes, data, tipo, status, pagador, descricao e valor.
- Interface moderna, administrativa, com icones e foco em produtividade.

Nao inclui:
- Integracao direta com banco via API nesta primeira versao.
- Emissao fiscal ou transmissao real de nota fiscal.
- Leitura garantida de todos os bancos e todos os layouts de extrato.
- OCR obrigatorio na primeira etapa, a menos que o PDF original seja imagem/escaneado.
- Conciliacao automatica com outros sistemas externos.
- Multiempresa ou multi-tenant na primeira versao.

## Fluxos principais
- Usuario acessa a tela de login.
- Usuario entra no painel administrativo.
- Usuario importa um PDF de extrato bancario.
- Sistema extrai movimentacoes do PDF conforme o layout suportado.
- Sistema classifica entradas e saidas quando possivel.
- Sistema ignora linhas de saldo e totais que nao representam movimentacoes.
- Usuario revisa os dados antes de salvar.
- Usuario ajusta pagador, descricao, valor, data ou tipo quando necessario.
- Usuario vincula uma descricao padrao a movimentacoes importadas.
- Sistema salva movimentacoes com numero da nota em branco e status pendente.
- Usuario filtra movimentacoes por periodo, mes, status, tipo, pagador ou descricao.
- Usuario informa numero da nota em uma movimentacao individual.
- Sistema muda o status dessa movimentacao para transmitido.
- Usuario informa numero da nota em massa para movimentacoes de um mes.
- Sistema atualiza as movimentacoes selecionadas para transmitido.

## Regras iniciais do extrato observado
- Datas aparecem no formato DD/MM/AAAA, na coluna esquerda.
- Entradas podem aparecer como PIX CREDITO DE.
- O nome do pagador deve ser extraido do texto apos PIX CREDITO DE:.
- Valores positivos aparecem com sinal de mais, por exemplo + R$ 30,00.
- Saldo do Dia deve ser ignorado e nao deve gerar movimentacao.
- O parser inicial deve priorizar o modelo de extrato enviado pelo cliente.
- Se o PDF real tiver texto selecionavel, usar extracao de texto/tabela.
- Se o PDF real for imagem/print escaneado, a fase tecnica deve prever OCR e aumentar a complexidade.

## Integracoes
- Upload de PDF pelo proprio sistema.
- Banco de dados para usuarios, descricoes e movimentacoes.
- Sem integracoes externas obrigatorias no MVP.

## Restricoes
- prazo: nao definido.
- orcamento: nao definido.
- tecnologia: previsto como sistema web Nivel 2; tecnologia sera detalhada na fase de arquitetura.
- hospedagem: VPS na fase final.
- legais/seguranca: proteger acesso por login, restringir arquivos enviados e tratar extratos como dados sensiveis.

## Riscos e duvidas
- Confirmar qual banco emite o extrato usado como padrao.
- Confirmar se o arquivo recebido sera PDF com texto selecionavel ou imagem escaneada.
- Confirmar se saidas possuem padrao textual claro no extrato.
- Confirmar se o numero da nota em massa deve aplicar a entradas, saidas ou ambos.
- Confirmar se a aplicacao em massa deve filtrar apenas status pendente.
- Confirmar se um mesmo numero de nota pode ser usado para varias movimentacoes do mesmo mes.
- Confirmar se havera perfis de usuario ou apenas usuario administrador no MVP.
- Validar se movimentacoes duplicadas devem ser detectadas ao importar o mesmo PDF duas vezes.

## Bibliotecas consultadas
- `/opt/codeacode/ai-office/WORKFLOW.md`
- `/opt/codeacode/ai-office/playbooks/new-project.md`
- `/opt/codeacode/ai-office/agents/gerente-projetos.md`
- `/opt/codeacode/ai-office/agents/prompt-specialist.md`
- `/opt/codeacode/ai-office/templates/discovery.md`
- `/opt/codeacode/ai-office/templates/master-prompt.md`
- `/opt/codeacode/ai-office/project-library/erp.md`
- `/opt/codeacode/ai-office/quality-gates/project-ready.md`

## Criterio para avancar
Discovery pronto para validacao do usuario e suficiente para o Analista criar requisitos detalhados na proxima tarefa.
