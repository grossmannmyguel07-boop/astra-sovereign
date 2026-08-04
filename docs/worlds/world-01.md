# Mundo 1

**Milestone:** M2 (estrutura) · **Estado:** em definicao

Primeiro mundo do jogo. Ensina a jogar sem tutorial e estabelece o padrao visual
de todos os outros.

## Nome

`[PENDENTE]` Depende da premissa em `lore/universo.md`.

## Tema

`[PENDENTE]`

`[PROPOSTA]` O Mundo 1 nao deveria ser o mais interessante — deveria ser o mais
**legivel**. E onde o jogador aprende a ler o vocabulario visual do jogo: o que
brilha e importante, o que e quente e hostil, o que e frio e aliado.

Um mundo calmo e vazio no inicio, que fica mais povoado conforme se afasta do
ponto de partida, ensina isso sem uma linha de texto.

## Atmosfera

`[DEFINIDO]` Fria, escura, silenciosa. Ceu quase preto, chao azul profundo,
nevoa fechando o horizonte. Vem da direcao de arte, ja implementada no M1.

`[PENDENTE]` **Solitaria ou hostil?** Muda o quanto o mundo parece habitado.

## Paleta

`[DEFINIDO]` Implementada e verificada no aparelho.

```
Vazio / ceu    #05060f
Chao           #141a33
Grid maior     #5f74c8
Grid menor     #33407a
Marcas de chao #2f3d7d
Estrutura      #2a3060
```

`[PENDENTE]` **Cor de acento do mundo** — o que brilha aqui e nao brilha nos
outros. Hoje o unico elemento luminoso e o circulo de limite.

## Iluminacao

`[DEFINIDO]`

```
Hemisferica  #6f86ff por cima, #0a0a18 por baixo, intensidade 1.15
Direcional   #bcd0ff, intensidade 1.35, vindo de (8, 16, 10)
Nevoa        #05060f, inicio 26, fim 78
```

## Musica e som

`[PENDENTE — pos-MVP]` Nao ha sistema de audio no roadmap ate depois do MVP.

## Estrutura espacial

`[DEFINIDO]` Limite circular de raio 38, com o player contido e deslizando pela
borda em vez de travar.

`[PENDENTE]` **O mundo continua circular?** O limite circular foi escolhido por
ser trivial de implementar, nao por design. Um mundo com forma real muda isso.

`[PENDENTE]` **Qual o tamanho certo?** Raio 38 atravessa em ~9 segundos a
velocidade atual. Isso e pequeno para exploracao e grande para um mundo vazio.
So da para calibrar com mobs e objetivos existindo.

`[PENDENTE]` **Quais zonas existem?** O template pede distribuicao de pontos de
interesse. Hoje o mundo e homogeneo.

`[PROPOSTA]` Tres aneis concentricos: partida ao centro (seguro, vazio), anel
intermediario (mobs comuns), anel externo (mobs fortes e portal). O jogador
percebe que se afastar e mais perigoso e mais recompensador sem nenhum texto.

## Mobs

`[PENDENTE — M3]` Nenhum definido. Depende de faccao e do benchmark de
desempenho.

## Boss

`[PENDENTE — M10]`

## Estacoes

`[PENDENTE]` Ver a proposta de substituir NPC por estacoes em
`lore/personagens.md`.

## Drops

`[PENDENTE — M4]`

## Progressao

`[PENDENTE — M6]` Nivel de chegada e de saida.

## Objetivo do mundo

`[PENDENTE]` Precisa caber em uma linha, porque vira o objetivo visivel na HUD.

## Portal

`[DEFINIDO — M2]` O marco visual do portal entra no M2: elemento mais brilhante
do mundo, legivel de qualquer ponto, ancora de orientacao.

`[DEFINIDO — M12]` O sistema de transicao so entra no M12, quando existir um
segundo mundo. Ver `03-roadmap.md`.

`[PENDENTE]` **Onde fica** e **qual o requisito** para atravessar.

## O que ja existe em codigo

Do M1, como base temporaria: chao de 324 unidades, grid de 3 unidades, 120
marcas espalhadas em `InstancedMesh`, circulo de limite, nevoa e duas luzes.
Total: 8 draw calls.

`src/render/world/ground.ts` — sera substituido pelo Mundo 1 de verdade no M2.
