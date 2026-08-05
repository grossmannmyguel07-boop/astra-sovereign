# Mundo

Dono: **World Agent** (`src/game/systems/world.ts`, `src/render/world/`).
Criado pelo Tech Lead como semente da area no M2.

O **o que existe e onde** do Mundo 1 esta em `docs/worlds/world-01.md`. Este
arquivo descreve **como o sistema funciona**.

## Estado atual

Mundo 1 completo em estrutura: terreno com relevo, colisao, seis regioes com
identidade propria, iluminacao interpolada e o portal nos dois estados.

Nao existe ainda: transicao entre mundos (M12), mobs (M3), carregamento por
area (nao previsto — o mundo inteiro cabe na memoria).

## A regra que estrutura tudo: uma funcao de altura, dois consumidores

`WorldSystem.heightAt(x, z)` e a **unica** fonte de altura do mundo. Dela saem:

- os vertices da malha do terreno (`src/render/world/terrain.ts`)
- a altura do player a cada tick (`src/game/systems/movement.ts`)
- a base de cada prop, mote e do portal

O bug classico de mundo — o visual e a colisao discordarem — nao e evitado por
disciplina aqui. Ele e **impossivel por construcao**: nao existe segunda fonte
para discordar.

O preco e que a altura precisa ser barata, porque e chamada por vertice na
construcao e por tick no jogo. Por isso e analitica (senos), nao um heightmap.

## `openness` — a forma do mundo numa funcao

```
openness(x, z) = menor distancia normalizada ate qualquer regiao ou corredor
```

Menor que 1 significa dentro de uma regiao ou corredor. Cresce ao se afastar de
tudo. Dela saem tres coisas diferentes:

| Consumidor | Como usa |
|---|---|
| Terreno | Acima de 1, o chao sobe ate `BORDER_HEIGHT` (6.5). Sao as elevacoes de fronteira |
| Limite do mundo | Acima de `MAX_OPEN` (1.9) o jogador nao passa |
| Colisao | O empurrao de volta e **descida de gradiente** sobre `openness` |

E isso que faz o limite do mundo ter a forma do mundo em vez de ser um circulo.
Duas iteracoes de gradiente bastam porque o deslocamento por tick e pequeno.

## Colisao

Duas coisas distintas, resolvidas separadamente:

| Tipo | Como |
|---|---|
| Chao | `heightAt` a cada tick. O player acompanha o terreno, sem pulo e sem queda |
| Bloqueador | Circulos. Empurrao para fora, depois gradiente do `openness` |

O movimento **nao importa o sistema de mundo**. Recebe uma `TerrainQuery`
somente-leitura do integrador (`src/main.ts`), mesmo padrao ja usado para o yaw
da camera. A regra de sistemas nao se importarem continua intacta.

### Deslizar, nao grudar

Ao ser empurrado, so a componente da velocidade **contraria ao empurrao** e
removida. A componente paralela sobrevive, entao encostar num muro em diagonal
faz deslizar por ele. Zerar a velocidade inteira faria o player grudar em toda
parede, que e o pior tato possivel num jogo de toque.

### Bloqueadores: circulos, e por que basta

Nada no M2 precisa de forma exata, e circulo resolve em quatro operacoes. O
custo e nos cantos de um muro, onde o jogador para ~0.8 antes de encostar. E
visivel se procurado, e irrelevante andando.

Onde importava, os numeros foram casados: `WALL_RADIUS` (1.5) e metade da
profundidade do bloco desenhado (3.0), entao na face plana o jogador para
exatamente encostado.

## Regioes e iluminacao

`regionWeightsAt(x, z)` da o peso de cada regiao num ponto, com queda suave
(`1 / (0.3 + d³)`). Uma unica chamada por frame alimenta **dois** consumidores:

- `Scene.applyAmbience` — cor da hemisferica, cor do chao, nevoa perto e longe
- `terrain.ts` — cor por vertice do chao

Duas luzes na cena inteira, sempre. A identidade de cada regiao vem de
interpolar propriedades dessas duas, nunca de acrescentar uma terceira. Custo:
zero draw calls, so atualizacao de uniforme.

A transicao e suavizada no tempo (`AMBIENCE_LAMBDA`); sem isso, atravessar uma
fronteira produz um salto de cor perceptivel.

## Draw calls: um lote por tipo de prop **por regiao**

O descarte por frustum e por objeto. Agrupar props por regiao — em vez de um
`InstancedMesh` global por tipo — permite eliminar regioes inteiras de uma vez
quando estao fora da vista.

Medido no M2: 8 draw calls na Arena, 26 nas Ruinas. A variacao **e** o descarte
funcionando.

## Notas para quem for mexer

- Tudo que bloqueia vem de `world.blockerList`. Nunca desenhar um muro a partir
  de uma segunda lista: muro desenhado num lugar e colidido em outro e o pior
  bug de mundo que existe, e a unica defesa real e nao ter duas listas.
- **Altura de prop e geometria de camera, nao estetica.** A camera fica 5.90
  acima dos pes do player e 16.92 atras: a linha de visao passa a
  `1.4 + 0.266 * d`. Um prop de topo `h` esconde o player ate `(h - 1.4) / 0.266`
  unidades atras dele. Ver `docs/worlds/world-01.md`, Risco 1.
- Quads deitados sobre relevo precisam acompanhar a normal do terreno
  (`Props.alignToGround`). Um plano horizontal numa encosta atravessa o chao de
  um lado e flutua do outro, e le como placa solta.
- Props repetidos sempre em `InstancedMesh`.
- Descarregar mundo precisa liberar memoria de verdade: `dispose()` em
  geometria, material e textura. Vazamento aqui derruba a aba no Safari.
