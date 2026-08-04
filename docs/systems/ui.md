# UI

Dono: **UI/UX Agent**. Criado pelo Tech Lead como semente da area; a partir daqui
alteracoes passam pelo agente de UI.

## Estado atual

Existe apenas o portao de orientacao. HUD, joystick e telas chegam a partir do M1.

## Portao de orientacao (`src/ui/orientation-gate.ts`)

O jogo assume exclusivamente paisagem (`docs/decisions/0005`). Em retrato, o
portao cobre a tela pedindo para girar o aparelho.

### Como decide

Compara `window.innerHeight > window.innerWidth` em `resize` e
`orientationchange`. Escolhemos comparacao de dimensoes em vez da media query
`(orientation: portrait)` porque o resultado e o mesmo no aparelho e ainda cobre
a janela estreita no desenvolvimento em desktop, onde o enquadramento sofre pelo
mesmo motivo geometrico.

### Efeito na simulacao

O portao recebe um callback e o Tech Lead o conecta ao game loop em `main.ts`:
retrato para a simulacao, paisagem retoma. Pausar importa porque `GameLoop.start()`
zera o acumulador — sem isso, voltar de um periodo em retrato dispararia um lote
de ticks atrasados de uma vez.

### Camadas

`z-index: 200`, acima da tela de boot (100) e das ferramentas de debug (58–60).
Em retrato, nada mais deve aparecer.

## Notas para quem for mexer

- Em paisagem o notch fica na lateral: `--safe-left` e `--safe-right` sao as
  margens que mais importam, nao `--safe-top`.
- Alvo de toque minimo 44x44px.
- Nao existe hover no toque; use `:active`.
- Nunca escreva no DOM a cada frame.

## Eventos

Nenhum ainda. O joystick passa a emitir intencao de movimento no M1.
