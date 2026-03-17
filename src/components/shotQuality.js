/* global d3 */
import { drawPitch } from '../utils/pitchDraw.js';

/**
 * ShotQuality.render(svgSelector, shots, options)
 *
 * shots – [{ x, y, xg, result, label? }]
 *   x, y    – 0–100 pitch coordinates
 *   xg      – expected goals value (0–1), determines bubble size
 *   result  – 'goal' | 'saved' | 'missed'
 *
 * options – {
 *   width, height, margin,
 *   minR (default 6),  maxR (default 22),
 *   showLabels (default true)
 * }
 *
 * Typically render only the attacking half: set halfPitch: true
 * and use x coords 50–100 for shots from the right side.
 */
function render(svgSelector, shots, options = {}) {
  const mg     = { top: 12, right: 16, bottom: 38, left: 16, ...options.margin };
  const totalW = options.width  || 700;
  const totalH = options.height || 440;
  const minR   = options.minR   || 6;
  const maxR   = options.maxR   || 22;
  const W = totalW - mg.left - mg.right;
  const H = totalH - mg.top  - mg.bottom;

  const svg = d3.select(svgSelector);
  svg.html('').attr('width', totalW).attr('height', totalH);

  const g = svg.append('g').attr('transform', `translate(${mg.left},${mg.top})`);
  drawPitch(g, W, H, 'stats-shotquality-pitch');

  const px = (v) => (v / 100) * W;
  const py = (v) => (v / 100) * H;

  const maxXg = d3.max(shots, (s) => s.xg) || 1;
  const rScale = d3.scaleSqrt().domain([0, maxXg]).range([minR, maxR]);

  // Draw in order: missed → saved → goal (so goals are on top)
  const order = { missed: 0, saved: 1, goal: 2 };
  const sorted = shots.slice().sort((a, b) => (order[a.result] || 0) - (order[b.result] || 0));

  sorted.forEach((s) => {
    const r = rScale(s.xg || 0.05);
    g.append('circle')
      .attr('cx', px(s.x)).attr('cy', py(s.y)).attr('r', r)
      .attr('class', `stats-shotquality-dot stats-shotquality-dot--${s.result || 'saved'}`);

    if (options.showLabels !== false && s.label) {
      g.append('text')
        .attr('x', px(s.x)).attr('y', py(s.y) + r + 12)
        .attr('class', 'stats-shotquality-label')
        .text(s.label);
    }
  });

  // xG total annotation
  const totalXg = shots.reduce((sum, s) => sum + (s.xg || 0), 0);
  const goals   = shots.filter((s) => s.result === 'goal').length;
  svg.append('text')
    .attr('x', mg.left).attr('y', mg.top + H + 22)
    .attr('class', 'stats-shotquality-summary')
    .text(`${goals} goals · ${totalXg.toFixed(2)} xG`);

  // Legend
  const LEGEND = [
    { label: 'Goal',   cls: 'stats-shotquality-dot--goal' },
    { label: 'Saved',  cls: 'stats-shotquality-dot--saved' },
    { label: 'Missed', cls: 'stats-shotquality-dot--missed' },
  ];
  const lg = svg.append('g').attr('transform', `translate(${totalW / 2 - 100},${mg.top + H + 22})`);
  LEGEND.forEach((d, i) => {
    lg.append('circle').attr('cx', i * 110 + 6).attr('cy', -2).attr('r', 6)
      .attr('class', `stats-shotquality-dot ${d.cls}`);
    lg.append('text').attr('x', i * 110 + 16).attr('y', 3)
      .attr('class', 'stats-shotquality-legend').text(d.label);
  });
}

export const ShotQuality = { render };
