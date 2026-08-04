# 0002 — Visual 2.5D: mundo em 3D, personagens em sprite

**Status:** aceito, com reavaliacao prevista · **Milestone:** decidido no M0,
aplicado a partir do M4

## Contexto

O genero tem muitas entidades simultaneas: mobs, units acompanhando o jogador,
numeros de dano, efeitos. Dois limites apertam ao mesmo tempo:

- **Producao.** Um personagem 3D anime exige modelagem, rig, animacao e
  retopologia — semanas de trabalho por personagem, para uma equipe de uma
  pessoa.
- **Runtime.** O Safari no iOS derruba a aba quando a memoria sobe, e malhas
  com esqueleto sao das coisas mais caras que podemos colocar em cena.

## Decisao

Mundo, terreno, props, portais e camera em 3D. Personagens, mobs e units como
billboards (sprites) desenhados com `InstancedMesh`.

## Alternativas consideradas

- **3D completo com modelos riggados.** Rejeitado: o custo de producao inviabiliza
  o cronograma de um dev solo, e o risco de memoria no iOS e real.
- **2D puro (PixiJS).** Seria mais leve ainda, mas perde a sensacao de mundo
  aberto com profundidade que a referencia tem.

## Consequencias

- Um personagem novo e uma imagem, nao um pipeline de arte.
- Custo de renderizacao cai bastante: sprites instanciados em vez de malhas
  animadas individuais.
- A camera fica restrita a uma faixa de angulos — girar livremente revelaria
  que os personagens sao planos.
- Animacao passa a ser spritesheet, com seu proprio custo de producao.

## Criterio de reavaliacao

Reavaliar quando o MVP estiver fechado. Migrar personagens especificos
(player, boss) para 3D so faz sentido se, ao mesmo tempo: houver folga de
framerate no aparelho alvo e existir uma fonte de arte 3D viavel. Caso
contrario, manter 2.5D.
