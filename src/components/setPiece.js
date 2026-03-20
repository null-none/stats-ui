/* global d3 */
import { drawPitch } from '../utils/pitchDraw.js';

function render(svgSelector, deliveries, options = {}) {
  const mg     = { top: 12, right: 16, bottom: 48, left: 16, ...options.margin };
  const totalW = options.width  || 700;
  const totalH = options.height || 440;
  const W = totalW - mg.left - mg.right;
  const H = totalH - mg.top  - mg.bottom;

  const svg = d3.select(svgSelector);
  svg.html('').attr('width', totalW).attr('height', totalH);

  const g = svg.append('g').attr('transform', `translate(${mg.left},${mg.top})`);
  drawPitch(g, W, H, 'stats-pitchmap');

  const px = (v) => (v / 100) * W;
  const py = (v) => (v / 100) * H;

  deliveries.forEach((d) => {
    const outcome = d.outcome || 'cleared';
    const x1 = px(d.fromX), y1 = py(d.fromY);
    const x2 = px(d.toX),   y2 = py(d.toY);
    const mx  = (x1 + x2) / 2;
    const my  = Math.min(y1, y2) - 35;

    g.append('path')
      .attr('d', `M ${x1},${y1} Q ${mx},${my} ${x2},${y2}`)
      .attr('class', `stats-set-piece-arc stats-set-piece-arc--${outcome}`);

    const r = 4;
    g.append('line').attr('x1', x1 - r).attr('y1', y1 - r).attr('x2', x1 + r).attr('y2', y1 + r)
      .attr('class', 'stats-set-piece-from');
    g.append('line').attr('x1', x1 + r).attr('y1', y1 - r).attr('x2', x1 - r).attr('y2', y1 + r)
      .attr('class', 'stats-set-piece-from');

    g.append('circle').attr('cx', x2).attr('cy', y2).attr('r', 5)
      .attr('class', `stats-set-piece-to stats-set-piece-to--${outcome}`);
  });

  const lg = svg.append('g').attr('transform', `translate(${mg.left},${mg.top + H + 10})`);
  [
    { outcome: 'goal',    color: '#000',     label: 'Goal',    filled: true,  dashed: false },
    { outcome: 'chance',  color: '#9ca3af',  label: 'Chance',  filled: true,  dashed: false },
    { outcome: 'cleared', color: '#ddd',     label: 'Cleared', filled: false, dashed: true  },
  ].forEach(({ color, label, filled, dashed }, i) => {
    const off = i * 110;
    lg.append('line').attr('x1', off).attr('y1', 8).attr('x2', off + 14).attr('y2', 8)
      .attr('stroke', color).attr('stroke-width', 1.5)
      .attr('stroke-dasharray', dashed ? '3 2' : null);
    lg.append('circle').attr('cx', off + 7).attr('cy', 8).attr('r', 4)
      .attr('fill', filled ? color : 'none')
      .attr('stroke', color).attr('stroke-width', 1);
    lg.append('text').attr('x', off + 20).attr('y', 12)
      .attr('class', 'stats-set-piece-legend').text(label);
  });
}

export const SetPiece = { render };
