# Referencia — movimentacao

**Estado:** analisado parcialmente.

O clipe mostra o jogador andando por uma area de hub. Da para observar
enquadramento e estabilidade; **nao** da para medir velocidade nem resposta ao
toque.

## O que foi observado

**O personagem fica fixo na tela e o mundo corre.** Posicao estavel em 50% da
largura e 52% da altura ao longo dos 11 segundos. Nao ha deslocamento por
look-ahead.

Consequencia direta para nos: **o chao precisa de referencia visual**. Com o
personagem parado no centro, e o cenario que comunica movimento. Grid e marcas
espalhadas nao sao enfeite — sao o que faz andar parecer andar.

Isso foi confirmado na pratica: a primeira versao do nosso mundo tinha o chao
liso demais e o movimento lateral quase nao dava retorno visual.

**O joystick e da metade esquerda** e aparece como circulo translucido grande.

## O que nao pode ser medido daqui

- **Velocidade do personagem.** Falta escala conhecida no cenario.
- **Resposta ao toque.** Nao da para medir latencia por quadros amostrados.
- **Curva de aceleracao.**

Nossos valores atuais vieram de teste no aparelho, nao da referencia.

## O que ainda falta observar

- Um clipe com o dedo visivel, ou uma gravacao com toques na tela, permitiria
  estimar latencia
- Existe corrida separada de caminhada? Dash tem cooldown?
- Como o personagem se comporta em rampa, escada, obstaculo
