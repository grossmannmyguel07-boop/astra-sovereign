# Mundo 1

**Milestone:** M2 (estrutura) · **Estado:** proposta aguardando aprovacao

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

`[PROPOSTA]` Seis regioes numa espinha dobrada, com o portal ao centro do
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
  -25 │           ┊                          │           │
      │           v                          │           │
  -45 │       ╭────────╮ <────────────────────╯          │
      │       │ PORTAL │  elevado +6                     │
      │       ╰────┬───╯                                 │
  -60 │   ╭────────┴────────╮                            │
      │   │      ARENA      │                            │
  -85 └───╰─────────────────╯────────────────────────────┘
      -105      -45     0        +40         +100      x
```

| Regiao | Centro | Extensao | Travessia |
|---|---|---|---|
| Inicial | (-85, 55) | ~34 | 4s |
| Campos | (-25, 25) | ~85 x 55 | 10s |
| Ruinas | (35, 50) | ~50 x 45 | 6s |
| Floresta | (70, -15) | ~55 | 6s |
| Portal | (15, -45) | ~30, elevado +6 | 4s |
| Arena | (-45, -60) | ~46 | 5s |

Percurso completo ~330 unidades, ~39 segundos correndo direto. Pequeno o
suficiente para nao cansar, grande o suficiente para se perder de proposito.

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

**Ensina (M2):** que a camera gira. A saida fica **fora do campo de visao
inicial** — o jogador precisa arrastar na metade direita para encontra-la. E o
tutorial da mecanica mais nao-obvia do jogo, sem uma linha de texto.

**Visual:** o unico chao com padrao emissivo proprio, concentrico, marcando o
ponto de origem. Menor densidade de nevoa do mundo.

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

### 5 — Portal

**Sensacao:** chegada. O ponto mais alto e mais luminoso do mundo.

**Forma:** plataforma elevada +6, alcancada por rampa. Vista de longe desde
Campos.

**Ensina:** que o objetivo era visivel desde o inicio.

**Visual:** o unico elemento verdadeiramente brilhante do mundo. Tudo o mais e
escuro para que isto funcione.

`[PENDENTE]` **Requisito para atravessar.** A proposta abaixo assume que o
portal esta inerte ate a Arena ser resolvida — ver pendencias.

### 6 — Arena

**Sensacao:** confronto. Nada para explorar, tudo para ver.

**Forma:** espaco plano, fechado, entrada unica. **Aqui uma arena esta certa** —
porque e um espaco de combate, nao o mundo inteiro.

**Ensina (M2):** nada. E um espaco preparado para o M10.

**Visual:** o mais escuro e o mais vazio, com um unico acento forte. Legibilidade
absoluta: com um boss em cena, nada pode competir por atencao.

---

## Como diferenciar regioes com apenas duas luzes

`[PROPOSTA]` A regra de duas luzes por cena permanece. O que muda por regiao sao
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

`[PROPOSTA]` **Relevo suave, nunca penhasco.** Altura maxima ~4 unidades. Tudo
caminhavel; nada de pulo, nada de queda.

**Uma funcao de altura, dois consumidores.** A mesma funcao analitica gera os
vertices do terreno e responde a consulta de altura da colisao. Isso elimina por
construcao o bug classico de o visual e a colisao discordarem.

**Dois tipos de colisao:**

| Tipo | Como |
|---|---|
| Chao | Consulta de altura; o player acompanha o terreno |
| Bloqueador | Lista de circulos e caixas; resolucao por empurrao |

`[PROPOSTA]` **Interface tecnica.** O sistema de mundo expoe uma consulta
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

`[PROPOSTA]` Alcance ampliado de 26–78 para **30–110**.

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

**Draw calls.** `[PROPOSTA]` Um `InstancedMesh` por tipo de prop **por regiao**,
nao global. Assim o descarte por frustum elimina regioes inteiras de uma vez.
Com nevoa em 110 e regioes separadas por ~65, duas ou tres regioes ficam
visiveis por vez.

Estimativa: 15 a 22 draw calls. Hoje sao 8. `[PENDENTE]` medir.

### Risco 1 — relevo escondendo o player

Com a camera a 15 graus, ela fica ~5.9 unidades acima do ponto observado e ~17
atras. Uma elevacao de 4 unidades no meio do caminho **bloqueia a visao do
player**.

Mitigacao proposta: elevacoes ficam nas fronteiras, longe do caminho
caminhavel, e as passagens entre regioes sao baixas. Se o teste no aparelho
mostrar que ainda atrapalha, a saida conhecida e desvanecer objetos entre camera
e player.

### Risco 2 — Floresta e oclusao

Elementos verticais densos sao o proposito da regiao e tambem o maior risco de
esconder o player. Mitigacao: troncos finos e espacados — uma oclusao breve
passando por tras de um tronco e aceitavel e ate da vida.

### Risco 3 — escopo

Terreno com relevo, colisao de bloqueadores, seis regioes com identidade e
interpolacao de iluminacao e o maior milestone ate agora. `[PENDENTE]` se
precisar cortar, a ordem de corte proposta e: relevo primeiro (mundo plano com
regioes ainda funciona), depois o numero de regioes.

---

## Pendencias

`[PENDENTE]` **O portal precisa da Arena resolvida?** A ordem que voce descreveu
coloca a Arena depois do Portal. Duas leituras: o portal esta inerte ate o boss
cair, ou o boss fica alem do portal. A primeira e mais coerente com o portal
sendo o objetivo visivel do mundo inteiro.

`[PENDENTE]` **Nomes.** Descritivos ate a ficcao existir, por `0010`.

`[PENDENTE]` **Mobs por regiao** — M3, depois do benchmark.

`[PENDENTE]` **Drops e objetivo do mundo** — M4 e M11.

`[PENDENTE]` **Musica e som** — pos-MVP.

---

## O que existe hoje em codigo

Do M1, como base temporaria: chao plano de 324 unidades, grid de 3 unidades, 120
marcas em `InstancedMesh`, circulo de limite, nevoa 26–78, duas luzes. Total: 8
draw calls.

`src/render/world/ground.ts` sera substituido pela estrutura acima.
