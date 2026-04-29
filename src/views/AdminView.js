/* ============================================================
   Admin View — Hidden dashboard (/admin)
   Passphrase: cogscreen2026
   ============================================================ */

import { render, $, downloadFile } from '../utils/dom.js';
import { Storage } from '../utils/storage.js';
import { recalculateRanks, getTierDistribution, getStatsSummary } from '../scoring/RankingEngine.js';
import { injectStyle } from '../router.js';

const PASS = 'cogscreen2026';
let authed = false;

export function AdminView() {
  injectStyle(`
    .av-gate {
      min-height:100vh; display:flex; align-items:center;
      justify-content:center; padding:40px 24px;
    }
    .av-gate-card {
      max-width: 380px; width:100%;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 40px;
      text-align: center;
    }
    .av-gate-card .lock { font-size:2.5rem; margin-bottom:20px; opacity:0.5; }
    .av-gate-card h2   { margin-bottom:6px; }
    .av-gate-card p    { color:var(--text-tertiary); font-size:0.9rem; margin-bottom:24px; }
    .av-err { color:#f87171; font-size:13px; margin-top:12px; }

    /* Layout */
    .av { min-height:100vh; display:flex; flex-direction:column; }
    .av-header {
      display:flex; align-items:center; justify-content:space-between;
      padding:12px 24px;
      border-bottom:1px solid rgba(255,255,255,0.06);
      background:rgba(0,0,0,0.4);
      backdrop-filter:blur(16px);
      position:sticky; top:0; z-index:50;
    }
    .av-logo { display:flex; align-items:center; gap:12px; font-size:1rem; font-weight:600; }
    .av-logo-icon {
      width:32px; height:32px;
      background: linear-gradient(135deg,#00f0ff,#a855f7);
      border-radius:8px;
      display:flex; align-items:center; justify-content:center;
      font-size:17px;
    }
    .av-actions { display:flex; gap:8px; }

    .av-body { flex:1; padding:24px; }

    /* Stats */
    .av-stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:12px; margin-bottom:24px; }
    .av-stat {
      background:rgba(255,255,255,0.02);
      border:1px solid rgba(255,255,255,0.07);
      border-radius:14px; padding:18px 20px;
    }
    .av-stat-label { font-family:var(--font-mono); font-size:11px; color:var(--text-tertiary); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:8px; }
    .av-stat-val   { font-family:var(--font-display); font-size:2rem; font-weight:700; }

    /* Tier bar */
    .av-tier-bar-wrap {
      background:rgba(255,255,255,0.02);
      border:1px solid rgba(255,255,255,0.07);
      border-radius:14px; padding:16px 20px;
      margin-bottom:24px;
    }
    .av-tier-bar-head {
      display:flex; justify-content:space-between; align-items:center;
      margin-bottom:10px;
      font-family:var(--font-mono); font-size:11px; color:var(--text-tertiary); letter-spacing:0.08em; text-transform:uppercase;
    }
    .av-tier-legend { display:flex; gap:14px; flex-wrap:wrap; }
    .av-tier-dot { display:inline-block; width:8px; height:8px; border-radius:2px; }
    .av-tier-bar { display:flex; height:10px; border-radius:99px; overflow:hidden; }
    .av-tier-seg { height:100%; transition:width 0.5s ease; }

    /* Table */
    .av-table-wrap {
      background:rgba(255,255,255,0.02);
      border:1px solid rgba(255,255,255,0.07);
      border-radius:14px; overflow:hidden;
    }
    .av-table-head {
      display:flex; justify-content:space-between; align-items:center;
      padding:14px 20px;
      border-bottom:1px solid rgba(255,255,255,0.06);
    }
    .av-table-head h2 { font-size:1rem; }
    .av-table-count   { font-size:13px; color:var(--text-tertiary); }
    .av-table-scroll  { overflow-x:auto; }
    table.av-t { width:100%; border-collapse:collapse; font-size:13px; }
    table.av-t thead { background:rgba(0,0,0,0.3); }
    table.av-t th {
      padding:9px 14px; text-align:left;
      font-family:var(--font-mono); font-size:10px; color:var(--text-tertiary);
      letter-spacing:0.08em; text-transform:uppercase;
      border-bottom:1px solid rgba(255,255,255,0.06);
      white-space:nowrap; cursor:pointer;
    }
    table.av-t th:hover { color:var(--text-secondary); }
    table.av-t td { padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.04); color:var(--text-secondary); white-space:nowrap; }
    table.av-t tr:last-child td { border-bottom:none; }
    table.av-t tbody tr:hover { background:rgba(255,255,255,0.025); }

    .td-name  { color:var(--text-primary)!important; font-weight:500; }
    .td-score-hi { color:#34d399!important; font-family:var(--font-mono); }
    .td-score-md { color:#fbbf24!important; font-family:var(--font-mono); }
    .td-score-lo { color:#f87171!important; font-family:var(--font-mono); }
    .td-mono     { font-family:var(--font-mono); }

    .tier-pip {
      display:inline-flex; align-items:center; justify-content:center;
      width:30px; height:22px; font-size:11px; font-weight:700;
      font-family:var(--font-mono); border-radius:5px; letter-spacing:0.03em;
    }
    .tier-sp { background:#ffd70020; color:#ffd700; }
    .tier-s  { background:rgba(0,240,255,0.12); color:#00f0ff; }
    .tier-a  { background:rgba(168,85,247,0.15); color:#a855f7; }
    .tier-b  { background:rgba(52,211,153,0.15); color:#34d399; }
    .tier-c  { background:rgba(251,191,36,0.15); color:#fbbf24; }
    .tier-d  { background:rgba(248,113,113,0.15); color:#f87171; }

    .av-empty { padding:80px 24px; text-align:center; color:var(--text-tertiary); }
    .av-empty-icon { font-size:3rem; margin-bottom:16px; opacity:0.4; }

    /* Detail modal */
    .av-modal-bg {
      position:fixed; inset:0; background:rgba(0,0,0,0.7);
      backdrop-filter:blur(8px);
      display:flex; align-items:center; justify-content:center;
      z-index:200; padding:24px;
    }
    .av-modal {
      max-width:860px; width:100%;
      max-height:88vh; overflow-y:auto;
      background:#0e0e1a;
      border:1px solid rgba(255,255,255,0.1);
      border-radius:20px;
      animation:scale-in 0.25s ease-out;
    }
    .av-modal-header {
      display:flex; justify-content:space-between; align-items:flex-start;
      padding:24px 28px;
      border-bottom:1px solid rgba(255,255,255,0.06);
      position:sticky; top:0; background:#0e0e1a; z-index:1;
    }
    .av-modal-body { padding:28px; }
    .av-metrics { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:10px; margin-bottom:28px; }
    .av-metric  {
      background:rgba(255,255,255,0.02);
      border:1px solid rgba(255,255,255,0.06);
      border-radius:12px; padding:14px 16px; text-align:center;
    }
    .av-metric-label { font-family:var(--font-mono); font-size:10px; color:var(--text-tertiary); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:6px; }
    .av-metric-val   { font-family:var(--font-display); font-size:1.7rem; font-weight:700; }

    .av-chart-title { font-size:0.9rem; margin-bottom:12px; color:var(--text-secondary); font-family:var(--font-mono); text-transform:uppercase; letter-spacing:0.06em; }
    .av-chart { display:flex; align-items:flex-end; gap:8px; height:160px; margin-bottom:28px; padding-top:20px; }
    .av-bar-col { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; height:100%; justify-content:flex-end; }
    .av-bar-val { font-family:var(--font-mono); font-size:10px; color:var(--text-tertiary); }
    .av-bar { width:100%; border-radius:4px 4px 0 0; min-height:3px; background:linear-gradient(135deg,#00f0ff,#a855f7); }
    .av-bar-lbl { font-family:var(--font-mono); font-size:10px; color:var(--text-tertiary); }

    /* Buttons */
    .av-btn {
      font-family:var(--font-display); font-size:13px; font-weight:500;
      padding:8px 16px; border-radius:8px; cursor:pointer;
      transition:all 0.15s; outline:none;
    }
    .av-btn-ghost {
      background:transparent; color:var(--text-secondary);
      border:1px solid rgba(255,255,255,0.1);
    }
    .av-btn-ghost:hover { background:rgba(255,255,255,0.05); color:var(--text-primary); }
    .av-btn-primary {
      background:linear-gradient(135deg,#00f0ff,#a855f7);
      color:#000; border:none;
    }
    .av-btn-view {
      font-family:var(--font-mono); font-size:11px;
      background:rgba(255,255,255,0.04);
      border:1px solid rgba(255,255,255,0.08);
      color:var(--text-secondary);
      padding:4px 10px; border-radius:6px; cursor:pointer;
    }
    .av-btn-view:hover { background:rgba(255,255,255,0.08); color:var(--text-primary); }
  `);

  if (!authed) { showGate(); } else { showDashboard(); }
}

/* ---- Gate ---- */
function showGate() {
  render(`
    <div class="av-gate">
      <div class="av-gate-card">
        <div class="lock">🔒</div>
        <h2>Admin Access</h2>
        <p>Enter the admin passphrase to view candidate results.</p>
        <div style="margin-bottom:12px;">
          <input class="input-field" type="password" id="ap-pass" placeholder="Passphrase" autocomplete="off" style="text-align:center;letter-spacing:0.1em;" />
        </div>
        <button class="btn btn-primary" id="ap-auth" style="width:100%">Authenticate</button>
        <div class="av-err" id="ap-err" style="display:none">Incorrect passphrase</div>
      </div>
    </div>
  `);

  injectStyle(`
    .input-field {
      width:100%; padding:12px 14px;
      background:rgba(255,255,255,0.05); color:var(--text-primary);
      border:1px solid rgba(255,255,255,0.08); border-radius:10px;
      font-size:15px; outline:none;
    }
    .input-field:focus { border-color:rgba(0,240,255,0.4); }
    .btn-primary {
      font-family:var(--font-display); font-weight:600; font-size:15px;
      padding:13px 24px;
      background:linear-gradient(135deg,#00f0ff,#a855f7);
      color:#000; border:none; border-radius:10px; cursor:pointer;
    }
  `);

  const doAuth = () => {
    const val = document.getElementById('ap-pass').value;
    if (val === PASS) {
      authed = true;
      showDashboard();
    } else {
      document.getElementById('ap-err').style.display = 'block';
      document.getElementById('ap-pass').value = '';
    }
  };
  document.getElementById('ap-auth').addEventListener('click', doAuth);
  document.getElementById('ap-pass').addEventListener('keydown', e => { if (e.key === 'Enter') doAuth(); });
}

/* ---- Dashboard ---- */
async function showDashboard() {
  const loadingHtml = `
    <div class="av">
      <div class="av-empty">
        <div class="av-empty-icon animate-pulse">☁️</div>
        <p>Syncing with Cloud Database...</p>
      </div>
    </div>
  `;
  render(loadingHtml);

  const rawCandidates = await Storage.getCandidates();
  const candidates = recalculateRanks(rawCandidates);
  const stats      = getStatsSummary(candidates);
  const tiers      = getTierDistribution(candidates);
  const n          = candidates.length;

  const TIER_COLORS = { 'S+':'#ffd700','S':'#00f0ff','A':'#a855f7','B':'#34d399','C':'#fbbf24','D':'#f87171' };
  const TIER_CLS    = { 'S+':'sp','S':'s','A':'a','B':'b','C':'c','D':'d' };

  render(`
    <div class="av">
      <header class="av-header">
        <div class="av-logo">
          <div class="av-logo-icon">🧠</div>
          CogScreen Admin
        </div>
        <div class="av-actions">
          <button class="av-btn av-btn-ghost" id="av-refresh">↻ Refresh</button>
          <button class="av-btn av-btn-ghost" id="av-json">↓ JSON</button>
          <button class="av-btn av-btn-ghost" id="av-csv">↓ CSV</button>
        </div>
      </header>

      <div class="av-body">
        <!-- Stats row -->
        <div class="av-stats">
          <div class="av-stat">
            <div class="av-stat-label">Total candidates</div>
            <div class="av-stat-val">${n}</div>
          </div>
          <div class="av-stat">
            <div class="av-stat-label">Avg composite</div>
            <div class="av-stat-val" style="color:#00f0ff">${stats.avgComposite}</div>
          </div>
          <div class="av-stat">
            <div class="av-stat-label">Avg Cowan's K</div>
            <div class="av-stat-val" style="color:#a855f7">${stats.avgK}</div>
          </div>
          <div class="av-stat">
            <div class="av-stat-label">Top tier (S+/S)</div>
            <div class="av-stat-val" style="color:#34d399">${stats.topTierCount}</div>
          </div>
        </div>

        ${n > 0 ? `
          <!-- Tier distribution -->
          <div class="av-tier-bar-wrap">
            <div class="av-tier-bar-head">
              <span>Tier Distribution</span>
              <div class="av-tier-legend">
                ${Object.entries(tiers).map(([t, c]) => `
                  <span style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--text-tertiary)">
                    <span class="av-tier-dot" style="background:${TIER_COLORS[t]}"></span>${t}: ${c}
                  </span>
                `).join('')}
              </div>
            </div>
            <div class="av-tier-bar">
              ${Object.entries(tiers).map(([t, c]) => `
                <div class="av-tier-seg" style="width:${n>0?(c/n)*100:0}%;background:${TIER_COLORS[t]}"></div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Candidate table -->
        <div class="av-table-wrap">
          <div class="av-table-head">
            <h2>Candidates (Cloud Storage)</h2>
            <span class="av-table-count">${n} total</span>
          </div>
          ${n === 0 ? `
            <div class="av-empty">
              <div class="av-empty-icon">📊</div>
              <p>No candidates yet. Share the assessment link to begin collecting data.</p>
            </div>
          ` : `
            <div class="av-table-scroll">
              <table class="av-t">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Handle</th>
                    <th>Age</th>
                    <th>Tier</th>
                    <th>Score</th>
                    <th>Cowan's K</th>
                    <th>Cowan's K (Dist)</th>
                    <th>Max N</th>
                    <th>Avg RT</th>
                    <th>Acc Pure</th>
                    <th>Acc Dist</th>
                    <th>Alerting</th>
                    <th>Orienting</th>
                    <th>Executive</th>
                    <th>Completed</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${candidates.map((c, i) => {
                    const s = c.scores || {};
                    const cs = s.compositeScore || 0;
                    const sc = cs >= 70 ? 'td-score-hi' : cs >= 40 ? 'td-score-md' : 'td-score-lo';
                    const tc = TIER_CLS[s.tier || 'D'] || 'd';
                    const date = c.completedAt ? new Date(c.completedAt).toLocaleDateString() : '—';
                    return `
                      <tr>
                        <td class="td-mono">${c.rank || i+1}</td>
                        <td class="td-name">${c.name || '—'}</td>
                        <td><span style="font-family:var(--font-mono);font-size:11px;background:rgba(0,240,255,0.08);color:#00f0ff;padding:2px 8px;border-radius:99px">${c.handle||'—'}</span></td>
                        <td class="td-mono">${c.age||'—'}</td>
                        <td><span class="tier-pip tier-${tc}">${s.tier||'—'}</span></td>
                        <td class="${sc}">${cs.toFixed(1)}</td>
                        <td class="td-mono">${(s.kPure||0).toFixed(2)}</td>
                        <td class="td-mono">${(s.kDistractor||0).toFixed(2)}</td>
                        <td class="td-mono">${s.maxSetSize||0}</td>
                        <td class="td-mono">${(s.meanRT||0).toFixed(0)}ms</td>
                        <td class="td-mono">${((s.accuracyPure||0)*100).toFixed(0)}%</td>
                        <td class="td-mono">${((s.accuracyDistractor||0)*100).toFixed(0)}%</td>
                        <td class="td-mono">${(s.alerting||0).toFixed(0)}ms</td>
                        <td class="td-mono">${(s.orienting||0).toFixed(0)}ms</td>
                        <td class="td-mono">${(s.executive||0).toFixed(0)}ms</td>
                        <td class="td-mono">${date}</td>
                        <td><button class="av-btn-view" data-email="${c.email||''}">Detail</button></td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>

      <div id="av-modal-container"></div>
    </div>
  `);

  // Button handlers
  $('#av-refresh')?.addEventListener('click', () => showDashboard());
  $('#av-json')?.addEventListener('click', () => downloadFile(Storage.exportJSON(candidates), `cogscreen_${Date.now()}.json`));
  // pass candidates here too
  $('#av-csv')?.addEventListener('click', () => downloadFile(Storage.exportCSV(candidates), `cogscreen_${Date.now()}.csv`, 'text/csv'));

  document.querySelectorAll('.av-btn-view').forEach(btn => {
    btn.addEventListener('click', () => showDetail(btn.dataset.email, candidates));
  });
}

/* ---- Detail modal ---- */
function showDetail(email, candidates) {
  const c = candidates.find(x => x.email === email);
  if (!c) return;
  const s = c.scores || {};
  const kData = s.vwmPure?.kScores || {};
  const setSizes = [1, 2, 3, 4, 6, 8];
  const maxK = 6;

  const mc = document.getElementById('av-modal-container');
  mc.innerHTML = `
    <div class="av-modal-bg" id="av-modal-bg">
      <div class="av-modal">
        <div class="av-modal-header">
          <div>
            <div style="display:flex;align-items:center;gap:12px;">
              <h2>${c.name}</h2>
              <span class="tier-pip tier-${(s.tier||'D').toLowerCase().replace('+','sp')}">${s.tier||'—'}</span>
            </div>
            <p style="color:var(--text-tertiary);font-size:13px;margin-top:4px;">${c.email} · @${c.handle} · Age ${c.age} · ${c.gender || '—'}</p>
            ${c.metadata?.skips ? `
              <div style="margin-top:8px; display:flex; gap:6px;">
                ${Object.keys(c.metadata.skips).map(t => `<span class="badge" style="background:#fbbf2420; color:#fbbf24; border:1px solid #fbbf2440; padding:2px 8px; font-size:10px; font-family:var(--font-mono)">SKIPPED: ${t.toUpperCase()}</span>`).join('')}
              </div>
            ` : ''}
          </div>
          <button class="av-btn av-btn-ghost" id="av-close-modal" style="font-size:1.2rem;padding:6px 14px;">✕</button>
        </div>
        <div class="av-modal-body">
          <div class="av-metrics">
            ${[
              ['Composite', (s.compositeScore||0).toFixed(1), '#00f0ff'],
              ['Cowan\'s K', (s.kPure||0).toFixed(2),          '#a855f7'],
              ['Cowan K(Dist)', (s.kDistractor||0).toFixed(2), '#c084fc'],
              ['Max N',     s.maxSetSize||0,                   '#f0f0f5'],
              ['Avg RT',    `${(s.meanRT||0).toFixed(0)}ms`,  '#fbbf24'],
              ['Acc Pure',  `${((s.accuracyPure||0)*100).toFixed(0)}%`, '#34d399'],
              ['Acc Dist.', `${((s.accuracyDistractor||0)*100).toFixed(0)}%`, '#34d399'],
            ].map(([label, val, color]) => `
              <div class="av-metric">
                <div class="av-metric-label">${label}</div>
                <div class="av-metric-val" style="color:${color}">${val}</div>
              </div>
            `).join('')}
          </div>

          <div class="av-chart-title">Cowan's K by Set Size (VWM Pure)</div>
          <div class="av-chart">
            ${setSizes.map(n => {
              const k = kData[n]?.k || 0;
              const pct = Math.max(2, (k / maxK) * 100);
              return `
                <div class="av-bar-col">
                  <div class="av-bar-val">${k.toFixed(1)}</div>
                  <div class="av-bar" style="height:${pct}%"></div>
                  <div class="av-bar-lbl">N=${n}</div>
                </div>
              `;
            }).join('')}
          </div>

          <div class="av-chart-title">ANT Scores</div>
          <div class="av-metrics" style="grid-template-columns:repeat(3,1fr);">
            ${[
              ['Alerting',   (s.alerting||0).toFixed(0)+'ms',  '#fbbf24'],
              ['Orienting',  (s.orienting||0).toFixed(0)+'ms', '#34d399'],
              ['Executive',  (s.executive||0).toFixed(0)+'ms', '#f87171'],
            ].map(([label, val, color]) => `
              <div class="av-metric">
                <div class="av-metric-label">${label}</div>
                <div class="av-metric-val" style="color:${color}">${val}</div>
              </div>
            `).join('')}
          </div>

          ${s.componentScores ? `
            <div class="av-chart-title">Component Scores (0–100)</div>
            <div class="av-chart">
              ${Object.entries(s.componentScores).map(([key, val]) => {
                const LABELS = { kPure:'CowanK',kDistractor:'CowanK(Dist)',maxSetSize:'MaxN',rtEfficiency:'RT Eff',alerting:'Alert',orienting:'Orient',executive:'Exec' };
                const color = val>=70?'#34d399':val>=40?'#fbbf24':'#f87171';
                return `
                  <div class="av-bar-col">
                    <div class="av-bar-val">${val.toFixed(0)}</div>
                    <div class="av-bar" style="height:${Math.max(2,val)}%;background:${color}"></div>
                    <div class="av-bar-lbl">${LABELS[key]||key}</div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : ''}

          <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.06);">
            <div style="font-family:var(--font-mono); font-size:12px; color:var(--text-tertiary);">
              Total trials: ${(s.vwmPure?.totalTrials||0)+(s.vwmDistractor?.totalTrials||0)+(s.ant?.totalTrials||0)}
              · Completed: ${c.completedAt ? new Date(c.completedAt).toLocaleString() : '—'}
            </div>
            ${c.metadata ? `
              <div style="font-family:var(--font-mono); font-size:11px; color:var(--text-tertiary); background:rgba(255,255,255,0.03); padding:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.05); margin-top:8px;">
                <div style="margin-bottom:4px; color:var(--text-secondary); font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">Device Telemetry</div>
                <div>Resolution: ${c.metadata.windowWidth}x${c.metadata.windowHeight}</div>
                <div style="margin-top:4px; opacity:0.7; line-height:1.4; word-break:break-all;">Agent: ${c.metadata.userAgent}</div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;

  const close = () => { mc.innerHTML = ''; };
  document.getElementById('av-close-modal').addEventListener('click', close);
  document.getElementById('av-modal-bg').addEventListener('click', e => { if (e.target === e.currentTarget) close(); });
}
