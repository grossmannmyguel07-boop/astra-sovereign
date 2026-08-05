import {
  BUDGET_CHARACTERS,
  PROTOCOL,
  TARGET_FPS,
  judge,
  type StageResult,
} from '@/bench/harness';

/**
 * Telas do benchmark: introducao, progresso e resultado.
 *
 * Dono: **Debug Agent**.
 *
 * Tudo em DOM/CSS, por `CLAUDE.md`. Aqui isso vale duplo: o resultado precisa
 * ser **legivel num print de iPhone em paisagem**, porque e assim que o numero
 * volta para o desenvolvimento. Texto desenhado no canvas ficaria refem da
 * resolucao e do DPR que estamos justamente medindo.
 */

const MONO = 'ui-monospace,SFMono-Regular,Menlo,monospace';

function panel(): HTMLDivElement {
  const element = document.createElement('div');
  element.style.cssText = [
    'position:fixed',
    'inset:0',
    'display:flex',
    'flex-direction:column',
    'z-index:60',
    'background:#05060f',
    'padding:calc(10px + var(--safe-top)) calc(12px + var(--safe-right))',
    'padding-bottom:calc(10px + var(--safe-bottom))',
    `font-family:${MONO}`,
  ].join(';');
  return element;
}

/** Tela inicial. Existe porque a medicao nao pode comecar sem um toque. */
export function showIntro(estimateMs: number, onStart: () => void): void {
  const root = panel();
  root.style.alignItems = 'center';
  root.style.justifyContent = 'center';
  root.style.gap = '18px';
  root.style.textAlign = 'center';

  const minutes = Math.ceil(estimateMs / 60_000);

  const title = document.createElement('div');
  title.textContent = 'BENCHMARK DE ANIMACAO';
  title.style.cssText = 'font-weight:600;font-size:16px;line-height:1.2;letter-spacing:0.16em;color:#8fa4ff';

  const body = document.createElement('div');
  body.style.cssText = 'font-weight:400;font-size:12px;line-height:1.8;color:#7d88b4;max-width:520px';
  body.innerHTML = [
    `Mede quantos personagens animados por esqueleto o aparelho sustenta a ${TARGET_FPS}fps.`,
    `Duracao: cerca de <b style="color:#bcc8ff">${minutes} minutos</b>.`,
    'Deixe a tela ligada e <b style="color:#bcc8ff">nao troque de app</b> — sair do Safari pausa o navegador e invalida a medicao.',
    'No fim, tire um print da tabela.',
  ]
    .map((line) => `<div>${line}</div>`)
    .join('');

  const button = document.createElement('button');
  button.textContent = 'INICIAR';
  button.style.cssText = [
    'margin-top:6px',
    'padding:13px 34px',
    'font-weight:600;font-size:13px',
    'letter-spacing:0.14em',
    'color:#05060f',
    'background:#8fa4ff',
    'border:0',
    'border-radius:9px',
  ].join(';');
  button.addEventListener('click', () => {
    root.remove();
    onStart();
  });

  root.append(title, body, button);
  document.body.appendChild(root);
}

/**
 * Barra de progresso durante a medicao.
 *
 * Nao e enfeite: sem retorno visivel, tres minutos parado parecem travamento, e
 * o teste morre porque alguem fechou a aba.
 */
export class Progress {
  private root = panel();
  private label = document.createElement('div');
  private bar = document.createElement('div');
  private fill = document.createElement('div');

  constructor() {
    this.root.style.cssText += ';justify-content:flex-end;gap:8px;pointer-events:none';
    this.root.style.background = 'transparent';

    this.label.style.cssText = 'font-weight:600;font-size:11px;color:#8fa4ff;letter-spacing:0.08em';
    this.bar.style.cssText =
      'height:4px;background:rgba(143,164,255,0.16);border-radius:2px;overflow:hidden';
    this.fill.style.cssText = 'height:100%;width:0%;background:#8fa4ff';

    this.bar.appendChild(this.fill);
    this.root.append(this.label, this.bar);
    document.body.appendChild(this.root);
  }

  update(text: string, fraction: number): void {
    this.label.textContent = text;
    this.fill.style.width = `${(fraction * 100).toFixed(1)}%`;
  }

  dispose(): void {
    this.root.remove();
  }
}

/** Tabela final. Tudo aqui existe para caber num print de 844x390. */
export function showResults(
  results: StageResult[],
  meta: Record<string, string>,
  interrupted = false
): void {
  const verdict = judge(results);
  const root = panel();
  root.style.gap = '5px';

  // Uma medicao interrompida nao e uma medicao ruim -- e uma nao-medicao. Sair
  // do Safari congela o `requestAnimationFrame`, e o frame de retorno entra na
  // amostra como um pico de segundos. Melhor dizer "refaca" do que entregar um
  // veredito que parece reprovar a tecnica quando reprovou o teste.
  if (interrupted) {
    const warning = document.createElement('div');
    warning.textContent =
      'MEDICAO INVALIDA — o app saiu de primeiro plano durante a execucao. Refaca sem trocar de app.';
    warning.style.cssText = [
      'padding:6px 9px',
      'font-weight:600;font-size:10px',
      'color:#05060f',
      'background:#ff8f6b',
      'border-radius:6px',
    ].join(';');
    root.appendChild(warning);
  }

  const headline = document.createElement('div');
  headline.style.cssText = [
    'display:flex',
    'align-items:baseline',
    'gap:10px',
    'flex-wrap:wrap',
    `color:${verdict.passes ? '#76e0c2' : '#ff8f6b'}`,
  ].join(';');
  headline.innerHTML =
    `<span style="font-weight:700;font-size:15px;letter-spacing:0.1em">${verdict.headline}</span>` +
    `<span style="font-weight:400;font-size:10px;color:#7d88b4">${verdict.detail}</span>`;

  const table = document.createElement('table');
  table.style.cssText =
    'width:100%;border-collapse:collapse;font-weight:400;font-size:11px;line-height:1.1;color:#c9d2f0';

  const columns = ['N', 'tecnica', 'fps', 'p50', 'p95', 'pior', 'js', 'draws', 'tris', 'MB', 'drift'];
  const head = document.createElement('tr');
  for (const column of columns) {
    const cell = document.createElement('th');
    cell.textContent = column;
    cell.style.cssText =
      'text-align:right;padding:2px 4px;color:#5f6b96;font-weight:600;border-bottom:1px solid #232b52';
    head.appendChild(cell);
  }
  table.appendChild(head);

  const budgetMs = 1000 / TARGET_FPS;
  for (const stage of results) {
    const row = document.createElement('tr');
    // Verde quando o p95 cabe no orcamento de frame; vermelho quando nao.
    // Julgar pelo p95 e nao pela media e deliberado: media esconde engasgo.
    const ok = stage.p95 <= budgetMs * 1.05;
    const cells = [
      String(stage.characters),
      stage.sustained ? `${stage.technique} 60s` : stage.technique,
      stage.fps.toFixed(0),
      stage.p50.toFixed(1),
      stage.p95.toFixed(1),
      stage.worst.toFixed(0),
      stage.jsMs.toFixed(2),
      String(stage.draws),
      // Espaco fino como separador, nao ponto: "8.800" num print le como 8,8 e
      // ja me confundiu uma vez lendo a propria tabela.
      String(stage.triangles).replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
      (stage.bytes / 1_048_576).toFixed(2),
      `${stage.drift >= 0 ? '+' : ''}${stage.drift.toFixed(0)}%`,
    ];
    cells.forEach((text, i) => {
      const cell = document.createElement('td');
      cell.textContent = text;
      const highlight = i === 2 || i === 4;
      cell.style.cssText = [
        'text-align:right',
        'padding:2px 4px',
        'border-bottom:1px solid #12162e',
        highlight ? `color:${ok ? '#76e0c2' : '#ff8f6b'}` : '',
        stage.sustained ? 'background:rgba(143,164,255,0.06)' : '',
      ].join(';');
      row.appendChild(cell);
    });
    table.appendChild(row);
  }

  // A tabela pode encolher e rolar; o rodape nunca sai da tela. Sem isto,
  // acrescentar um degrau na escada empurraria a linha da GPU e da versao de
  // protocolo para fora do print -- e sem elas a medicao nao se compara com
  // nenhuma outra, que e o proposito da ferramenta.
  const scroller = document.createElement('div');
  scroller.style.cssText = 'flex:1;min-height:0;overflow:auto';
  scroller.appendChild(table);

  const footer = document.createElement('div');
  footer.style.cssText =
    'display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-weight:400;font-size:9px;line-height:1.4;color:#5f6b96;flex-shrink:0;padding-top:3px';
  footer.innerHTML =
    Object.entries(meta)
      .map(([key, value]) => `<span>${key} <b style="color:#8b96c4">${value}</b></span>`)
      .join('') +
    `<span>protocolo <b style="color:#8b96c4">v${PROTOCOL}</b></span>` +
    `<span>orcamento <b style="color:#8b96c4">${BUDGET_CHARACTERS} @ ${TARGET_FPS}fps</b></span>`;

  const copy = document.createElement('button');
  copy.textContent = 'copiar JSON';
  copy.style.cssText = [
    'padding:5px 10px',
    'font-weight:600;font-size:9px',
    'color:#9fb0e0',
    'background:rgba(143,164,255,0.1)',
    'border:1px solid #2b3560',
    'border-radius:6px',
  ].join(';');
  copy.addEventListener('click', () => {
    const payload = JSON.stringify({ protocol: PROTOCOL, verdict, meta, results }, null, 2);
    navigator.clipboard?.writeText(payload).then(
      () => (copy.textContent = 'copiado'),
      () => (copy.textContent = 'falhou — use o print')
    );
  });
  footer.appendChild(copy);

  root.append(headline, scroller, footer);
  document.body.appendChild(root);
}
