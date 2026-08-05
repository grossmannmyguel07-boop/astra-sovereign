# Sistema de combate

**Arquivo:** `src/game/systems/combat.ts` · **Dono:** Combat Agent · **Desde:** M4

Alvo, golpes, morte e respawn. Nao importa `three` e nao importa outro sistema:
fala com o resto do jogo **apenas emitindo eventos**.

O design mora em `docs/design/combat.md`. Aqui esta como ele foi construido.

## A regra que estrutura tudo

Nao existe, e nao deve passar a existir, nenhuma nocao de "quanto tempo um mob
demora para morrer". O que existe sao atributos:

```
golpes = teto(vida / dano)
tempo  = golpes * intervalo de ataque
```

Se o dano alcancar a vida, o alvo morre **no primeiro golpe**. Isso nao e caso
especial: e a mesma linha de codigo com o resultado chegando a zero de uma vez.

Tres consequencias que o codigo respeita, e que qualquer mudanca aqui precisa
continuar respeitando:

1. **Nao ha caminho separado para o abate em um golpe.** Nenhuma etapa do abate
   depende de o alvo ter sobrevivido antes — nem animacao a terminar, nem
   estado intermediario a atravessar.
2. **O evento de dano sai mesmo quando o golpe mata.** O numero do golpe que
   matou importa tanto quanto os outros.
3. **A simetria vale para o jogador.** Sem piso de sobrevivencia.

Verificado no M4 com uma build descartavel de dano 90: os tres mobs caem no
primeiro golpe e o caminho inteiro roda — numero, flash, morte, queda, moeda e
respawn.

## Ordem de execucao

Registrado em `src/main.ts`, dentro do passo fixo:

```
movement  ->  mobs  ->  combat  ->  world.updateRegionWeights
```

Combate por ultimo entre os tres por dois motivos concretos: o alcance do golpe
e medido de onde o jogador esta **neste** tick, e o estado de alerta consultado
e o deste tick, nao o do anterior.

## O que ele faz por tick

```
1. Conta o respawn de cada mob morto; quem zera volta com vida cheia
2. Se o jogador esta morto, so conta o respawn dele e sai
3. Jogador ataca: escolhe alvo, e se o cooldown zerou aplica dano
4. Mobs atacam: cada um no alcance com cooldown zerado bate no jogador
```

Mob morto renasce **exatamente onde estava** — mob comum nunca sai do spawn, e
`x`/`z` sao constantes desde a geracao.

## Escolha de alvo

O mais proximo dentro do alcance, com **aderencia**: o alvo atual so e trocado
se outro estiver mais perto por `TARGET_STICKINESS` (1.5 unidades).

Sem ela, dois mobs praticamente equidistantes fazem o alvo alternar a cada tick
e o dano se espalha. O jogador veria dois mobs caindo devagar em vez de um
caindo e depois o outro — o oposto do pilar 1.

A raiz quadrada so e calculada quando ha alvo, e no maximo duas vezes por tick.
O resto da varredura usa distancia ao quadrado.

## Eventos que emite

Todos com **payload reaproveitado por tipo**, entregues de forma sincrona. Um
objeto por acerto vira lixo por frame com varios mobs em cena, e o coletor do
iOS produz engasgo visivel.

**Quem escuta nao guarda a referencia do payload.** Copie o que precisar.

| Evento | Quando | Quem escuta hoje |
|---|---|---|
| `player:attacked` | O jogador desferiu um golpe | Render: clipe de ataque |
| `mob:damaged` | Um mob levou dano, **inclusive o fatal** | Render: flash, recuo, clipe de dano, numero |
| `mob:killed` | Vida do mob chegou a zero | ninguem ainda — M6 (XP), M11 (quests) |
| `player:damaged` | O jogador levou dano | Render: flash, recuo, numero, e clipe de ataque no mob que bateu |
| `player:died` | Vida do jogador chegou a zero | ninguem ainda |
| `player:respawned` | Voltou a jogar | ninguem ainda |
| `currency:gained` | Abate concedeu moeda | Render: numero de recompensa |

Os tres sem ouvinte nao sao abstracao antecipada: sao emitidos pela mesma linha
de codigo que resolve a morte, e o custo de emitir e uma chamada num mapa vazio.

## Estado e evento tem criterios diferentes

Divisao que a `Scene` e os views seguem, e que vale a pena manter:

- **Condicao vira consulta.** Vivo ou morto esta em `dead`. O view compara com o
  que desenhou da ultima vez e reage a diferenca. Duplicar isso num evento
  criaria duas fontes de verdade para o mesmo fato.
- **Momento vira evento.** Quanto de dano, e quando o golpe saiu, nao existem no
  estado — sao coisas que aconteceram, nao que sao.

## Onde os numeros moram

| Numero | Arquivo |
|---|---|
| Vida, dano, intervalo e alcance do jogador; aderencia; esperas de respawn | `src/config/balance.ts` |
| Duracao do flash, do numero de dano, subida e recuo; teto do pool | `src/config/balance.ts` |
| Vida, dano, intervalo, alcance e recompensa de cada tipo de mob | `src/data/mobs.ts` |

**Nao existe constante de tempo de abate em lugar nenhum, e nao pode passar a
existir.**

## O que o M4 nao tem

- **Nenhum dreno de moeda.** Ela acumula e aparece no overlay. Persiste no M5,
  entra na HUD no M7 e e gasta no M9.
- **Nenhuma barra de vida na tela.** Vida so existe no overlay de debug ate o M7.
- **Nenhum mob perseguindo.** Eles continuam estacionarios; o combate acontece
  onde o jogador escolheu ir.
- **Nenhum critico, elemento ou afinidade.** Decidido, nao esquecido — ver
  `design/combat.md`.
