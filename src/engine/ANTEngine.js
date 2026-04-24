/* ============================================================
   ANT Engine — Attention Network Test
   ============================================================ */

import { delay, randomDelay, now } from '../utils/timing.js';

const ANT_CONFIG = {
  cueTypes: ['none', 'center', 'double', 'spatial'],
  flankerTypes: ['congruent', 'incongruent', 'neutral'],
  targetPositions: ['above', 'below'],
  fixationDuration: { min: 400, max: 1200 },
  cueDuration: 100,
  postCueFixation: 200,   
  maxResponseTime: 1200,  
  postTrialDuration: 400,
  countdownDuration: 600,
  trialsPerCondition: 8,   
  arrowSize: 28,
  flankerGap: 4,
  positionOffset: 80, 
};

const ARROWS = { left: '←', right: '→', dash: '—' };

function generateTrialConditions() {
  const conditions = [];
  for (const cueType of ANT_CONFIG.cueTypes) {
    for (const flankerType of ANT_CONFIG.flankerTypes) {
      for (let i = 0; i < ANT_CONFIG.trialsPerCondition; i++) {
        conditions.push({
          cueType, flankerType,
          targetDirection: Math.random() < 0.5 ? 'left' : 'right',
          targetPosition: Math.random() < 0.5 ? 'above' : 'below',
        });
      }
    }
  }
  return conditions.sort(() => Math.random() - 0.5);
}

export class ANTEngine {
  constructor() {
    this.trials = [];
    this.trialData = [];
    this.currentTrialIndex = 0;
    this.isRunning = false;
    this.skippedAt = null;
    this._resolveResponse = null;
    this.responseStartTime = 0;
    this.onStateChange = null;
    this.onTrialComplete = null;
    this.onTaskComplete = null;
    this.onCountdown = null;
  }

  async run(container) {
    this.container = container;
    this.isRunning = true;
    this.trials = generateTrialConditions();

    await this.showCountdown();
    for (this.currentTrialIndex = 0; this.currentTrialIndex < this.trials.length; this.currentTrialIndex++) {
      if (!this.isRunning) break;
      await this.runTrial(this.trials[this.currentTrialIndex]);
    }

    this.isRunning = false;
    if (this.onTaskComplete) this.onTaskComplete(this.trialData, this.skippedAt);
    return this.trialData;
  }

  async showCountdown() {
    const words = ['READY', 'SET', 'GO'];
    const classes = ['ready', 'set', 'go'];
    for (let i = 0; i < words.length; i++) {
      if (!this.isRunning) return;
      if (this.onCountdown) this.onCountdown(words[i], classes[i]);
      await delay(ANT_CONFIG.countdownDuration);
    }
  }

  async runTrial(condition) {
    if (!this.isRunning) return;
    const { cueType, flankerType, targetDirection, targetPosition } = condition;

    this.renderFixation();
    if (this.onStateChange) this.onStateChange('fixation', { trialIndex: this.currentTrialIndex, totalTrials: this.trials.length });
    await randomDelay(ANT_CONFIG.fixationDuration.min, ANT_CONFIG.fixationDuration.max);
    if (!this.isRunning) return;

    this.renderCue(cueType, targetPosition);
    await delay(ANT_CONFIG.cueDuration);
    if (!this.isRunning) return;

    this.renderFixation();
    await delay(ANT_CONFIG.postCueFixation);
    if (!this.isRunning) return;

    this.renderTarget(targetDirection, flankerType, targetPosition);
    this.responseStartTime = now();
    if (this.onStateChange) this.onStateChange('target', { trialIndex: this.currentTrialIndex, totalTrials: this.trials.length });

    const response = await this.waitForResponse(ANT_CONFIG.maxResponseTime);
    if (!this.isRunning) return;

    const record = {
      taskType: 'ant',
      trialNumber: this.currentTrialIndex + 1,
      cueType, flankerType, targetDirection, targetPosition,
      isCorrect: response.answer === targetDirection,
      reactionTimeMs: response.reactionTime,
      timestamp: Date.now(),
    };

    this.trialData.push(record);
    if (this.onTrialComplete) this.onTrialComplete(record);
    this.renderFixation();
    await delay(ANT_CONFIG.postTrialDuration);
  }

  renderFixation() {
    this.container.innerHTML = `<div class="ant-display-area"><div class="fixation-cross">+</div></div>`;
  }

  renderCue(cueType, targetPosition) {
    const offset = ANT_CONFIG.positionOffset;
    let cueHtml = '<div class="ant-display-area"><div class="fixation-cross">+</div>';
    if (cueType === 'center') cueHtml += `<div class="ant-cue" style="top:50%;left:50%;transform:translate(-50%,-50%)"></div>`;
    else if (cueType === 'double') {
      cueHtml += `<div class="ant-cue" style="top:calc(50% - ${offset}px);left:50%;transform:translate(-50%,-50%)"></div>`;
      cueHtml += `<div class="ant-cue" style="top:calc(50% + ${offset}px);left:50%;transform:translate(-50%,-50%)"></div>`;
    } else if (cueType === 'spatial') {
      const cueY = targetPosition === 'above' ? `calc(50% - ${offset}px)` : `calc(50% + ${offset}px)`;
      cueHtml += `<div class="ant-cue" style="top:${cueY};left:50%;transform:translate(-50%,-50%)"></div>`;
    }
    cueHtml += '</div>';
    this.container.innerHTML = cueHtml;
  }

  renderTarget(direction, flankerType, position) {
    const tA = ARROWS[direction];
    const fA = flankerType === 'congruent' ? tA : flankerType === 'incongruent' ? (direction === 'left' ? ARROWS.right : ARROWS.left) : ARROWS.dash;
    const top = position === 'above' ? `calc(50% - ${ANT_CONFIG.positionOffset}px)` : `calc(50% + ${ANT_CONFIG.positionOffset}px)`;
    this.container.innerHTML = `
      <div class="ant-display-area">
        <div class="fixation-cross">+</div>
        <div class="ant-display" style="top:${top};left:50%;transform:translate(-50%,-50%);display:flex;gap:4px;">
          <span class="ant-arrow">${fA}</span><span class="ant-arrow">${fA}</span>
          <span class="ant-arrow target" style="color:var(--accent-volt)">${tA}</span>
          <span class="ant-arrow">${fA}</span><span class="ant-arrow">${fA}</span>
        </div>
      </div>
    `;
  }

  waitForResponse(maxMs) {
    return new Promise(resolve => {
      let tId;
      this._resolveResponse = (answer) => {
        clearTimeout(tId);
        resolve({ answer, reactionTime: now() - this.responseStartTime });
        this._resolveResponse = null;
      };
      tId = setTimeout(() => {
        this._resolveResponse = null;
        resolve({ answer: 'none', reactionTime: maxMs });
      }, maxMs);
    });
  }

  handleResponse(dir) { if (this._resolveResponse) this._resolveResponse(dir); }

  skip() {
    this.skippedAt = Date.now();
    this.isRunning = false;
    if (this._resolveResponse) this._resolveResponse('none');
  }
}
