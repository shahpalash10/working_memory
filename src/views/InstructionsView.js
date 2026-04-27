/* ============================================================
   Instructions View — Task-specific instructions
   ============================================================ */

import { render } from '../utils/dom.js';
import { navigate, injectStyle } from '../router.js';

const TASK_INFO = {
  'vwm-pure': {
    icon: '🧠',
    title: 'VWMC Task',
    tag: 'TASK 1 OF 3',
    tagColor: '#00f0ff',
    color: '#00f0ff',
    summary: 'You will briefly see colored squares appear on screen. After a short pause, squares reappear — decide if any color <strong>changed</strong>.',
    steps: [
      'A fixation cross <strong>+</strong> appears — focus on it.',
      'Colored squares flash for a very brief moment (100ms).',
      'A blank period follows (900ms) — hold the colors in memory.',
      'One square reappears in color; the rest are empty outlines.',
      'Press <kbd>S</kbd> if that square is the <strong>SAME</strong> color as before, or <kbd>D</kbd> if it is <strong>DIFFERENT</strong>.',
      'Get <strong>2 correct in a row</strong> to advance to more squares. Start with just 1.',
    ],
    keys: [{ label: 'Same', key: 'S', color: '#34d399' }, { label: 'Different', key: 'D', color: '#f87171' }],
  },
  'vwm-distractor': {
    icon: '🎯',
    title: 'VWM Filtering Task',
    tag: 'TASK 2 OF 3',
    tagColor: '#a855f7',
    color: '#a855f7',
    summary: 'Same as before — but now <strong>gray distractor items</strong> also appear. You must <strong>completely ignore</strong> the gray items and remember only the colored ones.',
    distractor_note: true,
    steps: [
      'Colored target items AND gray distractor items appear together.',
      '<strong>Focus only on the colored items</strong> — ignore everything gray.',
      'A blank period follows — hold the target colors in memory.',
      'One target reappears in color; the rest are empty outlines.',
      'Decide if that one colored item is the SAME or DIFFERENT.',
      'Difficulty increases just like before — 2 correct → +1 colored item.',
    ],
    keys: [{ label: 'Same', key: 'S', color: '#34d399' }, { label: 'Different', key: 'D', color: '#f87171' }],
  },
  'ant': {
    icon: '⚡',
    title: 'Attention Network Test',
    tag: 'TASK 3 OF 3',
    tagColor: '#fbbf24',
    color: '#fbbf24',
    summary: 'An arrow will appear on screen, flanked by other arrows. Identify the direction of the <strong>center arrow only</strong> as fast as possible.',
    steps: [
      'A fixation cross appears in the center.',
      'Sometimes a brief circle cue will flash — indicating timing or location.',
      'An arrow target appears above or below center, surrounded by flankers.',
      'Identify only the <strong>center arrow</strong> direction — ignore flankers.',
      'Press <kbd>←</kbd> for LEFT, <kbd>→</kbd> for RIGHT.',
      'Respond as quickly and accurately as possible.',
    ],
    keys: [{ label: 'Left', key: '←', color: '#00f0ff' }, { label: 'Right', key: '→', color: '#a855f7' }],
  },
};

const NEXT_ROUTE = {
  'vwm-pure': 'task/vwm-pure',
  'vwm-distractor': 'task/vwm-distractor',
  'ant': 'task/ant',
};

export function InstructionsView(params = {}) {
  const taskKey = params.task || 'vwm-pure';
  const info = TASK_INFO[taskKey];
  if (!info) { navigate(''); return; }

  render(`
    <div class="view iv">
      <div class="iv-body">
        <div class="iv-header">
          <span class="iv-tag" style="color:${info.color};background:${info.color}18;border-color:${info.color}30;">${info.tag}</span>
          <div class="iv-icon">${info.icon}</div>
          <h1 class="iv-title">${info.title}</h1>
          <p class="iv-summary">${info.summary}</p>
        </div>

        ${info.distractor_note ? `
          <div class="iv-distractor-callout">
            <div class="iv-dist-visual">
              <div class="iv-dist-square target-sq"></div>
              <div class="iv-dist-square target-sq"></div>
              <div class="iv-dist-square distractor-sq"></div>
              <div class="iv-dist-square target-sq"></div>
              <div class="iv-dist-square distractor-sq"></div>
            </div>
            <div class="iv-dist-labels">
              <span><span class="iv-dot" style="background:#3b82f6"></span> Colored = Remember these</span>
              <span><span class="iv-dot" style="background:#6b7280;border:1px dashed #9ca3af"></span> Gray = IGNORE (distractors)</span>
            </div>
            <p class="iv-dist-tip">This task measures your ability to <strong>filter out irrelevant information</strong> while maintaining memory for relevant items.</p>
          </div>
        ` : ''}

        <div class="iv-steps-card">
          <h3 class="iv-steps-title">Step by Step</h3>
          <ol class="iv-steps">
            ${info.steps.map(s => `<li>${s}</li>`).join('')}
          </ol>
        </div>

        <div class="iv-keys">
          ${info.keys.map(k => `
            <div class="iv-key-item">
              <div class="iv-key-box" style="border-color:${k.color}55;color:${k.color}">${k.key}</div>
              <span class="iv-key-label">${k.label}</span>
            </div>
          `).join('')}
        </div>

        <button class="iv-cta" id="btn-start" style="background:linear-gradient(135deg,${info.color},${info.color}99);">
          I'm Ready — Begin →
        </button>
      </div>
    </div>
  `);

  injectStyle(`
    .iv {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      padding: 40px 24px;
    }
    .iv-body {
      max-width: 640px; width: 100%;
      display: flex; flex-direction: column; gap: 24px;
    }
    .iv-header { text-align: center; }
    .iv-tag {
      display: inline-block;
      font-family: var(--font-mono); font-size: 11px;
      letter-spacing: 0.12em; padding: 4px 14px;
      border-radius: 99px; border: 1px solid;
      margin-bottom: 20px;
    }
    .iv-icon { font-size: 2.8rem; margin-bottom: 12px; }
    .iv-title { font-size: 2rem; margin-bottom: 12px; }
    .iv-summary {
      color: var(--text-secondary); font-size: 1.05rem;
      line-height: 1.75; max-width: 540px; margin: 0 auto;
    }
    .iv-summary strong { color: var(--text-primary); }

    /* Distractor callout */
    .iv-distractor-callout {
      background: rgba(168,85,247,0.06);
      border: 1px solid rgba(168,85,247,0.25);
      border-radius: 16px;
      padding: 24px;
      text-align: center;
    }
    .iv-dist-visual {
      display: flex; align-items: center; justify-content: center;
      gap: 10px; margin-bottom: 16px;
    }
    .iv-dist-square {
      width: 36px; height: 36px; border-radius: 5px;
    }
    .target-sq    { background: #3b82f6; }
    .distractor-sq { background: #6b7280; border: 2px dashed #9ca3af; }
    .iv-dist-labels {
      display: flex; gap: 24px; justify-content: center;
      font-size: 13px; color: var(--text-secondary);
      margin-bottom: 12px;
    }
    .iv-dist-labels span { display: flex; align-items: center; gap: 8px; }
    .iv-dot { width:12px; height:12px; border-radius:3px; flex-shrink:0; display:inline-block; }
    .iv-dist-tip {
      font-size: 13px; color: var(--text-tertiary); line-height: 1.6;
    }
    .iv-dist-tip strong { color: #a855f7; }

    /* Steps */
    .iv-steps-card {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 16px;
      padding: 28px 32px;
    }
    .iv-steps-title {
      font-size: 0.8rem; font-family: var(--font-mono);
      color: var(--text-tertiary); letter-spacing: 0.1em;
      text-transform: uppercase; margin-bottom: 16px;
    }
    .iv-steps {
      counter-reset: step;
      list-style: none;
      display: flex; flex-direction: column; gap: 0;
    }
    .iv-steps li {
      counter-increment: step;
      padding: 12px 0 12px 42px;
      position: relative;
      color: var(--text-secondary);
      font-size: 0.95rem;
      line-height: 1.6;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .iv-steps li:last-child { border-bottom: none; }
    .iv-steps li::before {
      content: counter(step);
      position: absolute; left: 0; top: 12px;
      width: 26px; height: 26px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(0,240,255,0.1);
      color: var(--accent-cyan);
      font-family: var(--font-mono); font-size: 12px; font-weight: 600;
      border-radius: 6px;
    }
    .iv-steps li strong { color: var(--text-primary); }
    .iv-steps li em     { color: #a855f7; font-style: normal; font-weight: 600; }
    .iv-steps li kbd {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 22px; padding: 1px 6px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 5px;
      font-family: var(--font-mono); font-size: 13px;
      color: var(--text-primary);
    }

    /* Key indicators */
    .iv-keys {
      display: flex; gap: 20px; justify-content: center;
    }
    .iv-key-item {
      display: flex; flex-direction: column;
      align-items: center; gap: 8px;
    }
    .iv-key-box {
      width: 64px; height: 64px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.03);
      border: 2px solid;
      border-radius: 12px;
      font-family: var(--font-mono); font-size: 1.5rem; font-weight: 700;
    }
    .iv-key-label {
      font-size: 11px; color: var(--text-tertiary);
      font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.08em;
    }

    /* CTA */
    .iv-cta {
      font-family: var(--font-display); font-weight: 600;
      font-size: 1.05rem; color: #000;
      padding: 18px 24px;
      border: none; border-radius: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .iv-cta:hover { transform: translateY(-2px); box-shadow: 0 0 30px rgba(0,240,255,0.25); }
    .iv-cta:active { transform: translateY(0); }
  `);

  document.getElementById('btn-start').addEventListener('click', () => {
    navigate(NEXT_ROUTE[taskKey] || 'task/vwm-pure');
  });
}
