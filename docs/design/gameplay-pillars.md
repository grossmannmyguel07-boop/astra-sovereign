# Pilares de gameplay

Cinco pilares. Toda decisao de design responde a eles, e uma feature que nao
serve a nenhum nao entra.

Derivados da analise da referencia (`references/analise-video-01.md`) e das
prioridades do `CLAUDE.md`.

---

## 1. O numero nunca para de subir

`[DEFINIDO]` **O pilar mais importante. Se este falhar, nenhum outro salva.**

Medido na referencia: em 11 segundos apenas andando, **sem combate nenhum**, os
contadores de item subiram ~6 unidades por segundo.

O jogador nao precisa fazer nada para ver progresso. A tela esta sempre se
movendo a favor dele.

**Consequencia pratica:** a partir do M4, alguma coisa precisa entrar no
inventario ou subir na tela a cada poucos segundos. Um periodo de dez segundos
sem nenhum retorno visivel e um bug de design.

## 2. Sempre ha algo perto de completar

`[DEFINIDO]` Varias trilhas de progressao visiveis ao mesmo tempo, **com curvas
desalinhadas de proposito**. Quando uma esta longe, outra esta perto.

Na referencia coexistem nivel, rank, duas moedas, seis objetivos e cinco stats.
O jogador nunca olha para a tela sem ver alguma coisa quase la.

**Consequencia:** o MVP precisa de no minimo duas trilhas — nivel do personagem
e uma segunda. Ver `progression.md`.

> **Estado real: este pilar NAO esta atendido.** O M6 entregou uma trilha
> (nivel por XP) e o Rank ficou deliberadamente fora do MVP — ha apenas dois
> marcos no jogo inteiro para alimenta-lo, e uma trilha que se move duas vezes
> nunca esta perto de completar. Moeda nao conta como segunda: sai de abate
> igual ao XP e anda junto com ele.
>
> E decisao de produto registrada em `progression.md`, nao divida escondida.
> Quests (M11) sao a segunda trilha prevista. **Nao inventar uma trilha so para
> fechar este item.**

## 3. O jogador nunca pergunta o que fazer

`[DEFINIDO]` O objetivo atual fica **permanentemente na tela**, com contador
X/Y. Nao e um menu que se abre — e parte da HUD.

**Consequencia:** o M11 nao inventa a lista de quests; ela nasce ocupando o
espaco que o M7 ja reservou.

## 4. O jogo joga sozinho, e isso e uma feature

`[DEFINIDO]` Combate automatico. O jogador escolhe **onde estar**, nao qual
botao apertar. Isso torna a sessao compativel com atencao parcial — que e como
se joga no celular.

**Consequencia:** a decisao interessante do jogador e posicionamento e
composicao de time, nao execucao. O combate precisa recompensar estar no lugar
certo.

## 5. Legibilidade acima de riqueza

`[DEFINIDO]` Com dezenas de entidades em cena numa tela de celular, o jogador
precisa responder em menos de um piscar: onde estou, o que e inimigo, o que e
aliado, o que e perigoso.

Sustentado por regras duras em `art-direction.md`: cor do jogador exclusiva,
inimigo quente, aliado frio, mundo em faixa escura estreita, centro da tela
limpo.

**Consequencia:** um mundo bonito onde nao se acha o inimigo e um mundo ruim.
Densidade de cenario nunca compete com atores.

---

## O que estes pilares excluem

Explicitar o que **nao** e este jogo evita discussao repetida:

- **Combate de habilidade e execucao.** Contradiz o pilar 4.
- **Exploracao lenta e contemplativa.** Contradiz o pilar 1.
- **Narrativa densa em texto.** Sessao curta, tela pequena, atencao parcial.
- **Dificuldade punitiva.** Morte com perda pesada quebra o pilar 1.
- **Interface densa desde o inicio.** A referencia chegou a 30 elementos em
  anos; comecar assim e copiar o resultado sem o processo.

## Ordem de prioridade do projeto

Do `CLAUDE.md`, repetida aqui porque resolve empates:

```
1. Gameplay
2. Performance
3. Clareza do codigo
4. Facilidade de expansao
```

Nunca o contrario. Se uma escolha melhora clareza e piora gameplay, ela esta
errada.
