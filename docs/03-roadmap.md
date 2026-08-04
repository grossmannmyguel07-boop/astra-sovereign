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

A partir daqui o projeto tem uma equipe de agentes com fronteiras de propriedade
fixas — ver `docs/05-agents.md`. Cada milestone abaixo indica quais areas toca,
e o Tech Lead decide se vale trabalho paralelo ou execucao direta.

Integracao e QA nunca sao delegados.

## Milestones

| # | Nome | Entrega | Estado |
|---|---|---|---|
| 0 | Fundacao | Projeto Vite + TS + Three.js, loop de passo fixo, cena de teste, debug overlay, console in-game, publicacao funcionando, portao de orientacao paisagem, equipe de agentes definida | **concluido** |
| 1 | Player + Input | Joystick virtual flutuante, movimento em 8 direcoes com aceleracao e atrito, camera com follow suave e look-ahead, mundo plano temporario | **concluido** |
| 2 | Save | Persistencia local, migrations, exportar/importar save | proximo |
| 3 | Mundo 1 | Terreno, limites, colisao simples, props | |
| 4 | Mobs + Combate | Spawn, auto attack, dano, morte, numeros de dano. Chega o barramento de eventos | |
| 5 | Progressao | XP, level, stats, curvas. Chega o painel de tuning | |
| 6 | HUD | Vida, XP, level, moeda, botoes | |
| 7 | Units | Units seguindo o player e atacando | |
| 8 | Gacha | Tela de invocacao, raridades, pity | |
| 9 | Quests | Objetivos, progresso, recompensas | |
| 10 | Boss | Boss com fases e arena | |
| 11 | Portal + Mundo 2 | Transicao entre mundos — **MVP fechado** | |

## Por que o Save vem no M2 e nao no fim

Adicionar serializacao a dez sistemas prontos e doloroso e gera bugs silenciosos.
Com o Save existindo cedo, cada sistema ja nasce com sua fatia de save e sua
migration. Custa um dia agora e economiza uma semana depois.

## Depois do MVP

Identidade propria: substituir a estrutura inspirada em Anime Astral por
mecanicas, mundos e progressao originais. Ate la, a referencia serve para
acertar o ritmo do loop — nao para definir o jogo final.

Candidatos para depois do MVP, sem ordem definida: PWA com service worker,
audio, mais mundos, sistema de equipamentos, prestige/rebirth.
