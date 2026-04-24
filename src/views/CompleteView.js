/* ============================================================
   Complete View — Assessment done (no scores shown)
   ============================================================ */

import { render } from '../utils/dom.js';
import { Storage } from '../utils/storage.js';
import { computeFullScores } from '../scoring/ScoringEngine.js';
import { injectStyle } from '../router.js';

export function CompleteView() {
  const session = Storage.getCurrentSession();
  let syncComplete = false;

  const performSync = async () => {
    if (session?.trials?.length) {
      try {
        const scores = computeFullScores(session.trials);
        await Storage.saveCandidate({
          name: session.name,
          email: session.email,
          age: session.age,
          handle: session.handle,
          startedAt: session.startedAt,
          completedAt: new Date().toISOString(),
          trials: session.trials,
          metadata: session.metadata,
          scores,
        });
        Storage.clearCurrentSession();
        syncComplete = true;
        
        // Update DOM status
        const statusVal = document.querySelector('.cv-row-val');
        if (statusVal) statusVal.innerHTML = '<span class="cv-dot"></span> Submitted (Cloud Sync Ready)';
      } catch (err) {
        console.error('Scoring/Sync error', err);
      }
    }
  };

  performSync();

  const id = 'CS-' + Date.now().toString(36).toUpperCase().slice(-6) + '-' + Math.random().toString(36).slice(2,6).toUpperCase();

  render(`
    <div class="view cv">
      <!-- Floating particles -->
      <div class="cv-particles" aria-hidden="true">
        ${Array.from({length:24}, (_,i) => `
          <div class="cv-particle" style="
            left:${Math.random()*100}%;
            top:${Math.random()*100}%;
            width:${3+Math.random()*4}px;
            height:${3+Math.random()*4}px;
            animation-delay:${Math.random()*4}s;
            animation-duration:${4+Math.random()*5}s;
            background:${i%3===0?'#00f0ff':i%3===1?'#a855f7':'#34d399'};
          "></div>
        `).join('')}
      </div>

      <div class="cv-body">
        <svg class="cv-ring" width="100" height="100" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="46" stroke="url(#cvGrad)" stroke-width="2.5" fill="rgba(0,240,255,0.04)"/>
          <path d="M30 50L44 64L70 38" stroke="url(#cvGrad)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="cv-path"/>
          <defs>
            <linearGradient id="cvGrad" x1="0" y1="0" x2="100" y2="100">
              <stop offset="0%" stop-color="#00f0ff"/>
              <stop offset="100%" stop-color="#a855f7"/>
            </linearGradient>
          </defs>
        </svg>

        <h1 class="cv-heading">Assessment Complete</h1>
        <p class="cv-message">
          Thank you for completing the CogScreen cognitive assessment.
          Your results have been securely recorded and will be reviewed by our team.
          We'll be in touch soon.
        </p>

        <div class="cv-receipt">
          <div class="cv-row">
            <span class="cv-row-label">Status</span>
            <span class="cv-row-val">
              <span class="cv-dot"></span> Submitted
            </span>
          </div>
          <div class="cv-row">
            <span class="cv-row-label">Candidate</span>
            <span class="cv-row-val">${session?.name || '—'}</span>
          </div>
          <div class="cv-row">
            <span class="cv-row-label">Tasks completed</span>
            <span class="cv-row-val">3 / 3 ✓</span>
          </div>
          <div class="cv-row">
            <span class="cv-row-label">Assessment ID</span>
            <span class="cv-row-val mono">${id}</span>
          </div>
        </div>

        <p class="cv-footer">
          You may now close this window.
        </p>
      </div>
    </div>
  `);

  injectStyle(`
    .cv {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      padding: 40px 24px;
      position: relative; overflow: hidden;
    }
    .cv-particles { position: fixed; inset: 0; pointer-events: none; }
    .cv-particle  {
      position: absolute; border-radius: 50%; opacity: 0;
      animation: cvFloat ease-in-out infinite;
    }
    @keyframes cvFloat {
      0%   { opacity:0; transform:scale(0) translateY(0); }
      50%  { opacity:0.5; transform:scale(1) translateY(-50px); }
      100% { opacity:0; transform:scale(0) translateY(-100px); }
    }

    .cv-body {
      max-width: 480px; width: 100%;
      text-align: center;
      display: flex; flex-direction: column; align-items: center; gap: 28px;
      position: relative; z-index: 1;
    }
    .cv-ring { animation: scale-in 0.5s ease-out; }
    .cv-path { stroke-dasharray: 70; stroke-dashoffset: 70; animation: drawPath 0.6s ease-out 0.4s forwards; }
    @keyframes drawPath { to { stroke-dashoffset: 0; } }

    .cv-heading {
      font-size: 2.4rem;
      background: linear-gradient(135deg,#00f0ff,#a855f7);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .cv-message {
      color: var(--text-secondary); font-size: 1.05rem; line-height: 1.75;
    }
    .cv-receipt {
      width: 100%;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 8px 24px;
    }
    .cv-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .cv-row:last-child { border-bottom: none; }
    .cv-row-label { font-size: 13px; color: var(--text-tertiary); }
    .cv-row-val   {
      font-size: 13px; color: var(--text-primary); font-weight: 500;
      display: flex; align-items: center; gap: 8px;
    }
    .cv-row-val.mono { font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); }
    .cv-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #34d399;
      box-shadow: 0 0 8px #34d399;
      animation: pulse-glow 2s infinite;
    }
    .cv-footer { font-size: 0.85rem; color: var(--text-tertiary); }
  `);
}
