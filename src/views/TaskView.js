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

  render(`
    <div class="view task-view" id="task-view">
      <!-- HUD -->
      <div class="task-hud" id="task-hud">
        <div class="hud-left">
          <div class="hud-label">${taskType.toUpperCase().replace('-', ' · ')}</div>
          <div class="hud-progress-wrap">
            <div class="hud-progress-bar" id="hud-bar" style="width:0%"></div>
          </div>
        </div>
        <div class="hud-right">
          <button id="task-skip-btn" class="hud-skip-btn">Skip Section ⤑</button>
          <div class="hud-stats">
             <span id="hud-trial">TRIAL 1</span>
             <span class="hud-sep">/</span>
             <span id="hud-acc">ACC: 0%</span>
          </div>
        </div>
      </div>

      <!-- Countdown overlay -->
      <div class="countdown-wrap" id="countdown-wrap">
        <div class="countdown-word" id="countdown-word">READY</div>
      </div>

      <!-- Distractor legend -->
      ${isDistractor ? `
        <div class="distractor-legend" id="distractor-legend" style="display:none;">
          <span class="legend-item target-legend">
            <span class="legend-dot" style="background:#3b82f6"></span>
            Targets
          </span>
          <span class="legend-divider">·</span>
          <span class="legend-item distractor-legend-item">
            <span class="legend-dot" style="background:#6b7280;border:2px dashed #9ca3af"></span>
            Distractors
          </span>
        </div>
      ` : ''}

      <!-- Stimulus canvas -->
      <div class="stim-wrap" id="stim-wrap" style="display:none;">
        <div class="stim-canvas" id="stim-canvas"
          style="width:${CANVAS_SIZE}px;height:${CANVAS_SIZE}px;position:relative;">
        </div>
      </div>

      <!-- Response buttons -->
      <div class="task-response" id="task-response" style="display:none;">
        ${!isANT ? `
          <button class="resp-btn same-btn" id="btn-same">SAME <span class="resp-key">S</span></button>
          <button class="resp-btn diff-btn" id="btn-diff">DIFFERENT <span class="resp-key">D</span></button>
        ` : `
          <button class="resp-btn left-btn" id="btn-left">← LEFT <span class="resp-key">←</span></button>
          <button class="resp-btn right-btn" id="btn-right">RIGHT → <span class="resp-key">→</span></button>
        `}
      </div>
    </div>
  `);

  injectStyle(`
    .task-view { position: fixed; inset: 0; background: #000; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .task-hud { position: fixed; top: 0; left: 0; right: 0; display: flex; justify-content: space-between; align-items: center; padding: 16px 32px; background: rgba(8,8,9,0.9); border-bottom: 1px solid var(--border-dim); backdrop-filter: blur(12px); z-index: 100; }
    .hud-left { display: flex; align-items: center; gap: 24px; flex: 1; }
    .hud-label { font-family: var(--font-mono); font-size: 10px; color: var(--accent-volt); letter-spacing: 0.15em; font-weight: 700; white-space: nowrap; }
    .hud-progress-wrap { flex: 1; max-width: 300px; height: 2px; background: rgba(255,255,255,0.08); border-radius: 99px; }
    .hud-progress-bar { height: 100%; background: var(--accent-volt); border-radius: 99px; transition: width 0.3s ease; box-shadow: 0 0 10px var(--accent-volt-dim); }
    .hud-right { display: flex; align-items: center; gap: 32px; }
    .hud-stats { display: flex; align-items: center; gap: 12px; font-family: var(--font-mono); font-size: 11px; color: #5a5a5f; letter-spacing: 0.05em; }
    .hud-sep { opacity: 0.2; }
    .hud-skip-btn { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #fff; font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; padding: 6px 14px; border-radius: 4px; cursor: pointer; transition: all 0.2s; }
    .hud-skip-btn:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.25); color: var(--accent-volt); }
    .countdown-wrap { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: #000; z-index: 200; }
    .countdown-word { font-family: var(--font-display); font-weight: 700; font-size: 6rem; letter-spacing: 0.2em; text-transform: uppercase; }
    .countdown-word.ready { color: #fff; }
    .countdown-word.set   { color: #fff; }
    .countdown-word.go    { color: var(--accent-volt); text-shadow: 0 0 40px var(--accent-volt-dim); }
    .task-response { position: fixed; bottom: 60px; left: 0; right: 0; display: flex; justify-content: center; gap: 40px; z-index: 10; }
    .resp-btn { position: relative; font-family: var(--font-body); font-size: 14px; font-weight: 700; letter-spacing: 0.15em; padding: 20px 60px; background: transparent; border: 1px solid rgba(255,255,255,0.15); color: #fff; cursor: pointer; transition: all 0.15s cubic-bezier(0.2, 0, 0, 1); }
    .resp-btn:hover { transform: translateY(-3px); border-color: var(--accent-volt); color: var(--accent-volt); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .resp-key { position: absolute; top: -10px; right: 10px; background: #1a1a1c; border: 1px solid rgba(255,255,255,0.1); padding: 2px 8px; font-size: 10px; font-family: var(--font-mono); color: #5a5a5f; }
    .task-fixation { color: var(--accent-volt); font-family: var(--font-mono); font-size: 32px; opacity: 0.5; }
    .distractor-legend { position: fixed; top: 80px; display: flex; gap: 20px; font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; color: #5a5a5f; }
    .legend-dot { width: 8px; height: 8px; border-radius: 1px; display: inline-block; margin-right: 6px; }
  `);

  if (isANT) {
    runANT($('#countdown-wrap'), $('#countdown-word'), $('#stim-wrap'), $('#stim-canvas'), $('#task-response'), $('#hud-trial'), $('#hud-acc'), $('#hud-bar'), $('#task-skip-btn'));
  } else {
    runVWM(taskType, isDistractor, $('#countdown-wrap'), $('#countdown-word'), $('#stim-wrap'), $('#stim-canvas'), $('#task-response'), $('#hud-trial'), $('#hud-acc'), $('#hud-bar'), isDistractor ? $('#distractor-legend') : null, $('#task-skip-btn'));
  }
}

function runVWM(taskType, isDistractor, cdWrap, cdWord, stimWrap, canvas, responseArea, hudTrial, hudAcc, hudBar, legendEl, skipBtn) {
  const engine = new TaskEngine({ taskType, withDistractors: isDistractor });
  let keyHandler;
  let needsResponse = false;
  let correct = 0;
  let total = 0;

  skipBtn.addEventListener('click', () => { if (confirm('Skip this section? Progress will be saved.')) engine.skip(); });

  engine.onCountdown = (word, cls) => {
    cdWrap.style.display = 'flex';
    stimWrap.style.display = 'none';
    responseArea.style.display = 'none';
    cdWord.textContent = word;
    cdWord.className = `countdown-word ${cls}`;
  };

  engine.onPhase = (phase, meta) => {
    if (phase === 'blank' || phase === 'retention' || phase === 'stimulus') {
      cdWrap.style.display = 'none';
      stimWrap.style.display = 'flex';
      responseArea.style.display = 'none';
      if (legendEl) legendEl.style.display = (phase === 'stimulus' ? 'flex' : 'none');
      needsResponse = false;
    } else if (phase === 'probe') {
      responseArea.style.display = 'flex';
      needsResponse = true;
    } else {
      responseArea.style.display = 'none';
      needsResponse = false;
    }
    
    hudBar.style.width = `${(meta.trialNum / engine.maxTrials) * 100}%`;
    hudTrial.textContent = `TRIAL ${meta.trialNum + 1}`;
  };

  engine.onTrial = (record) => {
    total++;
    if (record.isCorrect) correct++;
    hudAcc.textContent = `ACC: ${Math.round((correct/total)*100)}%`;
    const session = Storage.getCurrentSession();
    if (session) { session.trials.push(record); Storage.saveCurrentSession(session); }
  };

  engine.onDone = (trials, skippedAt) => {
    document.removeEventListener('keydown', keyHandler);
    const session = Storage.getCurrentSession();
    if (session && skippedAt) {
      if (!session.metadata) session.metadata = {};
      if (!session.metadata.skips) session.metadata.skips = {};
      session.metadata.skips[taskType] = skippedAt;
      Storage.saveCurrentSession(session);
    }
    if (taskType === 'vwm-pure') navigate('transition', { next: 'vwm-distractor' });
    else navigate('transition', { next: 'ant' });
  };

  keyHandler = (e) => {
    if (!needsResponse) return;
    if (e.key.toLowerCase() === 's') engine.respond('same');
    if (e.key.toLowerCase() === 'd') engine.respond('different');
  };
  document.addEventListener('keydown', keyHandler);
  
  $('#btn-same').addEventListener('click', () => { if (needsResponse) engine.respond('same'); });
  $('#btn-diff').addEventListener('click', () => { if (needsResponse) engine.respond('different'); });

  engine.run(canvas);
}

function runANT(cdWrap, cdWord, stimWrap, canvas, responseArea, hudTrial, hudAcc, hudBar, skipBtn) {
  const engine = new ANTEngine();
  let keyHandler;
  let correct = 0;
  let total = 0;

  skipBtn.addEventListener('click', () => { if (confirm('Skip this section? Progress will be saved.')) engine.skip(); });

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
    responseArea.style.display = (state === 'target' ? 'flex' : 'none');
    hudBar.style.width = `${(data.trialIndex / data.totalTrials) * 100}%`;
    hudTrial.textContent = `TRIAL ${data.trialIndex + 1}`;
  };

  engine.onTrialComplete = (record) => {
    total++;
    if (record.isCorrect) correct++;
    hudAcc.textContent = `ACC: ${Math.round((correct/total)*100)}%`;
    const session = Storage.getCurrentSession();
    if (session) { session.trials.push(record); Storage.saveCurrentSession(session); }
  };

  engine.onTaskComplete = (trials, skippedAt) => {
    document.removeEventListener('keydown', keyHandler);
    const session = Storage.getCurrentSession();
    if (session && skippedAt) {
      if (!session.metadata) session.metadata = {};
      if (!session.metadata.skips) session.metadata.skips = {};
      session.metadata.skips['ant'] = skippedAt;
      Storage.saveCurrentSession(session);
    }
    navigate('complete');
  };

  keyHandler = (e) => {
    if (e.key === 'ArrowLeft') engine.handleResponse('left');
    if (e.key === 'ArrowRight') engine.handleResponse('right');
  };
  document.addEventListener('keydown', keyHandler);

  $('#btn-left').addEventListener('click', () => engine.handleResponse('left'));
  $('#btn-right').addEventListener('click', () => engine.handleResponse('right'));

  engine.run(canvas);
}
