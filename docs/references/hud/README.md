# Referencia — HUD

**Estado:** analisado.

## Estrutura observada

Mais de 30 elementos simultaneos, e ainda assim legivel. O mecanismo:

**O centro da tela e sagrado.** Toda densidade vai para as bordas.

**Divisao por polegar.** Esquerda: joystick, moedas, navegacao (loja, pets,
teleporte, itens). Direita: acao, stats, progresso, quests. Nada importante no
meio.

| Regiao | Conteudo |
|---|---|
| Esquerda, topo | Duas moedas empilhadas, com icone e rotulo |
| Esquerda, meio | Grade de navegacao com badges de notificacao |
| Esquerda, baixo | Joystick |
| Centro, baixo | Barra de drops recentes com contador |
| Centro, rodape | Rank e nivel, cada um com barra |
| Direita, topo | Lista de objetivos com contador X/Y |
| Direita, meio | Botao de acao destacado |
| Direita, baixo | Painel de stats, colapsavel |

## O que reproduzir

- Centro limpo, densidade nas bordas
- Divisao esquerda-move / direita-age
- **Objetivo sempre visivel na tela**, com contador X/Y. O jogador nunca
  precisa perguntar o que fazer agora
- **Varias trilhas de progresso simultaneas**, desalinhadas de proposito para
  sempre haver uma perto de completar
- Todo numero com icone e unidade; nunca um numero solto
- Numeros grandes com sufixo de ordem de grandeza

## O que NAO copiar

**Conteudo protegido.** Os objetivos da referencia usam nomes de personagens de
animes licenciados. Os itens seguem o mesmo padrao. Nada disso entra, nem
adaptado.

**Arranjo, icones e paleta** sao especificos daquele jogo.

**E os defeitos**, que sao facilmente confundidos com estilo:

- Texto sobreposto e rotulos cortados
- Popup de evento parado no centro superior durante o clipe inteiro, ocupando
  area nobre sem ser respondido
- Informacao duplicada em dois lugares da tela
- Rotulos minusculos em elementos importantes

**Densidade de partida.** A referencia chegou a 30 elementos ao longo de anos.
Comecar assim seria copiar o resultado sem o processo.

## O que ainda falta observar

- Como a HUD se comporta **durante** combate: barra de vida de inimigo, alerta
  de boss, indicador de dano recebido
- Telas cheias: gacha, inventario, quests
- Como o feedback de recompensa aparece (item novo, level up)
