/**
 * AlphaList.render(containerId, items, options)
 *
 * items   – [{ name, subtitle?, meta?, href? }]
 *   name     – primary label (used for alphabetical grouping)
 *   subtitle – secondary line (e.g. position, club)
 *   meta     – short text on the right (e.g. number, stat)
 *   href     – optional link; wraps the item in <a>
 *
 * options – { activeOnly (bool, default true) }
 *   activeOnly – show only letters that have items in the nav
 *
 * Pure HTML component — no D3.
 */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function render(containerId, items, options = {}) {
  const { activeOnly = true } = options;

  const container = document.getElementById(containerId);
  container.innerHTML = '';
  container.className = 'stats-alphalist';

  // Group items by first letter
  const groups = {};
  items.forEach((item) => {
    const letter = (item.name || '').charAt(0).toUpperCase();
    const key = /[A-Z]/.test(letter) ? letter : '#';
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  // Sort items within each group
  Object.keys(groups).forEach((k) => {
    groups[k].sort((a, b) => a.name.localeCompare(b.name));
  });

  const usedLetters = new Set(Object.keys(groups));

  // ── Letter nav ────────────────────────────────────────────────────────────
  const nav = document.createElement('div');
  nav.className = 'stats-alphalist-nav';

  const navLetters = activeOnly
    ? ALPHABET.filter((l) => usedLetters.has(l))
    : ALPHABET;

  navLetters.forEach((letter) => {
    const btn = document.createElement('button');
    btn.className = 'stats-alphalist-nav-letter';
    if (!usedLetters.has(letter)) btn.classList.add('stats-alphalist-nav-letter--empty');
    btn.textContent = letter;
    btn.setAttribute('aria-label', `Jump to ${letter}`);
    btn.addEventListener('click', () => {
      const target = container.querySelector(`[data-alpha-group="${letter}"]`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    nav.appendChild(btn);
  });

  container.appendChild(nav);

  // ── Groups ─────────────────────────────────────────────────────────────────
  const body = document.createElement('div');
  body.className = 'stats-alphalist-body';

  const sortedKeys = Object.keys(groups).sort((a, b) => {
    if (a === '#') return 1;
    if (b === '#') return -1;
    return a.localeCompare(b);
  });

  sortedKeys.forEach((letter) => {
    const group = document.createElement('div');
    group.className = 'stats-alphalist-group';
    group.setAttribute('data-alpha-group', letter);

    const label = document.createElement('div');
    label.className = 'stats-alphalist-group-label';
    label.textContent = letter;
    group.appendChild(label);

    groups[letter].forEach((item) => {
      const tag = item.href ? 'a' : 'div';
      const row = document.createElement(tag);
      row.className = 'stats-alphalist-item';
      if (item.href) {
        row.href = item.href;
        row.className += ' stats-alphalist-item--link';
      }

      const info = document.createElement('div');
      info.className = 'stats-alphalist-item-info';

      const name = document.createElement('span');
      name.className = 'stats-alphalist-item-name';
      name.textContent = item.name;
      info.appendChild(name);

      if (item.subtitle) {
        const sub = document.createElement('span');
        sub.className = 'stats-alphalist-item-sub';
        sub.textContent = item.subtitle;
        info.appendChild(sub);
      }

      row.appendChild(info);

      if (item.meta != null) {
        const meta = document.createElement('span');
        meta.className = 'stats-alphalist-item-meta';
        meta.textContent = item.meta;
        row.appendChild(meta);
      }

      group.appendChild(row);
    });

    body.appendChild(group);
  });

  container.appendChild(body);
}

export const AlphaList = { render };
