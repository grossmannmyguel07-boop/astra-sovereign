# Personagens

## O jogador

`[DEFINIDO]` **Aparencia:** humanoide 3D low-poly, ~1.9 unidades de altura,
origem entre os pes. Ver `decisions/0008` e `decisions/0009`.

`[DEFINIDO]` **Cor exclusiva.** Nenhum inimigo, aliado ou elemento de cenario
usa a faixa de cor do jogador. Em combate com dezenas de entidades, "onde eu
estou" precisa ser respondido em menos de um piscar. Ver
`design/art-direction.md`.

`[DEFINIDO]` **Fica no centro da tela.** O mundo se move; ele nao. Ocupa ~12% da
altura da tela — nessa escala nao existe rosto nem detalhe de roupa, so
silhueta, cor e movimento.

`[PENDENTE]` **Quem e?** Depende da premissa em `universo.md`.

`[PENDENTE]` **Tem nome, ou e o jogador?** Personagem com nome proprio permite
narrativa; avatar anonimo permite projecao. Escolha de tom, nao tecnica.

`[PENDENTE]` **A aparencia muda com a progressao?** Equipamento visivel e um
motivador forte no genero, e custa arte. Decidir antes do M6.

## Units

`[DEFINIDO]` **Acompanham o jogador e atacam sozinhas.** Sao o destino principal
do gacha e a razao de continuar invocando.

`[DEFINIDO]` **Cor fria**, oposta a dos inimigos. Ler amigo ou inimigo pela cor,
antes de qualquer forma, e o que sustenta combate com muita entidade.

`[PENDENTE]` **O que sao?** A resposta muda completamente o peso do gacha. Ver
as tres premissas em `universo.md` — na opcao C, cada Unit e alguem que
existiu, e invocar deixa de ser sortear item.

`[PENDENTE]` **Quantas acompanham ao mesmo tempo?** Afeta orcamento de draw
calls e leitura da tela. Ver `design/units.md`.

`[PENDENTE]` **Sao personagens ou criaturas?** Define se cabem no rig humanoid
ou se exigem um rig novo — o que, pela `decisions/0008`, so acontece quando
houver um caso concreto.

## NPCs

`[PENDENTE]` **Existem?** O MVP pode nao ter nenhum. NPC exige dialogo, e
dialogo exige interface de texto que o roadmap nao prevê ate o M12.

`[PROPOSTA]` Substituir NPC por **estacoes**: pontos no mundo com funcao clara e
um rotulo de uma linha. Sem dialogo, sem interface nova, mesma funcao de
orientar o jogador. E o que a referencia faz — ver
`references/world/README.md`.

## Bosses

`[DEFINIDO]` **Unico em cena, com tratamento visual proprio:** quente saturado,
emissivo forte.

`[PENDENTE]` **Um por mundo?** Padrao do genero, mas nao obrigatorio.

`[PENDENTE]` **Cabem no rig humanoid** ou exigem outro? Se o boss do Mundo 1 for
humanoide, o M10 nao precisa de rig novo.

## Ficha por personagem, quando forem definidos

```
Nome
Papel               jogador, unit, mob, boss, estacao
Faccao
Aparencia           silhueta e cor, dentro da paleta
Rig                 humanoid, ou justificar outro
Comportamento       o que faz em cena
Onde aparece        mundos
Relacao com o jogador
```
