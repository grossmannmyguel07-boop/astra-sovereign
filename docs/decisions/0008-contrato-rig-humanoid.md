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

**Status:** a ferramenta existe (`bench.html`, ver `docs/06-benchmark.md`) e
ficou permanente no projeto. Duas das quatro metricas acima nao tem API no
Safari: memoria e tempo de CPU. O benchmark **calcula** a memoria que aloca em
vez de medi-la, e usa o tempo de JS por frame como substituto de CPU. Isso esta
documentado na ferramenta, e nao contornado em silencio.

Falta a medicao em aparelho real, que e do desenvolvedor.

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
