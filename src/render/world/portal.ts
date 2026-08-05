import * as THREE from 'three';
import { REGIONS } from '@/data/world-01';
import type { WorldSystem } from '@/game/systems/world';

/**
 * Portal do Mundo 1.
 *
 * Dono: **World Agent**.
 *
 * Dois estados, definidos em `docs/worlds/world-01.md`:
 *
 * | Estado | Quando | Aparencia |
 * |---|---|---|
 * | Dormente | toda a exploracao | estrutura visivel, nucleo apagado, pulso frio |
 * | Desperto | depois do boss | nucleo aceso, o mais brilhante do mundo |
 *
 * **Um objetivo visivel e negado puxa mais que um objetivo disponivel.** O
 * jogador ve o portal de Campos nos primeiros segundos e passa o mundo inteiro
 * descobrindo o que falta.
 *
 * No M2 so o dormente e alcancavel em jogo; o desperto existe para o M10 e
 * pode ser inspecionado por cheat. Despertar e troca de material, nunca
 * geometria nova.
 */

/**
 * O que separa os dois estados e **o nucleo aceso**, nao a estrutura visivel.
 *
 * A estrutura dormente e clara o bastante para vencer a nevoa de Campos: a 84
 * unidades, com `fogNear 30 / fogFar 130`, ela chega 54% diluida no fundo. Com
 * a cor anterior o portal simplesmente sumia de longe, e um objetivo que nao se
 * ve nao puxa ninguem.
 */
const DORMANT_CORE = 0x1b2a5e;
const AWAKE_CORE = 0x9fd8ff;
const DORMANT_RING = 0x44519b;
const AWAKE_RING = 0x7fb4ff;
const DORMANT_EMISSIVE = 0x161f52;
const AWAKE_EMISSIVE = 0x2c4a8c;

/**
 * Opacidade do feixe. O dormente e fraco mas nao zero: e ele que marca a
 * posicao do portal acima da linha do horizonte, onde a estrutura ja se
 * confunde com o fundo.
 */
const DORMANT_BEAM = 0.12;

export class Portal {
  readonly group = new THREE.Group();

  private core: THREE.Mesh;
  private coreMaterial: THREE.MeshBasicMaterial;
  private ringMaterial: THREE.MeshLambertMaterial;
  private beamMaterial: THREE.MeshBasicMaterial;
  private geometries: THREE.BufferGeometry[] = [];
  private elapsed = 0;
  private awake = false;

  constructor(world: WorldSystem) {
    const region = REGIONS.find((r) => r.id === 'portal');
    const x = region?.x ?? 0;
    const z = region?.z ?? 0;
    const ground = world.heightAt(x, z);

    this.group.position.set(x, ground, z);

    // Arco: dois pilares e uma travessa. Silhueta reconhecivel de longe, que e
    // o que importa -- a esta distancia nada alem do contorno le.
    const pillarGeometry = new THREE.BoxGeometry(1.4, 9, 1.4);
    this.ringMaterial = new THREE.MeshLambertMaterial({
      color: DORMANT_RING,
      emissive: DORMANT_EMISSIVE,
    });
    for (const side of [-3.4, 3.4]) {
      const pillar = new THREE.Mesh(pillarGeometry, this.ringMaterial);
      pillar.position.set(side, 4.5, 0);
      this.group.add(pillar);
    }
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(9.4, 1.4, 1.4), this.ringMaterial);
    lintel.position.y = 9.7;
    this.group.add(lintel);
    this.geometries.push(pillarGeometry, lintel.geometry);

    // Nucleo: o que muda entre dormente e desperto.
    const coreGeometry = new THREE.PlaneGeometry(6.4, 8.6);
    this.coreMaterial = new THREE.MeshBasicMaterial({
      color: DORMANT_CORE,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.core = new THREE.Mesh(coreGeometry, this.coreMaterial);
    this.core.position.y = 4.9;
    this.group.add(this.core);
    this.geometries.push(coreGeometry);

    // Feixe vertical. E o que torna o portal legivel de Campos, a ~80 unidades:
    // a esta distancia a estrutura ja quase sumiu na nevoa, mas uma coluna alta
    // ainda aparece.
    const beamGeometry = new THREE.CylinderGeometry(1.6, 3.2, 60, 8, 1, true);
    this.beamMaterial = new THREE.MeshBasicMaterial({
      color: AWAKE_CORE,
      transparent: true,
      opacity: DORMANT_BEAM,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const beam = new THREE.Mesh(beamGeometry, this.beamMaterial);
    beam.position.y = 30;
    this.group.add(beam);
    this.geometries.push(beamGeometry);
  }

  /** Alterna o estado. Chamado pelo boss no M10; por cheat ate la. */
  setAwake(awake: boolean): void {
    this.awake = awake;
    this.coreMaterial.color.setHex(awake ? AWAKE_CORE : DORMANT_CORE);
    this.ringMaterial.color.setHex(awake ? AWAKE_RING : DORMANT_RING);
    this.ringMaterial.emissive.setHex(awake ? AWAKE_EMISSIVE : DORMANT_EMISSIVE);
  }

  get isAwake(): boolean {
    return this.awake;
  }

  /**
   * @param frameDt Tempo real. E animacao puramente visual: nao altera regra
   *                nenhuma, entao nao precisa de passo fixo.
   */
  update(frameDt: number): void {
    this.elapsed += frameDt;

    // Dormente pulsa devagar e fraco: presente, mas claramente desligado.
    // Desperto pulsa rapido e forte.
    const speed = this.awake ? 2.2 : 0.8;
    const base = this.awake ? 0.66 : 0.34;
    const swing = this.awake ? 0.24 : 0.1;
    const pulse = base + Math.sin(this.elapsed * speed) * swing;

    this.coreMaterial.opacity = pulse;
    this.beamMaterial.opacity = this.awake ? 0.26 + pulse * 0.14 : DORMANT_BEAM;
  }

  dispose(): void {
    for (const geometry of this.geometries) geometry.dispose();
    this.coreMaterial.dispose();
    this.ringMaterial.dispose();
    this.beamMaterial.dispose();
  }
}
