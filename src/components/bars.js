function parseCSV(csv) {
  const [, ...rows] = csv.trim().split('\n');
  return rows.map((row) => {
    const [label, aStr, bStr] = row.split(',');
    return { label, a: Number(aStr), b: Number(bStr) };
  });
}

function render(containerId, csvData) {
  const data = parseCSV(csvData);
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  data.forEach(({ label, a, b }) => {
    const max = Math.max(a, b);
    const aW  = (a / max) * 100;
    const bW  = (b / max) * 100;

    const group = document.createElement('div');
    group.className = 'stats-bar-group';
    group.innerHTML = `
      <div class="stats-bar-label">${label}</div>
      <div class="stats-bar-container">
        <div class="stats-bar-value">${a}</div>
        <div class="stats-bar-wrapper stats-bar-left-wrapper">
          <div class="stats-bar-bar stats-bar-left" style="width:${aW}%"></div>
        </div>
        <div class="stats-bar-wrapper stats-bar-right-wrapper">
          <div class="stats-bar-bar stats-bar-right" style="width:${bW}%"></div>
        </div>
        <div class="stats-bar-value">${b}</div>
      </div>`;
    container.appendChild(group);
  });
}

export const Bars = { render };
