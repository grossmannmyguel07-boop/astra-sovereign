# Movimento

Dono: **Combat Agent** (`src/game/systems/movement.ts`, `src/game/entities/player.ts`).
Criado pelo Tech Lead como semente da area no M1.

## Responsabilidade

Transformar a intencao do jogador em posicao. Nada mais: nao conhece o
joystick, nao conhece a camera, nao importa `three`.

## Entrada

```ts
interface MoveIntent { x: number; z: number }  // coordenadas de tela, -1..1
```

Passado como argumento em `update(dt, state, intent)`. Deliberadamente um dado
simples e nao uma dependencia: trocar a fonte de entrada (joystick, teclado,
gamepad, um bot de teste) nao encosta na simulacao.

O barramento de eventos chega no M4; ate la o `main.ts` faz a ligacao.

## Estado que possui

`state.player` — posicao, posicao anterior, velocidade, angulo do corpo e
angulo anterior.

Os campos `prev*` existem para interpolacao: a simulacao roda em passo fixo e a
renderizacao e livre, entao a maioria dos frames cai entre dois passos. O
renderizador interpola com o alpha do loop. Sem isso o movimento treme.

## Regras

### Discretizacao em 8 direcoes

A direcao do joystick e arredondada para o setor mais proximo de 45 graus. Num
controle de toque isso vale a pena: o polegar nunca segura um angulo exato, e
sem a discretizacao o personagem fica corrigindo o rumo sozinho o tempo todo.

O **modulo** do vetor continua analogico e controla a velocidade — direcao
discreta, intensidade continua.

### Zona morta

Abaixo de `JOYSTICK_DEADZONE` nao ha movimento. A zona e **descontada** do
modulo em vez de simplesmente cortada, para que a velocidade comece do zero na
borda dela e nao pule para um valor ja alto.

### Aceleracao e atrito

O atrito e maior que a aceleracao de proposito: responde rapido ao soltar, mas
ainda desliza o suficiente para nao parecer mecanico. Igualar os dois deixa o
controle escorregadio.

### Limite do mundo

Ao ultrapassar `WORLD_RADIUS`, a posicao e projetada de volta na borda e a
componente de velocidade que aponta para fora e zerada. Assim o player desliza
pela borda em vez de travar de vez.

## Numeros

Todos em `src/config/balance.ts`, do Data & Balance Agent. Este sistema le e
nunca escreve.

## Eventos

Nenhum ainda.

## Save

Ainda nao serializa. No M2 a fatia `state.player` passa a ser persistida.

## Verificado

Playwright arrastando o joystick, lendo posicao pelo overlay:

| Caso | Esperado | Medido |
|---|---|---|
| Frente | z negativo | -8.4 |
| Tras | z positivo | +8.5 |
| Direita | x positivo | +6.7 |
| Esquerda | x negativo | -8.7 |
| Diagonal frente-direita | x e z simetricos | +5.4 / -5.4 |
| Arrasto a ~20 graus | discretiza para direita pura, z intacto | x +7.2, z 0.0 |
| Soltar o joystick | velocidade cai a zero | 8.5 -> 0.0 |
| Correr contra a borda | distancia trava no raio | 38.0 |
