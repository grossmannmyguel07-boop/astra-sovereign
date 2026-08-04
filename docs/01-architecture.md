# Arquitetura

## A decisao central: simulacao separada da renderizacao

```
src/game/    logica pura        <- NUNCA importa three
src/render/  desenha com three  <- le o estado, nao decide regra
src/ui/      HUD em DOM/CSS     <- le o estado, emite intencoes
```

**Por que:** a logica vira TypeScript puro — deterministico, testavel e
verificavel sem abrir o navegador. Isso importa muito aqui: quem escreve boa
parte do codigo (Claude) nao ve a tela do iPhone. Com a logica isolada, a
maior parte do trabalho pode ser validada sem depender de inspecao visual.

**Custa:** disciplina constante (e tentador mexer em `mesh.position` de dentro
do combate) e alguma duplicacao — a posicao existe na simulacao e no objeto 3D,
sincronizadas a cada frame.

## Game loop de passo fixo

`src/core/loop.ts`. Simulacao a 60Hz fixos, renderizacao livre com fator de
interpolacao.

**Por que:** o iPhone reduz o clock quando esquenta e cai para 30fps depois de
alguns minutos. Com passo variavel, o dano por segundo do auto attack mudaria
com a temperatura do aparelho. Com passo fixo a simulacao e identica em
qualquer framerate — e reproduzivel, o que a torna testavel.

**Custa:** um acumulador com limite superior (`MAX_FRAME_TIME`), necessario
para que voltar de segundo plano nao dispare milhares de ticks de uma vez.

## Estado unico e serializavel

Uma arvore de estado (`player`, `world`, `units`, `inventory`, `quests`, ...)
e a fonte da verdade. Cada sistema le e escreve **apenas sua fatia**.

**Por que:** salvar e serializar essa arvore. Depurar e imprimi-la.
**Custa:** risco de virar um objeto gigante e acoplado, contido pela regra de
"cada sistema so toca sua fatia".

## Comunicacao por eventos

Sistemas nunca se importam entre si. Quem precisa saber de algo, escuta.

```
combat  emite  mob:killed
                 -> progression escuta e da XP
                 -> quests escuta e conta objetivo
                 -> inventory escuta e da drop
```

**Por que:** permite adicionar o decimo sistema sem editar os nove anteriores.
Tambem e o que permite trabalhar em um sistema sem tocar nos arquivos de outro.

**Custa:** o fluxo fica indireto — "quem causou isso?" exige procurar emissores.
Contido por uma lista central de eventos tipados e por log de eventos no debug.

**Ainda nao existe.** Chega no milestone em que o segundo sistema precisar
falar com o primeiro (previsto para o M4, combate). Criar um barramento de
eventos vazio agora seria abstracao antes do uso.

## Conteudo orientado a dados

Mobs, units, mundos, quests e pools de gacha vivem em `src/data/` como objetos
tipados, nao em codigo.

**Por que:** a maior parte do crescimento do jogo nos proximos meses e conteudo
novo, nao sistema novo. Adicionar um mob deve ser editar uma lista.
**Custa:** exige decidir os formatos antes; mudar um formato depois obriga a
revisar todo o conteudo ja escrito.

## HUD em DOM, nao no canvas

**Por que:** texto desenhado em canvas no iPhone e caro e borrado; CSS resolve
safe-area do notch e escala de graca; e a HUD fica facil de ajustar sem
conhecer Three.js.
**Custa:** duas camadas para coordenar, com atencao a `pointer-events`.

## Decisoes especificas de iPhone

| Decisao | Motivo |
|---|---|
| `devicePixelRatio` limitado a 2 | O iPhone reporta 3; renderizar em 3x custa ~9x mais pixels que 1x. Maior alavanca de performance do projeto. |
| FOV vertical derivado de um alvo horizontal | Em retrato (aspecto ~0.46) um FOV vertical fixo de 60 graus deixa so ~30 graus na horizontal: nao se enxerga nada dos lados. |
| Sem antialias no WebGL | MSAA custa caro e ajuda pouco num alvo 2.5D, onde as bordas vem de textura de sprite. |
| `MeshLambertMaterial` em vez de `MeshStandardMaterial` | Iluminacao PBR por pixel nao se paga em estetica anime no celular. |
| Pooling de objetos por frame | O coletor de lixo do iOS causa engasgos visiveis. |
| Orcamento fixo de entidades | Nada cresce sem limite; ao estourar, recicla o mais antigo. |
| Tratamento de `webglcontextlost` | Modo de falha real no Safari quando a memoria aperta. Sem log, a tela congela sem explicacao. |

## Ferramentas de debug como infraestrutura

`src/debug/` existe desde o primeiro milestone, nao no final.

**Por que:** o jogo e testado num iPhone, onde nao ha DevTools sem um Mac.
Sem o console in-game, um erro de JavaScript e uma tela preta sem pistas.

Contem hoje: overlay de metricas (fps, ms, ticks, draw calls, DPR, memoria) e
console in-game que captura `console.*`, `window.onerror` e promises rejeitadas.

A definir: painel de tuning em runtime, quando existirem numeros de
balanceamento para ajustar (previsto para o M5).

## O que deliberadamente NAO fazemos

- **ECS.** Espalharia cada feature por varios componentes e arquivos. Nosso
  teto e dezenas de entidades ativas, nao milhares — nao ha ganho que pague a
  indirecao.
- **Framework de UI.** A HUD e DOM direto. React aqui seria peso sem retorno.
- **Camada de abstracao sobre Three.js.** Usamos Three.js diretamente em
  `src/render/`. Se um dia trocarmos, trocamos essa pasta.
