# 0005 — Orientacao exclusivamente em paisagem

**Status:** aceito, definitivo · **Milestone:** decidido antes do M1

## Contexto

O jogo roda no Safari do iPhone, que abre em retrato por padrao. Era preciso
decidir qual orientacao o jogo assume antes de escrever o joystick e a HUD,
porque a escolha muda o layout da interface e o enquadramento da camera.

A verificacao do M0 tornou a diferenca concreta. Com o mesmo FOV adaptativo:

- **Paisagem (844x390):** os 8 pilares visiveis, grid legivel, boa nocao do
  espaco ao redor.
- **Retrato (390x844):** campo horizontal estreito. Enxerga-se longe a frente e
  quase nada dos lados — ruim para perceber mobs se aproximando.

O motivo e geometrico: Three.js expoe FOV vertical, e num aspecto de ~0.46 a
largura visivel encolhe muito. Da para amenizar com FOV adaptativo, mas nao da
para resolver.

## Decisao

O jogo assume **exclusivamente paisagem**. Em retrato, exibe um aviso pedindo
para girar o aparelho e pausa a apresentacao do jogo.

## Alternativas consideradas

- **Retrato.** E como o Safari abre, sem pedir nada ao jogador, e cabe numa mao
  so. Rejeitado pelo campo de visao estreito num jogo de exploracao e combate.
- **As duas, com HUD responsiva.** Mais confortavel para o jogador. Rejeitado
  pelo custo: dois layouts de HUD para manter em cada milestone ate o MVP,
  contra a prioridade de chegar rapido ao jogavel.

## Consequencias

- A HUD e desenhada uma vez so, para paisagem. Isso economiza trabalho em todos
  os milestones seguintes.
- Em paisagem o notch fica na lateral, entao `--safe-left` e `--safe-right`
  passam a ser as margens que mais importam — nao `--safe-top`.
- A web nao permite travar orientacao fora de fullscreen ou PWA instalado. O
  aviso para girar e a unica saida disponivel hoje; se o PWA entrar depois do
  MVP, da para travar de verdade pelo manifest.
- O jogador precisa de uma acao a mais para comecar. Aceito: e uma vez por
  sessao, e o ganho de enquadramento vale.

## Criterio de reavaliacao

Nenhum. Esta decisao foi marcada como definitiva pelo desenvolvedor. Mudar
implica refazer a HUD inteira e deve ser tratado como redesenho, nao ajuste.
