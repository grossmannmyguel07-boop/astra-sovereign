# Sistema de save

**Arquivo:** `src/save/save.ts` · **Dono:** Save Agent · **Desde:** M5

Persistencia local em `localStorage`. Guarda o minimo que doi perder num reload.

## Contrato

Chave `astra-sovereign/save`, JSON, versao `1`:

```json
{ "v": 1, "x": -25, "z": 25, "facing": 1.5, "hp": 77, "currency": 42 }
```

| Campo | Origem |
|---|---|
| `x`, `z`, `facing` | `state.player` |
| `hp` | `state.player.hp` |
| `currency` | `state.currency` |

## O que fica de fora, e por que

- **Altura do player.** Recalculada de `terrain.heightAt` ao carregar. Salvar
  daria dois donos ao mesmo numero, e o terreno mudar entre versoes deixaria o
  jogador enterrado.
- **Velocidade, cooldowns, posicao anterior.** Transitorios de um tick. Zerados
  ao carregar, que e o estado correto de quem acabou de chegar.
- **Os mobs.** Renascem em 6s a partir de uma semente fixa. Serializar 40
  registros para lembrar que um esta caido por mais quatro segundos e custo sem
  troca: recarregar e esperar seis segundos sao a mesma coisa para quem joga.
  Quando existir mob que se move, ou boss com fase, a versao sobe.

## Quando grava

Autosave a cada **5 segundos**, mais um flush em `visibilitychange` (escondeu) e
`pagehide` (recarregou ou fechou). Nada por frame e nada por evento de combate.

O flush ao esconder e o que realmente segura o progresso: no iOS a aba morre sem
avisar, e o periodico sozinho perderia sempre os ultimos segundos.

**Nao grava com o jogador morto.** A morte dura 2s e o autosave cai no meio dela
de vez em quando; guardar vida zero produziria um save que carrega alguem vivo
sem vida nenhuma. O save anterior, de no maximo 5s antes, continua valendo.

## Validacao

Qualquer campo invalido **descarta o save inteiro** e remove a chave. Nao ha
recuperacao parcial: um arquivo em que a posicao nao faz sentido nao merece
confianca no saldo de moeda.

- JSON ilegivel, nao-objeto, ou `v` diferente de 1 → descarta.
- `x`, `z`, `facing`, `hp`, `currency` nao finitos → descarta.
- Posicao alem do alcance do mundo (com folga de 1.5x) → descarta.
- `hp` e `currency` sao **presos na faixa**, nao recusados: sao os dois campos
  que o balanceamento pode mudar entre versoes, e um teto que baixou nao e save
  corrompido, e save antigo de um jogo que mudou.

Save de versao desconhecida e descartado, nao adivinhado. Enquanto nao houver um
segundo formato de verdade, migrar seria codigo para um caso que nunca ocorreu.

### A validacao de posicao ja foi apertada demais

A primeira versao perguntava se o ponto caia **dentro de alguma regiao**. O QA
pegou o estrago: quem salva andando por um **corredor** nao esta dentro de
regiao nenhuma, entao o save legitimo era recusado e apagado sem aviso.

Hoje a checagem e grosseira de proposito. Decidir se um ponto e caminhavel e do
limite do mundo, no `WorldSystem`, a cada tick. Aqui a pergunta e so se o numero
veio deste jogo. **Recusar progresso real e muito pior que aceitar uma
coordenada estranha**, que o proximo tick corrige sozinho.

## Onde entra

`src/main.ts`, depois do nascimento do player e antes de tudo que le a posicao.
Sem save, nada sobrescreve os valores de nascimento — o caminho do jogador novo
e o caminho normal, nao um caso especial.

O ponto de respawn do combate continua sendo o **nascimento**, nao a posicao
carregada: morrer devolve para a Inicial.
