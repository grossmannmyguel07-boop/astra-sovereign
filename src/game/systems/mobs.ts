import { MOB_PLACEMENTS, MOB_SEED, MOB_TYPES, type MobPlacement } from '@/data/mobs';
import { REGIONS } from '@/data/world-01';
import {
  MOB_DETECT_RADIUS,
  MOB_MIN_SPACING,
  MOB_RELEASE_MARGIN,
  MOB_TURN_LAMBDA,
} from '@/config/balance';
import { dampAngle } from '@/core/math';
import type { GameState } from '@/game/state';
import type { Mob } from '@/game/entities/mob';
import type { TerrainQuery } from '@/game/systems/world';

/**
 * Mobs comuns: nascimento, deteccao e alerta.
 *
 * Dono: **Combat Agent**. Criado pelo Tech Lead como semente da area no M3.
 *
 * **Nunca importa `three`.** Recebe uma consulta de terreno do integrador, do
 * mesmo jeito que o movimento recebe -- sistemas nao se importam.
 *
 * ## Mob comum nao e um agente
 *
 * Ele e conteudo com um temporizador. Sem perseguicao, o custo por tick colapsa
 * para uma distancia ao quadrado e uma interpolacao de angulo. Com 40 mobs a
 * 60Hz sao 2.400 comparacoes por segundo -- e por isso **nao ha particao
 * espacial aqui**, nem grade, nem quadtree. Pela regra 5, quando um alvo movel
 * a mais existir, ai se mede se precisa.
 *
 * A consulta de terreno e usada **so no nascimento**. Depois disso nenhum mob
 * volta a tocar no mundo.
 */

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Comparar quadrados evita uma raiz por mob por tick. */
const DETECT_SQ = MOB_DETECT_RADIUS * MOB_DETECT_RADIUS;
const RELEASE_SQ =
  (MOB_DETECT_RADIUS + MOB_RELEASE_MARGIN) * (MOB_DETECT_RADIUS + MOB_RELEASE_MARGIN);
const SPACING_SQ = MOB_MIN_SPACING * MOB_MIN_SPACING;

export class MobSystem {
  /**
   * Gera os mobs a partir das regras de cada regiao.
   *
   * Tenta varias posicoes por mob e desiste depois de um limite. Desistir e
   * correto: forcar o ultimo mob a caber empurraria ele para dentro de um muro
   * ou para cima da fronteira, e um mob a menos ninguem nota.
   */
  spawn(state: GameState, terrain: TerrainQuery): void {
    const random = mulberry32(MOB_SEED);
    const mobs: Mob[] = [];
    let id = 0;

    for (const placement of MOB_PLACEMENTS) {
      const region = REGIONS.find((r) => r.id === placement.region);
      if (!region) continue;

      for (let i = 0; i < placement.count; i++) {
        const spot = this.findSpot(placement, region, mobs, terrain, random);
        if (!spot) continue;

        mobs.push({
          id: id++,
          type: placement.type,
          x: spot.x,
          y: terrain.heightAt(spot.x, spot.z),
          z: spot.z,
          // Nasce olhando para fora do centro da regiao: um circulo de mobs
          // todos encarando o meio pareceria um ritual, nao um mundo.
          facing: spot.away,
          prevFacing: spot.away,
          restFacing: spot.away,
          state: 'idle',
          hp: MOB_TYPES[placement.type].hp,
          maxHp: MOB_TYPES[placement.type].hp,
          attackCooldown: 0,
          dead: false,
          respawnTimer: 0,
          animationOffset: random() * 4,
        });
      }
    }

    state.mobs = mobs;
  }

  private findSpot(
    placement: MobPlacement,
    region: (typeof REGIONS)[number],
    placed: readonly Mob[],
    terrain: TerrainQuery,
    random: () => number
  ): { x: number; z: number; away: number } | null {
    for (let attempt = 0; attempt < 24; attempt++) {
      const angle = random() * Math.PI * 2;
      const span = placement.to - placement.from;
      // A raiz distribui por area: sem ela, a faixa interna fica lotada e a
      // externa vazia, porque o mesmo intervalo de raio cobre areas diferentes.
      const t = Math.sqrt(placement.from * placement.from + random() * span * (2 - span));
      const distance = region.radius * Math.min(t, placement.to);

      const x = region.x + Math.cos(angle) * distance;
      const z = region.z + Math.sin(angle) * distance;

      // A mesma resolucao que o player usa. Um mob dentro de um muro das Ruinas
      // ou de um tronco da Floresta le como bug, e nunca sai de la sozinho.
      const clear = terrain.resolve(x, z, 0.7);

      if (this.tooClose(clear.x, clear.z, placed)) continue;
      return { x: clear.x, z: clear.z, away: Math.atan2(clear.x - region.x, clear.z - region.z) };
    }
    return null;
  }

  /**
   * Mobs nunca se movem, entao nao ha separacao em runtime para desfazer
   * sobreposicao. Dois que nascam juntos ficam juntos para sempre.
   */
  private tooClose(x: number, z: number, placed: readonly Mob[]): boolean {
    for (const mob of placed) {
      const dx = mob.x - x;
      const dz = mob.z - z;
      if (dx * dx + dz * dz < SPACING_SQ) return true;
    }
    return false;
  }

  /**
   * Um passo fixo de simulacao.
   *
   * O terreno **nao** aparece aqui: mob parado nao precisa consultar altura
   * nenhuma depois de nascer.
   */
  update(dt: number, state: GameState): void {
    const px = state.player.x;
    const pz = state.player.z;

    for (const mob of state.mobs) {
      mob.prevFacing = mob.facing;
      // Morto nao percebe nem encara. O respawn e do sistema de combate.
      if (mob.dead) continue;

      const dx = px - mob.x;
      const dz = pz - mob.z;
      const distanceSq = dx * dx + dz * dz;

      // Histerese: entra em alerta perto, so relaxa mais longe. Com um limiar
      // unico, andar na borda faz o estado piscar varias vezes por segundo.
      if (mob.state === 'idle') {
        if (distanceSq <= DETECT_SQ) mob.state = 'alert';
      } else if (distanceSq > RELEASE_SQ) {
        mob.state = 'idle';
      }

      const target =
        mob.state === 'alert'
          ? // atan2(x, z) e nao (z, x): o personagem encara +Z, entao o angulo
            // e medido a partir desse eixo. Trocar a ordem gira tudo 90 graus.
            Math.atan2(dx, dz)
          : mob.restFacing;

      mob.facing = dampAngle(mob.facing, target, MOB_TURN_LAMBDA, dt);
    }
  }
}
