import * as THREE from 'three';
import { MOB_TYPES } from '@/data/mobs';
import type { Mob } from '@/game/entities/mob';

/**
 * Barra de vida sobre cada mob.
 *
 * Dono: **Rendering Agent**.
 *
 * O combate ja tinha flash, recuo e numero de dano, mas nada dizia **quanto
 * falta** para o alvo cair. Sem isso, bater num mob e num boss parece a mesma
 * coisa ate um deles morrer.
 *
 * ## Por que DOM, e nao sprite na cena
 *
 * Mesmo argumento da `DamageNumbers`, e vale mais aqui: uma barra e um retangulo
 * dentro de outro, e em malha seriam **duas draw calls por mob visivel** numa
 * cena que hoje tem 23 a 37. Em DOM custa zero, sai nitido em qualquer DPR e
 * acompanha o que o `CLAUDE.md` ja manda para a HUD. O preco e projetar a
 * posicao a mao, que e o que `update` faz.
 *
 * ## Por que um elemento por mob, sem pool
 *
 * A `DamageNumbers` precisa de pool porque numero e evento: nascem dezenas por
 * segundo e nao tem dono fixo. Barra e o contrario -- e propriedade de um mob,
 * e a lista de mobs e **fixa desde o spawn** (mob comum nunca sai do lugar e
 * nunca deixa de existir, so morre e volta). Um elemento por mob nasce junto com
 * a cena e nunca mais e alocado, o que satisfaz a regra de pooling do
 * `CLAUDE.md` sem a indirecao de distribuir slots a cada frame.
 *
 * ## Quem aparece
 *
 * So quem esta **em combate ou machucado**, dentro do alcance da nevoa. Quarenta
 * barras permanentes na tela seriam ruido: o `docs/design/ui.md` pede que a
 * interface mostre o que esta acontecendo agora, e um mob intacto do outro lado
 * do campo nao esta acontecendo.
 */

/** Largura e altura do trilho, em pixels de tela. */
const WIDTH = 26;
const HEIGHT = 3;

/**
 * Altura da barra no mundo, em unidades, antes da escala do mob.
 *
 * O humanoide tem ~1.9. Isto poe a barra logo acima da cabeca, e **abaixo** do
 * numero de dano, que nasce em 2.1 e sobe: os dois nunca disputam o mesmo pixel
 * por mais de um quadro.
 */
const HEAD_HEIGHT = 1.98;

/** Trilho. O mesmo tom da HUD, com alfa para nao virar um bloco solido. */
const TRACK = 'rgba(26,33,64,0.82)';

interface BarSlot {
  root: HTMLDivElement;
  fill: HTMLDivElement;
  /** Altura no mundo, ja com a escala do tipo aplicada. */
  height: number;
  /** Ultima fracao desenhada. -1 forca a primeira escrita. */
  ratio: number;
  /** Ultimo estado de exibicao desenhado. Evita reescrever `display`. */
  shown: boolean;
}

export class MobHealthBars {
  private root: HTMLDivElement;
  private slots: BarSlot[] = [];
  private projected = new THREE.Vector3();

  constructor(mobs: readonly Mob[]) {
    this.root = document.createElement('div');
    this.root.style.cssText = [
      'position:fixed',
      'inset:0',
      // Abaixo do numero de dano (40), que precisa passar por cima da barra.
      'z-index:39',
      // Sem isto, a camada engoliria o toque do joystick e da rotacao de camera.
      'pointer-events:none',
      'overflow:hidden',
    ].join(';');

    for (const mob of mobs) {
      const definition = MOB_TYPES[mob.type];

      const bar = document.createElement('div');
      bar.style.cssText = [
        'position:absolute',
        'left:0',
        'top:0',
        'display:none',
        `width:${WIDTH}px`,
        `height:${HEIGHT}px`,
        `background:${TRACK}`,
        `border-radius:${HEIGHT / 2}px`,
        'overflow:hidden',
        // Mesmo motivo do contorno no numero de dano: o mundo e escuro mas nao
        // uniforme, e a barra passa por cima de props claros.
        'box-shadow:0 0 0 1px rgba(5,6,15,0.9)',
      ].join(';');

      const fill = document.createElement('div');
      fill.style.cssText = [
        'position:absolute',
        'inset:0',
        'width:100%',
        // A cor do proprio mob. O `combat.md` ja usa esse criterio para o flash
        // no jogador: o que pertence a uma criatura sai na cor dela.
        `background:#${definition.color.toString(16).padStart(6, '0')}`,
        `border-radius:${HEIGHT / 2}px`,
      ].join(';');

      bar.appendChild(fill);
      this.root.appendChild(bar);
      this.slots.push({
        root: bar,
        fill,
        height: HEAD_HEIGHT * definition.scale,
        ratio: -1,
        shown: false,
      });
    }

    document.body.appendChild(this.root);
  }

  /**
   * Projeta e atualiza cada barra viva.
   *
   * @param camera Precisa ter a matriz do mundo ja atualizada **neste** frame,
   *               pelo mesmo motivo da `DamageNumbers`: com a matriz do frame
   *               anterior as barras escorregam atras da camera ao girar.
   * @param cullDistance Alcance da nevoa desta regiao. Mesma regra do `MobView`:
   *                     o que a nevoa apaga nao precisa de barra.
   */
  update(
    mobs: readonly Mob[],
    camera: THREE.PerspectiveCamera,
    viewX: number,
    viewZ: number,
    cullDistance: number
  ): void {
    const halfWidth = window.innerWidth / 2;
    const halfHeight = window.innerHeight / 2;
    const cullSq = cullDistance * cullDistance;

    for (let i = 0; i < mobs.length; i++) {
      const mob = mobs[i]!;
      const slot = this.slots[i];
      if (!slot) continue;

      const dx = mob.x - viewX;
      const dz = mob.z - viewZ;
      // Morto some junto com o corpo. Intacto e fora de combate nao aparece:
      // quarenta barras cheias seriam ruido, nao informacao.
      const wanted =
        !mob.dead &&
        (mob.state === 'alert' || mob.hp < mob.maxHp) &&
        dx * dx + dz * dz <= cullSq;

      if (!wanted) {
        this.hide(slot);
        continue;
      }

      this.projected.set(mob.x, mob.y + slot.height, mob.z);
      this.projected.project(camera);

      // z > 1 e atras da camera, onde a projecao espelha o ponto para o lado
      // errado da tela -- a barra apareceria no lado oposto ao do mob.
      if (this.projected.z > 1) {
        this.hide(slot);
        continue;
      }

      const screenX = this.projected.x * halfWidth + halfWidth;
      const screenY = -this.projected.y * halfHeight + halfHeight;
      slot.root.style.transform = `translate3d(${screenX.toFixed(1)}px, ${screenY.toFixed(1)}px, 0) translate(-50%, -50%)`;

      if (!slot.shown) {
        slot.root.style.display = 'block';
        slot.shown = true;
      }

      // A largura so encosta no DOM quando a vida muda de verdade. A posicao
      // muda todo frame porque a camera se mexe; a vida, nao.
      const ratio = mob.maxHp > 0 ? Math.min(1, Math.max(0, mob.hp / mob.maxHp)) : 0;
      if (ratio !== slot.ratio) {
        slot.fill.style.width = `${(ratio * 100).toFixed(1)}%`;
        slot.ratio = ratio;
      }
    }
  }

  private hide(slot: BarSlot): void {
    if (!slot.shown) return;
    slot.root.style.display = 'none';
    slot.shown = false;
  }

  dispose(): void {
    this.root.remove();
    this.slots = [];
  }
}
