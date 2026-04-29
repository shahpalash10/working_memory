/* ============================================================
   Welcome View — Stealth Pro Edition
   ============================================================ */

import { render } from '../utils/dom.js';
import { Storage } from '../utils/storage.js';
import { navigate, injectStyle } from '../router.js';
import { t, getLang, setLang } from '../utils/i18n.js';

export function WelcomeView() {
  render(`
    <div class="view wv">
      <!-- Background Grid -->
      <div class="wv-grid"></div>

      <div class="wv-content animate-fade">
        <header class="wv-header">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 20px;">
            <img src="/xiberlinc_logo.png" alt="Xiberlinc" style="height:42px;" />
            <div style="display:flex; gap:12px; align-items:center;">
              <button id="lang-toggle" class="btn-ghost" style="padding:4px 10px; font-size:12px; border-radius:4px;">${t('lang_toggle')}</button>
              <div class="badge badge-volt">${t('badge_task')}</div>
            </div>
          </div>
          <h1 class="wv-title">${t('app_title')}<span class="dot">.</span></h1>
          <p class="wv-tagline">${t('app_tagline')}</p>
        </header>

        <div class="wv-main glass-card">
          <form id="reg-form" class="wv-form">
            <h2 class="form-title">${t('intake_title')}</h2>
            <div class="input-grid">
              <div class="field">
                <label>${t('label_name')}</label>
                <input type="text" id="r-name" placeholder="John Doe" required />
              </div>
              <div class="field">
                <label>${t('label_email')}</label>
                <input type="email" id="r-email" placeholder="john@example.com" required />
              </div>
              <div class="field">
                <label>${t('label_age')}</label>
                <input type="number" id="r-age" min="13" max="60" placeholder="21" required />
              </div>
              <div class="field">
                <label>${t('label_gender')}</label>
                <select id="r-gender" required style="background:#000; border:1px solid var(--border-medium); padding:14px; color:#fff; font-family:var(--font-body); font-size:14px;">
                  <option value="" disabled selected>${t('gender_select')}</option>
                  <option value="Male">${t('gender_male')}</option>
                  <option value="Female">${t('gender_female')}</option>
                  <option value="Other">${t('gender_other')}</option>
                  <option value="Undisclosed">${t('gender_none')}</option>
                </select>
              </div>
              <div class="field" style="grid-column: 1 / -1;">
                <label>${t('label_handle')}</label>
                <input type="text" id="r-handle" placeholder="X_REAPER_X" required />
              </div>
            </div>

            <div class="wv-footer" style="flex-direction: column; align-items: stretch; gap: 16px;">
              <div class="privacy-wrap" style="display:flex; align-items:flex-start; gap:12px;">
                <input type="checkbox" id="r-privacy" required style="margin-top:2px; width:auto; cursor:pointer;" />
                <label for="r-privacy" style="font-size:12px; color:#a0a0a5; line-height:1.4; cursor:pointer; font-family:var(--font-body);">${t('privacy_text')}</label>
              </div>
              <p class="notice" style="max-width:none; color:#7a7a7f;">
                <span>${t('disclaimer_text')}</span>
              </p>
              <button type="submit" class="btn-volt" style="align-self: flex-end;">${t('btn_init')}</button>
            </div>
          </form>
        </div>

        <footer class="wv-legal" style="justify-content:center;">
          <span>v1.2.4-stable</span>
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
      display: flex; justify-content: center;
      font-family: var(--font-mono); font-size: 10px; color: #3a3a3f;
      text-transform: uppercase; letter-spacing: 0.2em;
    }
    
    .btn-ghost {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border-dim);
      cursor: pointer;
      font-family: var(--font-body);
      transition: all 0.2s;
    }
    .btn-ghost:hover {
      background: rgba(255,255,255,0.05);
      color: var(--text-primary);
    }
  `);

  document.getElementById('lang-toggle').addEventListener('click', () => {
    const newLang = getLang() === 'en' ? 'ja' : 'en';
    setLang(newLang);
    WelcomeView(); // Re-render
  });

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
