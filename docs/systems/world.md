# Mundo

Dono: **World Agent** (`src/render/world/`, e `src/game/systems/world.ts` quando
existir). Criado pelo Tech Lead como semente da area no M1.

## Estado atual

Apenas o mundo plano temporario do M1 (`src/render/world/ground.ts`).
Substituido pelo Mundo 1 de verdade no M3.

Ainda **nao existe** `src/game/systems/world.ts`: nao ha colisao, regiao ativa
nem carregamento por area. Chega no M3.

## Mundo plano (M1)

Existe para uma coisa so: dar referencia visual de movimento. Um chao liso e
vazio faz o player parecer parado mesmo andando a toda velocidade.

| Elemento | Papel | Custo |
|---|---|---|
| Chao 120x120 | Base | 1 draw call |
| Grid 40 divisoes | Sensacao de velocidade | 1 draw call |
| 56 marcas espalhadas | Parallax e referencia lateral | 1 draw call (InstancedMesh) |
| Circulo do limite | Mostra a borda jogavel | 1 draw call |

### Por que as marcas ficam rentes ao chao

Nao ha colisao ainda. Um objeto alto e solido que o player atravessa pareceria
bug; marcas rentes ao solo dao a mesma referencia de movimento sem prometer
solidez.

### Por que o grid tem celulas grandes e alto contraste

Na primeira versao ele era fino e escuro. Na pratica so as linhas
perpendiculares a camera apareciam: o chao lia como listras, nao como grade, e
andar de lado quase nao dava retorno visual.

### Limite do mundo

Circulo em `WORLD_RADIUS`. A regra que segura o player e do sistema de
movimento — aqui e apenas a representacao visual. Sem ela o jogador esbarra
numa parede invisivel e acha que travou.

## Notas para quem for mexer

- Definicao dos mundos vai para `src/data/worlds.ts` no M4. Nao inventar
  conteudo em codigo depois disso.
- Descarregar mundo precisa liberar memoria de verdade: `dispose()` em
  geometria, material e textura. Vazamento aqui derruba a aba no Safari.
- Props repetidos sempre em `InstancedMesh`.
