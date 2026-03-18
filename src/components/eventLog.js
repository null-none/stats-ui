/**
 * EventLog.render(containerId, events, options)
 *
 * events – [{ minute, second?, type, text, team? }]
 *   type  – 'goal' | 'yellow-card' | 'red-card' | 'sub' | 'var' | 'penalty' | 'foul'
 *   team  – 'home' | 'away'  (affects alignment)
 *
 * options – { maxHeight (px, enables scroll) }
 *
 * Pure HTML component — no D3.
 */
const TYPE_LABEL = {
  'goal':        'Goal',
  'yellow-card': 'Yellow card',
  'red-card':    'Red card',
  'sub':         'Substitution',
  'var':         'VAR',
  'penalty':     'Penalty',
  'foul':        'Foul',
};

function render(containerId, events, options = {}) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  container.className = 'stats-eventlog';

  if (options.maxHeight)
    container.style.maxHeight = `${options.maxHeight}px`;

  const sorted = events.slice().sort((a, b) => {
    const at = a.minute * 60 + (a.second ?? 0);
    const bt = b.minute * 60 + (b.second ?? 0);
    return at - bt;
  });

  sorted.forEach((e) => {
    const item = document.createElement('div');
    item.className = [
      'stats-eventlog-item',
      `stats-eventlog-item--${e.team || 'home'}`,
    ].join(' ');

    const timeLabel = e.second != null
      ? `${e.minute}:${String(e.second).padStart(2, '0')}`
      : `${e.minute}'`;

    item.innerHTML = `
      <span class="stats-eventlog-time">${timeLabel}</span>
      <span class="stats-eventlog-icon stats-eventlog-icon--${e.type || 'default'}"
            title="${TYPE_LABEL[e.type] || e.type}"></span>
      <span class="stats-eventlog-text">${e.text}</span>`;

    container.appendChild(item);
  });
}

export const EventLog = { render };
