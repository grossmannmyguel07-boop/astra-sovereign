# Direcao de arte

Padroes visuais do Astra Sovereign. Vale para todo o desenvolvimento, nao so
para o MVP.

Este documento nao descreve um gosto — descreve restricoes derivadas do
aparelho alvo, do enquadramento medido e de quem produz o conteudo. Quando uma
regra aqui parecer arbitraria, ela tem um numero por tras.

## As tres restricoes que definem tudo

**1. O personagem ocupa 12.4% da altura da tela.** Num iPhone em paisagem sao
~48px logicos. Nessa escala nao existe rosto, textura de roupa nem expressao.
Existe **silhueta, cor e movimento**. Toda decisao visual sobre personagens
passa por esse filtro: se so aparece a 200px, nao vale o custo.

**2. O Safari no iOS derruba a aba quando a memoria aperta.** Textura e o maior
consumidor de memoria em jogo web. Por isso a fase 1 nao tem nenhum arquivo de
imagem — ver `decisions/0009`.

**3. Quem implementa escreve codigo e nao desenha.** Geometria, shader, textura
gerada em canvas, animacao procedural: sim. Sprite, pintura, escultura: nao.
O estilo precisa ser alcancavel por codigo, ou nao acontece.

---

## Estilo artistico

**Low-poly cosmico com cor chapada e luz emissiva.**

Formas simples e legiveis, sem detalhe de superficie. O que carrega a imagem e
a **silhueta** contra um fundo escuro, e o **brilho** nas bordas do que importa.

Referencia de sensacao, nao de aparencia: a leitura instantanea de um jogo de
plataforma estilizado, aplicada a um ceu noturno.

### Regra do detalhe

Nenhum detalhe menor que ~4px na tela. Se um elemento nao sobrevive a essa
prova, ele vira cor ou some. Isso inclui costura de roupa, textura de pedra,
padrao de tijolo, texto em placa.

### Por que isso e escolha e nao limitacao

O nome do jogo e cosmico. Um mundo escuro com atores luminosos e uma direcao
coerente com o tema, nao um disfarce para falta de arte. Um jogo que tenta
parecer realista com meios pobres parece pobre; um que assume o proprio meio
parece deliberado.

---

## Cores predominantes

Paleta fechada. Cor nova exige justificativa e entra aqui antes de entrar no
codigo.

### Mundo — faixa escura e estreita

| Papel | Hex | Uso |
|---|---|---|
| Vazio / ceu | `#05060f` | Fundo, cor da nevoa |
| Chao | `#141a33` | Terreno base |
| Grid maior | `#5f74c8` | Linhas de referencia principais |
| Grid menor | `#33407a` | Linhas secundarias |
| Marcas de chao | `#2f3d7d` | Decalques, referencia de movimento |
| Estrutura | `#2a3060` | Props, paredes, formacoes |

**O mundo inteiro vive num intervalo de valor estreito e baixo.** Isso e o
mecanismo central da legibilidade: com o cenario contido, qualquer coisa clara
ou saturada salta sem precisar de contorno.

### Atores — o que se move e mais claro que o mundo

| Papel | Hex | Uso |
|---|---|---|
| Player | `#4a63d8` corpo, `#bcd0ff` frente | Exclusivo do jogador |
| Aliado / unit | faixa ciano-azul | Nunca a cor do player |
| Inimigo comum | faixa quente (ambar/vermelho) | Oposto do player no circulo cromatico |
| Boss | quente saturado + emissivo forte | Unico em cena |
| Neutro / NPC | cinza-azulado dessaturado | Nao compete por atencao |

**Regra inviolavel: a cor do player e exclusiva.** Nenhum inimigo, aliado ou
elemento de cenario usa a faixa do player. Em combate com dezenas de entidades,
"onde eu estou" precisa ser respondido em menos de um piscar.

**Inimigo e quente, aliado e frio.** Ler amigo ou inimigo pela cor, antes de
qualquer forma, e o que sustenta combate automatico com muita entidade.

### Interface

| Papel | Hex |
|---|---|
| Texto principal | `#e8ecff` |
| Texto secundario | `#5a6488` |
| Destaque / acao | `#8fa4ff` |
| Fundo de painel | `#060916` |
| Borda de painel | `#2b3560` |
| Erro / perigo | `#ff7b8a` |
| Aviso | `#ffca6b` |

---

## Iluminacao

**Duas luzes. Sempre.** Cada luz adicional recompila shaders e custa por pixel
no aparelho.

| Luz | Papel |
|---|---|
| Hemisferica | Ambiente. Ceu frio por cima, reflexo escuro por baixo |
| Direcional | Define a forma. Uma unica direcao, consistente em todos os mundos |

**Sem sombras projetadas.** Shadow map e caro no iPhone e rende pouco num mundo
de cor chapada. O contato com o chao e resolvido por um decalque escuro sob cada
personagem — mais barato e mais legivel.

**Sem PBR.** `MeshLambertMaterial`, nunca `MeshStandardMaterial`. Iluminacao por
pixel com metalness e roughness nao se paga numa estetica de cor chapada.

**Brilho vem de `emissive`, nao de luz.** O que precisa brilhar — portal, boss,
efeito de dano — usa material emissivo. Nao acende luz.

### Cada mundo tem uma temperatura

A iluminacao e a assinatura de um mundo. Mundo 1 e frio e azul; um mundo
seguinte muda a hemisferica e a direcional, e a mesma geometria le como outro
lugar. Isso e o jeito mais barato de fazer mundos parecerem diferentes.

---

## Atmosfera

**A nevoa e ferramenta de composicao, nao efeito de clima.**

Ela faz tres trabalhos ao mesmo tempo:

1. **Esconde a borda do mundo.** O plano do chao termina em algum lugar; a
   nevoa fecha antes disso e o jogador nunca ve o fim.
2. **Cria profundidade sem geometria.** Objetos distantes desbotam para a cor do
   fundo — a nocao de distancia sai de graca.
3. **Limita o alcance de desenho.** O que a nevoa cobre pode ser simplificado ou
   nem existir.

Configuracao atual do Mundo 1: inicio em 26, fim em 78, cor igual ao fundo. A
regra e que **a cor da nevoa e sempre a cor do fundo** — qualquer diferenca
aparece como uma faixa horizontal falsa.

**O horizonte fica visivel.** Foi calibrado para ~20% do topo da tela. Ceu
ocupando a faixa superior e o que separa "mundo" de "mapa visto de cima".

---

## Camera

Definida pelas decisoes `0006` e pelo ajuste medido em `references/analise-video-01.md`.

| Parametro | Valor | Motivo |
|---|---|---|
| Tipo | Orbital em terceira pessoa | Exploracao do genero |
| Yaw | Livre, arrasto na metade direita | Inspecionar o mundo |
| Pitch padrao | ~15 graus | Horizonte a ~20% do topo |
| Pitch minimo / maximo | 6 / 66 graus | Nem dentro do chao, nem mapa |
| Distancia | Fixa | Zoom fica para depois do MVP |
| Look-ahead | Curto (0.10s) | Personagem estavel no centro |

**A posicao do horizonte depende de duas variaveis**, nao so do angulo:

```
horizonte = 0.5 - tan(pitch) / (2 * tan(fov_vertical / 2))
```

Mexer no FOV sem recalcular o pitch quebra o enquadramento. Estao amarrados.

**Em aberto para o M3:** o FOV horizontal atual e 75 graus; a referencia do
genero usa ~113. Ela mostra bem mais mundo. Alargar so pode ser julgado com
mundo de verdade na tela.

---

## Movimentacao e sensacao de gameplay

O que o jogo precisa transmitir pelo controle, nao pela imagem:

**Resposta imediata.** O corpo comeca a andar no quadro seguinte ao toque.
Velocidade maxima em ~4 quadros, parada em ~6. Rampa existe apenas para o vetor
girar em vez de saltar.

**Direcao exata.** Movimento analogico em 360 graus, sem discretizacao. A
diferenca entre o que o dedo faz e o que aparece na tela e a definicao de
imprecisao.

**O mundo se move, nao o personagem.** O personagem fica praticamente fixo no
centro; e o cenario que corre. Por isso o chao precisa de referencia visual —
grid e marcas espalhadas — senao andar nao produz sensacao de andar.

**Progressao continua.** Alguma coisa precisa subir na tela a cada poucos
segundos. Essa e a sensacao central do genero, medida na referencia em ~6 itens
por segundo. Ver `references/analise-video-01.md`.

---

## Animacoes

**Silhueta e peso acima de fidelidade.** A 48px, o que le e a mudanca de
contorno e o ritmo. Um ciclo de caminhada com boa alternancia vence uma
animacao anatomicamente correta.

**Movimento nunca e linear.** Aceleracao e desaceleracao em tudo. Interpolacao
linear parece maquina.

**Toda acao tem antecipacao e resolucao.** Um ataque que so aparece no impacto
nao le. Precisa de um recuo antes e um retorno depois, ainda que de 3 quadros.

**Impacto e o quadro mais importante do combate.** Ao acertar: flash na cor do
atacante, deslocamento curto do alvo, numero de dano subindo. Sem isso o
combate automatico vira numeros mudando sozinhos.

**Animacao procedural e legitima e preferida quando serve.** Balanco ao andar,
inclinacao na curva, esmagamento no impacto, flutuacao de item no chao —
tudo isso e codigo, custa quase nada e nao depende de arquivo.

Clipes padronizados pela decisao `0008`: `idle`, `walk`, `run`, `attack`,
`hit`, `die`.

---

## Efeitos visuais

**Todo evento de jogo precisa de um sinal visivel.** Dano, morte, drop, level,
invocacao. Um evento sem feedback e um evento que o jogador nao percebe que
aconteceu.

**Pooling obrigatorio** para qualquer coisa criada por frame. O coletor de lixo
do iOS produz engasgos visiveis.

**Efeito e emissivo e curto.** Nada de partícula que fica na tela. A regra e:
se dura mais de 1 segundo, provavelmente esta atrapalhando a leitura.

**Numeros de dano sao parte da direcao de arte, nao da UI.** Sobem, desbotam,
e usam a cor de quem causou o dano — o jogador distingue o proprio dano do dano
das units sem ler nada.

---

## HUD

Regras derivadas da analise da referencia (`references/analise-video-01.md`), incluindo
o que ela faz de errado.

**O centro da tela e sagrado.** Toda densidade vai para as bordas. A referencia
tem mais de 30 elementos simultaneos e ainda assim mantem o meio livre.

**Divisao por polegar:**

```
+--------------------------------------------------------------+
| moedas                                        objetivo (X/Y)  |
|                                                               |
|                      [ CENTRO LIMPO ]                         |
|                                                               |
| joystick                                       [ acao ]       |
| navegacao                     vida | XP | nivel               |
+--------------------------------------------------------------+
```

Esquerda move e navega. Direita age e acompanha progresso. Nada importante no
meio, onde nenhum polegar alcanca.

**Todo numero tem icone e unidade.** Nunca um numero solto.

**Alvo de toque minimo 44x44px.** Dedo nao e cursor.

**HUD e DOM e CSS, nunca desenhada no canvas.** Texto em canvas no iPhone e caro
e borrado; CSS resolve safe-area e escala de graca.

**Em paisagem o notch fica na lateral.** `--safe-left` e `--safe-right` sao as
margens que importam, nao `--safe-top`.

**Densidade cresce por milestone.** Nao nascer com 30 elementos. A referencia
chegou la em anos.

### O que a referencia faz de errado e nao copiamos

- Texto sobreposto e rotulos cortados
- Popup de evento parado no centro superior sem ser respondido
- Informacao duplicada em dois lugares
- Rotulos minusculos em elementos importantes

---

## Organizacao visual dos mundos

**Cada mundo tem uma identidade em tres eixos:** temperatura de luz, paleta de
estrutura e densidade de nevoa. A geometria pode se repetir; esses tres mudam.

**Cada mundo tem um marco visivel de longe.** Uma silhueta que oriente sem
mapa. E o que transforma andar em explorar.

**Legibilidade acima de riqueza.** Um mundo bonito onde o jogador nao acha o
inimigo e um mundo ruim. Densidade de cenario nunca compete com atores.

**O portal e o elemento mais brilhante do mundo.** E o destino, e precisa ser
lido de qualquer ponto.

**Escala:** humanoide ~1.9 unidades. Tudo se dimensiona a partir disso — 1
unidade e 1 metro, sempre.

---

## Pipeline de producao

```
Concept / referencia
        |
        v
Modelo 3D low-poly
        |
        v
Rig Humanoid  (contrato da decisao 0008)
        |
        v
Animacoes reutilizaveis  (servem a todos os humanoides)
        |
        v
Importacao: uma linha em src/data/
        |
        v
Gameplay desacoplado da renderizacao
```

**Fase atual: personagens montados por codigo**, obedecendo ao mesmo contrato de
juntas. Modelos em arquivo entram a partir do M5, sem tocar em logica.

**O ponto de desacoplamento e absoluto.** Gameplay, combate, colisao, IA e
progressao nunca referenciam modelo, clipe ou textura. Gameplay emite eventos
semanticos; a renderizacao decide o que mostrar.

---

## Orcamento tecnico

Numeros a respeitar, verificaveis no overlay de debug.

| Item | Limite | Situacao |
|---|---|---|
| Draw calls | a definir por medicao no M3 | 8 hoje |
| Luzes por cena | 2 | 2 |
| Material | `MeshLambert`, nunca `Standard` | ok |
| Sombras projetadas | nenhuma | ok |
| Arquivos de textura | zero na fase 1 | ok |
| `devicePixelRatio` | teto em 2 | ok |
| Alocacao por frame | nenhuma; pooling obrigatorio | ok |
| Props repetidos | sempre `InstancedMesh` | ok |

**O limite de draw calls fica em aberto de proposito.** Sera medido no inicio do
M3 com uma cena de estresse no aparelho, e nao estimado. Ver a pendencia na
decisao `0008`.

---

## Como esta direcao muda

Alterar qualquer regra deste documento e decisao estrutural: proposta,
vantagem, desvantagem, aprovacao, e um registro em `docs/decisions/`.

Referencia nova sempre vira analise escrita antes de virar codigo. O fluxo esta
em `references/README.md`.
