/* global d3 */
import { drawPitch } from '../utils/pitchDraw.js';

/**
 * Formation.render(svgSelector, players, options)
 *
 * players – [{ number, name, x, y, highlight?, sub? }]
 *   x, y  – 0–100 pitch coordinates
 *
 * options – {
 *   width, height, label, formation,
 *   showNames  (default true),
 *   halfPitch  (default false) — show only attacking half (x 50–100)
 * }
 */
function render(svgSelector, players, options = {}) {
  const mg        = { top: 36, right: 16, bottom: 16, left: 16, ...options.margin };
  const totalW    = options.width  || 520;
  const totalH    = options.height || 420;
  const halfPitch = options.halfPitch !== false; // default: show half pitch
  const W = totalW - mg.left - mg.right;
  const H = totalH - mg.top  - mg.bottom;

  const svg = d3.select(svgSelector);
  svg.html('').attr('width', totalW).attr('height', totalH);

  // Header label
  if (options.label || options.formation) {
    const hdr = svg.append('g').attr('transform', `translate(${mg.left},0)`);
    if (options.label)
      hdr.append('text').attr('x', W / 2).attr('y', 16)
        .attr('class', 'stats-formation-team').text(options.label);
    if (options.formation)
      hdr.append('text').attr('x', W / 2).attr('y', 30)
        .attr('class', 'stats-formation-label').text(options.formation);
  }

  const g = svg.append('g').attr('transform', `translate(${mg.left},${mg.top})`);

  // Draw half pitch (attacking direction → right)
  if (halfPitch) {
    // Clip to right half of pitch drawing
    const defs = svg.append('defs');
    defs.append('clipPath').attr('id', 'half-clip')
      .append('rect').attr('x', 0).attr('y', 0).attr('width', W).attr('height', H);

    const pitchG = g.append('g').attr('clip-path', 'url(#half-clip)');
    // Scale pitch so the right half (x 50–100) maps to full W
    const scaleG = pitchG.append('g').attr('transform', `translate(${-W},0) scale(2,1)`);
    drawPitch(scaleG, W, H, 'stats-formation-pitch');
  } else {
    drawPitch(g, W, H, 'stats-formation-pitch');
  }

  // Player coords mapping
  // If halfPitch: x=50 maps to 0, x=100 maps to W
  // If full pitch: x=0 maps to 0, x=100 maps to W
  const mapX = halfPitch
    ? (v) => ((v - 50) / 50) * W
    : (v) => (v / 100) * W;
  const mapY = (v) => (v / 100) * H;

  players.forEach((p) => {
    const cx = mapX(p.x);
    const cy = mapY(p.y);
    const mod = p.highlight ? ' stats-formation-player--highlight' : p.sub ? ' stats-formation-player--sub' : '';

    g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 18)
      .attr('class', `stats-formation-player${mod}`);

    g.append('text').attr('x', cx).attr('y', cy + 5)
      .attr('class', `stats-formation-number${mod}`)
      .text(p.number);

    if (options.showNames !== false && p.name) {
      g.append('text').attr('x', cx).attr('y', cy + 32)
        .attr('class', 'stats-formation-name')
        .text(p.name.split(' ').pop()); // last name only
    }
  });
}

export const Formation = { render };
