# Combate

**Milestone:** M4 · **Estado:** implementado e jogado

> **Aviso.** Nao temos referencia analisada de combate. O material disponivel
> tem 11 segundos de caminhada por uma area de hub, sem nenhum mob sendo
> atingido. Ver `references/combat/README.md`.
>
> As decisoes de ritmo foram fechadas contra **o jogo rodando**, nao contra a
> referencia. Onde nao havia como julgar sem jogar, o valor entrou como ponto de
> partida declarado e esta anotado como tal.

---

## Definido

`[DEFINIDO]` **Combate automatico.** O jogador escolhe onde estar; a luta
acontece. Pilar 4.

`[DEFINIDO]` **Simulacao em passo fixo.** Nada de dano dependente de framerate.
O iPhone cai para 30fps ao esquentar, e sem passo fixo o DPS mudaria com a
temperatura do aparelho. Ver `decisions/0004`.

`[DEFINIDO]` **Numeros em `src/config/balance.ts`**, conteudo em `src/data/`,
regra em `src/game/systems/`. Nunca misturados.

`[DEFINIDO]` **Pooling obrigatorio** para numeros de dano e projeteis. O coletor
de lixo do iOS produz engasgos visiveis.

`[DEFINIDO]` **Gameplay nunca conhece aparencia.** Combate emite evento
semantico; a renderizacao decide o que tocar. Ver `decisions/0008`.

`[DEFINIDO]` **O tempo para matar e consequencia, nunca regra.**

O combate e inteiramente baseado em atributos. Nenhum sistema conhece, calcula
ou impoe um tempo de abate. Ele **emerge**:

```
golpes = teto(vida do mob / dano do jogador)
tempo  = golpes * intervalo de ataque
```

Se o dano do jogador alcancar a vida do mob, ele morre **em um unico golpe**.
Isso nao e caso especial nem excecao a tratar: e a formula acima com
`golpes = 1`.

**Proibido, agora e sempre:**

- constante de "tempo para matar" em qualquer lugar
- numero minimo de golpes
- limitar o dano para o alvo sobreviver ao primeiro acerto
- dano escalado para o abate durar um tempo alvo

A referencia de tempo serve apenas para escolher os **valores iniciais** de vida
e dano. E ponto de partida de balanceamento, nao comportamento.

Depois do M7 essa referencia passou de ~2 para **~5 segundos**. Dois segundos
era o mob morrendo antes de conseguir responder: quatro golpes do jogador contra
**um** dele.

### O que o codigo precisa respeitar

- **O caminho de abate em um golpe funciona inteiro**: numero de dano, flash,
  morte, drop e respawn. Nada pode assumir que o alvo sobrevive ao primeiro
  acerto — nem uma animacao de dano que precise terminar antes da morte.
- **A simetria vale para o jogador.** Um mob cujo dano alcance a vida dele mata
  em um golpe. Nao ha piso de sobrevivencia.
- O intervalo de ataque continua limitando o ritmo, mas ele e **atributo**, nao
  regra de sistema. Um jogador com intervalo menor mata mais rapido porque
  ataca mais, nao porque o sistema permitiu.

## Estrutura

`[DEFINIDO]` O combate mais simples que entrega o pilar 1. Implementado no M4 em
`src/game/systems/combat.ts` — ver `systems/combat.md`:

```
1. Sistema procura o alvo valido mais proximo dentro do raio
2. Se ha alvo e o cooldown zerou, aplica dano e emite mob:damaged
3. Se a vida chega a zero, emite mob:killed
4. Progressao escuta e concede XP; inventario escuta e concede drop
5. Quests escutam e contam
```

Sem posicionamento tatico, sem mira, sem esquiva. Adicionar depois se o teste
mostrar que falta profundidade — nunca antes.

## Feedback de impacto

`[DEFINIDO]` **O quadro do impacto e o mais importante do combate.** Sem ele, o
combate automatico vira numeros mudando sozinhos.

Ao acertar, tres coisas simultaneas:

1. Flash na cor do atacante, no alvo
2. Deslocamento curto do alvo
3. Numero de dano subindo, **na cor de quem causou**

O terceiro item importa mais do que parece: com units atacando junto, e a cor
que permite o jogador distinguir o proprio dano do dano delas sem ler nada.

A regra vale nos dois sentidos: o mob pisca claro, na faixa do jogador, e o
jogador pisca na cor do mob que bateu.

Isso so passou a funcionar quando os inimigos foram para a faixa quente. Com
mobs azuis escuros, um flash escuro sobre o corpo mais claro da cena nao era um
evento, era um borrao — o M4 chegou a registrar um desvio usando `#ff7b8a` por
esse motivo. Corrigida a cor dos mobs, o desvio saiu e a regra original voltou.

O deslocamento do alvo e **puramente visual**: mob comum e estacionario por
decisao de design, e a posicao simulada dele nao muda. O que recua e a malha,
dentro do proprio grupo, e ela volta sozinha.

## Ritmo — fechado no M4

~~`[PENDENTE]` Quanto tempo para matar um mob comum?~~ **Nao e pergunta de
sistema.** Sai da relacao entre vida, dano e intervalo — ver a regra acima. O
que se calibra sao os atributos, nao o tempo.

~~`[PENDENTE]` Quantos mobs engajados ao mesmo tempo?~~ **Resolvido no M3.** A
`decisions/0011` mediu >= 200 personagens animados a 59fps num iPhone 14. Nao e
restricao de orcamento.

`[DEFINIDO]` **O jogador luta andando.** Nada no combate para o movimento, e o
movimento nao interrompe o golpe. E o pilar 4: a decisao do jogador e **onde
estar**, e tirar o controle dele durante a luta transformaria posicionamento em
espera.

Isso tem uma consequencia medida no M4, e ela e desejada: atravessar uma regiao
correndo **leva dano sem produzir abate**. A 8.5 unidades por segundo o alvo sai
do alcance antes dos golpes necessarios saírem. Parar ao encostar num mob abate
em ~5s e reabre o ciclo. Quem corre paga; quem escolhe onde ficar colhe.

`[DEFINIDO]` **Alcance do auto attack: 5 unidades — e o do mob tambem.** Contra
11 de deteccao. A faixa de 11 a 5 e o **aviso**: o mob levanta a guarda bem antes
de qualquer um poder acertar o outro, e da tempo de decidir se entra ou passa
reto. Verificado no M4: 24 segundos parado dentro da faixa de alerta, sem um
ponto de dano dos dois lados.

**O golpe do mob valia 4 contra os 5 do jogador, e isso era um buraco.** Parado
na folga entre 4 e 5, o jogador matava sem nunca poder ser atingido — medido no
QA depois do M7: sete golpes dados, **zero** recebidos, vida intacta. Nao era
faixa de aviso, era faixa de impunidade.

`[DEFINIDO]` **Quem alcanca pode ser alcancado.** Alcance diferente entre os dois
lados so vale se for a ideia daquele mob, nunca por descuido.

`[DEFINIDO]` **Alvo: o mais proximo, com aderencia de 1.5 unidades.** O alvo
atual so e trocado se outro estiver mais perto por essa margem. Sem aderencia,
dois mobs praticamente equidistantes fazem o alvo alternar a cada tick e o dano
se espalha — o jogador veria dois mobs caindo devagar em vez de um caindo e
depois o outro, que e o oposto do pilar 1.

`[DEFINIDO]` **Nao ha indicador de alvo.** O alvo se anuncia pelo que acontece
com ele: flash, recuo e numero de dano. Um marcador seria um segundo elemento
disputando o centro da tela para dizer o que os tres primeiros ja dizem — e o
pilar 5 manda o centro da tela ficar limpo.

## Sistema — fechado no M4

`[DEFINIDO]` **Nao existe afinidade nem elemento.** Adicionaria custo em dados,
HUD, arte e balanceamento de uma vez, e nao serve a nenhum pilar que ja nao
esteja servido. Fica disponivel como profundidade futura, depois do MVP, se o
teste mostrar que falta — nunca antes. E tambem decisao de lore: ver
`lore/faccoes.md`.

`[DEFINIDO]` **O jogador morre, e a punicao e zero.** Vida a zero, 2 segundos
parado, e ele volta na regiao Inicial com a vida cheia. Nao perde moeda, nem
progresso, nem posicao de quest. Punicao pesada quebra o pilar 1, e o
`gameplay-pillars.md` ja exclui dificuldade punitiva explicitamente.

A Inicial nao tem mobs de proposito, entao renascer nunca cai em cima de quem
matou. O preco da morte e o caminho de volta, e so.

`[DEFINIDO]` **Nao existe critico.** E feedback barato, mas hoje toda variacao
de numero na tela viria do critico — antes de existir progressao, o numero
subindo **e** a leitura de poder. Introduzir ruido aleatorio nele agora
atrapalharia o unico sinal que o M4 tem. Reavaliar quando o M6 trouxer stats.

## Pendencias que continuam abertas

`[PENDENTE]` **Os valores iniciais estao certos?** Vida 120, dano 14, intervalo
0.55 dao 4, 6 e 5 golpes nos tres mobs. Sao **ponto de partida declarado**, nao
medicao: so o desenvolvedor jogando no aparelho decide se o ritmo agrada.

## Orcamento

**Resolvido no M3.** >= 200 personagens animados a 59fps no iPhone 14, contra os
~49 previstos. Ver `decisions/0011` e `docs/06-benchmark.md`.
