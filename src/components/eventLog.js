/**
 * EventLog.render(containerId, events, options)
 *
 * events – [{ minute, type, text, team? }]
 *   type  – 'goal' | 'yellow-card' | 'red-card' | 'sub' | 'var' | 'penalty'
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
};

function render(containerId, events, options = {}) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  container.className = 'stats-eventlog';

  if (options.maxHeight)
    container.style.maxHeight = `${options.maxHeight}px`;

  const sorted = events.slice().sort((a, b) => a.minute - b.minute);

  sorted.forEach((e) => {
    const item = document.createElement('div');
    item.className = [
      'stats-eventlog-item',
      `stats-eventlog-item--${e.team || 'home'}`,
    ].join(' ');

    item.innerHTML = `
      <span class="stats-eventlog-time">${e.minute}'</span>
      <span class="stats-eventlog-icon stats-eventlog-icon--${e.type || 'default'}"
            title="${TYPE_LABEL[e.type] || e.type}"></span>
      <span class="stats-eventlog-text">${e.text}</span>`;

    container.appendChild(item);
  });
}

export const EventLog = { render };
