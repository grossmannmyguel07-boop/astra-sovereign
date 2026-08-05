# 0008 — Contrato do rig Humanoid

**Status:** aceito · **Milestone:** definido antes do M2, implementado no M3

## Contexto

Sem um padrao de esqueleto, cada personagem chega com hierarquia e nomes
proprios, e cada animacao serve a um unico modelo. O terceiro personagem custa
tanto quanto o primeiro, e trocar um modelo por outro vira retrabalho.

No Three.js a solucao e direta: um `AnimationClip` referencia os nos **pelo
nome**. Dois modelos com a mesma hierarquia e os mesmos nomes de osso
compartilham animacoes sem conversao nenhuma. Nao e truque — e o comportamento
padrao.

## Decisao

**Um unico rig por enquanto: `humanoid`.** Quadruped, Flying e qualquer outro
so existem quando aparecer o primeiro personagem concreto que os exija.

**Nomenclatura de ossos: padrao Mixamo**, exportado como esta, com o prefixo
`mixamorig:`.

> **Correcao (M3).** O prefixo sai assim **no arquivo**, mas os dois pontos
> nunca chegam ao runtime. O `PropertyBinding` do Three.js trata `:` como
> separador de caminho, entao `mixamorig:LeftArm` e lido como diretorio
> `mixamorig:` mais um no chamado `LeftArm` — que nao existe. O `GLTFLoader`
> sabe disso e sanitiza os nomes ao carregar, **dos dois lados**, osso e
> trilha, entao dentro do jogo o osso se chama `mixamorigLeftArm`.
>
> Quem escrever codigo que procura osso pelo nome tem que usar a forma
> sanitizada (`THREE.PropertyBinding.sanitizeNodeName`), nunca a do arquivo.
>
> Isto foi descoberto pelo benchmark do M3, antes de existir qualquer arte. O
> modo de falha e o pior possivel: o Three.js imprime um aviso, segue em frente
> e a animacao fica **parada**, sem quebrar nada. Por isso `src/bench/` valida
> a amarracao de toda trilha antes de medir, e qualquer sistema de animacao
> futuro deve fazer o mesmo.

### Esqueleto obrigatorio

```
mixamorig:Hips
  mixamorig:Spine  ->  Spine1  ->  Spine2
    mixamorig:Neck  ->  Head
    mixamorig:LeftShoulder   ->  LeftArm   ->  LeftForeArm   ->  LeftHand
    mixamorig:RightShoulder  ->  RightArm  ->  RightForeArm  ->  RightHand
  mixamorig:LeftUpLeg   ->  LeftLeg   ->  LeftFoot   ->  LeftToeBase
  mixamorig:RightUpLeg  ->  RightLeg  ->  RightFoot  ->  RightToeBase
```

Dedos sao opcionais e ignorados. Na escala em que o personagem aparece na tela
eles nao existem visualmente.

### Convencoes espaciais

| Item | Valor |
|---|---|
| Pose de repouso | T-pose |
| Eixo vertical | +Y |
| Frente do personagem | +Z |
| Origem do modelo | entre os pes, no chao — **nao** no quadril |
| Escala | 1 unidade = 1 metro; humanoide alvo ~1.9 unidades |

Origem nos pes importa: com ela, posicionar o personagem no terreno e atribuir
`y = altura do chao`. Com origem no quadril, cada modelo precisaria de um
deslocamento proprio.

### Clipes obrigatorios

`idle`, `walk`, `run`, `attack`, `hit`, `die`.

Um personagem sem algum desses clipes cai no `idle` em vez de quebrar.

## Por que Mixamo e nao um padrao proprio

Mixamo riga automaticamente qualquer humanoide e da acesso a uma biblioteca
grande de animacoes gratuitas, todas com a mesma nomenclatura. Isso e
exatamente a propriedade que queremos: trocar o modelo, manter as animacoes.

Inventar um padrao proprio significaria converter toda animacao de terceiro que
usarmos — trabalho recorrente para ganho nenhum.

**Modelos de outras fontes** (packs CC0, por exemplo) entram com um mapa de
renomeacao aplicado no carregamento. E uma tabela por modelo, nao codigo novo.

**Atrito conhecido:** o Mixamo funciona por upload no site e e orientado a
desktop. Enquanto o desenvolvimento acontecer so pelo celular isso incomoda, e
packs ja riggados contornam. Nao muda o padrao — muda so de onde vem o arquivo.

## Emenda (M4) — dois contratos novos, e a tabela de renomeacao em uso

Esta decisao foi **reafirmada** quando os pacotes de asset chegaram: o contrato
do projeto fica, e todo asset externo se adapta a ele.

Isso virou criterio objetivo de selecao. Cada rig externo foi medido por quantos
dos 22 ossos consegue preencher:

| Rig externo | Cobre | Resultado |
|---|---|---|
| Quaternius **Big** (43 ossos) | **17 / 22** | Adotado como `humanoid` |
| Kenney (7 ossos) | 7 / 22 | **Recusado** |

O rig da Kenney foi recusado por nao alcancar o contrato — falta antebraco,
ombro, pescoco, joelho e pe. Adaptar exigiria re-riggar a malha, e o pipeline de
asset e automatizado por decisao: **nenhuma etapa em Blender**.

### Os dois rigs que agora existem

Este documento dizia que Quadruped, Flying e outros so existiriam "quando
aparecer o primeiro personagem concreto que os exija". Eles apareceram.

```ts
rig: 'humanoid' | 'blob' | 'flying'
```

| Rig | Ossos | Origem | Papel |
|---|---|---|---|
| `humanoid` | 22 (contrato) | Quaternius Big, 17/22 pela tabela | Player, boss |
| `blob` | `Body, Head, Head2, Head3` | Quaternius Blob | **Mobs comuns** |
| `flying` | `Root, Torso, Neck, Head, Wing1-4.L/R, Body1` | Quaternius Flying | Reservado |

`blob` e `flying` **nao sao humanoides degradados** — nao tem membro nenhum, e
forcar o contrato humanoide sobre eles seria mentira de tipo. Cada um e um
contrato proprio, com os clipes que o corpo dele consegue tocar.

O `blob` entra em uso no primeiro milestone que trocar o placeholder dos mobs.
O `flying` fica declarado e sem uso ate um milestone pedir.

### A tabela de renomeacao, na pratica

Este documento ja previa: *"Modelos de outras fontes entram com um mapa de
renomeacao aplicado no carregamento."* O mapa do corpo Big:

```
Hips        -> Hips          UpperArm.L  -> LeftArm
Abdomen     -> Spine         LowerArm.L  -> LeftForeArm
Torso       -> Spine1        UpperLeg.L  -> LeftUpLeg
Neck        -> Neck          LowerLeg.L  -> LeftLeg
Head        -> Head          Foot.L      -> LeftFoot
Shoulder.L  -> LeftShoulder  (idem para .R)
```

Sem correspondente no Big: `Spine2`, `LeftHand`, `RightHand`, `LeftToeBase`,
`RightToeBase`. Os dedos e os `PoleTarget` do modelo ficam fora do contrato —
existem na malha, sao animados pelos clipes proprios dela, e nenhum sistema do
jogo os referencia.

**A renomeacao acontece na conversao, nao em runtime.** O `.glb` produzido ja sai
com os nomes do contrato, entao o carregador do jogo nao precisa saber de onde o
modelo veio.

## O personagem e um conjunto de dados

Nenhum sistema de jogo conhece a aparencia de nada. A definicao visual vive em
`src/data/` e e lida **apenas** por `src/render/`:

```ts
interface CharacterVisual {
  rig: 'humanoid';
  model: string;                     // caminho do .glb
  scale?: number;
  yawOffset?: number;                // se o modelo nao encara +Z
  clips: Record<ClipName, string>;   // nome do jogo -> nome no arquivo
}
```

A fatia de gameplay do mesmo personagem — vida, dano, velocidade, alcance — e
outro objeto, lido por `src/game/`. Mesmo `id`, duas fatias, dois leitores.

### Como o gameplay pede uma animacao sem conhecer animacoes

Nao pede. **Emite um evento semantico**, e a renderizacao decide o que tocar:

```
combat  emite  mob:attacked { id }
                 -> render procura o clipe 'attack' daquele personagem
```

Combate, colisao, IA e progressao nunca referenciam um clipe, um modelo ou uma
textura. Trocar o modelo de um mob e editar uma linha em `src/data/`.

## O sistema de animacao nao entra agora

Existem hoje zero personagens e zero animacoes. Escrever carregador, mixer e
maquina de estados neste momento seria adivinhar a interface antes do primeiro
caso concreto, contra a regra 5 do `CLAUDE.md`.

O contrato acima e documento e custa uma tarde. O sistema chega no **M3**,
quando o primeiro mob existir e houver um segundo usuario para provar que o
padrao serve.

Ate la, o personagem procedural do M2 e construido **obedecendo a este mesmo
contrato de juntas** — mesmos nomes, mesma hierarquia, mesma origem, mesma
escala. Quando um `.glb` de verdade chegar, ele entra no lugar sem tocar em
nenhuma linha de logica.

## Pendencia obrigatoria: medir antes de decidir

`SkinnedMesh` **nao instancia**. Cada personagem animado por esqueleto e uma
draw call propria. O orcamento previsto e ~40 mobs + 8 units + player, contra
as 8 draw calls que a cena inteira tem hoje.

Nao sabemos se isso aguenta no iPhone, e chutar aqui repetiria o erro cometido
com o enquadramento da camera. **No inicio do M3, antes de qualquer arte**,
sobe uma cena de estresse com N personagens esqueletados e mede-se no aparelho:

- FPS e tempo de frame
- Draw calls e triangulos
- Consumo de memoria
- Tempo de renderizacao

**Resolvida em `0011`.** Medido no aparelho: 200 personagens esqueletados a
59fps sem derrubar um unico frame, contra os 49 previstos. `SkinnedMesh` fica,
sem instanciamento e sem VAT.

As saidas listadas abaixo — esqueleto so para player, units e boss; mobs comuns
em malha nao esqueletada — **nao serao usadas**. Nao ha problema para elas
resolverem.

Duas das quatro metricas acima nao tem API no Safari: memoria e tempo de CPU. O
benchmark calcula a memoria que aloca em vez de medi-la, e usa o tempo de JS por
frame como substituto de CPU. Documentado em `docs/06-benchmark.md`, nao
contornado em silencio.

Se o custo for alto, as saidas sao conhecidas: esqueleto apenas para player,
units e boss; mobs comuns com animacao procedural em malha nao-esqueletada
(instanciavel) ou billboard. **O contrato do rig nao muda** — muda so quem o
usa.

## Consequencias

- Uma animacao serve a todos os humanoides. O custo por personagem novo cai
  para o custo do modelo.
- Trocar aparencia nao toca em gameplay, e vice-versa.
- Modelos que nao seguem o padrao precisam de um mapa de renomeacao. E uma
  tabela por modelo, feita uma vez.
- O orcamento de draw calls vira restricao de design, nao detalhe tecnico:
  quantos personagens animados cabem em cena e uma pergunta a responder com
  numero medido.
