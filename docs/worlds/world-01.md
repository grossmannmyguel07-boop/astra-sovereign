# Mundo 1

**Milestone:** M2 (estrutura) · **Estado:** implementado e verificado

Primeiro mundo do jogo. Ensina a jogar sem tutorial e estabelece o vocabulario
visual de todos os outros.

## Principio de projeto

`[DEFINIDO]` Pela decisao `0010`, o mundo **nao** e projetado a partir de uma
ficcao. Cada regiao existe por tres razoes concretas, nesta ordem:

1. **Que sensacao produz**
2. **Que mecanica ensina**
3. **Que ritmo cria** entre a regiao anterior e a seguinte

Tema visual serve a essas tres. Nomes sao descritivos ate a ficcao existir.

`[DEFINIDO]` **Nao e circular e nao e arena.** O limite circular do M1 foi
escolhido por ser trivial de implementar. Um mundo precisa parecer um lugar, e
lugar nao tem raio.

---

## Estrutura

`[DEFINIDO]` Seis regioes numa espinha dobrada, com o portal ao centro do
retorno. Extensao total ~205 x 160 unidades.

```
    z
  +75 ┌──────────────────────────────────────────────────┐
      │                                                  │
      │   ╭─────────╮                                    │
  +50 │   │ INICIAL │           ╭──────────╮             │
      │   ╰────┬────╯           │  RUINAS  │             │
      │        │                ╰─────┬────╯             │
  +25 │   ╭────┴──────────────────────╯                  │
      │   │           CAMPOS                             │
    0 │   │                            ╭───────────╮     │
      │   ╰───────┬─────────╯          │  FLORESTA │     │
      │           ┊ visada             ╰─────┬─────╯     │
  -30 │           ┊                          │           │
      │           v                          v           │
  -55 │  ╭─────────╮                 ╭─────────────╮     │
      │  │ PORTAL  │<────────────────│    ARENA    │     │
      │  │ elevado │    so depois    ╰─────────────╯     │
  -75 │  ╰─────────╯    do boss                          │
      └──────────────────────────────────────────────────┘
      -105      -45     0        +40         +100      x
```

| Regiao | Centro | Extensao | Travessia |
|---|---|---|---|
| Inicial | (-85, 55) | ~34 | 4s |
| Campos | (-25, 25) | ~85 x 55 | 10s |
| Ruinas | (35, 50) | ~50 x 45 | 6s |
| Floresta | (70, -15) | ~55 | 6s |
| Arena | (25, -55) | ~46 | 5s |
| Portal | (-40, -58) | ~30, elevado +6 | 4s |

**A Arena fica fora da visada.** O jogador ve o portal de Campos, mas nao ve o
que o separa dele. O obstaculo se revela; o objetivo nao.

Percurso completo ~330 unidades, ~39 segundos correndo direto. Pequeno o
suficiente para nao cansar, grande o suficiente para se perder de proposito.

**Ordem de percurso:** Inicial, Campos, Ruinas, Floresta, Arena, Portal.

### Por que dobrada e nao linear

Uma corrente reta e um corredor. A dobra faz o **portal ficar visivel de
Campos** — o jogador ve o destino do mundo inteiro nos primeiros vinte
segundos, muito antes de poder usa-lo.

Isso resolve orientacao sem mapa, sem seta e sem texto, e cria a tensao que
sustenta a exploracao: **voce sabe para onde vai; o mundo e o caminho ate la.**

---

## As regioes

### 1 — Inicial

**Sensacao:** recolhimento. Pequena, fechada, sem ameaca.

**Forma:** uma bacia rasa, cercada por elevacoes baixas. Uma unica saida.

**Ensina (M2):** que a camera gira. A saida nasce **fora do campo de visao
inicial** — mas nao depende de o jogador girar por acaso.

`[DEFINIDO]` **Tres pistas ambientais redundantes**, nenhuma com texto ou seta:

1. **Particulas em deriva.** Motes de luz atravessam a bacia, todas na mesma
   direcao, indo em direcao a saida. Movimento atrai o olhar mesmo na periferia
   da visao, e a direcao ja e a resposta.
2. **Feixe de luz vertical** na saida, alto o bastante para ultrapassar a borda
   da bacia. E o destino para onde as particulas correm.
3. **Padrao emissivo assimetrico no chao**, mais denso do lado da saida.

Redundancia proposital: se uma pista nao for lida, as outras duas continuam
funcionando. O cenario ensina; o texto nunca.

**Visual:** o unico chao com padrao emissivo proprio. Menor densidade de nevoa
do mundo.

### 2 — Campos

**Sensacao:** respiro e escala. A maior area, a mais aberta, a de ceu mais
visivel.

**Forma:** planicie ampla com relevo suave. Poucos elementos altos, muito
espacados.

**Ensina (M2):** velocidade e distancia. E aqui que o jogador descobre quao
rapido anda e quao longe enxerga.
**Depois (M3/M4):** primeiros mobs, em espaco aberto, onde errar nao custa.

**Visual:** menor densidade de estrutura, maior fracao de ceu, grid mais
legivel. A visada para o portal sai daqui.

### 3 — Ruinas

**Sensacao:** algo esteve aqui. Geometria quebrada, angulos retos interrompidos.

**Forma:** muros parciais formando corredores incompletos e patios. O primeiro
lugar onde a colisao importa.

**Ensina (M2):** **colisao e contorno.** E a mecanica que o M2 introduz, entao
Ruinas e o tutorial dela.
**Depois:** posicionamento — mobs atras de cobertura, onde parar importa.

**Visual:** maior densidade de estrutura, verticais fortes, nevoa fechada.
Sensacao de espaco comprimido logo depois da amplitude de Campos.

### 4 — Floresta

**Sensacao:** desorientacao controlada. Nao se ve longe, nao se ve o que vem.

**Forma:** elementos verticais densos, caminho sinuoso sem rota unica obvia.

**Ensina (M2):** **a camera como ferramenta de navegacao.** Em Inicial ela era
curiosidade; aqui e necessidade.
**Depois:** emboscada — inimigos que so aparecem perto.

**Visual:** maior oclusao do mundo, nevoa mais curta, chao mais escuro. Acento
emissivo acima da linha do olhar, sugerindo copa.

### 5 — Arena

**Sensacao:** confronto. Nada para explorar, tudo para ver.

**Forma:** espaco plano, fechado, entrada unica. **Aqui uma arena esta certa** —
porque e um espaco de combate, nao o mundo inteiro.

**Ensina (M2):** nada. E um espaco preparado para o M10.

**Visual:** o mais escuro e o mais vazio, com um unico acento forte. Legibilidade
absoluta: com um boss em cena, nada pode competir por atencao.

### 6 — Portal

**Sensacao:** chegada, e antes dela, negacao. Ultimo ponto do percurso.

**Forma:** plataforma elevada +6, alcancada por rampa. Visivel de Campos desde
os primeiros segundos.

`[DEFINIDO]` **Dois estados.**

| Estado | Quando | Aparencia |
|---|---|---|
| **Dormente** | Toda a exploracao | Estrutura visivel, nucleo apagado, pulso lento e frio. Le de longe, mas le como desligado |
| **Desperto** | Depois do boss | Nucleo aceso, o elemento mais brilhante do mundo |

**Por que fechado o tempo todo importa.** Um objetivo disponivel e uma tarefa.
Um objetivo **visivel e negado** e uma pergunta, e pergunta puxa mais que
tarefa. O jogador passa o mundo inteiro sabendo para onde vai e descobrindo o
que falta.

O despertar tambem da ao boss uma consequencia visivel no mundo, em vez de
apenas um numero na tela.

**Visual:** dormente e escuro com um pulso frio; desperto e o unico elemento
verdadeiramente brilhante. Tudo o mais e escuro para que isto funcione.

`[DEFINIDO]` **A Arena vem antes.** O portal so desperta depois do boss cair.
No M2 existe apenas o estado dormente — o desperto chega no M10. A geometria
nasce preparada: despertar e mudanca de material e emissivo, nao geometria
nova.

---

## Como diferenciar regioes com apenas duas luzes

`[DEFINIDO]` A regra de duas luzes por cena permanece. O que muda por regiao sao
**propriedades**, interpoladas conforme o jogador se move. Custo: zero draw
calls, so atualizacao de uniforme.

| Alavanca | Efeito |
|---|---|
| Cor da hemisferica | O eixo mais forte. Muda a temperatura do lugar |
| Distancia da nevoa | Curta comprime, longa abre |
| Cor do chao | Deslocamento dentro da faixa escura |
| Densidade e silhueta de estrutura | Le antes da cor |
| Acento emissivo | Uma cor por regiao, so no que brilha |
| Relevo | Plano e aberto; ondulado e intimo |

A interpolacao acontece por proximidade ao centro de cada regiao, entao a
transicao e continua — nao ha "porta" entre regioes.

---

## Terreno e colisao

`[DEFINIDO]` **Relevo suave, nunca penhasco.** Altura maxima ~4 unidades. Tudo
caminhavel; nada de pulo, nada de queda.

**Uma funcao de altura, dois consumidores.** A mesma funcao analitica gera os
vertices do terreno e responde a consulta de altura da colisao. Isso elimina por
construcao o bug classico de o visual e a colisao discordarem.

**Dois tipos de colisao:**

| Tipo | Como |
|---|---|
| Chao | Consulta de altura; o player acompanha o terreno |
| Bloqueador | Lista de circulos e caixas; resolucao por empurrao |

`[DEFINIDO]` **Interface tecnica.** O sistema de mundo expoe uma consulta
somente-leitura, passada ao movimento pelo integrador — mesmo padrao ja usado
para o yaw da camera:

```ts
interface TerrainQuery {
  heightAt(x: number, z: number): number;
  resolve(x: number, z: number, radius: number): { x: number; z: number };
}
```

Assim o movimento nao importa o sistema de mundo, e a regra de sistemas nao se
importarem continua intacta.

---

## Nevoa e visada

`[DEFINIDO]` Alcance ampliado de 26–78 para **30–110**.

O alcance atual foi calibrado para um mundo plano de teste. Com 110, o portal a
~80 unidades de Campos aparece **desbotado mas visivel** — exatamente o brilho
distante que ancora a orientacao.

**A separacao entre regioes passa a vir de oclusao, nao de nevoa.** Elevacoes
baixas nas fronteiras bloqueiam a visada rasante entre regioes vizinhas, com uma
abertura deliberada de Campos em direcao ao portal.

Isso e melhor design: esconder por nevoa e acidente, esconder por relevo e
intencao.

---

## Orcamento e riscos

**Draw calls.** `[DEFINIDO]` Um `InstancedMesh` por tipo de prop **por regiao**,
nao global. Assim o descarte por frustum elimina regioes inteiras de uma vez.
Com nevoa em 110 e regioes separadas por ~65, duas ou tres regioes ficam
visiveis por vez.

Estimativa: 15 a 22 draw calls. **Medido:** 8 na Arena, 11 na Floresta, 14 no
Portal, 20 em Campos, 22 na Inicial, 26 nas Ruinas. O descarte por regiao
funciona — a variacao de 8 a 26 conforme onde se esta e exatamente ele agindo.
~25 mil triangulos em qualquer ponto.

### Risco 1 — relevo escondendo o player · **aconteceu, resolvido**

Com a camera a 15 graus, ela fica **5.90 acima** dos pes do player e **16.92
atras**. A linha de visao passa a `1.4 + 0.266 * d`, onde `d` e a distancia
atras do player.

O relevo nunca foi o problema — os **muros das Ruinas** foram. Na primeira
versao eles tinham 4.2 de altura, topo entre 2.86 e 4.96: tapavam o player ate
**13.4 unidades atras**, metade da regiao. A verificacao pegou isso na tela,
nao nos numeros; o QA automatico passou limpo.

Resolvido baixando o muro para 2.5 de base, topo maximo 2.37, o que reduz a
oclusao para **3.6 unidades** — perto o bastante para o proprio movimento
resolver. Muro quebrado tambem le melhor como ruina do que bloco inteiro, entao
a correcao de leitura e a correcao de camera sao a mesma.

A saida conhecida caso volte a incomodar continua sendo desvanecer objetos entre
camera e player. Nao foi preciso, e por `regra 5` nao se implementa antes de
precisar.

### Risco 2 — Floresta e oclusao

Elementos verticais densos sao o proposito da regiao e tambem o maior risco de
esconder o player. Mitigacao: troncos finos e espacados — uma oclusao breve
passando por tras de um tronco e aceitavel e ate da vida.

### Risco 3 — escopo

Terreno com relevo, colisao de bloqueadores, seis regioes com identidade e
interpolacao de iluminacao e o maior milestone ate agora. **Nao foi preciso
cortar nada.**

---

## Pendencias

`[PENDENTE]` **Nomes.** Descritivos ate a ficcao existir, por `0010`.

`[PENDENTE]` **Mobs por regiao** — M3, depois do benchmark.

`[PENDENTE]` **Drops e objetivo do mundo** — M4 e M11.

`[PENDENTE]` **Musica e som** — pos-MVP.

---

## O que existe hoje em codigo

| Arquivo | Papel |
|---|---|
| `src/data/world-01.ts` | As seis regioes, os cinco corredores e a semente dos bloqueadores |
| `src/game/systems/world.ts` | Altura do terreno, `openness`, bloqueadores e resolucao de colisao |
| `src/render/world/terrain.ts` | Malha do terreno, deslocada pela **mesma** funcao de altura |
| `src/render/world/props.ts` | Muros, troncos, obeliscos, anel da Arena e marcas de chao |
| `src/render/world/portal.ts` | Portal com os dois estados |
| `src/render/world/motes.ts` | Particulas em deriva da regiao Inicial |
| `src/render/scene.ts` | Interpolacao de iluminacao e nevoa pelos pesos de regiao |

`src/render/world/ground.ts` do M1 foi substituido.

### Onde a orientacao e a altura de um bloqueador moram

No proprio bloqueador (`Blocker.yaw` e `Blocker.scale`), nao no desenho.

A colisao e circular e ignora os dois campos, entao parecem visuais fora de
lugar num arquivo de simulacao. Mas quem **gera** o muro e o unico que sabe em
que eixo ele corre; sortear de novo no render criaria uma segunda verdade sobre
a mesma parede — e foi exatamente o que aconteceu na primeira versao, onde cada
trecho recebia um giro aleatorio e a fileira lia como cubos soltos em vez de
construcao.
