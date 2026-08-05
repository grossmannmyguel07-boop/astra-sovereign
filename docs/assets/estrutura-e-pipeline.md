# Estrutura e pipeline de assets

`[DEFINIDO]` — aprovado. Ainda nao implementado.

**Exigencia adicional: automacao total.** Nenhuma etapa manual, nenhum Blender,
nenhum editor de imagem. Importar um pacote novo no futuro tem que ser rodar um
comando.

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
   |  4. aplica o fator de escala do pacote
   |  5. renomeia osso pela tabela do contrato   <- decisions/0008
   |  6. remove textura, mantem cor por material
   v
produzido (GLB)
```

### O que a automacao total obriga

Duas etapas que eu tinha deixado como trabalho manual **viram codigo**:

| Era manual | Vira |
|---|---|
| Autorar os atlas da Kenney num editor de imagem | Ler o PNG, mapear cada amostra para a paleta por regra, escrever o novo. Node tem `zlib`, e PNG de blocos chapados e trivial de codificar |
| Corrigir pivo e re-riggar em Blender | Correcao de pivo e renomeacao de osso na conversao. **Re-riggar deixa de ser opcao** — e por isso que o rig da Kenney foi recusado |

A segunda consequencia e a mais importante e vale dita em voz alta: **a
automacao total foi o que decidiu a Decisao 1 na pratica.** Um rig que nao
alcanca o contrato so entraria com trabalho de Blender, e Blender esta fora.

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
- **Nao converte OBJ riggado**, porque OBJ nao suporta esqueleto.

**O Ultimate Monsters muda o escopo:** ele vem em **glTF com esqueleto e
animacao**, entao o conversor precisa de um segundo caminho — glTF para GLB, com
renomeacao de osso pela tabela do contrato e embutimento do atlas. E menos
trabalho que o caminho OBJ (a geometria ja esta em binario), mas e outro caminho.

Dois caminhos, um so alvo:

```
OBJ + MTL   (Nature, RPG)      -->  |
                                    |--> GLB do projeto
glTF + PNG  (Monsters)         -->  |
```

## Estrutura de pastas

```
public/assets/            <- servido estatico pelo Vite, carregado por URL
  characters/
    player.glb              Big/Ninja, ossos renomeados para o contrato
    boss.glb                Big/Orc_Skull
    mob-errante.glb         Blob/PinkBlob
    mob-sentinela.glb       Blob/Mushnub
    mob-espreita.glb        Blob/Dog
  world/
    ruins/                  muro, coluna, pilar, escada
    nature/                 arvores secas, rochas, tronco
    props/                  estandarte, lanterna, barril, viga
  items/
    coin.glb  sword.glb  chest.glb

tools/asset/              <- o pipeline. Nao entra no bundle
  convert.mjs               OBJ/glTF -> GLB
  palette.json              nome de material -> cor do projeto
  rigmap.json               nome de osso externo -> contrato da 0008
  recolor.mjs               reescreve os atlas da Kenney por regra

docs/assets/              <- esta biblioteca. So texto, nenhum binario
```

**Nome de arquivo por papel, nao por origem.** `mob-errante.glb` e nao
`PinkBlob.glb`: trocar o modelo de um mob passa a ser trocar um arquivo, sem
tocar em `src/data/mobs.ts`.

**`public/` e nao `src/assets/`** porque o `GLTFLoader` carrega por URL em
runtime. Com `base: './'` do `vite.config.ts`, os caminhos saem relativos e
continuam funcionando publicados em subdiretorio.

### O bruto nao entra no repositorio

Os `.zip` originais tem 21 MB e 476 modelos, dos quais o MVP usa algumas
dezenas. Versionar tudo custaria clone lento para sempre, em troca de nada.

`[DEFINIDO]` **O bruto fica fora do Git.** Versionamos apenas o processado —
os `.glb` de saida. Revisitar quando o pipeline estiver consolidado.

`[PENDENTE]` **Onde exatamente o bruto mora.** Precisa de um lugar — sem ele,
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

Atribuicao final:

| Familia | Autor | Por que |
|---|---|---|
| Player, mobs, boss | **Quaternius Monsters** | Unico rig que alcanca o contrato da `0008` — 17/22 contra 7/22 da Kenney |
| Estrutura e ruinas | **Kenney** | Grade modular, e o M2 ja esta calibrado em 2.5 de altura |
| Rochas | **Quaternius Nature** | 107 tris contra 128–200, e 21 variacoes contra 4 |
| Arvores | **Quaternius Nature**, so as secas | Sem folha para brigar com a paleta |
| Itens | **Kenney** | 252 contra 396 na moeda, 80 contra 872 na espada |

**Personagem e cenario vem de autores diferentes, e tudo bem.** A regra do autor
unico vale dentro de uma familia visual; personagem e mundo sao familias
distintas, e nenhum jogo espera que o heroi seja feito do mesmo poligono que a
parede.

As rochas sao a excecao dentro da natureza: sao o unico caso em que a Quaternius
e **mais barata** que a Kenney, e forma de pedra e abstrata o bastante para nao
denunciar autor.
