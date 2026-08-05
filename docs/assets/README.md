# Biblioteca de assets

Dono: **Docs Agent**, com a direcao visual respondendo a `design/art-direction.md`.

Levantamento do que existe, o que serve, o que fica de fora e por que. **Nenhum
arquivo de asset mora no repositorio ainda** — esta biblioteca e o inventario e
a decisao; a importacao acontece quando um milestone precisar.

| Arquivo | O que tem |
|---|---|
| `inventario.md` | Todo modelo levantado, por categoria, com numeros medidos |
| `direcao-visual.md` | Como fazer estes assets caberem na paleta, e o que excluir |
| `paleta-mundo-01.md` | O mapa de cor por material, regiao por regiao |
| `estrutura-e-pipeline.md` | Onde os arquivos moram e como o bruto vira produzido |
| `mvp-asset-set.md` | A lista curta: so o que o MVP precisa |

## Metodo

Nada aqui foi julgado por suposicao — a regra de trabalho do projeto exige
analise, nao palpite.

- Cada `.glb` foi aberto e teve o chunk JSON lido: triangulos, ossos,
  animacoes, caixa envolvente e tamanho em disco sao **medidos**, nao
  estimados.
- Cada pacote foi visto: previews gerais e previews individuais.
- Os atlas de textura foram abertos.

## Pacotes levantados

| Pacote | Autor | Licenca | Modelos | Formatos | Tris/modelo |
|---|---|---|---|---|---|
| Mini Dungeon 2.0 | Kenney | CC0 1.0 | 30 | **GLB**, FBX, OBJ | 183 |
| Fantasy Town Kit 2.0 | Kenney | CC0 1.0 | 167 | **GLB**, FBX, OBJ | 157 |
| Skyboxes | Kenney | CC0 1.0 | 5 imagens | PNG | — |
| Ultimate Nature Pack | Quaternius | CC0 | 150 | FBX, OBJ, blend | **1 223** |
| Ultimate RPG | Quaternius | CC0 | 106 | FBX, OBJ, blend | **857** |
| Ultimate Monsters | Quaternius | CC0 | **50** | **glTF** + atlas | **2 341 – 6 445** |

CC0 e uso livre, inclusive comercial, sem exigencia de credito. Creditar e
voluntario e vamos creditar mesmo assim.

### Os dois autores nao entregam a mesma coisa

| | Kenney | Quaternius |
|---|---|---|
| Formato pronto para web | **GLB** | **nenhum** — precisa converter |
| Custo por modelo | 157–183 tris | **857–1 223 tris**, ate 8x mais |
| Cor | atlas de paleta, um PNG por pacote | **materiais nomeados**, sem textura |
| Pivo no chao | consistente | **67/150** e **26/106** |
| Personagens riggados | sim, 2 | nao |

**Os dois sao recoloriveis, por caminhos diferentes.** Kenney: trocar o PNG do
atlas. Quaternius: mapear nome de material (`Wood`, `Rock`, `Green`) para uma
cor do projeto no carregamento. O segundo caminho e melhor — permite decidir
cor por elemento em vez de por amostra de UV.

**O que nao se unifica e densidade de poligono.** Kenney e blocado; Quaternius e
facetado e organico. Lado a lado, no mesmo enquadramento, leem como dois jogos.
A regra que resolve isso esta em `direcao-visual.md`.

### Formato: GLB, sempre

E o unico que carrega malha, material, esqueleto e animacao num arquivo so, e e
o nativo do `GLTFLoader`. FBX exige um carregador pesado; OBJ nem suporta
esqueleto; `.blend` exige Blender, que e desktop.

Como os pacotes Quaternius nao trazem GLB, eles precisam de uma etapa de
conversao. Ver `estrutura-e-pipeline.md`.

### Ultimate Monsters fecha as duas lacunas

Chegou por ultimo e resolveu exatamente o que faltava: **50 monstros em tres
corpos**, todos riggados e animados, em glTF.

| Corpo | Qtd | Ossos | Anims | Tris med |
|---|---|---|---|---|
| **Big** (bipede) | 16 | 43, com dedos | 14 | 6 445 |
| **Blob** (pequeno, redondo) | 17 | 4 | 9 | 2 341 |
| **Flying** | 17 | 13, com asas | 8 | 4 075 |

Animacoes do Big: `Idle, Walk, Run, Punch, HitReact, Death, Jump, Duck, Weapon,
Wave, Yes, No`. Cobrem o contrato da `0008` quase inteiro.

### Ainda nao levantado

Os dois links do Google Drive **nao foram acessados** — o proxy bloqueia
`drive.google.com`, do mesmo jeito que bloqueia `github.io`. Precisam vir como
arquivo.

## As tres descobertas que mudam decisoes ja tomadas

### 1. O rig do projeto ficou, e isso elegeu os assets

**Decidido: a `0008` fica como esta. Asset externo se adapta ao nosso contrato,
nunca o contrario.**

Isso virou um criterio objetivo — quantos dos 22 ossos do contrato cada pacote
consegue preencher pela tabela de renomeacao que a propria `0008` ja previa:

| Rig | Cobertura do contrato | Falta |
|---|---|---|
| **Quaternius Big** (43 ossos) | **17 / 22** | Spine2, maos, dedos do pe |
| Kenney (7 ossos) | **7 / 22** | antebraco, ombro, joelho, pe, pescoco... |

**Os personagens da Kenney sairam da biblioteca.** Nao por qualidade — por nao
alcancarem o contrato. Um rig sem antebraco nem pescoco nao consegue tocar uma
animacao autorada para o esqueleto do projeto, e adaptar ele exigiria re-riggar
a malha, que e trabalho de Blender — proibido pela Decisao 3.

### 2. A escala e outra, e o fator e limpo

Os kits da Kenney vivem numa grade de 1 unidade. O personagem tem **0.76** de
altura; o nosso humanoide tem 1.9.

**Fator de conversao do projeto: x2.5.** Aplicado a tudo, sem excecao.

A confirmacao veio de graca: a parede da Kenney tem 1.0 de altura, e x2.5 da
**2.5** — exatamente a altura que os muros das Ruinas ganharam no M2 depois de
serem calibrados contra a geometria da camera. Os dois numeros foram obtidos
por caminhos independentes e bateram.

### 3. A textura e um atlas de paleta, entao tudo e recolorivel

Cada pacote tem **um unico PNG de 512x512** com amostras de cor chapada. Nao ha
textura de superficie nenhuma: cada modelo mapeia UV numa amostra.

Isso derruba o maior obstaculo. A paleta da Kenney e quente e alegre — madeira
laranja, telhado vermelho, arvore verde — e a nossa e fria e fechada. Recolorir
167 modelos seria proibitivo; **trocar um PNG e trabalho de uma tarde.**

Os dois pacotes usam a mesma convencao mas **ordens de amostra diferentes**,
entao sao dois atlas, nao um.

## Como adicionar um pacote novo

1. Enviar o arquivo. Link nao serve — o ambiente nao acessa Drive.
2. Medir antes de opinar: triangulos, ossos, animacoes, caixa envolvente.
3. Conferir a licenca e registrar aqui.
4. Julgar contra `design/art-direction.md`, nao contra o gosto.
5. So entao entrar no `mvp-asset-set.md`, e so se algum milestone precisar.
