/* ============================================================
   Task View — Full-screen immersive task runner
   ============================================================ */

import { render, $ } from '../utils/dom.js';
import { Storage } from '../utils/storage.js';
import { TaskEngine } from '../engine/TaskEngine.js';
import { ANTEngine } from '../engine/ANTEngine.js';
import { navigate, injectStyle } from '../router.js';
import { CANVAS_SIZE, ITEM_SIZE } from '../engine/StimulusGenerator.js';

export function TaskView(taskType = 'vwm-pure') {
  const isANT = taskType === 'ant';
  const isDistractor = taskType === 'vwm-distractor';

  // Full-screen black task environment
  render(`
    <div class="view task-view" id="task-view">
      <!-- HUD -->
      <div class="task-hud" id="task-hud">
        <div class="task-hud-label" id="hud-label">
          ${isANT ? 'ATTENTION · NETWORK · TEST' : isDistractor ? 'VWM · DISTRACTOR' : 'VWM · PURE'}
        </div>
        <div class="task-hud-progress">
          <div class="task-hud-bar" id="hud-bar" style="width:0%"></div>
        </div>
        <div class="task-hud-trial" id="hud-trial">—</div>
      </div>

      <!-- Countdown overlay -->
      <div class="countdown-wrap" id="countdown-wrap">
        <div class="countdown-word" id="countdown-word">READY</div>
      </div>

      <!-- Distractor legend (only shown for distractor task during probe) -->
      ${isDistractor ? `
        <div class="distractor-legend" id="distractor-legend" style="display:none;">
          <span class="legend-item target-legend">
            <span class="legend-dot" style="background:#3b82f6"></span>
            Remember these
          </span>
          <span class="legend-divider">·</span>
          <span class="legend-item distractor-legend-item">
            <span class="legend-dot" style="background:#6b7280;border:2px dashed #9ca3af"></span>
            Ignore these (distractors)
          </span>
        </div>
      ` : ''}

      <!-- Stimulus canvas -->
      <div class="stim-wrap" id="stim-wrap" style="display:none;">
        <div class="stim-canvas" id="stim-canvas"
          style="width:${CANVAS_SIZE}px;height:${CANVAS_SIZE}px;position:relative;">
        </div>
      </div>

      <!-- Response buttons (VWM) -->
      ${!isANT ? `
        <div class="task-response" id="task-response" style="display:none;">
          <button class="resp-btn same-btn" id="btn-same">
            SAME
            <span class="resp-key">S</span>
          </button>
          <button class="resp-btn diff-btn" id="btn-diff">
            DIFFERENT
            <span class="resp-key">D</span>
          </button>
        </div>
      ` : `
        <div class="task-response" id="task-response" style="display:none;">
          <button class="resp-btn left-btn" id="btn-left">
            ← LEFT
            <span class="resp-key">←</span>
          </button>
          <button class="resp-btn right-btn" id="btn-right">
            RIGHT →
            <span class="resp-key">→</span>
          </button>
        </div>
      `}
    </div>
  `);

  injectStyle(`
    .task-view {
      position: fixed;
      inset: 0;
      background: #000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      user-select: none;
    }

    /* HUD */
    .task-hud {
      position: fixed;
      top: 0; left: 0; right: 0;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 20px;
      background: rgba(0,0,0,0.8);
      z-index: 10;
    }
    .task-hud-label {
      font-family: var(--font-mono);
      font-size: 11px;
      color: rgba(255,255,255,0.35);
      letter-spacing: 0.12em;
      white-space: nowrap;
    }
    .task-hud-progress {
      flex: 1;
      height: 2px;
      background: rgba(255,255,255,0.08);
      border-radius: 999px;
      overflow: hidden;
    }
    .task-hud-bar {
      height: 100%;
      background: linear-gradient(90deg, #00f0ff, #a855f7);
      border-radius: 999px;
      transition: width 0.3s ease;
    }
    .task-hud-trial {
      font-family: var(--font-mono);
      font-size: 11px;
      color: rgba(255,255,255,0.35);
      letter-spacing: 0.06em;
      white-space: nowrap;
    }

    /* Countdown */
    .countdown-wrap {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000;
      z-index: 20;
    }
    .countdown-word {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 5rem;
      letter-spacing: 0.15em;
      animation: cdPop 0.65s ease-out;
    }
    .countdown-word.ready  { color: #00f0ff; }
    .countdown-word.set    { color: #a855f7; }
    .countdown-word.go     { color: #34d399; }
    @keyframes cdPop {
      0%   { opacity:0; transform:scale(0.4); }
      60%  { opacity:1; transform:scale(1.12); }
      100% { opacity:1; transform:scale(1); }
    }

    /* Distractor legend */
    .distractor-legend {
      position: fixed;
      top: 48px; left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 16px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 99px;
      padding: 6px 20px;
      z-index: 10;
      font-size: 12px;
      color: rgba(255,255,255,0.5);
      font-family: var(--font-mono);
      letter-spacing: 0.04em;
    }
    .legend-item { display:flex; align-items:center; gap:8px; }
    .legend-dot  { width:14px; height:14px; border-radius:3px; flex-shrink:0; }
    .legend-divider { opacity:0.3; }

    /* Stim canvas */
    .stim-wrap { display:flex; align-items:center; justify-content:center; }
    .stim-canvas { position:relative; }

    /* Fixation cross */
    .task-fixation {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      font-size: 2rem;
      color: rgba(255,255,255,0.7);
      font-family: var(--font-mono);
    }

    /* Feedback */
    .task-feedback {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      font-size: 3.5rem;
      font-family: var(--font-display);
      font-weight: 700;
      animation: fbFlash 0.4s ease-out forwards;
    }
    .task-feedback.correct   { color: #34d399; }
    .task-feedback.incorrect { color: #f87171; }
    @keyframes fbFlash {
      0%   { opacity:0; transform:translate(-50%,-50%) scale(0.6); }
      40%  { opacity:1; transform:translate(-50%,-50%) scale(1.1); }
      100% { opacity:0.8; transform:translate(-50%,-50%) scale(1); }
    }

    /* Response buttons */
    .task-response {
      position: fixed;
      bottom: 40px; left: 0; right: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 32px;
    }
    .resp-btn {
      position: relative;
      font-family: var(--font-display);
      font-size: 1rem;
      font-weight: 700;
      padding: 16px 48px;
      border: 2px solid;
      border-radius: 12px;
      cursor: pointer;
      letter-spacing: 0.1em;
      min-width: 180px;
      transition: all 0.12s ease;
      outline: none;
    }
    .resp-btn:hover  { transform: translateY(-2px); }
    .resp-btn:active { transform: translateY(0); }
    .resp-key {
      position: absolute;
      top: -8px; right: -8px;
      font-size: 10px;
      font-family: var(--font-mono);
      background: rgba(255,255,255,0.12);
      padding: 2px 6px;
      border-radius: 99px;
      letter-spacing: 0;
    }
    .same-btn  {
      background: rgba(52,211,153,0.10);
      border-color: rgba(52,211,153,0.4);
      color: #34d399;
    }
    .same-btn:hover  { background:rgba(52,211,153,0.20); border-color:#34d399; box-shadow:0 0 20px rgba(52,211,153,0.2); }
    .diff-btn  {
      background: rgba(248,113,113,0.10);
      border-color: rgba(248,113,113,0.4);
      color: #f87171;
    }
    .diff-btn:hover  { background:rgba(248,113,113,0.20); border-color:#f87171; box-shadow:0 0 20px rgba(248,113,113,0.2); }
    .left-btn  {
      background: rgba(0,240,255,0.10);
      border-color: rgba(0,240,255,0.4);
      color: #00f0ff;
    }
    .left-btn:hover  { background:rgba(0,240,255,0.20); border-color:#00f0ff; }
    .right-btn {
      background: rgba(168,85,247,0.10);
      border-color: rgba(168,85,247,0.4);
      color: #a855f7;
    }
    .right-btn:hover { background:rgba(168,85,247,0.20); border-color:#a855f7; }

    /* Stim items */
    .stim-item {
      position: absolute;
      border-radius: 6px;
    }
    .stim-item.circle     { border-radius: 50%; }
    .stim-item.empty-frame {
      background: transparent !important;
      border: 2px solid rgba(255,255,255,0.3) !important;
      box-shadow: none !important;
    }
    .stim-item.distractor {
      opacity: 0.82;
    }
  `);

  if (isANT) {
    runANT($('#countdown-wrap'), $('#countdown-word'), $('#stim-wrap'), $('#stim-canvas'), $('#task-response'), $('#hud-trial'), $('#hud-bar'));
  } else {
    runVWM(taskType, isDistractor, $('#countdown-wrap'), $('#countdown-word'), $('#stim-wrap'), $('#stim-canvas'), $('#task-response'), $('#hud-trial'), $('#hud-bar'), isDistractor ? $('#distractor-legend') : null);
  }
}

/* ============ VWM Runner ============ */
function runVWM(taskType, isDistractor, cdWrap, cdWord, stimWrap, canvas, responseArea, hudTrial, hudBar, legendEl) {
  const engine = new TaskEngine({ taskType, withDistractors: isDistractor, shape: 'square' });
  let keyHandler;
  let needsResponse = false;

  engine.onCountdown = (word, cls) => {
    cdWrap.style.display = 'flex';
    stimWrap.style.display = 'none';
    responseArea.style.display = 'none';
    cdWord.textContent = word;
    cdWord.className = `countdown-word ${cls}`;
  };

  engine.onPhase = (phase, meta) => {
    switch (phase) {
      case 'blank':
      case 'retention':
        cdWrap.style.display = 'none';
        stimWrap.style.display = 'flex';
        responseArea.style.display = 'none';
        if (legendEl) legendEl.style.display = 'none';
        needsResponse = false;
        break;
      case 'stimulus':
        cdWrap.style.display = 'none';
        stimWrap.style.display = 'flex';
        responseArea.style.display = 'none';
        if (legendEl) legendEl.style.display = 'flex';
        needsResponse = false;
        break;
      case 'probe':
        responseArea.style.display = 'flex';
        needsResponse = true;
        if (legendEl) legendEl.style.display = 'none';
        break;
      case 'feedback':
        responseArea.style.display = 'none';
        needsResponse = false;
        break;
    }

    // HUD
    const progress = Math.min(100, (meta.trialNum / engine.maxTrials) * 100);
    hudBar.style.width = `${progress}%`;
    hudTrial.textContent = `TRIAL ${meta.trialNum + 1} · N=${meta.setSize} · STREAK ${meta.streak}`;
  };

  engine.onTrial = (record) => {
    const session = Storage.getCurrentSession();
    if (session) {
      session.trials.push(record);
      Storage.saveCurrentSession(session);
    }
  };

  engine.onDone = () => {
    cleanup();
    if (taskType === 'vwm-pure') {
      navigate('transition', { next: 'vwm-distractor' });
    } else {
      navigate('transition', { next: 'ant' });
    }
  };

  // Button handlers
  const btnSame = $('#btn-same');
  const btnDiff = $('#btn-diff');
  if (btnSame) btnSame.addEventListener('click', () => { if (needsResponse) engine.respond('same'); });
  if (btnDiff) btnDiff.addEventListener('click', () => { if (needsResponse) engine.respond('different'); });

  keyHandler = (e) => {
    if (!needsResponse) return;
    if (e.key === 's' || e.key === 'S') { engine.respond('same'); }
    if (e.key === 'd' || e.key === 'D') { engine.respond('different'); }
  };
  document.addEventListener('keydown', keyHandler);

  function cleanup() {
    document.removeEventListener('keydown', keyHandler);
  }

  engine.run(canvas);
}

/* ============ ANT Runner ============ */
function runANT(cdWrap, cdWord, stimWrap, canvas, responseArea, hudTrial, hudBar) {
  const engine = new ANTEngine();
  let keyHandler;
  let needsResponse = false;

  engine.onCountdown = (word, cls) => {
    cdWrap.style.display = 'flex';
    stimWrap.style.display = 'none';
    responseArea.style.display = 'none';
    cdWord.textContent = word;
    cdWord.className = `countdown-word ${cls}`;
  };

  engine.onStateChange = (state, data) => {
    cdWrap.style.display = 'none';
    stimWrap.style.display = 'flex';

    if (state === 'target') {
      responseArea.style.display = 'flex';
      needsResponse = true;
    } else {
      responseArea.style.display = 'none';
      needsResponse = false;
    }

    const progress = (data.trialIndex / Math.max(1, data.totalTrials)) * 100;
    hudBar.style.width = `${progress}%`;
    hudTrial.textContent = `TRIAL ${data.trialIndex + 1} / ${data.totalTrials}`;
  };

  engine.onTrialComplete = (record) => {
    const session = Storage.getCurrentSession();
    if (session) {
      session.trials.push(record);
      Storage.saveCurrentSession(session);
    }
  };

  engine.onTaskComplete = () => {
    document.removeEventListener('keydown', keyHandler);
    navigate('complete');
  };

  const btnLeft = $('#btn-left');
  const btnRight = $('#btn-right');
  if (btnLeft) btnLeft.addEventListener('click', () => { if (needsResponse) engine.handleResponse('left'); });
  if (btnRight) btnRight.addEventListener('click', () => { if (needsResponse) engine.handleResponse('right'); });

  keyHandler = (e) => {
    if (!needsResponse) return;
    if (e.key === 'ArrowLeft')  engine.handleResponse('left');
    if (e.key === 'ArrowRight') engine.handleResponse('right');
  };
  document.addEventListener('keydown', keyHandler);

  engine.run(canvas);
}
