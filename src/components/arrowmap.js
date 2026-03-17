/* global d3 */
import { drawPitch } from '../utils/pitchDraw.js';

const TYPES = {
  pass:    { color: '#000',     width: 2,   curve: 28, opacity: 0.7 },
  run:     { color: '#002b5b',  width: 2.5, curve: 0,  opacity: 0.8 },
  shot:    { color: '#e11d48',  width: 2,   curve: 0,  opacity: 0.9 },
  press:   { color: '#f97316',  width: 1.5, curve: 0,  opacity: 0.65 },
  dribble: { color: '#16a34a',  width: 2,   curve: 22, opacity: 0.8 },
  default: { color: '#9ca3af',  width: 1.5, curve: 10, opacity: 0.6 },
};

function render(svgSelector, arrows, options = {}) {
  const mg     = { top: 12, right: 16, bottom: 38, left: 16, ...options.margin };
  const totalW = options.width  || 700;
  const totalH = options.height || 440;
  const W = totalW - mg.left - mg.right;
  const H = totalH - mg.top  - mg.bottom;

  const svg = d3.select(svgSelector);
  svg.html('').attr('width', totalW).attr('height', totalH);

  // Arrow markers
  const defs = svg.append('defs');
  Object.entries(TYPES).forEach(([type, cfg]) =>
    defs.append('marker')
      .attr('id', `am-arrow-${type}`)
      .attr('markerWidth', 7).attr('markerHeight', 7)
      .attr('refX', 5).attr('refY', 3).attr('orient', 'auto')
      .append('path').attr('d', 'M0,0 L0,6 L7,3 z').attr('fill', cfg.color));

  const g = svg.append('g').attr('transform', `translate(${mg.left},${mg.top})`);
  drawPitch(g, W, H, 'stats-arrowmap');

  const px = (v) => (v / 100) * W;
  const py = (v) => (v / 100) * H;

  arrows.forEach((a) => {
    const cfg = TYPES[a.type] || TYPES.default;
    const x1 = px(a.x1), y1 = py(a.y1);
    const x2 = px(a.x2), y2 = py(a.y2);
    const mx2 = (x1 + x2) / 2, my2 = (y1 + y2) / 2;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const curve = a.curve !== undefined ? a.curve : cfg.curve;
    const cpx = mx2 + (-dy / len) * curve;
    const cpy = my2 + ( dx / len) * curve;
    const sw  = a.value ? Math.max(1.5, Math.min(a.value * 0.6, 7)) : cfg.width;

    g.append('path')
      .attr('d', `M ${x1},${y1} Q ${cpx},${cpy} ${x2},${y2}`)
      .attr('fill', 'none').attr('stroke', cfg.color)
      .attr('stroke-width', sw).attr('stroke-opacity', a.opacity ?? cfg.opacity)
      .attr('marker-end', `url(#am-arrow-${a.type || 'default'})`);
  });

  if (options.showLegend !== false) {
    const types = [...new Set(arrows.map((a) => a.type).filter(Boolean))];
    const lg = svg.append('g').attr('transform', `translate(${mg.left},${mg.top + H + 10})`);
    types.forEach((t, i) => {
      const cfg = TYPES[t] || TYPES.default;
      lg.append('line').attr('x1', i * 120).attr('y1', 8).attr('x2', i * 120 + 14).attr('y2', 8)
        .attr('stroke', cfg.color).attr('stroke-width', 2)
        .attr('marker-end', `url(#am-arrow-${t})`);
      lg.append('text').attr('x', i * 120 + 18).attr('y', 13)
        .attr('class', 'stats-arrowmap-legend').text(t);
    });
  }
}

export const Arrowmap = { render };
