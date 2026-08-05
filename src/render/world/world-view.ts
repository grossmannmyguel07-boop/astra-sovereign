import * as THREE from 'three';
import type { WorldSystem } from '@/game/systems/world';
import { Motes } from '@/render/world/motes';
import { Portal } from '@/render/world/portal';
import { Props } from '@/render/world/props';
import { Terrain } from '@/render/world/terrain';

/**
 * Composicao visual do Mundo 1.
 *
 * Dono: **World Agent**.
 *
 * Junta terreno, elementos construidos, portal e particulas. Nao decide regra
 * nenhuma: le o mundo simulado e o desenha.
 *
 * Iluminacao e nevoa **nao** ficam aqui -- sao da cena, porque valem para tudo
 * e nao so para o mundo.
 */
export class WorldView {
  readonly group = new THREE.Group();
  readonly portal: Portal;

  private terrain: Terrain;
  private props: Props;
  private motes: Motes;

  constructor(world: WorldSystem) {
    this.terrain = new Terrain(world);
    this.props = new Props(world);
    this.portal = new Portal(world);
    this.motes = new Motes(world);

    this.group.add(this.terrain.mesh);
    this.group.add(this.props.group);
    this.group.add(this.portal.group);
    this.group.add(this.motes.points);
  }

  /** @param frameDt Tempo real. Tudo aqui e animacao visual pura. */
  update(frameDt: number): void {
    this.portal.update(frameDt);
    this.motes.update(frameDt);
  }

  dispose(): void {
    this.terrain.dispose();
    this.props.dispose();
    this.portal.dispose();
    this.motes.dispose();
  }
}
