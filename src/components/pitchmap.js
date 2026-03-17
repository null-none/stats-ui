/* global d3 */
import { drawPitch } from '../utils/pitchDraw.js';

function render(svgSelector, events, options = {}) {
  const mg     = { top: 12, right: 16, bottom: 38, left: 16, ...options.margin };
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

  events.forEach((e) =>
    g.append('circle')
      .attr('cx', px(e.x)).attr('cy', py(e.y)).attr('r', e.r || 7)
      .attr('class', `stats-pitchmap-event stats-pitchmap-event--${e.type || 'default'}`));

  if (options.showLegend !== false) {
    const types = [...new Set(events.map((e) => e.type).filter(Boolean))];
    const lg = svg.append('g').attr('transform', `translate(${mg.left},${mg.top + H + 10})`);
    types.forEach((t, i) => {
      lg.append('circle').attr('cx', i * 130 + 6).attr('cy', 8).attr('r', 5)
        .attr('class', `stats-pitchmap-event stats-pitchmap-event--${t}`);
      lg.append('text').attr('x', i * 130 + 16).attr('y', 13)
        .attr('class', 'stats-pitchmap-legend').text(t.replace(/-/g, ' '));
    });
  }
}

export const Pitchmap = { render };
