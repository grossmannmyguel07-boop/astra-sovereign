# Referencia — iluminacao

**Estado:** pendente de comparacao direta.

A referencia usa dia claro, ceu azul com nuvens, sombras suaves e cores
saturadas. Nossa direcao e o oposto: mundo escuro, atores luminosos.

Isso e escolha deliberada, registrada em `docs/07-art-direction.md`, e nao
tentativa fracassada de imitar. A referencia de iluminacao serve para entender
**funcao**, nao para copiar aparencia.

## O que precisa ser observado

- Como a iluminacao separa personagem do cenario naquele contraste alto
- Se cada mundo tem tratamento de luz proprio, e o quanto isso os diferencia
- Como efeitos brilhantes se destacam contra um fundo ja claro

## Padroes ja definidos

- Duas luzes por cena: hemisferica e direcional
- Sem sombras projetadas; contato com o chao por decalque
- Sem PBR; `MeshLambertMaterial`
- Brilho vem de `emissive`, nunca de luz nova
- Temperatura de luz e a assinatura de cada mundo
