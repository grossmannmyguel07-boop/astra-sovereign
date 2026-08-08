# Sistema de progressao

**Arquivo:** `src/game/systems/progression.ts` · **Dono:** Progression Agent · **Desde:** M6

XP e nivel. Ouve `mob:killed`, emite `player:leveled`. Nada mais.

## Contrato

| Campo | Onde | O que e |
|---|---|---|
| `state.level` | `src/game/state.ts` | Nivel atual, comeca em 1 |
| `state.xp` | `src/game/state.ts` | XP **dentro do nivel atual**, zera a cada subida |
| `player.attackDamage` | `src/game/entities/player.ts` | Derivado do nivel, nunca salvo |
| `MOB_TYPES[].xp` | `src/data/mobs.ts` | 10 / 20 / 15 por tipo |

```
xpToNext(nivel)      = round(XP_BASE * nivel ^ XP_CURVE)   // 30, 85, 156, 240...
damageAtLevel(nivel) = PLAYER_ATTACK_DAMAGE + (nivel - 1) * DAMAGE_PER_LEVEL
```

Curva progressiva, nao linear, como `design/progression.md` marca `[DEFINIDO]`.
O XP zera a cada nivel em vez de acumular: evita que o numero cresca sem limite
e precise do formato com sufixo, que continua sem decisao.

## Subir de nivel da dano, e so

Escolha deliberada, e o motivo e de leitura, nao de design de RPG: **o numero de
dano ja esta na tela desde o M4**. Ver `14` virar `17` no golpe seguinte e
feedback completo sem uma linha de HUD. Vida maxima seria invisivel ate o M7.

O texto `NIVEL N` que aparece na subida reaproveita o pool de numeros de dano,
na cor de recompensa. Nao ha interface nova.

## O laco de subida existe por um motivo

`award` sobe **quantos niveis couberem** de uma vez, em vez de um por abate. Hoje
nenhum mob vale um nivel inteiro, mas tratar isso como impossivel seria a mesma
classe de erro que o `combat.md` proibe no abate em um golpe: supor que o alvo
sobrevive ao primeiro acerto.

## Por que e um sistema separado

O combate nao pode saber que XP existe. Ele emite "este mob morreu" e quem
quiser que faca algo: hoje progressao e o numero de recompensa, amanha quests
contam e inventario solta drop. Enfiar XP dentro do combate obrigaria a enfiar os
outros tres tambem.

## O que **nao** existe

Sem segunda trilha, sem distribuicao de pontos, sem teto de nivel, sem prestige,
sem stat alem de dano. Os cinco continuam `[PENDENTE]` ou `[PROPOSTA]` em
`design/progression.md`, e a regra do projeto proibe transformar pendencia em
codigo.

**O Pilar 2 ainda nao esta atendido.** Ele exige duas trilhas com curvas
desalinhadas, e moeda e XP saem os dois de abate -- ou seja, andam juntas. A
segunda trilha de verdade depende de decidir o que faz o Rank subir.
