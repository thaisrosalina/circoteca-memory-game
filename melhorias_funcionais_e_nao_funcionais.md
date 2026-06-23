# Melhorias do projeto — Circoteca: Memória Viva do Circo

Este documento foi criado para registrar as 3 melhorias funcionais e as 3 melhorias não funcionais feitas a partir do primeiro projeto de jogo da memória.

## 3 melhorias funcionais

### MF01 — Tema educativo da Circoteca

O jogo deixou de usar emojis genéricos e passou a trabalhar com memórias ligadas ao universo do circo, como lona, picadeiro, palhaçaria, malabares, circo itinerante e memória oral.

**Impacto:** o jogo passa a ter uma proposta educativa e cultural, conectada ao resgate da memória do circo mineiro e brasileiro.

### MF02 — Modal de memória desbloqueada

Quando o jogador encontra um par, o sistema exibe uma janela com o título, a categoria e uma explicação curta sobre aquela memória.

**Impacto:** o jogador aprende um conteúdo novo a cada acerto, sem interromper a lógica do jogo.

### MF03 — Acervo desbloqueado durante a partida

Foi criada uma área lateral chamada “Acervo desbloqueado”, onde cada memória encontrada aparece como item conquistado.

**Impacto:** além de vencer o jogo, o jogador sente que está completando um acervo cultural.

## 3 melhorias não funcionais

### MNF01 — Melhor organização do código

As informações das cartas foram separadas em um arquivo próprio chamado `cartas-circoteca.js`.

**Impacto:** fica mais fácil atualizar, trocar ou ampliar as cartas sem mexer na lógica principal do jogo.

### MNF02 — Melhor responsividade e experiência de uso

O layout foi ajustado para funcionar melhor em celular, tablet e computador. O tabuleiro usa grid responsivo e os cards se adaptam ao espaço disponível.

**Impacto:** o jogo pode ser usado em diferentes telas, inclusive em contextos educativos e apresentações públicas.

### MNF03 — Melhor acessibilidade e clareza visual

Foram usados botões semânticos, textos de apoio, contraste visual, aria-labels e organização mais clara das informações.

**Impacto:** o jogo fica mais compreensível e mais fácil de usar por diferentes públicos.

## Próximas evoluções possíveis

- Usar fotos reais do acervo da Circoteca.
- Adicionar áudios curtos com depoimentos.
- Criar fases por tema: objetos, artistas, cidades, técnicas e memória oral.
- Criar um mapa de Minas com memórias desbloqueadas por território.
- Criar formulário para envio de memórias do público.
