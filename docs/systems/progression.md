# Sistema de progressao

**Arquivo:** `src/game/systems/progression.ts` · **Dono:** Progression Agent · **Desde:** M6

Duas trilhas independentes: **Nivel** e **Poder**. Ouve `mob:killed`, emite
`player:leveled`. Nada mais.

```
abate  -> XP    -> Nivel -> vida maxima
clique -> Poder ---------> dano
```

## Contrato

| Campo | Onde | O que e |
|---|---|---|
| `state.level` | `src/game/state.ts` | Nivel atual, comeca em 1 |
| `state.xp` | `src/game/state.ts` | XP **dentro do nivel atual**, zera a cada subida |
| `state.power` | `src/game/state.ts` | Poder acumulado. **Salvo** (v3) |
| `player.maxHp` | `entities/player.ts` | Derivado do nivel, nunca salvo |
| `player.attackDamage` | `entities/player.ts` | Derivado do Poder, nunca salvo |
| `MOB_TYPES[].xp` | `src/data/mobs.ts` | 10 / 20 / 15 por tipo |

```
xpToNext(nivel)      = round(XP_BASE * nivel ^ XP_CURVE)     // 60, 170, 312, 480...
maxHpAtLevel(nivel)  = PLAYER_MAX_HP + (nivel - 1) * HP_PER_LEVEL
damageFromPower(pod) = round(PLAYER_BASE_DAMAGE * (1 + pod * POWER_DAMAGE_SCALE))
```

Curva progressiva, nao linear, como `design/progression.md` marca `[DEFINIDO]`.
O XP zera a cada nivel em vez de acumular: evita que o numero cresca sem limite
e precise do formato com sufixo, que continua sem decisao.

## A correcao do M6: nivel nao produz dano

O M6 fazia `nivel -> dano`, com uma funcao `damageAtLevel`. **As duas coisas
deixaram de existir**, e o motivo e estrutural, nao de gosto: com uma unica
fonte (abate) movendo o unico stat que importa, nao ha como existir a segunda
trilha que o Pilar 2 exige. Qualquer trilha nova andaria junto da primeira.

Dano passou a sair do **Poder**, que sobe por clique. Fonte diferente, curva
diferente, e o desalinhamento acontece sozinho.

Nivel ficou com a **vida maxima**. A escolha usa o argumento que o proprio
`DAMAGE_PER_LEVEL` registrava para recusa-la — "vida maxima seria invisivel ate
o M7". O M7 existe: a HUD mostra `vida X/Y`, entao subir de nivel aparece na
tela sem nada novo ser desenhado, e `120/120` virando `130/130` e tao legivel
quanto o numero de dano mudando.

Ao subir de nivel a vida ganha entra como vida cheia daquele tanto. O Pilar 1
proibe punir, e subir de nivel nunca pode parecer que nao aconteceu nada.

## Poder nao e recurso

**Forca acumulada, nao energia.** Nunca diminui, nunca e gasta, nao limita acao
nenhuma, e atacar **nao** a consome. Nao e stamina, nao e mana, nao e cooldown e
nao e barra que esvazia. A unica coisa que ela faz e multiplicar o dano.

Morrer nao tira Poder — verificado no QA.

A forma `base * (1 + poder * escala)` vem da referencia do genero. A escala
(0.008) nao veio: foi derivada do combate que existe, para o dano dobrar em ~2
minutos de jogo. Multiplicativa e nao aditiva, para o Poder continuar valendo
quando o dano base subir por outra via.

## Uma operacao para clique e Auto Click

`gainPower` e chamada pelo toque na tela e pelo temporizador do Auto Click. **Nao
existem dois caminhos.** Se o ganho mudar de valor, ou passar a emitir evento, os
dois herdam a mudanca sem ninguem lembrar de sincronizar.

O toque chega por `CameraDrag.consumeTaps()`: a zona de camera cobre a tela
inteira e ignorava toques ate agora, entao o clique nao tirou nada de ninguem —
girar continua sendo arrastar, e a pinca continua sendo dois dedos. Verificado:
8 segundos arrastando geram exatamente o mesmo Poder que 8 segundos parado.

### O Auto Click e o proprio auto attack

Era um temporizador livre de 1 segundo, e estava errado: **o Poder subia com o
jogo aberto e ninguem jogando**. Dez minutos de aba esquecida bastavam para o mob
inicial virar irrelevante, sem nenhuma decisao do jogador.

Na referencia do genero o clique **e** a acao — clica-se para bater, e o passe
"Fast Click" automatiza esse clique enquanto se farma. Aqui o golpe ja sai
sozinho, entao o Auto Click e ele: a progressao escuta `player:attacked` e chama
a mesma `gainPower`.

A consequencia e a que se quer: **Poder e pago com combate, nao com tempo de
tela**. Parado num campo vazio nao sobe nada — verificado: 15 segundos parados na
Inicial, Poder inalterado.

Isso nao transforma Poder em recurso. Ele continua sem ser gasto, sem teto e sem
limitar acao nenhuma; o que mudou foi **de onde vem**, nao o que e.

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

Sem Rank, sem distribuicao de pontos, sem teto de nivel, sem prestige, sem
multiplicador comprado, sem stat alem de vida e dano. Continuam `[PENDENTE]` ou
`[PROPOSTA]` em `design/progression.md`, e a regra do projeto proibe transformar
pendencia em codigo.

**O Pilar 2 passou a ter duas trilhas com fontes diferentes** — abate move o
Nivel, clique move o Poder. Se isso basta para "sempre haver algo perto de
completar" so o aparelho responde: o Poder nao tem marco visivel, ele cresce
continuamente. Fica como pergunta aberta para quando quests existirem (M11).
