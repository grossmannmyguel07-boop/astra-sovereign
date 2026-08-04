# UI

Dono: **UI/UX Agent** (`src/ui/`, `src/input/`). Criado pelo Tech Lead como
semente da area; a partir daqui alteracoes passam pelo agente de UI.

## Estado atual

Portao de orientacao e joystick virtual. HUD e telas chegam a partir do M6.

## Portao de orientacao (`src/ui/orientation-gate.ts`)

O jogo assume exclusivamente paisagem (`docs/decisions/0005`). Em retrato, o
portao cobre a tela pedindo para girar o aparelho.

### Como decide

Compara `window.innerHeight > window.innerWidth` em `resize` e
`orientationchange`. Comparacao de dimensoes em vez da media query
`(orientation: portrait)` porque o resultado e o mesmo no aparelho e ainda
cobre a janela estreita no desenvolvimento em desktop.

### Efeito na simulacao

O portao recebe um callback e o Tech Lead o conecta ao game loop em `main.ts`:
retrato para a simulacao, paisagem retoma. Pausar importa porque
`GameLoop.start()` zera o acumulador — sem isso, voltar de um periodo em
retrato dispararia um lote de ticks atrasados de uma vez.

## Joystick virtual (`src/input/joystick.ts`)

**Flutuante, nao ancorado.** Nasce onde o dedo encosta, dentro da metade
esquerda da tela. Num aparelho de mao isso e bem melhor que um joystick fixo: o
polegar nunca precisa procurar o controle, e nao existe uma posicao "certa" de
segurar o aparelho.

### Partes

| Elemento | Papel |
|---|---|
| Zona | Metade esquerda da tela, invisivel, recebe o toque |
| Anel de descanso | Dica visual de onde encostar. Sem ele um jogador novo nao descobre o controle |
| Base + punho | Aparecem no ponto do toque, somem ao soltar |

### Comportamento

- `setPointerCapture` no primeiro toque: o dedo continua sendo seguido mesmo
  saindo da zona.
- Um unico `pointerId` e rastreado. Outros dedos na tela nao interferem — isso
  importa a partir do M6, quando houver botoes do lado direito.
- Arrastar alem do raio limita o punho mas mantem a direcao: continua valendo
  como "velocidade maxima naquele rumo".
- Ao soltar, a intencao zera imediatamente. A desaceleracao e do sistema de
  movimento, nao daqui.

### Fronteira

Expoe apenas `intent: { x, z }` em coordenadas de tela. Nao conhece o player
nem a simulacao. A zona morta e a discretizacao em 8 direcoes sao regra de
jogo e ficam no sistema de movimento.

## Arrasto de camera (`src/input/camera-drag.ts`)

Metade direita da tela. Acumula o deslocamento do dedo e entrega em `consume()`,
uma vez por frame.

Acumular e entregar por frame, em vez de aplicar direto no evento, mantem a
rotacao no mesmo ritmo do desenho: os eventos de ponteiro chegam em blocos
irregulares e as vezes varios por frame.

| Gesto | Efeito |
|---|---|
| Arrastar para a direita | Visao gira para a direita |
| Arrastar para baixo | Camera sobe, visao mais de cima |
| Arrastar para cima | Camera desce em direcao ao horizonte |

A sensibilidade vertical e menor que a horizontal de proposito: a faixa util de
inclinacao e pequena, e igualar as duas faz a camera bater nos limites com
qualquer arrasto diagonal.

Nao conhece a camera — so relata quanto o jogador pediu para girar. Quem aplica
e o `main.ts`.

### Convivencia com o joystick

Zonas distintas (esquerda e direita) e cada uma rastreia o proprio `pointerId`,
entao girar a camera e andar ao mesmo tempo funciona — que e o caso normal.

**Pendencia para o M6:** os botoes de acao vao ficar na metade direita, junto
com a area de rotacao. Ou ficam fora do caminho, ou o arrasto passa a ignorar
toques iniciados sobre eles.

## Camadas

| z-index | Elemento |
|---|---|
| 200 | Portao de orientacao |
| 100 | Tela de boot |
| 58–60 | Ferramentas de debug |
| 40–42 | Joystick |

## Notas para quem for mexer

- Em paisagem o notch fica na lateral: `--safe-left` e `--safe-right` sao as
  margens que mais importam, nao `--safe-top`.
- Alvo de toque minimo 44x44px.
- Nao existe hover no toque; use `:active`.
- Nunca escreva no DOM a cada frame.

## Eventos

Nenhum ainda. O `main.ts` le `joystick.intent` e passa ao sistema de movimento.
