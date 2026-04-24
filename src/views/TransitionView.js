/* ============================================================
   Transition View — Rest screen between tasks
   ============================================================ */

import { render } from '../utils/dom.js';
import { navigate, injectStyle } from '../router.js';

const NEXT_INFO = {
  'vwm-distractor': {
    number: 2, total: 3,
    icon: '🎯',
    title: 'Working Memory + Distractors',
    desc: 'Same memory task — but gray distractor items will appear alongside the colored targets. Your job: ignore everything gray, remember only the colors.',
    color: '#a855f7',
  },
  'ant': {
    number: 3, total: 3,
    icon: '⚡',
    title: 'Attention Network Test',
    desc: 'A completely different task. Identify the direction of a central arrow as fast as possible, while ignoring surrounding flanker arrows.',
    color: '#fbbf24',
  },
};

export function TransitionView(params = {}) {
  const next = params.next || 'vwm-distractor';
  const info = NEXT_INFO[next] || NEXT_INFO['vwm-distractor'];

  render(`
    <div class="view trv">
      <div class="trv-body">
        <svg class="trv-check" width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="38" stroke="#34d399" stroke-width="2" fill="rgba(52,211,153,0.08)"/>
          <path d="M24 40L35 51L56 30" stroke="#34d399" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="trv-path"/>
        </svg>

        <h2 class="trv-title">Task Complete!</h2>
        <p class="trv-sub">Take a short breath. Continue whenever you feel ready.</p>

        <div class="trv-card" style="border-color:${info.color}22">
          <div class="trv-card-head">
            <span class="trv-badge" style="color:${info.color};background:${info.color}15;border-color:${info.color}30;">UP NEXT</span>
            <span class="trv-prog">${info.number} of ${info.total}</span>
          </div>
          <div class="trv-icon">${info.icon}</div>
          <h3 class="trv-card-title">${info.title}</h3>
          <p class="trv-card-desc">${info.desc}</p>
          <div class="trv-bar-wrap">
            <div class="trv-bar">
              <div class="trv-bar-fill" style="width:${((info.number - 1) / info.total) * 100}%;background:${info.color}"></div>
            </div>
            <span class="trv-bar-label">${info.number - 1}/${info.total} complete</span>
          </div>
        </div>

        <button class="trv-cta" id="btn-continue" style="background:linear-gradient(135deg,${info.color},${info.color}99);">
          Continue →
        </button>
      </div>
    </div>
  `);

  injectStyle(`
    .trv {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      padding: 40px 24px;
    }
    .trv-body {
      max-width: 520px; width: 100%;
      text-align: center;
      display: flex; flex-direction: column; align-items: center; gap: 24px;
    }
    .trv-check { animation: scale-in 0.4s ease-out; }
    .trv-path  { stroke-dasharray: 55; stroke-dashoffset: 55; animation: drawPath 0.5s ease-out 0.3s forwards; }
    @keyframes drawPath { to { stroke-dashoffset: 0; } }

    .trv-title { font-size: 2.2rem; color: #34d399; margin-bottom: 4px; }
    .trv-sub   { color: var(--text-secondary); font-size: 1rem; }

    .trv-card {
      width: 100%;
      background: rgba(255,255,255,0.02);
      border: 1px solid;
      border-radius: 20px;
      padding: 28px 32px;
      text-align: left;
    }
    .trv-card-head {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 16px;
    }
    .trv-badge {
      font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em;
      padding: 3px 12px; border-radius: 99px; border: 1px solid;
    }
    .trv-prog {
      font-family: var(--font-mono); font-size: 11px;
      color: var(--text-tertiary);
    }
    .trv-icon        { font-size: 2rem; margin-bottom: 10px; }
    .trv-card-title  { font-size: 1.15rem; margin-bottom: 8px; }
    .trv-card-desc   { color: var(--text-secondary); font-size: 0.9rem; line-height: 1.65; margin-bottom: 20px; }
    .trv-bar-wrap    { display: flex; align-items: center; gap: 10px; }
    .trv-bar         { flex: 1; height: 4px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden; }
    .trv-bar-fill    { height: 100%; border-radius: 99px; }
    .trv-bar-label   { font-family: var(--font-mono); font-size: 10px; color: var(--text-tertiary); white-space: nowrap; }

    .trv-cta {
      font-family: var(--font-display); font-weight: 600;
      font-size: 1.05rem; color: #000;
      padding: 16px 48px; min-width: 260px;
      border: none; border-radius: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .trv-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.3); }
  `);

  document.getElementById('btn-continue').addEventListener('click', () => {
    navigate('instructions', { task: next });
  });
}
