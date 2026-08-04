# Referencia — camera

**Estado:** analisado e medido.

## Medicoes

Extraidas de quadros de um clipe de 11s em paisagem, 2454x1134.

| Medida | Referencia | Astra Sovereign |
|---|---|---|
| FOV vertical | 70 graus | 48 graus |
| Inclinacao | 22.8 graus | 14.9 graus |
| Linha do horizonte | 20% do topo | ~20% do topo |
| Personagem na tela | ~12% da altura | 12.4% |
| Posicao do personagem | 50% largura, 52% altura, estavel | quase estavel |

## O que foi reproduzido

- **Horizonte visivel a ~20% do topo.** E o que separa "mundo" de "mapa visto
  de cima".
- **Personagem estavel no centro.** A referencia nao usa look-ahead; o nosso
  foi reduzido de 0.28 para 0.10 segundo.
- **Rotacao livre no eixo horizontal**, com inclinacao limitada.

## A licao mais importante

O angulo da referencia **nao pode ser copiado direto**. A posicao do horizonte
depende de duas variaveis:

```
horizonte = 0.5 - tan(pitch) / (2 * tan(fov_vertical / 2))
```

Com FOV vertical de 70 graus, 22.8 de inclinacao dao 20% de horizonte. Com os
nossos 48, o mesmo angulo daria ~5%, quase colado no topo. Para o mesmo
resultado aqui, a inclinacao precisa ser ~15 graus.

Copiar o numero teria produzido o enquadramento errado.

## Diferenca que permanece

A referencia usa ~113 graus de FOV horizontal contra os nossos 75. Ela mostra
**bem mais mundo** ao redor do jogador. Alargar deixaria a exploracao mais
aberta ao custo de distorcao nas bordas.

Em aberto para o M3 — nao da para julgar isso num mundo plano e vazio.

## O que ainda falta observar

- Comportamento da camera durante combate: ela reage a acerto, a morte de
  inimigo, a chegada de boss?
- Existe algum enquadramento especial em portais ou transicoes de mundo?
- A camera colide com cenario ou atravessa?
