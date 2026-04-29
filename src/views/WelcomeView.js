/* ============================================================
   Welcome View — Stealth Pro Edition
   ============================================================ */

import { render } from '../utils/dom.js';
import { Storage } from '../utils/storage.js';
import { navigate, injectStyle } from '../router.js';

export function WelcomeView() {
  render(`
    <div class="view wv">
      <!-- Background Grid -->
      <div class="wv-grid"></div>

      <div class="wv-content animate-fade">
        <header class="wv-header">
          <div class="badge badge-volt">Task 01/03</div>
          <h1 class="wv-title">Attention & Working Memory<span class="dot">.</span></h1>
          <p class="wv-tagline">High-precision cognitive profiling for competitive e-sports.</p>
        </header>

        <div class="wv-main glass-card">
          <form id="reg-form" class="wv-form">
            <h2 class="form-title">Candidate Intake / Registration</h2>
            <div class="input-grid">
              <div class="field">
                <label>Legal Name</label>
                <input type="text" id="r-name" placeholder="John Doe" required />
              </div>
              <div class="field">
                <label>Email Address</label>
                <input type="email" id="r-email" placeholder="john@example.com" required />
              </div>
              <div class="field">
                <label>Age</label>
                <input type="number" id="r-age" min="13" max="60" placeholder="21" required />
              </div>
              <div class="field">
                <label>Gender</label>
                <select id="r-gender" required style="background:#000; border:1px solid var(--border-medium); padding:14px; color:#fff; font-family:var(--font-body); font-size:14px;">
                  <option value="" disabled selected>Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Undisclosed">Do not want to declare</option>
                </select>
              </div>
              <div class="field" style="grid-column: 1 / -1;">
                <label>Gamer Handle</label>
                <input type="text" id="r-handle" placeholder="X_REAPER_X" required />
              </div>
            </div>

            <div class="wv-footer" style="flex-direction: column; align-items: stretch; gap: 16px;">
              <div class="privacy-wrap" style="display:flex; align-items:flex-start; gap:12px;">
                <input type="checkbox" id="r-privacy" required style="margin-top:2px; width:auto; cursor:pointer;" />
                <label for="r-privacy" style="font-size:12px; color:#a0a0a5; line-height:1.4; cursor:pointer; font-family:var(--font-body);">I agree to the <a href="#" style="color:var(--accent-volt); text-decoration:none;">Privacy Policy</a> and consent to the collection of my cognitive and device telemetry data for evaluation purposes.</label>
              </div>
              <p class="notice" style="max-width:none; color:#7a7a7f;">
                <span>Please secure <strong>12 minutes</strong> to complete this task. If you are not able to complete all tasks in a row within 12 mins, you will need to try again. The system logs you out automatically.</span>
              </p>
              <button type="submit" class="btn-volt" style="align-self: flex-end;">Initialize Assessment →</button>
            </div>
          </form>
        </div>

        <footer class="wv-legal">
          <span>v1.2.4-stable</span>
          <span style="display:flex; align-items:center; gap:8px;"><img src="/xiberlinc_logo.png" alt="" style="height:14px; opacity:0.8; filter:grayscale(1) brightness(2);"/> Powered by Xiberlinc</span>
        </footer>
      </div>
    </div>
  `);

  injectStyle(`
    .wv {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-8);
      position: relative;
    }

    .wv-grid {
      position: fixed; inset: 0;
      background-image: 
        linear-gradient(var(--border-dim) 1px, transparent 1px),
        linear-gradient(90deg, var(--border-dim) 1px, transparent 1px);
      background-size: 60px 60px;
      mask-image: radial-gradient(circle at center, black, transparent 80%);
      pointer-events: none;
    }

    .wv-content {
      width: 100%;
      max-width: 800px;
      z-index: 10;
    }

    .wv-header {
      margin-bottom: var(--space-12);
      text-align: left;
    }

    .wv-title {
      margin: var(--space-4) 0;
      text-transform: uppercase;
    }
    .wv-title .dot { color: var(--accent-volt); }

    .wv-tagline {
      font-size: 1.1rem;
      color: #7a7a7f;
      white-space: nowrap;
    }

    .form-title {
      font-size: 1.5rem;
      margin-bottom: var(--space-8);
      text-transform: uppercase;
      font-weight: 500;
      letter-spacing: 0.1em;
      color: #fff;
    }

    .input-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 40px;
    }
    @media (max-width: 600px) { .input-grid { grid-template-columns: 1fr; } }

    .field { display: flex; flex-direction: column; gap: 8px; }
    .field label {
      font-family: var(--font-mono);
      font-size: 11px;
      text-transform: uppercase;
      color: #5a5a5f;
      letter-spacing: 0.1em;
    }

    input {
      background: #000;
      border: 1px solid var(--border-medium);
      padding: 14px;
      color: #fff;
      font-family: var(--font-body);
      font-size: 14px;
      transition: var(--transition-fast);
    }
    input:focus {
      border-color: var(--accent-volt);
      outline: none;
      box-shadow: 0 0 10px var(--accent-volt-dim);
    }

    .wv-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 32px;
      padding-top: 32px;
      border-top: 1px solid var(--border-dim);
    }
    @media (max-width: 700px) { .wv-footer { flex-direction: column; text-align: center; } }

    .notice { font-size: 13px; max-width: 400px; line-height: 1.6; }
    .notice strong { color: var(--accent-volt); font-family: var(--font-mono); font-size: 11px; }

    .wv-legal {
      margin-top: 48px;
      display: flex; justify-content: space-between;
      font-family: var(--font-mono); font-size: 10px; color: #3a3a3f;
      text-transform: uppercase; letter-spacing: 0.2em;
    }
  `);

  document.getElementById('reg-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const name   = document.getElementById('r-name').value.trim();
    const email  = document.getElementById('r-email').value.trim();
    const ageRaw = document.getElementById('r-age').value.trim();
    const gender = document.getElementById('r-gender').value;
    const handle = document.getElementById('r-handle').value.trim();

    // Clear previous errors
    document.querySelectorAll('.field-error').forEach(el => el.remove());

    const errors = [];

    if (name.length < 2) errors.push({ id: 'r-name', msg: 'Name must be at least 2 characters' });

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) errors.push({ id: 'r-email', msg: 'Enter a valid email address' });

    const age = parseInt(ageRaw);
    if (isNaN(age) || age < 13 || age > 60) errors.push({ id: 'r-age', msg: 'Age must be between 13 and 60' });

    if (handle.length < 2) errors.push({ id: 'r-handle', msg: 'Handle must be at least 2 characters' });

    if (errors.length > 0) {
      errors.forEach(({ id, msg }) => {
        const input = document.getElementById(id);
        input.style.borderColor = '#ff4d4d';
        const errEl = document.createElement('span');
        errEl.className = 'field-error';
        errEl.style.cssText = 'color:#ff4d4d;font-size:11px;font-family:var(--font-mono);margin-top:4px;';
        errEl.textContent = msg;
        input.parentElement.appendChild(errEl);
      });
      return;
    }

    const metadata = {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      userAgent: navigator.userAgent
    };

    Storage.saveCurrentSession({ name, email, age, gender, handle, startedAt: new Date().toISOString(), trials: [], metadata });
    navigate('instructions', { task: 'vwm-pure' });
  });
}
