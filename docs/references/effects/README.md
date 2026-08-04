# Referencia — efeitos visuais

**Estado:** pendente.

Nenhum efeito de combate aparece no material analisado.

## O que precisa ser observado

- Numeros de dano: tamanho, cor, trajetoria, duracao, empilhamento
- Efeito de acerto no alvo
- Efeito de morte
- Como o drop aparece e viaja ate o inventario
- Efeito de level up e de recompensa
- Aparencia e sinalizacao do portal

## Padroes ja definidos

Ver `docs/design/art-direction.md`:

- Todo evento de jogo precisa de sinal visivel
- Efeito e emissivo e curto; acima de 1 segundo atrapalha a leitura
- Pooling obrigatorio para qualquer coisa criada por frame
- Numeros de dano usam a cor de quem causou o dano
