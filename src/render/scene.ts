import * as THREE from 'three';
import { REGIONS } from '@/data/world-01';
import type { EventBus } from '@/game/events';
import type { GameState } from '@/game/state';
import type { WorldSystem } from '@/game/systems/world';
import { CameraRig } from '@/render/camera';
import { DamageNumbers } from '@/render/damage-numbers';
import { PlayerView } from '@/render/views/player-view';
import { MobView } from '@/render/views/mob-view';
import { WorldView } from '@/render/world/world-view';
import { buildHumanoidGeometry } from '@/render/characters/humanoid';
import { buildClips } from '@/render/characters/clips';
import { damp } from '@/core/math';

/**
 * Monta a cena e espelha o estado da simulacao nela.
 *
 * Dono: **Rendering Agent**.
 *
 * Le o estado e desenha. Nunca decide regra: se o player esta em determinada
 * posicao, quem decidiu foi o sistema de movimento.
 *
 * ## E o unico ouvinte do combate
 *
 * O barramento entrega evento **semantico** -- "levou 14 de dano" -- e e aqui
 * que ele vira imagem. O `CombatSystem` nao sabe que existem clipes, materiais
 * ou numeros na tela, e nao pode saber: e a `decisions/0008`.
 *
 * Os ouvintes leem o payload na hora e nao guardam a referencia. O barramento
 * reaproveita um objeto por tipo de evento -- guardar significaria ler o
 * proximo acerto sem perceber. Ver o topo de `src/game/events.ts`.
 */

/** Suavizacao da mudanca de ambiencia entre regioes, por segundo. */
const AMBIENCE_LAMBDA = 1.6;

/**
 * Altura em que o numero nasce, acima dos pes do alvo.
 *
 * O humanoide tem ~1.9 de altura, entao isto poe o numero logo acima da cabeca:
 * alto o bastante para nao ser tapado pelo corpo, baixo o bastante para ainda
 * pertencer a ele quando ha varios em cena.
 */
const NUMBER_HEIGHT = 2.1;

/**
 * A recompensa nasce mais alta que o dano.
 *
 * O golpe que mata emite dano e moeda no mesmo tick, no mesmo ponto. Sem
 * separar, os dois numeros nascem um sobre o outro e nenhum dos dois se le --
 * justamente no quadro mais importante, que e o do abate.
 */
const REWARD_HEIGHT = 3;

/**
 * Cores do feedback, da tabela de `docs/design/art-direction.md`.
 *
 * O `combat.md` manda o numero sair **na cor de quem causou**, porque com units
 * atacando junto e a cor que deixa o jogador distinguir o proprio dano do delas
 * sem ler nada. Ate as units existirem, o que a cor separa e dano dado de dano
 * levado -- que e a distincao que importa agora.
 */
const COLOR_PLAYER_DAMAGE = '#e8ecff';
const COLOR_PLAYER_HURT = '#ff7b8a';
const COLOR_REWARD = '#ffca6b';

export class Scene {
  readonly three: THREE.Scene;
  readonly rig: CameraRig;
  readonly world: WorldView;

  private playerView: PlayerView;
  private mobView: MobView;
  private damageNumbers: DamageNumbers;
  /** Uma geometria para todos os personagens do jogo, player incluso. */
  private characterGeometry: THREE.BufferGeometry;
  private hemisphere: THREE.HemisphereLight;
  private key: THREE.DirectionalLight;
  private fog: THREE.Fog;

  private skyColor = new THREE.Color();
  private groundColor = new THREE.Color();
  private blendSky = new THREE.Color();
  private blendGround = new THREE.Color();
  private fogNear = 30;
  private fogFar = 130;

  constructor(worldSystem: WorldSystem, state: GameState, events: EventBus) {
    this.three = new THREE.Scene();
    this.three.background = new THREE.Color(0x05060f);

    // A nevoa e ferramenta de composicao, nao clima: esconde a borda do mundo,
    // cria profundidade sem geometria e limita o alcance de desenho.
    // A cor e sempre a do fundo -- qualquer diferenca vira uma faixa falsa.
    this.fog = new THREE.Fog(0x05060f, this.fogNear, this.fogFar);
    this.three.fog = this.fog;

    // Duas luzes. Cada luz adicional recompila shaders e custa por pixel.
    // A identidade de cada regiao vem de interpolar as propriedades destas
    // duas, nunca de acrescentar uma terceira.
    this.hemisphere = new THREE.HemisphereLight(0x6f86ff, 0x0a0a18, 1.15);
    this.three.add(this.hemisphere);

    this.key = new THREE.DirectionalLight(0xbcd0ff, 1.25);
    this.key.position.set(8, 16, 10);
    this.three.add(this.key);

    this.world = new WorldView(worldSystem);
    this.three.add(this.world.group);

    // Uma geometria e um conjunto de clipes, compartilhados por todo
    // personagem em cena. O que e proprio de cada um e so o esqueleto.
    this.characterGeometry = buildHumanoidGeometry();
    const clips = buildClips();

    this.playerView = new PlayerView(this.characterGeometry, clips);
    this.three.add(this.playerView.object);

    this.mobView = new MobView(state.mobs, this.characterGeometry, clips);
    this.three.add(this.mobView.group);

    this.damageNumbers = new DamageNumbers();
    this.rig = new CameraRig();

    this.listen(events, state);
  }

  /**
   * Liga o combate a tela.
   *
   * Cada assinatura aqui e uma das quatro conversas que justificaram o
   * barramento existir, listadas no topo de `src/game/events.ts`. Morte e
   * respawn nao aparecem: sao estado, e os views leem direto de `dead`.
   */
  private listen(events: EventBus, state: GameState): void {
    events.on('player:attacked', () => {
      this.playerView.attack();
    });

    events.on('mob:damaged', (payload) => {
      this.mobView.hit(payload.mobId);
      this.damageNumbers.spawn(
        payload.x,
        payload.y + NUMBER_HEIGHT,
        payload.z,
        String(payload.amount),
        COLOR_PLAYER_DAMAGE
      );
    });

    events.on('player:damaged', (payload) => {
      this.playerView.hurt();
      // Quem bateu tambem se mexe: sem o clipe de golpe no mob, o dano no
      // jogador apareceria sem nada em cena tendo causado.
      this.mobView.attack(payload.sourceId);
      const player = state.player;
      this.damageNumbers.spawn(
        player.x,
        player.y + NUMBER_HEIGHT,
        player.z,
        String(payload.amount),
        COLOR_PLAYER_HURT
      );
    });

    events.on('currency:gained', (payload) => {
      this.damageNumbers.spawn(
        payload.x,
        payload.y + REWARD_HEIGHT,
        payload.z,
        `+${payload.amount}`,
        COLOR_REWARD
      );
    });
  }

  get camera(): THREE.PerspectiveCamera {
    return this.rig.camera;
  }

  /** Chamado uma vez por frame, na renderizacao. */
  sync(state: GameState, worldSystem: WorldSystem, alpha: number, frameDt: number): void {
    this.playerView.sync(state.player, alpha, frameDt);
    this.rig.sync(state.player, alpha, frameDt);
    // Depois do rig: o corte usa a posicao da camera **deste** frame, e o
    // alcance da nevoa da regiao atual, que muda conforme se anda.
    this.mobView.sync(
      state.mobs,
      alpha,
      frameDt,
      this.camera.position.x,
      this.camera.position.z,
      this.fog.far
    );
    this.world.update(frameDt);
    this.applyAmbience(worldSystem, frameDt);

    // Depois do rig, e com a matriz recalculada a mao: os numeros sao
    // projetados por conta propria, e o renderizador so atualiza as matrizes
    // quando desenha -- ou seja, depois daqui. Sem esta linha eles usariam a
    // camera do frame anterior e escorregariam atras dela ao girar.
    this.camera.updateMatrixWorld();
    this.damageNumbers.update(this.camera, frameDt);
  }

  /**
   * Interpola iluminacao e nevoa pelos pesos de regiao.
   *
   * A transicao e continua e suavizada no tempo: sem o `damp`, atravessar a
   * fronteira produziria um salto de cor perceptivel. Custo: zero draw calls,
   * apenas atualizacao de uniforme.
   */
  private applyAmbience(worldSystem: WorldSystem, frameDt: number): void {
    let skyR = 0;
    let skyG = 0;
    let skyB = 0;
    let groundR = 0;
    let groundG = 0;
    let groundB = 0;
    let near = 0;
    let far = 0;

    for (let i = 0; i < REGIONS.length; i++) {
      const region = REGIONS[i]!;
      const weight = worldSystem.weights[i]!;

      this.skyColor.setHex(region.skyLight);
      this.groundColor.setHex(region.groundLight);
      skyR += this.skyColor.r * weight;
      skyG += this.skyColor.g * weight;
      skyB += this.skyColor.b * weight;
      groundR += this.groundColor.r * weight;
      groundG += this.groundColor.g * weight;
      groundB += this.groundColor.b * weight;

      near += region.fogNear * weight;
      far += region.fogFar * weight;
    }

    this.blendSky.setRGB(skyR, skyG, skyB);
    this.blendGround.setRGB(groundR, groundG, groundB);

    this.hemisphere.color.lerp(this.blendSky, 1 - Math.exp(-AMBIENCE_LAMBDA * frameDt));
    this.hemisphere.groundColor.lerp(
      this.blendGround,
      1 - Math.exp(-AMBIENCE_LAMBDA * frameDt)
    );

    this.fogNear = damp(this.fogNear, near, AMBIENCE_LAMBDA, frameDt);
    this.fogFar = damp(this.fogFar, far, AMBIENCE_LAMBDA, frameDt);
    this.fog.near = this.fogNear;
    this.fog.far = this.fogFar;
  }

  /** Posiciona a camera sem suavizacao. Usado ao iniciar. */
  snapCamera(state: GameState): void {
    this.rig.snapTo(state.player);
  }

  dispose(): void {
    this.world.dispose();
    this.playerView.dispose();
    this.mobView.dispose();
    this.damageNumbers.dispose();
    this.characterGeometry.dispose();
  }
}
