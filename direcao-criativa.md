# Direcao Criativa

## Projeto
ExtratoFlow

## Fontes
- `discovery.md`
- `master-prompt.md`
- `requisitos.md`
- `arquitetura.md`
- `ux.md`
- `/opt/codeacode/ai-office/DESIGN_PRINCIPLES.md`
- `/opt/codeacode/ai-office/templates/direcao-criativa.md`
- `/opt/codeacode/ai-office/knowledge/ui.md`
- `/opt/codeacode/ai-office/knowledge/ux.md`
- `/opt/codeacode/ai-office/component-library/buttons.md`
- `/opt/codeacode/ai-office/component-library/cards.md`
- `/opt/codeacode/ai-office/component-library/forms.md`
- `/opt/codeacode/ai-office/component-library/dashboard.md`
- `/opt/codeacode/ai-office/inspiration/dashboards.md`
- `/opt/codeacode/ai-office/inspiration/saas.md`
- `/opt/codeacode/ai-office/quality-gates/ui-review.md`

## Conceito visual
ExtratoFlow deve transmitir controle financeiro, confianca e velocidade operacional. A interface precisa parecer um painel premium de gestao, nao um CRUD generico. O visual deve ser limpo, bem alinhado, com tabelas fortes, filtros compactos, indicadores objetivos e estados muito claros.

Conceito: "controle financeiro operacional". A experiencia visual deve fazer o usuario sentir que consegue importar, conferir e fechar o mes sem perder o controle dos registros.

## Referencias de inspiracao
As referencias devem orientar principios, sem copiar layout ou conteudo:
- Stripe Dashboard: clareza em dados financeiros, confianca e uso cuidadoso de indicadores.
- Linear: densidade, foco operacional e navegacao limpa.
- Shopify Admin: gestao de registros, filtros e acoes frequentes sem poluicao.
- Notion: leveza, modularidade e leitura clara.
- shadcn/ui e Tailwind UI: componentes consistentes, estados previsiveis e acabamento moderno.

## Paleta
Paleta funcional, neutra e profissional. Evitar interface dominada por uma unica cor.

### Base
- Fundo principal: `#F6F8FB`
- Superficie: `#FFFFFF`
- Superficie secundaria: `#F1F5F9`
- Borda suave: `#DDE3EA`
- Texto principal: `#111827`
- Texto secundario: `#64748B`
- Texto fraco: `#94A3B8`

### Acao e navegacao
- Primaria: `#2563EB`
- Primaria hover: `#1D4ED8`
- Primaria suave: `#DBEAFE`
- Foco: `#60A5FA`

### Estados financeiros
- Entrada: `#0F9F6E`
- Entrada suave: `#DDF8EC`
- Saida: `#DC2626`
- Saida suave: `#FEE2E2`
- Pendente: `#D97706`
- Pendente suave: `#FEF3C7`
- Transmitido: `#16A34A`
- Transmitido suave: `#DCFCE7`

### Sistema
- Alerta: `#F59E0B`
- Erro: `#DC2626`
- Sucesso: `#16A34A`
- Informacao: `#0284C7`

## Tipografia
- Fonte recomendada: Inter, system-ui ou equivalente.
- Titulo de pagina: 24px a 28px, peso 650/700.
- Titulo de secao: 16px a 18px, peso 600.
- Texto padrao: 14px a 15px, peso 400/500.
- Texto auxiliar: 12px a 13px.
- Numeros financeiros: 20px a 28px em indicadores; 14px em tabelas, com alinhamento consistente.
- Letter spacing: 0.
- Evitar texto grande em paineis densos.

## Componentes principais
### Navegacao
- Sidebar compacta em desktop.
- Topbar com periodo atual, usuario e acao rapida.
- Itens com icone e texto.
- Estado ativo visivel com fundo suave e borda/realce discreto.

### Botoes
- Primario: usado para acao principal da tela, como "Importar PDF", "Confirmar importacao" e "Aplicar nota".
- Secundario: cancelar, voltar, abrir filtros.
- Fantasma: acoes leves em tabela.
- Destrutivo: excluir, descartar linha, inativar usuario.
- Icone: editar, filtro, visualizar, baixar, descartar, confirmar.
- Todo botao deve ter hover, focus, disabled e loading.

### Formularios
- Labels sempre visiveis.
- Campos com altura consistente.
- Validacao perto do campo.
- Campos de data e valor com formato brasileiro.
- Formularios curtos em modais; formularios maiores divididos por secao.

### Filtros
- Filtros compactos no topo da tabela.
- Campos principais sempre visiveis: mes, status, tipo.
- Filtros adicionais recolhiveis: pagador, descricao, valor.
- Botao claro para limpar filtros.

### Tabelas
- Tabelas sao o componente central do sistema.
- Cabecalho fixo quando a lista for extensa, se tecnicamente viavel.
- Linhas com hover sutil.
- Acoes por linha alinhadas a direita.
- Valores monetarios alinhados.
- Badges para status e tipo.
- Overflow horizontal controlado em telas menores.

### Cards funcionais
- Usar cards para indicadores de dashboard e alertas.
- Evitar card dentro de card.
- Cards compactos, com numero principal, periodo e atalho para detalhe.
- Cards de alerta devem indicar proxima acao.

### Badges
- `pendente`: fundo `#FEF3C7`, texto `#92400E`.
- `transmitido`: fundo `#DCFCE7`, texto `#166534`.
- `entrada`: fundo `#DDF8EC`, texto `#047857`.
- `saida`: fundo `#FEE2E2`, texto `#991B1B`.
- `erro`: fundo `#FEE2E2`, texto `#991B1B`.
- Badges devem ter texto, nao depender apenas de cor.

### Modais
- Usar para confirmacoes e formularios curtos.
- Modal de lancamento em massa deve destacar:
  - mes;
  - numero da nota;
  - quantidade de registros afetados;
  - total financeiro afetado;
  - aviso de que o status mudara para transmitido.
- Acoes destrutivas com botao destrutivo separado do botao cancelar.

### Toasts
- Sucesso: confirmacao curta.
- Erro: mensagem acionavel.
- Alerta: informacao de revisao necessaria.
- Nao usar toast como unico lugar para erro de formulario.

## Layout e hierarquia
### Estrutura desktop
- Sidebar fixa ou semificsa na esquerda.
- Topbar leve.
- Conteudo com largura fluida e maximo controlado.
- Area principal com padding consistente.
- Dashboard com indicadores compactos no topo e tabelas/listas abaixo.
- Tabelas ocupam largura principal, nao devem parecer secundarias.

### Ordem de prioridade visual
1. Pendencias e alertas que exigem acao.
2. Acoes principais: importar PDF, revisar importacao, aplicar nota.
3. Indicadores financeiros.
4. Filtros.
5. Tabela/lista operacional.
6. Acoes secundarias.

### Tela de revisao
- Resumo no topo: linhas detectadas, linhas com alerta, linhas descartadas.
- Tabela editavel como foco principal.
- Destaque visual para linhas com baixa confianca.
- Acoes persistentes: cancelar, salvar importacao.

### Tela de movimentacoes
- Filtros compactos no topo.
- Tabela com status, nota, tipo, data, pagador, descricao e valor.
- Acoes por linha com icones e tooltip.
- Estado vazio deve sugerir importar PDF ou limpar filtros.

### Dashboard
- Periodo claramente visivel.
- Cards pequenos para totais.
- Alerta de pendencias com atalho para movimentacoes filtradas.
- Historico recente de importacoes.

## Estados visuais
- loading:
  - skeleton em cards e tabelas;
  - spinner pequeno em botoes;
  - progresso/feedback durante upload e processamento de PDF.
- empty:
  - mensagem curta;
  - explicacao do motivo;
  - acao sugerida, como "Importar extrato" ou "Limpar filtros".
- error:
  - caixa de erro perto do contexto;
  - texto claro e acionavel;
  - preservar dados preenchidos.
- success:
  - toast discreto;
  - atualizacao visual da lista;
  - destaque temporario na linha alterada.
- disabled:
  - contraste suficiente;
  - tooltip ou texto explicando quando a acao for importante.
- selected:
  - fundo suave;
  - borda ou marcador visual;
  - nao depender apenas de cor.

## Microinteracoes
- Hover sutil em linhas clicaveis.
- Focus ring visivel em inputs, botoes e links.
- Skeleton em carregamento de tabelas.
- Transicao curta em abertura de modal.
- Destaque temporario apos alterar status para transmitido.
- Feedback de upload com progresso ou estado "processando".
- Confirmacao em massa com contagem dinamica dos registros afetados.

## Responsividade
### Desktop
- Experiencia principal.
- Sidebar completa.
- Tabelas densas e filtros em linha.

### Tablet
- Sidebar pode virar menu recolhido.
- Filtros podem quebrar em duas linhas.
- Tabelas com overflow horizontal controlado.

### Mobile
- Uso basico: consulta, filtros simples e acoes pontuais.
- Sidebar vira drawer.
- Tabelas podem virar lista compacta somente se necessario.
- Importacao e revisao extensa podem indicar melhor uso em desktop, sem quebrar layout.

## Acessibilidade basica
- Contraste adequado em textos e badges.
- Foco visivel em todos os controles.
- Icones sem texto precisam de tooltip e label acessivel.
- Status sempre com texto.
- Erros associados ao campo.
- Ordem de tabulacao coerente.

## Guia para DEV
- Usar componentes reutilizaveis para botoes, inputs, badges, toasts, modais, tabelas e cards de indicador.
- Nao criar tela com aparencia de admin template generico.
- Nao usar hero, banners decorativos ou cards excessivos.
- Priorizar tabela, filtros e acoes operacionais.
- Implementar todos os estados: loading, empty, error, success, disabled, hover, focus.
- Garantir que textos caibam em botoes e badges.
- Garantir overflow controlado em tabelas.
- Usar icones consistentes, preferencialmente lucide-react.
- Validar desktop, tablet e mobile antes de concluir telas.
- Toda acao critica deve ter confirmacao.
- Tela de revisao da importacao deve receber atencao visual maxima.

## Criterio para avancar
Direcao visual pronta para aprovacao do usuario e suficiente para criar `tarefas.md` com etapas tecnicas pequenas antes de qualquer implementacao.

Proxima tarefa recomendada: Tarefa 6 - criar `tarefas.md`, quebrando o desenvolvimento em tarefas economicas para Codex.
