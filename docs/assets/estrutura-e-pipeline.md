# Estrutura e pipeline de assets

`[PROPOSTA]` — nada aqui foi implementado. Precisa de aprovacao.

## O problema a resolver

Os pacotes chegam em tres estados diferentes e nenhum esta pronto para o jogo:

| | Kenney | Quaternius |
|---|---|---|
| Formato | GLB pronto | **so OBJ / FBX / blend** |
| Cor | atlas de paleta quente | materiais nomeados, cores quentes |
| Pivo | consistente | **67/150 e 26/106** com base no chao |
| Escala | grade de 1 unidade | quase real, arvore de 3.5 a 5.0 |

Quatro problemas, e todos tem a mesma forma: **o bruto precisa virar produzido
antes de entrar no jogo.**

## A proposta: um conversor proprio, nao quatro etapas manuais

Um script que le OBJ+MTL e emite GLB, resolvendo os quatro de uma vez:

```
bruto (OBJ + MTL)
   |
   |  1. le geometria e nomes de material
   |  2. troca a cor pelo mapa do projeto        <- paleta-mundo-01.md
   |  3. baixa o pivo para a base do modelo      <- resolve o 67/150
   |  4. aplica o fator de escala do pacote      <- 2.5 na Kenney, 0.5 na Quaternius
   |  5. remove textura, mantem cor por material
   v
produzido (GLB)
```

### Por que um conversor proprio e nao `obj2gltf`

`obj2gltf` resolveria **um** dos quatro problemas — o formato. Paleta, pivo e
escala continuariam sendo trabalho manual em 256 modelos, num Blender que o
desenvolvedor nao tem.

Escrever o conversor e barato: OBJ e texto simples, GLB e JSON mais um buffer
binario, e nao ha esqueleto nem textura para tratar nestes pacotes. O que se
ganha e **determinismo** — rodar de novo produz exatamente o mesmo arquivo, e
mudar a paleta e reexecutar, nao reeditar.

Custo real: uma dependencia a menos e um script a mais.

### O que o conversor **nao** faz

- **Nao toca nos GLB da Kenney.** Eles ja estao prontos; a recolorizacao deles e
  a troca do PNG do atlas, que e outro trabalho.
- **Nao converte personagem riggado.** Nenhum dos dois pacotes Quaternius tem
  esqueleto. Se o Ultimate Monsters trouxer, o conversor precisa crescer — e ai
  vale reavaliar contra `obj2gltf` ou FBX2glTF.

## Estrutura de pastas

```
public/assets/            <- servido estatico pelo Vite, carregado por URL
  characters/             character-human.glb, character-orc.glb
  world/                  ruinas, rochas, arvores, props
  items/                  moeda, arma, bau

tools/asset/              <- o conversor. Nao entra no bundle
  convert.mjs
  palette.json            <- mapa nome-de-material -> cor do projeto

docs/assets/              <- esta biblioteca. So texto, nenhum binario
```

**`public/` e nao `src/assets/`** porque o `GLTFLoader` carrega por URL em
runtime. Com `base: './'` do `vite.config.ts`, os caminhos saem relativos e
continuam funcionando publicados em subdiretorio.

### O bruto nao entra no repositorio

Os `.zip` originais tem 21 MB e 476 modelos, dos quais o MVP usa algumas
dezenas. Versionar tudo custaria clone lento para sempre, em troca de nada.

`[PENDENTE]` **Onde o bruto fica guardado.** Precisa de um lugar — sem ele,
mudar a paleta exige baixar tudo de novo. Nao ha resposta obvia: o repositorio e
publico, o Drive nao e acessivel deste ambiente, e o desenvolvedor nao tem
computador.

## Como a troca de placeholder acontece sem mexer na arquitetura

Isto ja esta preparado desde a `decisions/0008`, e e a razao dela existir.

Hoje o personagem e procedural, construido em
`src/render/characters/humanoid.ts`. A troca e:

1. O `.glb` entra em `public/assets/characters/`.
2. Nasce um carregador em `src/render/characters/` — que **ainda nao existe**,
   pela regra 5, porque ate agora nao havia arquivo nenhum para carregar.
3. `MobView` e `PlayerView` passam a pedir a malha ao carregador em vez de ao
   gerador procedural.

**Nada em `src/game/` muda.** Nem uma linha. O sistema de combate, o de mobs e o
de movimento nao sabem que existe modelo, muito menos qual. Foi assim que a
`0008` foi desenhada e e o que ela cobra agora.

O mesmo vale para o mundo: `props.ts` monta `InstancedMesh` a partir da lista de
bloqueadores. Trocar a geometria de caixa por um `.glb` carregado e mudar de
onde vem a geometria, nao como o mundo e montado.

## Consistencia entre autores: uma regra so

**Um autor por familia visual. Nunca misturar dentro da mesma categoria.**

Paleta se unifica — os dois usam cor chapada sem textura de superficie.
**Densidade de poligono nao se unifica.** Kenney e blocado, 157 tris por modelo;
Quaternius e facetado, 1 223. Uma arvore-cone da Kenney ao lado de uma bétula
facetada da Quaternius, no mesmo enquadramento, le como dois jogos.

Atribuicao proposta:

| Familia | Autor | Por que |
|---|---|---|
| Personagens, mobs, boss | **Kenney** | Sao os unicos riggados. Ate o Monsters chegar, nao ha escolha |
| Estrutura e ruinas | **Kenney** | Grade modular, e o M2 ja esta calibrado nessa altura |
| Rochas | **Quaternius** | 107 tris contra 128–200 da Kenney, e 21 variacoes contra 4 |
| Arvores | **Quaternius**, so as secas | Sem folha, nao brigam com a paleta. Ver `direcao-visual.md` |
| Itens | **Quaternius** | A Kenney quase nao tem itens |

As rochas sao a excecao que confirma a regra: sao o unico caso em que a
Quaternius e **mais barata** que a Kenney, e a forma de pedra e abstrata o
bastante para nao denunciar autor.
