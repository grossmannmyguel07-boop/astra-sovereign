# Estado atual

> Este arquivo e a memoria do projeto entre sessoes. Sempre atualizar ao fim
> de um milestone. Quem chega sem contexto deve conseguir retomar so lendo isto.

**Ultima atualizacao:** Milestone 4 concluido — combate ligado e jogavel.

## O que existe e funciona

**Motor**
- Vite + TypeScript + Three.js. `npm run dev`, `build`, `preview`, `check`.
- Game loop com passo fixo a 60Hz e interpolacao, com teto no acumulador
  (`src/core/loop.ts`).
- Utilidades matematicas: `approach`, `damp`, `lerpAngle`, `wrapAngle`
  (`src/core/math.ts`).
- Renderer com limite de DPR em 2, resize, FOV vertical derivado de um alvo
  horizontal e tratamento de perda de contexto WebGL.

**Jogo**
- `GameState` com a fatia do player (`src/game/state.ts`).
- Entidade do player: posicao, posicao anterior, velocidade e angulo
  (`src/game/entities/player.ts`).
- Sistema de movimento em passo fixo: **direcao analogica em 360 graus**
  relativa a camera, intensidade com saturacao antecipada, zona morta
  descontada, aceleracao alta para resposta imediata e giro suave
  (`src/game/systems/movement.ts`). **Nao importa `three`** — recebe o angulo da
  camera como um numero e o terreno como uma consulta. Ver `decisions/0007`.
  O player acompanha a altura do chao e **desliza** ao encostar num obstaculo:
  so a componente da velocidade contraria ao empurrao e removida.
- **Sistema de mundo** (`src/game/systems/world.ts`): altura do terreno,
  bloqueadores, limite do mundo e pesos de regiao. Tambem **nao importa
  `three`**. Ver `systems/world.md`.
- **Sistema de mobs** (`src/game/systems/mobs.ts`): 40 mobs **estacionarios**
  em tres regioes, com deteccao por distancia e histerese, e giro para encarar.
  Nao perseguem e nao voltam ao spawn -- nunca saem dele. Ver `systems/mobs.md`.
- **Barramento de eventos** (`src/game/events.ts`): sete eventos tipados, entrega
  sincrona, payload reaproveitado por tipo. Existe porque a regra 2 proibe um
  sistema importar outro, e o combate foi o primeiro a precisar falar.
- **Sistema de combate** (`src/game/systems/combat.ts`): auto attack com alvo
  mais proximo e aderencia, dano, morte, respawn de mob e do jogador, e moeda.
  **O tempo de abate e consequencia de vida/dano/intervalo, nunca regra** -- se o
  dano alcanca a vida, o alvo cai no primeiro golpe. Ver `systems/combat.md`.

**Save**
- `localStorage`, chave `astra-sovereign/save`, JSON versionado (`v: 1`).
  Persiste posicao, angulo, vida e moeda -- cinco numeros. Mobs e altura ficam
  de fora de proposito. Autosave a cada 5s mais flush ao esconder ou sair.
  Save invalido e descartado inteiro e o jogo comeca do zero.
  Ver `systems/save.md`.

**Conteudo**
- `src/data/world-01.ts`: as seis regioes do Mundo 1, os cinco corredores e a
  semente dos bloqueadores. Primeiro arquivo de `src/data/`.
- `src/data/mobs.ts`: tres tipos de mob e as regras de quantos nascem em cada
  regiao. A Inicial fica sem mobs de proposito.

**Entrada**
- Joystick virtual **ancorado** no canto inferior esquerdo, com area de toque
  maior que o desenho (`src/input/joystick.ts`). Era flutuante ate o M2; mudou
  depois de testar no aparelho, onde ele aparecia no meio da tela tapando a
  cena.
- **Um dedo gira a camera, dois dedos dao zoom** por pinca, entre 9 e 32
  unidades (`src/input/camera-drag.ts`). A zona ocupa a tela inteira, por baixo
  da do joystick. Andar e girar ao mesmo tempo funciona.

**Render**
- Camera orbital: yaw livre, pitch padrao ~15 graus limitado entre 6 e 66,
  **distancia ajustavel pelo jogador** entre 9 e 32, suavizacao exponencial
  independente de framerate e look-ahead curto (`src/render/camera.ts`). Ver `decisions/0006` e `references/analise-video-01.md`.
  O pitch foi calibrado para trazer o horizonte a ~20% do topo, como na
  referencia do genero.
- Player provisorio: capsula com marcador de frente e marca de contato com o
  chao (`src/render/views/player-view.ts`).
- **Mundo 1** (`src/render/world/`): terreno com relevo gerado pela mesma funcao
  de altura que a colisao usa, muros das Ruinas, troncos da Floresta, obeliscos
  de Campos, anel da Arena, marcas de chao, portal nos dois estados e particulas
  em deriva na regiao Inicial.
- Iluminacao e nevoa **interpoladas por regiao** com apenas duas luzes na cena
  inteira. Zero draw calls por regiao — so atualizacao de uniforme.
- **Personagem animado** (`src/render/characters/`): rig procedural obedecendo
  a `decisions/0008`, com clipes idle, walk, run e alert. Uma geometria
  compartilhada por todos; so o esqueleto e proprio.
- O player **deixou de ser capsula**. O clipe sai da velocidade que a simulacao
  ja calculou — `src/game/` nao sabe que animacao existe.
- **Clipes de acao** (`attack`, `hit`, `die`): tocam uma vez, ao contrario dos de
  ciclo. O `Animator` ganhou `playOnce`, e enquanto uma acao corre o pedido de
  ciclo fica anotado em vez de apagar o golpe no frame seguinte. A morte segura
  a pose ate o corpo voltar a viver.
- **Feedback de impacto**: flash por troca de material, recuo curto da malha e
  numero de dano. O recuo e **so visual** — a posicao simulada do mob nao muda.
- **Numeros de dano em DOM** (`src/render/damage-numbers.ts`), pool fixo de 24,
  projetados a mao para a tela. Zero draw calls; em sprite seriam 24 a mais numa
  cena que tem 16 a 26.

**Cores do feedback**
- Numeros: dano do jogador `#e8ecff`, dano levado `#ff7b8a`, moeda `#ffca6b`.
- **Flash na cor de quem bateu, nos dois sentidos.** O mob pisca claro, na faixa
  do jogador; o jogador pisca na cor do mob que acertou. Funciona porque os
  inimigos estao na faixa quente e o player e azul claro — a oposicao de matiz e
  o que faz o quadro se ler a 48px.

**Orientacao**
- Exclusivamente paisagem. Em retrato o portao cobre a tela e pausa a
  simulacao; voltar retoma sem lote de ticks atrasados.

**Debug**
- Overlay: fps, ms, pico, ticks, draw calls, triangulos, DPR, resolucao, heap,
  mais posicao, altitude, velocidade, regiao ativa e yaw da camera.
- Cheats de teleporte por regiao e alternancia do portal (`src/debug/cheats.ts`).
  Atravessar o mundo leva ~39 segundos; verificar a Arena a pe a cada build
  seriam minutos perdidos por rodada.
- **Benchmark de personagens animados** em `bench.html`, entrada Vite separada
  do jogo. Ferramenta permanente, com protocolo versionado para comparar
  medicoes entre milestones. Ver `06-benchmark.md`.
- Console in-game capturando `console.*`, `window.onerror` e promises
  rejeitadas.

**Entrega**
- `main` publica no GitHub Pages a cada push.
- URL: https://grossmannmyguel07-boop.github.io/astra-sovereign/

**Organizacao**
- Equipe de agentes com mapa de propriedade fixo (`docs/05-agents.md`,
  `.claude/agents/`).

## Verificado no M4

Playwright emulando iPhone em paisagem (844x390, DPR 3, toque), sobre a build de
producao. O jogo foi jogado de verdade: teleporte para Campos, andar ate encostar
num mob, e deixar o auto attack trabalhar.

| Caso | Medido |
|---|---|
| Abate parado, ciclo completo | moeda **3 → 6 → 9**, um mob por vez |
| Tempo do contato ate o abate | **~2s** (52 de vida / 14 por golpe = 4 golpes) |
| Respawn do mob | volta em **6s**, no mesmo lugar, vida cheia |
| Dano recebido parado | 120 → **100** em 16s |
| 24s parado dentro da faixa de alerta (11), fora do golpe (5 e 4) | **zero dano dos dois lados** |
| Numeros de dano na tela | `14` em `#e8ecff` e `5` em `#ff7b8a`, simultaneos |
| Flash no mob e no jogador | **os dois**, legiveis contra o mundo escuro |
| Corpo caido | tomba e desce ao chao; ninguem fica deitado no ar |
| Draw calls durante o combate | 13 a **47** |
| Triangulos | 26 mil a **47 mil** |
| Erros de console, pagina e requisicao | **nenhum**, fora o 404 de favicon |

Caminhos extremos, verificados com builds descartaveis de balanceamento — os
valores voltaram ao normal antes do commit:

| Caso | Como | Medido |
|---|---|---|
| **Abate em um golpe** | dano do jogador em 90 | mob cai com o jogador em vida cheia; numero, moeda e respawn rodam inteiros |
| **Morte do jogador** | dano do mob em 70 | vida a **0**, renasce na Inicial em 2s com **120/120** |
| **Flash de impacto** | duracao em 1.5s | mob em `#e8ecff` e jogador em `#ff7b8a`, na mesma cena |

Duas anomalias investigadas e descartadas como bug: uma emenda vertical na
imagem (artefato de captura do SwiftShader, nao reproduz entre quadros) e o
jogador aparentemente fora do centro (estava atras de um tronco; parado e
correndo em area aberta ele fica centrado).

### Corrigido depois do M4, no polimento

1. **Troncos da Floresta.** Altura 7.5 (ate 9.4 com escala) escondia o jogador
   inteiro em toda a distancia entre camera e player — luta invisivel. Baixados
   para 2.6 e afinados; a faixa de ocultacao total caiu para 5.7 unidades. Mesma
   escolha do muro das Ruinas no M2.
2. **Cor dos mobs.** Os tres foram para a faixa quente — terracota, tijolo e
   brasa. Nenhum usa `#ffca6b`, que e exclusiva de recompensa.
3. **Flash do jogador.** O desvio que usava a cor de perigo saiu: com inimigos
   quentes a regra "cor de quem bateu" voltou a ser legivel.

Continua aberto: o 404 de `/favicon.ico`, que o `index.html` produz por nao
declarar icone. E anterior ao M4.

### Encontrado durante o QA do M4, **nao corrigido na epoca**

1. **Os troncos da Floresta escondem o jogador por completo.** Lutando entre
   eles, ha quadros em que o corpo do jogador nao aparece. E o mesmo `Risco 1` de
   `worlds/world-01.md` que os muros das Ruinas tiveram no M2, agora na Floresta.
   Custa mais caro aqui: no M2 era navegacao, no M4 e nao ver a propria luta.
2. **O `index.html` nao declara icone**, entao o navegador pede `/favicon.ico` e
   leva 404 em toda sessao. E anterior ao M4 e aparece no console de todos os
   milestones.
3. **A cor dos mobs contradiz a direcao de arte.** `art-direction.md` manda
   inimigo na faixa quente (ambar/vermelho); o codigo tem azuis e roxos. A
   decisao ja esta fechada — ver "Biblioteca de assets" abaixo — mas o M3 ainda
   nao foi corrigido. E o que obriga o flash no jogador a usar a cor de perigo
   em vez da cor do atacante: corrigida a cor dos mobs, a regra original volta a
   valer sozinha.

## Verificado no M3

Playwright emulando iPhone em paisagem (844x390, DPR 3, toque), sobre a build de
producao.

| Caso | Medido |
|---|---|
| Mobs gerados | **40**, nas tres regioes previstas |
| Folga ao bloqueador mais proximo | **0.70** — o raio de resolucao, exato |
| Mobs dentro de bloqueador | **0** |
| Mobs fora da propria regiao | **0** |
| Deteccao ao andar em Campos | 0 -> **3** alerta -> 0 ao se afastar |
| Regiao Inicial e Arena | **0 alerta**, como projetado |
| Draw calls por regiao | 8 (Arena) a **44** (Ruinas) |
| Triangulos | 25 mil a **44 mil** |
| Erros de console, pagina e requisicao | **nenhum** |

Ajustes de controle pedidos depois de jogar no aparelho, ja verificados:

| Caso | Medido |
|---|---|
| Afastar os dedos | distancia 17.5 -> **9** (limite minimo) |
| Aproximar os dedos | distancia -> **32** (limite maximo) |
| Insistir alem dos limites | segura em **9** e **32** |
| Andar e girar com dois dedos | velocidade **8.4** constante, yaw 0 -> **50** |
| Soltar o joystick | velocidade a **zero** |
| Horizonte a 9 e a 32 | **mesma altura** — o enquadramento do M1 sobrevive |

Corrigido durante a verificacao:

1. **81 draw calls nas Ruinas**, contra 26 no M2. Nevoa esconde mas nao
   descarta: dezenas de mobs invisiveis continuavam sendo desenhados. Entrou
   corte por distancia da nevoa da regiao, e as marcas de chao viraram um
   `InstancedMesh` unico. Caiu para 44.
2. **Player e mobs eram quase a mesma cor** (`0x4a63d8` contra `0x5a6bb8`),
   indistinguiveis em movimento. O player passou a ser o unico personagem claro
   em cena. No M4 eles atacam — nao dar para saber quem e quem seria falha de
   jogabilidade, nao de arte.

**Medido no iPhone 14:** o jogo completo roda a **60fps travados**, inclusive
nas Ruinas, a regiao mais pesada — 16 a 26 draw calls conforme o angulo da
camera, com 40 mobs no mundo. Isso fecha a segunda ressalva da `decisions/0011`,
que era nao ter medido a soma de mundo mais personagens.

## Verificado no M2

Playwright emulando iPhone em paisagem (844x390, DPR 3, toque), sobre a build de
producao. Numeros lidos do overlay.

| Caso | Esperado | Medido |
|---|---|---|
| Nascer na Inicial | dentro da bacia, abaixo de zero | (-85, 55) alt **-1.7** |
| Teleporte para cada uma das seis regioes | regiao ativa correta | 6 de 6 |
| Altitude ao longo do mundo | bacia negativa, plato positivo | **-1.7** a **+5.7** |
| Andar da Inicial para Campos | a altura muda com o terreno | -1.7 -> **-1.0** |
| Correr contra a borda por 11s | o limite segura | parado em (-84.1, -34.1) |
| Draw calls por regiao | variam com o descarte por frustum | **8** (Arena) a **26** (Ruinas) |
| Triangulos | orcamento estavel | ~**25 mil** em qualquer ponto |
| Portal visto de Campos, a 84 unidades | visivel e claramente desligado | sim |
| Portal desperto, mesmo enquadramento | claramente aceso | sim |
| Erros de console, pagina e requisicao | nenhum | **nenhum** |

Corrigido durante a verificacao, tudo encontrado **olhando a tela**:

1. **Os muros das Ruinas escondiam o player.** Topo entre 2.86 e 4.96 contra uma
   linha de visao que passa a `1.4 + 0.266 * d`: tapavam ate 13.4 unidades
   atras. Baixados para topo maximo 2.37, oclusao agora em 3.6 unidades. E o
   `Risco 1` de `worlds/world-01.md`, que aconteceu de fato.
2. **Um bloqueador existia sem muro na tela.** A fileira de muros nascia na
   origem e crescia so para um lado, entao um muro comprido escapava da regiao e
   caia fora do filtro de desenho — colisao sem nada visivel. A fileira passou a
   nascer centrada.
3. **Cada trecho de muro tinha um giro aleatorio**, entao a fileira lia como
   cubos soltos em vez de construcao. A orientacao passou a morar no proprio
   bloqueador.
4. **O portal dormente sumia de Campos**, diluido 54% pela nevoa a 84 unidades —
   quebrando a afirmacao central do desenho do mundo. Estrutura clareada; o que
   separa os dois estados e o nucleo aceso, nao a estrutura visivel.
5. **As particulas da Inicial liam como nevasca** (120 delas, tamanho 1.05). Um
   campo denso vira ambiente e o olhar para de segui-lo; 52 menores leem como
   corrente, e corrente tem direcao.

O framerate do ambiente de verificacao reflete renderizacao por software
(SwiftShader) e nao diz nada sobre o iPhone. Os numeros que valem sao draw calls
e triangulos.

## Verificado no M1

Playwright emulando iPhone em paisagem (844x390, DPR 3, toque), sobre a build
de producao. Posicao lida do overlay:

| Caso | Esperado | Medido |
|---|---|---|
| Empurrar a 22.5 graus | anda a 22.5 graus | **22.9** (erro 0.4) |
| Empurrar a 30 graus | anda a 30 graus | **30.3** (erro 0.3) |
| Empurrar a 67.5 graus | anda a 67.5 graus | **67.5** (erro 0.0) |
| Empurrar a 105 graus | anda a 105 graus | **104.9** (erro 0.1) |
| Inclinacao 0.20 / 0.35 / 0.50 | velocidade proporcional | 1.2 / 3.4 / 5.6 |
| Inclinacao 0.65 / 1.00 | satura perto do maximo | 7.9 / 8.5 |
| Velocidade apos 300ms parado | ja no maximo | 8.5 |
| Soltar o joystick | velocidade a zero | 8.5 -> 0.0 |
| Correr contra a borda | distancia trava no raio | 38.0 |
| Arrastar 250px a direita | visao gira a direita | yaw -89 |
| Arrastar 250px a esquerda | visao gira a esquerda | yaw +89 |
| Arrastar muito para baixo | pitch trava no teto | 66 |
| Arrastar muito para cima | pitch trava no piso | 6 |
| Girar ~90 e empurrar "para cima" | anda para onde a camera olha | x +6.8, z +0.1 |
| Retrato | portao aparece | sim |

8 draw calls, 730 triangulos. Sem erros de console, de pagina ou requisicoes
falhas.

Corrigido durante a verificacao: o chao original lia como listras e nao como
grade, e a cena vazia nao dava referencia de movimento lateral. Grid ganhou
celulas maiores e mais contraste, e entraram 120 marcas instanciadas.

O framerate do ambiente de verificacao reflete renderizacao por software
(SwiftShader). Com 8 draw calls o custo real no iPhone e irrelevante.

Limitacao: o proxy do ambiente bloqueia `github.io`, entao a verificacao visual
acontece sobre a build servida localmente — byte a byte a mesma que vai ao
Pages. A confirmacao na URL publicada e do desenvolvedor.

## O que NAO existe ainda

Save, XP, HUD, units, gacha, quests, boss. Tambem nao existem: painel de tuning
(M6) e transicao entre mundos (M12).

A moeda acumula mas **nao tem dreno nenhum** ate o M9. Vida e moeda so aparecem
no overlay de debug — a HUD e do M7.

O portal existe como marco visual nos dois estados, mas **nao leva a lugar
nenhum** — atravessa-lo nao faz nada. O despertar de verdade e do M10; a
transicao, do M12.

## Proximo passo

**Milestone 6 — Progressao.** XP, level, stats e duas trilhas simultaneas.
Chega o painel de tuning. O M5 fechou: o save ja guarda o que o M6 vai precisar
estender, e estender significa **subir a versao do save**.

Antes dele, duas coisas pedem decisao do desenvolvedor:

1. **O ritmo do combate agrada?** Os valores atuais sao ponto de partida
   declarado, nao medicao. So jogando no aparelho da para dizer.
2. **O trabalho de asset, que nao esta no roadmap** e precisa acontecer antes de
   qualquer troca de placeholder:
   - escrever o pipeline (`docs/assets/estrutura-e-pipeline.md`);
   - subir o benchmark para **protocolo v2** e medir os modelos reais no
     aparelho — os escolhidos passam do teto de ~900 triangulos e 22 ossos que a
     medicao v1 assumiu, o que invalida o v1.

Area: **Progression Agent** e **Data & Balance**, com o Tech Lead integrando.

## Direcao visual definida

- **Direcao de arte** em `design/art-direction.md`: low-poly cosmico, cor chapada,
  luz emissiva, paleta fechada, duas luzes, sem sombras projetadas, sem PBR.
- **Personagens em 3D**, revertendo os sprites 2.5D — `decisions/0009`.
- **Contrato de rig humanoid** com nomenclatura Mixamo — `decisions/0008`,
  emendada no M4 com os contratos `blob` e `flying`.
- **Referencias** em `docs/references/`: analise escrita apenas, sem midia de
  terceiros.

## Decisoes fechadas no M4

Todas registradas em `design/combat.md`, que deixou de ter pendencia de ritmo.

- **O jogador luta andando.** Nada para o movimento. A consequencia medida e
  desejada: correr pela regiao leva dano sem abater; parar abate em ~2s.
- **Alcance 5 contra deteccao 11.** A faixa entre os dois e o aviso, e ela e
  inerte — 24s parado ali sem dano nenhum.
- **Alvo mais proximo com aderencia de 1.5**, para o dano concentrar.
- **Sem indicador de alvo, sem critico, sem elemento nem afinidade.**
- **Morte sem punicao**: 2s e volta na Inicial com vida cheia.
## Biblioteca de assets — fechada

`docs/assets/`. Seis pacotes CC0 levantados, 526 modelos medidos, **34
escolhidos**. Nenhum binario no repositorio ainda.

| Decisao | Resultado |
|---|---|
| **Rig** | A `0008` fica. Asset externo se adapta pela tabela de renomeacao. O criterio elegeu Quaternius (17/22 do contrato) e **recusou Kenney** (7/22) |
| **Cor dos inimigos** | Passam a ser **quentes**. O mundo continua frio. O M3 sera corrigido |
| **Pipeline** | Conversor proprio, **automacao total, sem Blender e sem editor de imagem** |
| **`#ffca6b`** | Cor da recompensa, exclusiva. Parte da identidade do projeto |
| **Bruto** | Fica **fora do Git**. Versiona-se so o processado |

Player e boss saem do corpo **Big**; mobs comuns do corpo **Blob**; ruinas e
itens da **Kenney**; arvores secas e rochas da **Quaternius Nature**.

## Decisoes fechadas no M3

- **Densidade de mobs.** 14 em Campos, 12 nas Ruinas, 14 na Floresta. Aceita
  provisoriamente depois de jogar no aparelho. Os numeros sao uma linha cada em
  `src/data/mobs.ts` -- reabrir custa minutos.
- **Tamanho do personagem na tela.** Deixou de ser decisao do desenvolvedor: o
  jogador ajusta por pinca. Ver `decisions/0006`.

## Decisoes em aberto

- **FOV horizontal.** Hoje 75 graus contra ~113 da referencia, que mostra bem
  mais mundo. Julgar no M3, com mundo de verdade na tela.
- **Orcamento do personagem.** ~900 triangulos e 22 ossos, congelado
  **provisoriamente**. Vira definitivo quando o primeiro modelo real existir.
  Com 4x de folga medida, ha espaco para subir se a arte pedir — mas subir
  invalida a medicao e exige nova versao de protocolo.
