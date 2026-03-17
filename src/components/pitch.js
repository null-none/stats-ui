function parseCSV(csv) {
  return csv.trim().split('\n').map((row) =>
    row.trim().split(',').map((cell) => {
      const [g, b] = cell.trim().split(':').map(Number);
      return { good: g || 0, bad: b || 0 };
    })
  );
}

function zoneColor(good, bad) {
  const total = good + bad;
  if (total === 0) return 'stats-pitch-green-1';
  const ratio = good / total;
  if (ratio >= 0.75) return 'stats-pitch-green-3';
  if (ratio >= 0.5)  return 'stats-pitch-green-2';
  if (ratio >= 0.25) return 'stats-pitch-orange';
  return 'stats-pitch-red';
}

function render(containerId, csvData) {
  const rows = parseCSV(csvData);
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  const pitch = document.createElement('div');
  pitch.className = 'stats-pitch';

  rows.forEach((row) => {
    row.forEach(({ good, bad }) => {
      const zone = document.createElement('div');
      zone.className = `stats-pitch-zone ${zoneColor(good, bad)}`;
      const total = good + bad;
      zone.innerHTML = `<span class="stats-pitch-label">${total > 0 ? `${good}/${bad}` : '–'}</span>`;
      pitch.appendChild(zone);
    });
  });

  container.appendChild(pitch);
}

export const Pitch = { render };
