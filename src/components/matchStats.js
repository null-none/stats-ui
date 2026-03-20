function render(containerId, data, options = {}) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'stats-match-stats';

  if (options.teamA || options.teamB || options.scoreA != null) {
    const score = options.scoreA != null && options.scoreB != null
      ? `${options.scoreA} : ${options.scoreB}` : '';
    const header = document.createElement('div');
    header.className = 'stats-match-stats-header';
    header.innerHTML = `
      <div class="stats-match-stats-team stats-match-stats-team--home">${options.teamA || ''}</div>
      <div class="stats-match-stats-score">${score}</div>
      <div class="stats-match-stats-team stats-match-stats-team--away">${options.teamB || ''}</div>
    `;
    wrap.appendChild(header);
  }

  data.forEach(({ label, a, b }) => {
    const total = (a + b) || 1;
    const aPct  = (a / total) * 50;
    const bPct  = (b / total) * 50;

    const row = document.createElement('div');
    row.className = 'stats-match-stats-row';
    row.innerHTML = `
      <div class="stats-match-stats-val">${a}</div>
      <div class="stats-match-stats-mid">
        <div class="stats-match-stats-label">${label}</div>
        <div class="stats-match-stats-bar">
          <div class="stats-match-stats-bar-a" style="width:${aPct}%"></div>
          <div class="stats-match-stats-bar-b" style="width:${bPct}%"></div>
        </div>
      </div>
      <div class="stats-match-stats-val">${b}</div>
    `;
    wrap.appendChild(row);
  });

  container.appendChild(wrap);
}

export const MatchStats = { render };
