# Circoteca — Memória Viva do Circo

Jogo da memória educativo inspirado no projeto Circoteca, uma biblioteca/acervo vivo voltado ao resgate da memória do circo mineiro e brasileiro.

## Objetivo do jogo

O jogador precisa encontrar pares de cartas. Cada par encontrado desbloqueia uma memória relacionada ao universo do circo.

A proposta é unir jogo, educação patrimonial, cultura popular e memória circense.

## Arquivos do projeto

- `index.html` — estrutura da página.
- `style.css` — visual e responsividade.
- `script.js` — lógica do jogo.
- `cartas-circoteca.js` — dados educativos das cartas.
- `melhorias_funcionais_e_nao_funcionais.md` — registro das melhorias pedidas pelo professor.

## Como abrir

Abra o arquivo `index.html` no navegador.

Também é possível rodar em localhost:

```bash
python -m http.server 5500
```

Depois acesse:

```txt
http://localhost:5500
```

## Melhorias implementadas

### Funcionais

1. Tema educativo da Circoteca.
2. Modal de memória desbloqueada a cada par encontrado.
3. Acervo desbloqueado durante a partida.

### Não funcionais

1. Organização do código com dados separados em `cartas-circoteca.js`.
2. Layout responsivo para diferentes telas.
3. Melhor acessibilidade e clareza visual.

## Observação importante

Os textos educativos são uma primeira versão de mediação. Antes de publicar como acervo histórico definitivo, o ideal é revisar as informações com documentos, fontes, depoimentos e materiais reais da Circoteca.
