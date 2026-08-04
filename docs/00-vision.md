# Visao

## O que e

Astra Sovereign e um RPG/simulator web de exploracao e progressao, jogado no
navegador do celular. O jogador explora mundos abertos, derrota inimigos em
combate automatico, evolui atributos, invoca Units atraves de um Gacha,
cumpre quests, enfrenta bosses e desbloqueia novos mundos por portais.

## A sensacao que buscamos

Progressao constante e visivel. O jogador nunca deve passar muito tempo sem
ver um numero subir, um drop cair, uma unit nova aparecer ou um mundo novo
abrir. O loop e curto e recompensador:

> explorar -> lutar (automatico) -> ganhar XP e moeda -> gastar no Gacha ->
> ficar mais forte -> alcancar o proximo mundo -> repetir com numeros maiores

## Referencia

Anime Astral (Roblox) e a referencia de **experiencia**: ritmo de progressao,
estrutura de mundos, HUD do genero, auto attack, units acompanhando o jogador.

Nao copiamos personagens, nomes, artes, mapas, interface nem qualquer conteudo
protegido. Depois do MVP, o jogo ganha identidade propria — ver `03-roadmap.md`.

## Escopo da primeira versao

O MVP e considerado pronto quando estes doze itens existem e funcionam juntos:

- Player controlavel por joystick virtual
- Mundo 1 explorável com colisao
- Mobs com spawn e respawn
- Auto attack com dano, morte e feedback visual
- XP, level e stats
- HUD (vida, XP, level, moeda)
- Units acompanhando e atacando
- Gacha com raridades
- Quests com objetivo e recompensa
- Boss com fases
- Portal para o Mundo 2
- Save local persistente

## Fora de escopo (nesta fase)

Multiplayer, servidor, banco de dados, login, analytics, telemetria, Docker.
O jogo roda inteiro no navegador e salva no proprio aparelho.

## Plataforma

Safari no iPhone, em retrato. Desktop e um efeito colateral bem-vindo do
desenvolvimento, nao um alvo.
