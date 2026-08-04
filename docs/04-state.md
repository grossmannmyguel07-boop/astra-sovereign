# Estado atual

> Este arquivo e a memoria do projeto entre sessoes. Sempre atualizar ao fim
> de um milestone. Quem chega sem contexto deve conseguir retomar so lendo isto.

**Ultima atualizacao:** Milestone 1 concluido e publicado.

## O que existe e funciona

**Motor**
- Vite + TypeScript + Three.js. `npm run dev`, `build`, `preview`, `check`.
- Game loop com passo fixo a 60Hz e interpolacao, com teto no acumulador
  (`src/core/loop.ts`).
- Utilidades matematicas: `approach`, `damp`, `lerpAngle`, `wrapAngle`
  (`src/core/math.ts`).
- Renderer com limite de DPR em 2, resize, FOV vertical derivado de um alvo
  horizontal e tratamento de perda de contexto WebGL.

**Jogo**
- `GameState` com a fatia do player (`src/game/state.ts`).
- Entidade do player: posicao, posicao anterior, velocidade e angulo
  (`src/game/entities/player.ts`).
- Sistema de movimento em passo fixo: **direcao analogica em 360 graus**
  relativa a camera, intensidade com saturacao antecipada, zona morta
  descontada, aceleracao alta para resposta imediata, giro suave e limite
  circular do mundo (`src/game/systems/movement.ts`). **Nao importa `three`** —
  recebe o angulo da camera como um numero. Ver `decisions/0007`.

**Entrada**
- Joystick virtual flutuante: nasce onde o dedo encosta na metade esquerda,
  anel de descanso como dica visual, um unico `pointerId` rastreado
  (`src/input/joystick.ts`).
- Arrasto na metade direita gira a camera (`src/input/camera-drag.ts`). Zonas
  independentes: andar e olhar ao mesmo tempo funciona.

**Render**
- Camera orbital: yaw livre, pitch padrao ~15 graus limitado entre 6 e 66,
  distancia fixa, suavizacao exponencial independente de framerate e look-ahead
  curto (`src/render/camera.ts`). Ver `decisions/0006` e `references/analise-video-01.md`.
  O pitch foi calibrado para trazer o horizonte a ~20% do topo, como na
  referencia do genero.
- Player provisorio: capsula com marcador de frente e marca de contato com o
  chao (`src/render/views/player-view.ts`).
- Mundo plano temporario: chao de 324 unidades, grid, 120 marcas instanciadas e circulo do
  limite (`src/render/world/ground.ts`). **Substituido no M2.**

**Orientacao**
- Exclusivamente paisagem. Em retrato o portao cobre a tela e pausa a
  simulacao; voltar retoma sem lote de ticks atrasados.

**Debug**
- Overlay: fps, ms, pico, ticks, draw calls, triangulos, DPR, resolucao, heap,
  mais posicao e velocidade do player.
- Console in-game capturando `console.*`, `window.onerror` e promises
  rejeitadas.

**Entrega**
- `main` publica no GitHub Pages a cada push.
- URL: https://grossmannmyguel07-boop.github.io/astra-sovereign/

**Organizacao**
- Equipe de agentes com mapa de propriedade fixo (`docs/05-agents.md`,
  `.claude/agents/`).

## Verificado no M1

Playwright emulando iPhone em paisagem (844x390, DPR 3, toque), sobre a build
de producao. Posicao lida do overlay:

| Caso | Esperado | Medido |
|---|---|---|
| Empurrar a 22.5 graus | anda a 22.5 graus | **22.9** (erro 0.4) |
| Empurrar a 30 graus | anda a 30 graus | **30.3** (erro 0.3) |
| Empurrar a 67.5 graus | anda a 67.5 graus | **67.5** (erro 0.0) |
| Empurrar a 105 graus | anda a 105 graus | **104.9** (erro 0.1) |
| Inclinacao 0.20 / 0.35 / 0.50 | velocidade proporcional | 1.2 / 3.4 / 5.6 |
| Inclinacao 0.65 / 1.00 | satura perto do maximo | 7.9 / 8.5 |
| Velocidade apos 300ms parado | ja no maximo | 8.5 |
| Soltar o joystick | velocidade a zero | 8.5 -> 0.0 |
| Correr contra a borda | distancia trava no raio | 38.0 |
| Arrastar 250px a direita | visao gira a direita | yaw -89 |
| Arrastar 250px a esquerda | visao gira a esquerda | yaw +89 |
| Arrastar muito para baixo | pitch trava no teto | 66 |
| Arrastar muito para cima | pitch trava no piso | 6 |
| Girar ~90 e empurrar "para cima" | anda para onde a camera olha | x +6.8, z +0.1 |
| Retrato | portao aparece | sim |

8 draw calls, 730 triangulos. Sem erros de console, de pagina ou requisicoes
falhas.

Corrigido durante a verificacao: o chao original lia como listras e nao como
grade, e a cena vazia nao dava referencia de movimento lateral. Grid ganhou
celulas maiores e mais contraste, e entraram 120 marcas instanciadas.

O framerate do ambiente de verificacao reflete renderizacao por software
(SwiftShader). Com 8 draw calls o custo real no iPhone e irrelevante.

Limitacao: o proxy do ambiente bloqueia `github.io`, entao a verificacao visual
acontece sobre a build servida localmente — byte a byte a mesma que vai ao
Pages. A confirmacao na URL publicada e do desenvolvedor.

## O que NAO existe ainda

Save, colisao, mobs, combate, XP, HUD, units, gacha, quests, boss, portal.
Tambem nao existem: barramento de eventos (M4), painel de tuning (M5),
`src/data/` (M4), `src/game/systems/world.ts` (M2).

## Proximo passo

**Milestone 2 — Mundo 1.** Terreno, colisao, iluminacao, organizacao espacial,
atmosfera, estrutura do mapa e o marco visual do portal.

Escopo deliberadamente estrutural: a ambientacao detalhada evolui junto com
combate e HUD. O sistema de transicao entre mundos fica para o M12.

Areas: **World Agent** e **Rendering Agent**, com o Tech Lead integrando.

O roadmap foi reordenado — mundo antes de mobs, save depois de combate. Os
motivos estao em `03-roadmap.md`.

## Direcao visual definida

- **Direcao de arte** em `design/art-direction.md`: low-poly cosmico, cor chapada,
  luz emissiva, paleta fechada, duas luzes, sem sombras projetadas, sem PBR.
- **Personagens em 3D**, revertendo os sprites 2.5D — `decisions/0009`.
- **Contrato de rig humanoid** com nomenclatura Mixamo — `decisions/0008`.
  O sistema de animacao so chega no M3.
- **Referencias** em `docs/references/`: analise escrita apenas, sem midia de
  terceiros.

## Decisoes em aberto

- **FOV horizontal.** Hoje 75 graus contra ~113 da referencia, que mostra bem
  mais mundo. Julgar no M3, com mundo de verdade na tela.
- **Tecnica de animacao dos mobs comuns.** Depende do benchmark obrigatorio no
  inicio do M3.
