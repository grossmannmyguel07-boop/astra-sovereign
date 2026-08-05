# UI

Dono: **UI/UX Agent** (`src/ui/`, `src/input/`). Criado pelo Tech Lead como
semente da area; a partir daqui alteracoes passam pelo agente de UI.

## Estado atual

Portao de orientacao, joystick virtual ancorado e controle de camera por toque
(giro e zoom). HUD e telas chegam a partir do M6.

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

**Ancorado no canto inferior esquerdo.** Posicao fixa, sempre a mesma.

### Por que deixou de ser flutuante (M3)

Ate o M2 ele nascia onde o dedo encostasse, em qualquer ponto da metade
esquerda. O argumento era que o polegar nunca precisaria procurar o controle.

**Testado no aparelho, o efeito foi o oposto.** O joystick aparecia no meio da
tela, por cima do mundo, em posicao diferente a cada toque. Nao dava para criar
memoria muscular de nada, e ele tapava justamente a parte da cena onde o
personagem esta.

Ancorado, ele tambem libera a maior parte da tela para a camera — que e o que
permite a pinca de dois dedos funcionar em quase qualquer lugar.

### Partes

| Elemento | Papel |
|---|---|
| Zona | Retangulo no canto inferior esquerdo. **Maior que o desenho**, porque o polegar nao acerta 58px no escuro |
| Anel de descanso | Dica visual, no lugar exato onde o joystick vai aparecer |
| Base + punho | Base fixa; so o punho se move |

O alcance da zona (`JOYSTICK_ZONE_REACH`) e um meio-termo deliberado: grande o
bastante para o polegar errar, pequeno o bastante para um toque na borda nao
virar inclinacao maxima instantanea.

### Comportamento

- O centro e lido do proprio elemento com `getBoundingClientRect`, nao
  calculado das constantes. As `safe-area-inset` do iPhone so existem em CSS —
  duplicar a conta em JS daria um centro certo no emulador e deslocado no
  aparelho, que e o pior tipo de erro para achar.
- `setPointerCapture` no toque, dentro de `try`: se for recusada, o joystick
  ainda funciona dentro da area.
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

### Zoom por pinca (M3)

**Um dedo gira, dois dedos dao zoom.**

A razao e multiplicativa, nao incremental: afastar os dedos pela metade da tela
precisa aproximar tanto de longe quanto de perto. Com incremento fixo, o mesmo
gesto seria imperceptivel a 32 unidades e violento a 9.

**O horizonte nao se move com o zoom.** Ele sai de
`0.5 - tan(pitch) / (2 * tan(fov_v / 2))`, que nao depende da distancia. Por
isso o enquadramento calibrado no M1 contra a referencia sobrevive intacto —
verificado nos dois extremos. Ver `decisions/0006`.

Ao soltar um dedo da pinca, o que sobra vira o dedo da rotacao, e o ancoramento
e refeito. Sem isso, a distancia entre a ultima posicao lida e a atual entraria
de uma vez como um giro brusco.

### Convivencia com o joystick

A zona da camera ocupa a **tela inteira**, por baixo da zona do joystick. Quem
chega primeiro na pilha de eventos e o joystick, no canto; todo o resto cai na
camera. Cada uma rastreia os proprios ponteiros, entao andar e girar ao mesmo
tempo funciona — verificado no M3 com dois dedos de verdade.

**Pendencia para o M6:** os botoes de acao vao competir com a area de rotacao,
que agora e a tela toda. Ou ficam fora do caminho, ou o arrasto passa a ignorar
toques iniciados sobre eles.

## Camadas

| z-index | Elemento |
|---|---|
| 200 | Portao de orientacao |
| 100 | Tela de boot |
| 58–60 | Ferramentas de debug |
| 43 | Zona de toque do joystick |
| 41–42 | Anel, base e punho do joystick |
| 40 | Zona da camera (tela inteira, por baixo de tudo) |

## Notas para quem for mexer

- Em paisagem o notch fica na lateral: `--safe-left` e `--safe-right` sao as
  margens que mais importam, nao `--safe-top`.
- Alvo de toque minimo 44x44px.
- Nao existe hover no toque; use `:active`.
- Nunca escreva no DOM a cada frame.

## Eventos

Nenhum ainda. O `main.ts` le `joystick.intent` e passa ao sistema de movimento.
