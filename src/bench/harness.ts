/**
 * Medicao e protocolo do benchmark.
 *
 * Dono: **Debug Agent**.
 *
 * **Nao importa `three`.** Recebe numeros e devolve numeros, entao a medicao
 * pode ser testada e conferida sem subir uma cena.
 *
 * O benchmark e ferramenta permanente: uma medicao feita no M3 precisa ser
 * comparavel com uma feita no M9, senao nao serve para pegar regressao. E por
 * isso que existe `PROTOCOL` -- ele muda sempre que o cenario muda, e resultado
 * de protocolos diferentes nunca deve ser comparado.
 */

/**
 * Versao do protocolo de medicao.
 *
 * **Suba isto** ao mudar qualquer coisa que afete o numero: escada de N,
 * duracao dos estagios, orcamento de triangulo, contagem de osso, camera,
 * layout dos personagens ou politica de transicao de clipe.
 */
export const PROTOCOL = 1;

/** Descartado no inicio de cada estagio: compilacao de shader, upload, GC. */
export const WARMUP_MS = 1500;

/** Janela de medicao de cada degrau da escada. */
export const MEASURE_MS = 10_000;

/**
 * Estagio longo no orcamento previsto, para pegar queda termica.
 *
 * Dez segundos nao veem throttling: o iPhone leva dezenas de segundos para
 * esquentar. Um benchmark curto entregaria um numero otimista que o jogo nao
 * sustenta em cinco minutos de jogo.
 */
export const SUSTAINED_MS = 60_000;

/**
 * Orcamento previsto pela decisao 0008: ~40 mobs + 8 units + player.
 * E contra este numero que o veredito e dado.
 */
export const BUDGET_CHARACTERS = 49;

/** Alvo de framerate do projeto, por `CLAUDE.md`. */
export const TARGET_FPS = 60;

/**
 * Escada de N. Vai muito alem do orcamento de proposito: saber **onde** esta o
 * penhasco vale mais do que saber que o orcamento passou. Se `skinned` segurar
 * 60fps em 100, os estagios B e C morrem sem precisar existir.
 */
export const LADDER = [10, 25, 50, 100, 200];

export type Technique = 'skinned' | 'static';

export interface StageResult {
  technique: Technique;
  characters: number;
  sustained: boolean;
  /** Mediana do tempo de frame. E dela que sai o fps reportado. */
  p50: number;
  p95: number;
  worst: number;
  fps: number;
  /** Tempo gasto no nosso proprio JS por frame -- proxy de CPU. */
  jsMs: number;
  draws: number;
  triangles: number;
  /** Bytes que a tecnica aloca, calculados. Ver `measuredBytes` abaixo. */
  bytes: number;
  frames: number;
  /**
   * Variacao da mediana entre o primeiro e o ultimo terco da janela, em
   * porcentagem. Positivo significa que ficou **mais lento** ao longo do
   * estagio, que e a assinatura de throttling termico.
   */
  drift: number;
}

/**
 * Coletor de tempos de frame de um estagio.
 *
 * Guarda cada delta em vez de acumular media: media esconde engasgo, e engasgo
 * e exatamente o que estraga a sensacao de um jogo de acao.
 */
export class FrameSampler {
  private deltas: number[] = [];
  private jsTotal = 0;
  private elapsed = 0;
  private warmed = 0;

  /** True quando a janela de medicao terminou. */
  get done(): boolean {
    return this.elapsed >= this.window;
  }

  get progress(): number {
    return Math.min(1, (this.warmed + this.elapsed) / (WARMUP_MS + this.window));
  }

  constructor(private window: number) {}

  /**
   * @param deltaMs Tempo real do frame.
   * @param jsMs Tempo gasto no nosso codigo neste frame.
   */
  push(deltaMs: number, jsMs: number): void {
    if (this.warmed < WARMUP_MS) {
      this.warmed += deltaMs;
      return;
    }
    if (this.done) return;
    this.deltas.push(deltaMs);
    this.jsTotal += jsMs;
    this.elapsed += deltaMs;
  }

  finish(
    technique: Technique,
    characters: number,
    sustained: boolean,
    draws: number,
    triangles: number,
    bytes: number
  ): StageResult {
    const sorted = [...this.deltas].sort((a, b) => a - b);
    const count = sorted.length;
    const p50 = percentile(sorted, 0.5);

    return {
      technique,
      characters,
      sustained,
      p50,
      p95: percentile(sorted, 0.95),
      worst: count > 0 ? sorted[count - 1]! : 0,
      fps: p50 > 0 ? 1000 / p50 : 0,
      jsMs: count > 0 ? this.jsTotal / count : 0,
      draws,
      triangles,
      bytes,
      frames: count,
      drift: this.computeDrift(),
    };
  }

  /**
   * Compara a mediana do primeiro terco com a do ultimo terco, na ordem em que
   * os frames aconteceram. Ordenar antes destruiria justamente a informacao
   * temporal que interessa aqui.
   */
  private computeDrift(): number {
    const count = this.deltas.length;
    if (count < 30) return 0;
    const third = Math.floor(count / 3);
    const first = percentile([...this.deltas.slice(0, third)].sort((a, b) => a - b), 0.5);
    const last = percentile(
      [...this.deltas.slice(count - third)].sort((a, b) => a - b),
      0.5
    );
    if (first <= 0) return 0;
    return ((last - first) / first) * 100;
  }
}

function percentile(sorted: number[], fraction: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * fraction));
  return sorted[index]!;
}

/**
 * Memoria que cada tecnica aloca, em bytes.
 *
 * **Calculada, nao medida.** O Safari nao expoe `performance.memory` -- e uma
 * extensao do Chrome -- e nenhum navegador expoe memoria de GPU. Estimar por
 * cima seria inventar numero.
 *
 * O que da para saber com certeza e quanto **nos** alocamos, e e justamente o
 * numero que separa as tecnicas: a geometria e compartilhada entre todos os
 * personagens, mas cada esqueleto carrega as proprias matrizes de osso e a
 * propria textura de osso.
 */
export function measuredBytes(
  geometryBytes: number,
  perCharacterBytes: number,
  characters: number
): number {
  return geometryBytes + perCharacterBytes * characters;
}

export interface Verdict {
  passes: boolean;
  /** N mais alto que sustentou o alvo de fps. */
  ceiling: number;
  headline: string;
  detail: string;
}

/**
 * O veredito do benchmark, que e a razao dele existir.
 *
 * Julga pelo **p95**, nao pela media: um jogo que roda a 60fps de media com
 * engasgos regulares nao passa de 60fps para quem esta jogando.
 */
export function judge(results: StageResult[]): Verdict {
  const skinned = results.filter((r) => r.technique === 'skinned' && !r.sustained);
  const budget = 1000 / TARGET_FPS;

  let ceiling = 0;
  for (const stage of skinned) {
    if (stage.p95 <= budget * 1.05) ceiling = Math.max(ceiling, stage.characters);
  }

  const sustained = results.find((r) => r.sustained);
  const throttled = sustained !== undefined && sustained.drift > 15;
  const passes = ceiling >= BUDGET_CHARACTERS && !throttled;

  let detail: string;
  if (!passes && ceiling < BUDGET_CHARACTERS) {
    detail =
      `Segurou ${TARGET_FPS}fps ate ${ceiling} personagens, abaixo dos ` +
      `${BUDGET_CHARACTERS} previstos. Estagio B (skinning instanciado) passa a ser necessario.`;
  } else if (throttled) {
    detail =
      `Segurou ${ceiling} personagens, mas caiu ${sustained!.drift.toFixed(0)}% ao longo do ` +
      `estagio longo. E queda termica, nao falta de capacidade.`;
  } else {
    detail =
      `Teto medido em ${ceiling} personagens, contra ${BUDGET_CHARACTERS} previstos. ` +
      `Estagios B e C nao precisam existir.`;
  }

  return {
    passes,
    ceiling,
    headline: passes ? 'ESTAGIO A ATENDE' : 'ESTAGIO A NAO ATENDE',
    detail,
  };
}
