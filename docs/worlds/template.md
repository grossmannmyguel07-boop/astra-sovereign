# Template de mundo

Copiar este arquivo para `world-NN.md` ao criar um mundo novo. Todo campo tem
uma orientacao — se um campo nao puder ser respondido, o mundo ainda nao esta
pronto para ser construido.

---

## Nome

Nome proprio, curto, pronunciavel. Aparece na HUD e em quests, entao precisa
caber em pouco espaco.

## Tema

Uma frase que qualquer agente entenda sem ler o resto. Se precisar de um
paragrafo, o tema ainda esta vago.

## Atmosfera

O que o jogador sente ao chegar. Solitario, hostil, sagrado, abandonado.
Isso guia iluminacao, densidade de nevoa e som mais do que qualquer outra coisa.

## Paleta de cores

Dentro da paleta geral em `design/art-direction.md`. Um mundo **nao inventa
cores novas** — ele escolhe uma enfase dentro do que ja existe.

```
Vazio / ceu
Chao
Estrutura
Acento           o que brilha neste mundo
```

## Iluminacao

**Duas luzes, sempre.** A temperatura e a assinatura do mundo: e o jeito mais
barato de fazer a mesma geometria ler como outro lugar.

```
Hemisferica      cor de cima / cor de baixo, intensidade
Direcional       cor, intensidade, direcao
Nevoa            inicio, fim (cor sempre igual a do vazio)
```

## Musica e som

`[PENDENTE — projeto]` Nao ha sistema de audio ate o pos-MVP. Preencher com a
intencao, para quando existir.

## Mobs

Quais criaturas vivem aqui, de que faccao, e em que densidade. Densidade importa
mais que variedade: e ela que define o ritmo de recompensa.

```
Tipo    | Faccao | Onde aparece | Densidade
```

## Boss

Qual, onde, e o que muda quando ele aparece — camera, HUD, musica.

## NPCs / estacoes

Pontos de funcao no mundo. Cada um com rotulo de uma linha.

## Drops

O que cai aqui e nao cai em outro lugar. Um mundo sem drop proprio nao da razao
para voltar.

## Progressao

Nivel esperado na chegada e na saida. Isso amarra o mundo as curvas em
`design/progression.md`.

## Objetivo do mundo

O que o jogador precisa fazer para considerar este mundo resolvido. Precisa ser
enunciavel em uma linha, porque vira o objetivo visivel na HUD.

## Portal para o proximo mundo

```
Onde fica          posicao, e se e visivel de longe
Requisito          o que desbloqueia
Como e comunicado  como o jogador sabe que ainda nao pode passar
```

**O portal e o elemento mais brilhante do mundo.** E o destino, e precisa ser
lido de qualquer ponto.

## Organizacao espacial

Como o espaco e dividido e o que guia o jogador. Marco visivel de longe, caminho
ou linha de leitura, e distribuicao de pontos de interesse.

**Legibilidade acima de riqueza.** Um mundo bonito onde nao se acha o inimigo e
um mundo ruim.
