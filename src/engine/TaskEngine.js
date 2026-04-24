/* ============================================================
   Task Engine — VWM state machine (correct paradigm)
   ============================================================ */

import { generateTrial, renderStudy, renderProbe } from './StimulusGenerator.js';
import { delay, randomDelay, now } from '../utils/timing.js';

const SET_SIZES = [1, 2, 3, 4, 6, 8];

const T = {
  COUNTDOWN_WORD: 700,
  BLANK_MIN: 400,
  BLANK_MAX: 600,
  STIMULUS: 100,
  RETENTION: 900,
  FEEDBACK: 400,
  ITI: 300,
  RESPONSE_TIMEOUT: 6000,
};

export class TaskEngine {
  constructor({ taskType = 'vwm-pure', withDistractors = false, shape = 'square' } = {}) {
    this.taskType     = taskType;
    this.withDistractors = withDistractors;
    this.shape        = shape;

    this.ssIdx   = 0;
    this.streak  = 0;
    this.trialNum = 0;
    this.running  = false;
    this.aborted  = false;
    this.skippedAt = null;
    this._resolveResponse = null;
    this._responseStartTime = 0;

    this.trialData = [];
    this.maxTrials = 72;

    // Callbacks
    this.onCountdown = null;  // (word, cls)
    this.onPhase     = null;  // (phase, meta)
    this.onTrial     = null;  // (trialRecord)
    this.onDone      = null;  // (allTrials, skippedAt)
  }

  get currentSetSize() { return SET_SIZES[this.ssIdx]; }

  get currentDifficulty() {
    if (this.ssIdx <= 1) return 'medium';
    if (this.ssIdx <= 3) return 'medium';
    return 'hard';
  }

  respond(answer) {
    if (this._resolveResponse) {
      const rt = now() - this._responseStartTime;
      this._resolveResponse({ answer, rt });
      this._resolveResponse = null;
    }
  }

  skip() {
    this.skippedAt = Date.now();
    this.running = false;
    if (this._resolveResponse) {
      this._resolveResponse({ answer: '__skip__', rt: 0 });
      this._resolveResponse = null;
    }
  }

  abort() {
    this.aborted = true;
    this.running = false;
    if (this._resolveResponse) {
      this._resolveResponse({ answer: '__abort__', rt: 0 });
      this._resolveResponse = null;
    }
  }

  async run(canvas) {
    this.canvas  = canvas;
    this.running = true;

    await this._countdown();
    if (this.aborted) return;

    while (this.running && !this.aborted && this.trialNum < this.maxTrials) {
      await this._runOneTrial();
      this.trialNum++;
    }

    this.running = false;
    if (this.onDone) this.onDone(this.trialData, this.skippedAt);
  }

  async _countdown() {
    for (const { text, cls } of [
      { text: 'READY', cls: 'ready' },
      { text: 'SET',   cls: 'set'   },
      { text: 'GO',    cls: 'go'    },
    ]) {
      if (this.aborted || !this.running) return;
      if (this.onCountdown) this.onCountdown(text, cls);
      await delay(T.COUNTDOWN_WORD);
    }
  }

  _emit(phase, extra = {}) {
    if (this.onPhase) this.onPhase(phase, {
      trialNum:  this.trialNum,
      setSize:   this.currentSetSize,
      ssIdx:     this.ssIdx,
      maxTrials: this.maxTrials,
      streak:    this.streak,
      ...extra,
    });
  }

  async _runOneTrial() {
    const setSize   = this.currentSetSize;
    const difficulty = this.currentDifficulty;
    const isChange = Math.random() < 0.5;

    const trial = generateTrial({
      setSize,
      isChange,
      withDistractors: this.withDistractors,
      shape: this.shape,
      difficulty,
    });

    this._emit('blank');
    this.canvas.innerHTML = '<div class="task-fixation">+</div>';
    await randomDelay(T.BLANK_MIN, T.BLANK_MAX);
    if (this.aborted || !this.running) return;

    this._emit('stimulus', { setSize });
    renderStudy(this.canvas, trial);
    await delay(T.STIMULUS);
    if (this.aborted || !this.running) return;

    this._emit('retention');
    this.canvas.innerHTML = '<div class="task-fixation">+</div>';
    await delay(T.RETENTION);
    if (this.aborted || !this.running) return;

    this._emit('probe', { isChange });
    renderProbe(this.canvas, trial);
    this._responseStartTime = now();
    const { answer, rt } = await this._waitResponse(T.RESPONSE_TIMEOUT);
    if (this.aborted || !this.running) return;

    const isCorrect = answer === (isChange ? 'different' : 'same');

    if (isCorrect) {
      this.streak++;
      if (this.streak >= 2 && this.ssIdx < SET_SIZES.length - 1) {
        this.ssIdx++;
        this.streak = 0;
      }
    } else {
      this.streak = 0;
    }

    this._emit('feedback', { isCorrect });
    this.canvas.innerHTML = `<div class="task-feedback ${isCorrect ? 'correct' : 'incorrect'}">${isCorrect ? '✓' : '✗'}</div>`;
    await delay(T.FEEDBACK);

    this.canvas.innerHTML = '';
    await delay(T.ITI);

    const record = {
      taskType: this.taskType,
      trialNumber: this.trialNum + 1,
      setSize,
      isChange,
      isCorrect,
      reactionTimeMs: Math.round(rt),
      timestamp: Date.now(),
      withDistractors: this.withDistractors,
    };

    this.trialData.push(record);
    if (this.onTrial) this.onTrial(record);
  }

  _waitResponse(timeout) {
    return new Promise(resolve => {
      const timer = setTimeout(() => {
        this._resolveResponse = null;
        resolve({ answer: 'timeout', rt: timeout });
      }, timeout);

      this._resolveResponse = (result) => {
        clearTimeout(timer);
        resolve(result);
      };
    });
  }
}
