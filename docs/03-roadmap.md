# Roadmap

Fatias verticais: cada milestone entrega algo **jogavel no iPhone**, nao uma
camada abstrata. O objetivo e chegar rapido ao MVP.

## Definition of Done (vale para todos)

1. Funciona no Safari do iPhone em paisagem (confirmado com screenshot).
2. `npm run check` passa.
3. Rodado e inspecionado via Playwright, sem erros no console.
4. `docs/04-state.md` atualizado.
5. Sistema novo tem doc em `docs/systems/`.
6. Commit feito, merge para `main`, deploy confirmado.

## Como o trabalho e dividido

Equipe de agentes com fronteiras de propriedade fixas — ver `docs/05-agents.md`.
Cada milestone indica as areas que toca, e o Tech Lead decide entre trabalho
paralelo e execucao direta. Integracao e QA nunca sao delegados.

## Milestones

| # | Nome | Entrega | Areas | Estado |
|---|---|---|---|---|
| 0 | Fundacao | Vite + TS + Three.js, loop de passo fixo, debug overlay, console in-game, publicacao, orientacao paisagem, equipe de agentes | Tech Lead | **concluido** |
| 1 | Player | Joystick flutuante, movimento analogico 360 relativo a camera, camera orbital com pitch limitado, enquadramento calibrado | UI, Render, Combat | **concluido** |
| 2 | Mundo 1 | Terreno, colisao, iluminacao, organizacao espacial, atmosfera, estrutura do mapa, marco visual do portal | World, Render | **concluido** |
| 3 | Mobs | **Benchmark de personagens animados no aparelho**, sistema de animacao, spawn, respawn, IA de perseguicao | Combat, Render, Data | proximo |
| 4 | Combate | Auto attack, dano, morte, numeros de dano, drop. Chega o barramento de eventos | Combat, Render, Data |
| 5 | Save | Persistencia local, versionamento, migrations, exportar/importar | Save |
| 6 | Progressao | XP, level, stats, duas trilhas simultaneas. Chega o painel de tuning | Progression, Data |
| 7 | HUD | Vida, XP, nivel, moeda, objetivo visivel. Resolver a disputa entre botoes e area de rotacao | UI |
| 8 | Units | Units seguindo e atacando | Progression, Render |
| 9 | Gacha | Invocacao, raridades, pity | Progression, Data, UI |
| 10 | Boss | Boss com fases e arena | Combat, Render |
| 11 | Quests | Objetivos, progresso, recompensas | Progression, Data, UI |
| 12 | Mundo 2 | Sistema de transicao entre mundos — **MVP fechado** | World, Save |

## Decisoes de ordenacao

### Por que Mundo antes de Mobs

Mob precisa de lugar para existir. Spawn, perseguicao e colisao so podem ser
calibrados dentro de um espaco real; num plano infinito qualquer numero parece
certo.

### Por que Save saiu do inicio para o M5

A ordem anterior colocava Save no M2, com o argumento de que retrofitar
serializacao em dez sistemas prontos e doloroso. O argumento continua valido,
mas hoje o estado do jogo e a posicao do player: salvar isso e teatro.

No M5 existem mundo, mobs e combate — ha estado de verdade para persistir, e o
formato do save nasce a partir de algo real em vez de ser adivinhado.

**A protecao contra o retrofit continua obrigatoria:** todo sistema criado do
M2 em diante ja nasce com `serialize()` e `deserialize()` na fatia dele, mesmo
sem ninguem chamando ainda. O custo e de minutos por sistema.

### Por que o portal se divide em dois

**Marco visual do portal: M2.** E o elemento mais brilhante do mundo e serve de
ancora de orientacao. Faz parte de dar rumo ao espaco.

**Sistema de transicao: M12.** Trocar de mundo exige descarregar cena, liberar
memoria, reposicionar player e persistir onde ele estava. Isso e trabalho de
sistema, nao de cenario, e so tem sentido quando existe um segundo mundo.

### Por que HUD depois de Progressao

HUD mostra numeros. Antes do M6 nao ha numero para mostrar alem da posicao.
Construir a HUD antes seria desenhar o recipiente antes de saber o conteudo — e
refaze-la quando o conteudo chegasse.

## Amarras entre milestones

| Milestone | Depende de | Motivo |
|---|---|---|
| M3 Mobs | M2 Mundo | Precisa de espaco e colisao |
| M4 Combate | M3 Mobs | Precisa de alvo |
| M5 Save | M4 Combate | Precisa de estado real |
| M7 HUD | M6 Progressao | Precisa de numeros |
| M9 Gacha | M8 Units | Units sao a recompensa principal |
| M11 Quests | M4 Combate | Objetivos contam abates |
| M12 Mundo 2 | M5 Save | Onde o jogador estava precisa persistir |

## Pendencia obrigatoria no M3

**Benchmark antes de qualquer arte.** `SkinnedMesh` nao instancia: cada
personagem animado por esqueleto e uma draw call propria, contra as 8 que a
cena inteira tem hoje.

Medir no aparelho, com cena de estresse: FPS, tempo de frame, draw calls,
triangulos, memoria. A partir do numero decide-se se mobs comuns usam esqueleto
ou tecnica mais barata. Ver `decisions/0008`.

## Depois do MVP

Identidade propria: substituir a estrutura inspirada na referencia por
mecanicas e mundos originais. Ate la, a referencia serve para acertar o ritmo do
loop — nao para definir o jogo final.

Candidatos sem ordem definida: PWA com service worker, audio, mais mundos,
equipamentos, prestige, automacoes de farm, multiplicadores.
