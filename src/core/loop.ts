import { FIXED_DT, MAX_FRAME_TIME } from '@/config/constants';

export interface LoopHandlers {
  /**
   * Simulacao. Chamado 0..N vezes por frame, sempre com o MESMO dt (FIXED_DT).
   * Toda regra de jogo mora aqui.
   */
  fixedUpdate(dt: number): void;

  /**
   * Desenho. Chamado 1 vez por frame.
   * @param alpha  0..1 -- fracao do proximo passo de simulacao ja decorrida.
   *               Usar para interpolar posicoes e evitar tremor visual.
   * @param frameDt Tempo real do frame, em segundos. Para animacoes puramente
   *                visuais que nao afetam regra de jogo.
   */
  render(alpha: number, frameDt: number): void;
}

/**
 * Game loop com passo fixo de simulacao e renderizacao livre.
 *
 * Por que passo fixo: o iPhone faz thermal throttling e cai de 60fps para 30fps
 * depois de alguns minutos de jogo. Com passo variavel, o DPS do auto-attack
 * mudaria conforme a temperatura do aparelho. Com passo fixo, a simulacao e
 * identica em qualquer framerate -- o que tambem torna o jogo testavel.
 */
export class GameLoop {
  private handlers: LoopHandlers;
  private rafId = 0;
  private lastTime = 0;
  private accumulator = 0;
  private running = false;

  /** Ticks de simulacao executados no ultimo frame. Lido pelo debug overlay. */
  public lastStepCount = 0;

  constructor(handlers: LoopHandlers) {
    this.handlers = handlers;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private tick = (now: number): void => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.tick);

    // Converte para segundos e limita o salto maximo.
    const frameDt = Math.min((now - this.lastTime) / 1000, MAX_FRAME_TIME);
    this.lastTime = now;

    this.accumulator += frameDt;

    let steps = 0;
    while (this.accumulator >= FIXED_DT) {
      this.handlers.fixedUpdate(FIXED_DT);
      this.accumulator -= FIXED_DT;
      steps++;
    }
    this.lastStepCount = steps;

    this.handlers.render(this.accumulator / FIXED_DT, frameDt);
  };
}
