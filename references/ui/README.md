# Referencia — UI

**Estado:** pendente. Distinto de `hud/`.

`hud/` cobre o que fica permanentemente na tela durante o jogo. Aqui ficam as
telas cheias: inventario, loja, quests, configuracoes, index.

O clipe mostra os botoes de acesso a essas telas, mas nenhuma delas aberta.

## O que precisa ser observado

- Como uma tela cheia entra: cobre tudo, ou deixa o jogo visivel atras
- O jogo pausa quando uma tela abre
- Navegacao entre abas
- Como listas longas sao percorridas com o dedo
- Como o jogador fecha a tela e volta ao jogo

## Padroes ja definidos

- Tela cheia e DOM e CSS, nunca canvas
- Alvo de toque minimo 44x44px
- Em paisagem, margens laterais respeitam `--safe-left` e `--safe-right`
- Nao escrever no DOM a cada frame
