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

Terceira pessoa, altura e distancia fixas, seguindo o player no plano.

**Suavizacao exponencial** (`damp` em `core/math.ts`), nao `lerp` por frame. Um
`lerp(atual, alvo, 0.1)` parece suave mas muda de velocidade junto com o
framerate: a 30fps fica visivelmente mais lento que a 60fps. A forma
exponencial resolve — `lambda` e taxa por segundo.

**Look-ahead:** o alvo se adianta na direcao do movimento, proporcional a
velocidade atual. Da visao do que vem pela frente sem exigir girar nada, e ao
parar o alvo volta sozinho para cima do player.

`snapTo()` posiciona sem suavizacao. Usado ao iniciar e, no futuro, ao trocar
de mundo — sem ele a camera faria uma varredura pelo mundo inteiro.

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
