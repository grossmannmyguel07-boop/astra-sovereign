import { GameLoop } from '@/core/loop';
import { EventBus } from '@/game/events';
import { createInitialState, type GameState } from '@/game/state';
import { playerSpeed } from '@/game/entities/player';
import { CombatSystem } from '@/game/systems/combat';
import { MovementSystem, type MoveIntent } from '@/game/systems/movement';
import { MobSystem } from '@/game/systems/mobs';
import { ProgressionSystem, xpToNext } from '@/game/systems/progression';
import { WorldSystem } from '@/game/systems/world';
import { SaveSystem } from '@/save/save';
import { VirtualJoystick } from '@/input/joystick';
import { CameraDrag } from '@/input/camera-drag';
import { Renderer } from '@/render/renderer';
import { Scene } from '@/render/scene';
import { Hud } from '@/ui/hud';
import { OrientationGate } from '@/ui/orientation-gate';
import { installDebugConsole } from '@/debug/console';
import { DebugOverlay } from '@/debug/overlay';
import { installCheats } from '@/debug/cheats';
import { REGIONS } from '@/data/world-01';

// Primeira linha executada no projeto: a captura de erros precisa existir
// antes de qualquer coisa que possa falhar.
installDebugConsole();

/** Quantos mobs perceberam o jogador. Existe para o QA enxergar a deteccao. */
function alertCount(state: GameState): number {
  let count = 0;
  for (const mob of state.mobs) if (mob.state === 'alert') count++;
  return count;
}

/** Quantos estao abatidos esperando o respawn. */
function deadCount(state: GameState): number {
  let count = 0;
  for (const mob of state.mobs) if (mob.dead) count++;
  return count;
}

function boot(): void {
  const container = document.getElementById('app');
  if (!container) throw new Error('Elemento #app nao encontrado no index.html');

  const state = createInitialState();
  const world = new WorldSystem();

  // O barramento nasce antes de tudo que fala por ele. Ele e a unica ligacao
  // entre sistemas: pela regra 2 do `CLAUDE.md`, um sistema nunca importa outro.
  const events = new EventBus();

  // O jogador nasce no centro da regiao inicial, sobre o terreno.
  const spawn = REGIONS[0]!;
  const spawnY = world.heightAt(spawn.x, spawn.z);
  state.player.x = spawn.x;
  state.player.z = spawn.z;
  state.player.y = spawnY;
  state.player.prevX = state.player.x;
  state.player.prevZ = state.player.z;
  state.player.prevY = state.player.y;

  // O save entra **depois** do nascimento e sobrescreve o que existir. Assim o
  // caminho sem save e o caminho normal, nao um caso especial: quem chega pela
  // primeira vez simplesmente nao tem nada sobrescrevendo.
  const saves = new SaveSystem(state, world);
  const loaded = saves.load();
  saves.install();

  world.updateRegionWeights(state.player.x, state.player.z);

  // Os mobs nascem antes da cena porque a cena constroi uma malha por mob. Eles
  // sao estacionarios: esta e a unica vez que o sistema toca no terreno.
  const mobs = new MobSystem();
  mobs.spawn(state, world);

  const scene = new Scene(world, state, events);
  const renderer = new Renderer(container, scene.camera);
  const joystick = new VirtualJoystick();
  const cameraDrag = new CameraDrag();
  const movement = new MovementSystem();
  const hud = new Hud();
  const overlay = new DebugOverlay();

  // Depois do save: o nivel vem do disco e o dano do jogador e derivado dele.
  const progression = new ProgressionSystem(events);
  progression.init(state);

  const combat = new CombatSystem(events);
  // O ponto de respawn e o **nascimento**, nao onde o save deixou o jogador:
  // morrer devolve para a Inicial, que nao tem mobs de proposito
  // (`src/data/mobs.ts`) -- renascer nunca cai em cima de quem matou.
  combat.setRespawnPoint(spawn.x, spawnY, spawn.z);

  scene.snapCamera(state);
  installCheats(state, world, scene);

  // Reaproveitado a cada tick: nada de alocar objeto por frame.
  const intent: MoveIntent = { x: 0, z: 0, yaw: 0 };

  const loop = new GameLoop({
    fixedUpdate(dt) {
      // A ligacao entre entrada, camera, mundo e simulacao mora aqui, no
      // integrador. O movimento nao conhece o joystick, a camera nem o sistema
      // de mundo: recebe a intencao de tela, o angulo que a converte em direcao
      // de mundo, e uma consulta de terreno.
      intent.x = joystick.intent.x;
      intent.z = joystick.intent.z;
      intent.yaw = scene.rig.worldYaw;

      // O clique do jogador entra pela mesma `gainPower` que o Auto Click usa.
      // O Auto Click nao aparece aqui: ele e o proprio auto attack, e a
      // progressao o escuta pelo barramento (`player:attacked`).
      const taps = cameraDrag.consumeTaps();
      for (let i = 0; i < taps; i++) progression.gainPower(state);

      movement.update(dt, state, intent, world);
      mobs.update(dt, state);
      // Depois dos mobs, para o combate ver o alerta deste tick e nao o do
      // anterior. Depois do movimento pelo mesmo motivo: o alcance do golpe e
      // medido de onde o jogador esta agora.
      combat.update(dt, state);
      world.updateRegionWeights(state.player.x, state.player.z);
    },
    render(alpha, frameDt) {
      // A rotacao pedida no frame e aplicada antes de desenhar, para o giro
      // aparecer no mesmo quadro em que o dedo se moveu.
      const camera = cameraDrag.consume();
      scene.rig.rotate(camera.yaw, camera.pitch);
      scene.rig.zoom(camera.zoom);

      scene.sync(state, world, alpha, frameDt);
      renderer.render(scene.three);

      const p = state.player;
      const xpNeeded = xpToNext(state.level);
      hud.update(state, xpNeeded);

      const yawDegrees = ((scene.rig.worldYaw * 180) / Math.PI) % 360;

      overlay.update(
        frameDt,
        renderer.stats,
        loop.lastStepCount,
        `pos    ${p.x.toFixed(1)}, ${p.z.toFixed(1)}  alt ${p.y.toFixed(1)}\n` +
          `vel    ${playerSpeed(p).toFixed(1)}\n` +
          `regiao ${world.dominantRegion().id}\n` +
          `cam    yaw ${yawDegrees.toFixed(0)}  dist ${scene.rig.currentDistance.toFixed(1)}\n` +
          `mobs   ${state.mobs.length} (${alertCount(state)} alerta, ${deadCount(state)} caido)\n` +
          // Vida, moeda, nivel e XP sairam daqui no M7: a HUD mostra os quatro,
          // e `references/hud/README.md` lista informacao duplicada em dois
          // lugares da tela como defeito. Fica so o que a HUD nao mostra.
          // Poder fica no debug, nao na HUD: e ferramenta para o QA enxergar a
          // trilha nova. Onde ele aparece para o jogador e no numero de dano,
          // que ja esta na tela desde o M4 e sobe junto.
          `poder  ${state.power}  ->  dano ${p.attackDamage}` +
          `${p.dead ? `  MORTO ${p.respawnTimer.toFixed(1)}s` : ''}`
      );
    },
  });

  // O jogo so roda em paisagem. Em retrato a simulacao pausa em vez de avancar
  // sem ninguem jogando -- e `start()` zera o acumulador, entao voltar nao
  // dispara um lote de ticks atrasados.
  const gate = new OrientationGate((blocked) => {
    if (blocked) loop.stop();
    else loop.start();
  });

  if (!gate.blocked) loop.start();

  document.getElementById('boot')?.classList.add('hidden');
  console.log(`[boot] Astra Sovereign iniciado. Save ${loaded ? 'carregado' : 'ausente'}.`);
}

try {
  boot();
} catch (error) {
  // Sem isto, uma falha de inicializacao deixaria a tela de "Carregando..."
  // parada para sempre, sem nenhuma pista do motivo.
  console.error('[boot] Falha ao iniciar:', error);
}
