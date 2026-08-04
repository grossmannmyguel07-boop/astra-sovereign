# Renderizacao

Dono: **Rendering Agent** (`src/render/`, exceto `world/`).

## Componentes

| Arquivo | Papel |
|---|---|
| `renderer.ts` | Canvas WebGL, DPR, resize, FOV adaptativo, perda de contexto |
| `camera.ts` | Camera em terceira pessoa seguindo o player |
| `scene.ts` | Monta a cena e espelha o estado nela |
| `views/player-view.ts` | Representacao visual do player |

`world/` pertence ao World Agent.

## Renderer

- **DPR limitado** ao teto em `constants.ts`. O iPhone reporta 3; renderizar em
  3x custa ~9x mais pixels que 1x. Maior alavanca de performance do projeto.
- **FOV vertical derivado de um alvo horizontal.** Three.js expoe FOV vertical,
  e num aspecto largo e baixo o FOV fixo enquadra errado.
- **Sem antialias.** MSAA custa caro e ajuda pouco no alvo 2.5D.
- **Perda de contexto WebGL** e logada. E um modo de falha real no Safari
  quando a memoria aperta, e sem log a tela apenas congela.

## Camera

Orbital em coordenadas esfericas ao redor do player. Ver `docs/decisions/0006`.

| Eixo | Comportamento |
|---|---|
| Yaw | Livre, arrastando na metade direita da tela |
| Pitch | Limitado entre 8 e 66 graus acima do horizonte |
| Distancia | Fixa. Zoom fica para depois do MVP |

Com yaw 0 a camera fica em +Z olhando para -Z: o mesmo enquadramento que
existia antes da rotacao entrar.

**Alvo e valor atual sao separados.** O arrasto altera o alvo; o valor que
aparece persegue o alvo. E o que permite responder na hora sem repassar o
serrilhado dos eventos de ponteiro, que chegam em blocos irregulares.

**Suavizacao exponencial** (`damp` em `core/math.ts`), nao `lerp` por frame. Um
`lerp(atual, alvo, 0.1)` parece suave mas muda de velocidade junto com o
framerate: a 30fps fica visivelmente mais lento que a 60fps. A forma
exponencial resolve — `lambda` e taxa por segundo.

A rotacao usa lambda bem maior que o follow (22 contra 7): ela precisa parecer
presa ao dedo. Alcanca o alvo em menos de um decimo de segundo.

**O yaw acumula sem normalizar.** Como alvo e atual crescem juntos, a
suavizacao nunca precisa decidir para que lado dar a volta.

**Look-ahead:** o alvo se adianta na direcao do movimento, proporcional a
velocidade atual. Ao parar, volta sozinho para cima do player.

`snapTo()` posiciona sem suavizacao, incluindo os angulos. Usado ao iniciar e,
no futuro, ao trocar de mundo — sem ele a camera faria uma varredura pelo mundo
inteiro.

**`worldYaw` e lido de fora.** O integrador o usa para converter a intencao de
tela do joystick em direcao de mundo. Sem isso o movimento nao acompanharia
para onde o jogador esta olhando.

## Interpolacao

`sync(state, alpha, frameDt)` roda uma vez por frame.

- `alpha` interpola entre o passo de simulacao anterior e o atual. Posicao e
  angulo do player passam por ele.
- `frameDt` e tempo real, usado so na suavizacao da camera — que e efeito
  visual e nao pode alterar a simulacao.

## Player view

Capsula com marcador de frente e uma marca de contato com o chao. Provisorio
ate a arte existir (`docs/decisions/0002` — sprites 2.5D).

O marcador de frente nao e enfeite: sem ele nao da para perceber que o corpo
gira, e o giro e metade da sensacao de controle. A marca no chao evita a
sensacao de estar flutuando.

## Custo atual

8 draw calls, 474 triangulos, 2 luzes. Medido no overlay de debug.
