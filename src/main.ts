import { GameLoop } from '@/core/loop';
import { createInitialState } from '@/game/state';
import { playerSpeed } from '@/game/entities/player';
import { MovementSystem, type MoveIntent } from '@/game/systems/movement';
import { VirtualJoystick } from '@/input/joystick';
import { CameraDrag } from '@/input/camera-drag';
import { Renderer } from '@/render/renderer';
import { Scene } from '@/render/scene';
import { OrientationGate } from '@/ui/orientation-gate';
import { installDebugConsole } from '@/debug/console';
import { DebugOverlay } from '@/debug/overlay';

// Primeira linha executada no projeto: a captura de erros precisa existir
// antes de qualquer coisa que possa falhar.
installDebugConsole();

function boot(): void {
  const container = document.getElementById('app');
  if (!container) throw new Error('Elemento #app nao encontrado no index.html');

  const state = createInitialState();

  const scene = new Scene();
  const renderer = new Renderer(container, scene.camera);
  const joystick = new VirtualJoystick();
  const cameraDrag = new CameraDrag();
  const movement = new MovementSystem();
  const overlay = new DebugOverlay();

  scene.snapCamera(state);

  // Reaproveitado a cada tick: nada de alocar objeto por frame.
  const intent: MoveIntent = { x: 0, z: 0, yaw: 0 };

  const loop = new GameLoop({
    fixedUpdate(dt) {
      // A ligacao entre entrada, camera e simulacao mora aqui, no integrador.
      // O sistema de movimento nao conhece o joystick nem a camera: recebe a
      // intencao de tela e o angulo que a converte em direcao de mundo.
      intent.x = joystick.intent.x;
      intent.z = joystick.intent.z;
      intent.yaw = scene.rig.worldYaw;

      movement.update(dt, state, intent);
    },
    render(alpha, frameDt) {
      // A rotacao pedida no frame e aplicada antes de desenhar, para o giro
      // aparecer no mesmo quadro em que o dedo se moveu.
      const rotation = cameraDrag.consume();
      scene.rig.rotate(rotation.yaw, rotation.pitch);

      scene.sync(state, alpha, frameDt);
      renderer.render(scene.three);

      const p = state.player;
      const yawDegrees = ((scene.rig.worldYaw * 180) / Math.PI) % 360;
      const pitchDegrees = (scene.rig.currentPitch * 180) / Math.PI;

      overlay.update(
        frameDt,
        renderer.stats,
        loop.lastStepCount,
        `pos    ${p.x.toFixed(1)}, ${p.z.toFixed(1)}\n` +
          `vel    ${playerSpeed(p).toFixed(1)}\n` +
          `cam    yaw ${yawDegrees.toFixed(0)}  pitch ${pitchDegrees.toFixed(0)}`
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
  console.log('[boot] Astra Sovereign iniciado. Milestone 1.');
}

try {
  boot();
} catch (error) {
  // Sem isto, uma falha de inicializacao deixaria a tela de "Carregando..."
  // parada para sempre, sem nenhuma pista do motivo.
  console.error('[boot] Falha ao iniciar:', error);
}
