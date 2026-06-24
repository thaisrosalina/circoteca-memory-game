# Circoteca — Memória Viva do Circo

Jogo da memória educativo com identidade visual inspirada em acervo vivo, ilustração editorial e memória do circo mineiro e brasileiro.

## O que mudou nesta versão

- As cartas deixaram de usar emojis e agora usam imagens autorais.
- Foi criada a pasta `assets/img` para organizar todos os arquivos visuais.
- O arquivo `cartas-circoteca.js` passou a guardar o caminho de cada imagem.
- O JavaScript agora renderiza imagens no tabuleiro, no modal e no acervo desbloqueado.
- O CSS foi redesenhado para aproximar o jogo do mockup visual.
- O botão de dica única continua implementado.

## Estrutura de pastas

```txt
circoteca-memory-game/
├── index.html
├── style.css
├── script.js
├── cartas-circoteca.js
└── assets/
    └── img/
        ├── banner-circoteca-home.png
        ├── carta-verso-circoteca.png
        ├── card-lona-circo.png
        ├── card-picadeiro.png
        ├── card-palhacaria.png
        ├── card-malabares.png
        ├── card-perna-de-pau.png
        ├── card-circo-itinerante.png
        ├── card-praca-publica.png
        └── card-familia-circense.png
```

## Como testar

Abra o terminal dentro da pasta do projeto e rode:

```bash
python -m http.server 5500
```

Depois acesse:

```txt
http://localhost:5500
```

## Como atualizar no GitHub

```bash
git status
git add .
git commit -m "Aplica nova identidade visual e imagens da Circoteca"
git push
```
