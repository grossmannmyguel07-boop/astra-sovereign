# 0006 — Camera orbital com movimento relativo a ela

**Status:** aceito · **Milestone:** M1

## Contexto

A primeira versao da camera do M1 apenas seguia o player, sem rotacao. Isso
nao foi uma decisao: foi o minimo que o escopo pedia, e a pergunta nunca foi
levantada. O desenvolvedor apontou a lacuna ao comparar com a referencia.

Girar a camera e parte central da experiencia do genero: e como o jogador
inspeciona o mundo, encontra o proximo objetivo e se orienta depois de uma
luta. Sem isso a exploracao fica presa a um unico angulo.

## Decisao

Camera orbital em coordenadas esfericas ao redor do player:

- **Yaw livre**, arrastando na metade direita da tela.
- **Pitch limitado** entre 8 e 66 graus acima do horizonte.
- **Distancia fixa.** Zoom fica para depois do MVP.
- **Movimento relativo a camera:** a intencao do joystick e girada pelo yaw
  antes de virar direcao de mundo.

## Por que o movimento teve que mudar junto

Esta e a parte nao obvia. Antes, tela e mundo coincidiam, entao a intencao do
joystick virava direcao de mundo diretamente.

Com a camera girando, manter isso significaria que empurrar o joystick "para
cima" andaria sempre para o mesmo lado do mundo, independente de para onde o
jogador esta olhando — o controle deixaria de fazer sentido assim que a camera
saisse do angulo inicial.

A conversao acontece no integrador (`main.ts`), que le o yaw da camera e o
passa ao sistema de movimento como um numero. A simulacao continua sem saber o
que e uma camera: para ela e apenas "o angulo em que a tela do jogador esta em
relacao ao mundo". A regra de `src/game/` nunca importar `three` segue intacta.

## Nota posterior: a discretizacao em 8 direcoes foi removida

Esta decisao descrevia originalmente como os 8 setores de direcao passavam a
ser relativos a tela. A discretizacao inteira foi revertida em seguida — ver
`0007-movimento-analogico.md`.

O que permanece valido e a conversao em si: a intencao de tela e girada pelo
yaw da camera antes de virar direcao de mundo. Andar "para frente" e sempre
para onde se olha.

## Limites verticais

Abaixo de ~8 graus a camera entraria no chao. Acima de ~66 graus o mundo vira
um mapa visto de cima e a nocao de profundidade some — junto com boa parte da
leitura de distancia que o combate vai precisar no M4.

## Alternativas consideradas

- **Camera fixa.** Era a minha recomendacao inicial, por economizar o segundo
  polegar e por combinar com sprites 2.5D. Rejeitada pelo desenvolvedor: nao
  reproduz a experiencia da referencia.
- **Rotacao limitada a uma faixa com retorno ao centro.** Menos liberdade, e
  nao resolveria orientacao apos combate.

## Consequencias

- A metade direita da tela agora e area de rotacao. Os botoes de acao do M6
  precisam conviver com ela: ou ficam fora do caminho, ou o arrasto passa a
  ignorar toques iniciados sobre eles.
- Combate (M4) le direcao de mira a partir da camera, entao ja nasce coerente.
- Sprites 2.5D (`decisao 0002`) continuam viaveis: o pitch limitado impede os
  angulos que revelariam que os personagens sao planos. Girar o yaw nao e
  problema — o billboard sempre encara a camera.
- Um segundo dedo passa a ser necessario para andar e olhar ao mesmo tempo.
  As duas zonas sao independentes e cada uma rastreia o proprio ponteiro.
