/* ============================================================
   ANT Engine — Attention Network Test
   ============================================================
   Based on Fan et al. (2002).
   Combines Posner cueing with Eriksen flanker task to measure:
   - Alerting: ability to maintain vigilance
   - Orienting: shifting attention spatially
   - Executive Control: resolving conflict
   ============================================================ */

import { delay, randomDelay, now } from '../utils/timing.js';

/**
 * ANT Configuration
 */
const ANT_CONFIG = {
  // Cue types
  cueTypes: ['none', 'center', 'double', 'spatial'],
  // Flanker types
  flankerTypes: ['congruent', 'incongruent', 'neutral'],
  // Target can appear above or below fixation
  targetPositions: ['above', 'below'],
  // Timing (ms)
  fixationDuration: { min: 400, max: 1200 },
  cueDuration: 100,
  postCueFixation: 200,   // Shorter delay = faster reaction required
  maxResponseTime: 1200,  // Tightening the window
  postTrialDuration: 400,
  countdownDuration: 600,
  // Trial counts
  trialsPerCondition: 8,   // 4 cues × 3 flankers = 12 conditions × 8 = 96 trials
  // Display
  arrowSize: 28,
  flankerGap: 4,
  positionOffset: 80, // px from center for above/below
};

/**
 * Arrow characters
 */
const ARROWS = {
  left: '←',
  right: '→',
  dash: '—', // neutral flanker
};

/**
 * Generate all ANT trial conditions
 * @returns {Object[]} Shuffled trial conditions
 */
function generateTrialConditions() {
  const conditions = [];

  for (const cueType of ANT_CONFIG.cueTypes) {
    for (const flankerType of ANT_CONFIG.flankerTypes) {
      for (let i = 0; i < ANT_CONFIG.trialsPerCondition; i++) {
        const targetDirection = Math.random() < 0.5 ? 'left' : 'right';
        const targetPosition = Math.random() < 0.5 ? 'above' : 'below';

        conditions.push({
          cueType,
          flankerType,
          targetDirection,
          targetPosition,
        });
      }
    }
  }

  // Shuffle
  for (let i = conditions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [conditions[i], conditions[j]] = [conditions[j], conditions[i]];
  }

  return conditions;
}

export class ANTEngine {
  constructor() {
    this.trials = [];
    this.trialData = [];
    this.currentTrialIndex = 0;
    this.isRunning = false;
    this.aborted = false;
    this._resolveResponse = null;
    this.responseStartTime = 0;

    // Callbacks
    this.onStateChange = null;
    this.onTrialComplete = null;
    this.onTaskComplete = null;
    this.onCountdown = null;

    // DOM
    this.container = null;
  }

  /**
   * Run the complete ANT
   * @param {HTMLElement} container
   * @returns {Object[]} Trial data
   */
  async run(container) {
    this.container = container;
    this.isRunning = true;
    this.aborted = false;
    this.trials = generateTrialConditions();
    this.trialData = [];

    // Countdown
    await this.showCountdown();

    // Run all trials
    for (this.currentTrialIndex = 0; this.currentTrialIndex < this.trials.length; this.currentTrialIndex++) {
      if (this.aborted) break;
      await this.runTrial(this.trials[this.currentTrialIndex]);
    }

    this.isRunning = false;

    if (this.onTaskComplete) {
      this.onTaskComplete(this.trialData);
    }

    return this.trialData;
  }

  /**
   * Show Ready-Set-Go countdown
   */
  async showCountdown() {
    const words = ['READY', 'SET', 'GO'];
    const classes = ['ready', 'set', 'go'];

    for (let i = 0; i < words.length; i++) {
      if (this.aborted) return;
      if (this.onCountdown) {
        this.onCountdown(words[i], classes[i]);
      }
      await delay(ANT_CONFIG.countdownDuration);
    }
  }

  /**
   * Run a single ANT trial
   * @param {Object} condition
   */
  async runTrial(condition) {
    if (this.aborted) return;

    const { cueType, flankerType, targetDirection, targetPosition } = condition;

    // 1. Fixation
    this.renderFixation();
    if (this.onStateChange) {
      this.onStateChange('fixation', {
        trialIndex: this.currentTrialIndex,
        totalTrials: this.trials.length,
      });
    }
    await randomDelay(ANT_CONFIG.fixationDuration.min, ANT_CONFIG.fixationDuration.max);
    if (this.aborted) return;

    // 2. Cue
    this.renderCue(cueType, targetPosition);
    await delay(ANT_CONFIG.cueDuration);
    if (this.aborted) return;

    // 3. Post-cue fixation
    this.renderFixation();
    await delay(ANT_CONFIG.postCueFixation);
    if (this.aborted) return;

    // 4. Target + Flankers
    this.renderTarget(targetDirection, flankerType, targetPosition);
    this.responseStartTime = now();

    if (this.onStateChange) {
      this.onStateChange('target', {
        trialIndex: this.currentTrialIndex,
        totalTrials: this.trials.length,
      });
    }

    // Wait for response (with timeout)
    const response = await this.waitForResponse(ANT_CONFIG.maxResponseTime);
    if (this.aborted) return;

    const isCorrect = response.answer === targetDirection;
    const reactionTime = response.timedOut ? ANT_CONFIG.maxResponseTime : response.reactionTime;

    const record = {
      taskType: 'ant',
      trialNumber: this.currentTrialIndex + 1,
      cueType,
      flankerType,
      targetDirection,
      targetPosition,
      userResponse: response.answer,
      isCorrect,
      reactionTimeMs: reactionTime,
      timedOut: response.timedOut || false,
      timestamp: Date.now(),
    };

    this.trialData.push(record);

    if (this.onTrialComplete) {
      this.onTrialComplete(record);
    }

    // 5. Post-trial fixation
    this.renderFixation();
    await delay(ANT_CONFIG.postTrialDuration);
  }

  /**
   * Render fixation cross
   */
  renderFixation() {
    this.container.innerHTML = `
      <div class="ant-display-area">
        <div class="fixation-cross">+</div>
      </div>
    `;
  }

  /**
   * Render cue
   * @param {string} cueType
   * @param {string} targetPosition
   */
  renderCue(cueType, targetPosition) {
    const offset = ANT_CONFIG.positionOffset;

    let cueHtml = '<div class="ant-display-area"><div class="fixation-cross">+</div>';

    switch (cueType) {
      case 'center':
        cueHtml += `<div class="ant-cue" style="top: 50%; transform: translate(-50%, -50%);"></div>`;
        break;
      case 'double':
        cueHtml += `
          <div class="ant-cue" style="top: calc(50% - ${offset}px); transform: translate(-50%, -50%);"></div>
          <div class="ant-cue" style="top: calc(50% + ${offset}px); transform: translate(-50%, -50%);"></div>
        `;
        break;
      case 'spatial':
        const cueY = targetPosition === 'above'
          ? `calc(50% - ${offset}px)`
          : `calc(50% + ${offset}px)`;
        cueHtml += `<div class="ant-cue" style="top: ${cueY}; transform: translate(-50%, -50%);"></div>`;
        break;
      case 'none':
      default:
        // No cue shown
        break;
    }

    cueHtml += '</div>';
    this.container.innerHTML = cueHtml;
  }

  /**
   * Render target with flankers
   * @param {string} direction - 'left' or 'right'
   * @param {string} flankerType - 'congruent', 'incongruent', 'neutral'
   * @param {string} position - 'above' or 'below'
   */
  renderTarget(direction, flankerType, position) {
    const targetArrow = ARROWS[direction];
    let flankerArrow;

    switch (flankerType) {
      case 'congruent':
        flankerArrow = targetArrow;
        break;
      case 'incongruent':
        flankerArrow = direction === 'left' ? ARROWS.right : ARROWS.left;
        break;
      case 'neutral':
        flankerArrow = ARROWS.dash;
        break;
    }

    const offset = ANT_CONFIG.positionOffset;
    const top = position === 'above'
      ? `calc(50% - ${offset}px)`
      : `calc(50% + ${offset}px)`;

    this.container.innerHTML = `
      <div class="ant-display-area">
        <div class="fixation-cross">+</div>
        <div class="ant-display" style="top: ${top};">
          <span class="ant-arrow">${flankerArrow}</span>
          <span class="ant-arrow">${flankerArrow}</span>
          <span class="ant-arrow target">${targetArrow}</span>
          <span class="ant-arrow">${flankerArrow}</span>
          <span class="ant-arrow">${flankerArrow}</span>
        </div>
      </div>
    `;
  }

  /**
   * Wait for response with timeout
   * @param {number} maxMs
   * @returns {Promise<Object>}
   */
  waitForResponse(maxMs) {
    return new Promise(resolve => {
      let timeoutId;

      this._resolveResponse = (answer) => {
        clearTimeout(timeoutId);
        const reactionTime = now() - this.responseStartTime;
        resolve({ answer, reactionTime, timedOut: false });
        this._resolveResponse = null;
      };

      timeoutId = setTimeout(() => {
        this._resolveResponse = null;
        resolve({ answer: 'none', reactionTime: maxMs, timedOut: true });
      }, maxMs);
    });
  }

  /**
   * Handle user response (called from view)
   * @param {'left'|'right'} direction
   */
  handleResponse(direction) {
    if (this._resolveResponse) {
      this._resolveResponse(direction);
    }
  }

  /**
   * Abort the task
   */
  abort() {
    this.aborted = true;
    this.isRunning = false;
    if (this._resolveResponse) {
      this._resolveResponse('none');
    }
  }

  /**
   * Get progress info
   */
  getProgress() {
    return {
      current: this.currentTrialIndex,
      total: this.trials.length,
      percent: this.trials.length > 0
        ? (this.currentTrialIndex / this.trials.length) * 100
        : 0,
    };
  }
}
