/* global d3 */
import { drawPitch } from '../utils/pitchDraw.js';

function render(svgSelector, duels, options = {}) {
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

  duels.forEach((d) => {
    const cls = `stats-duels-map-${d.won ? 'won' : 'lost'}-${d.type || 'ground'}`;
    const r   = d.type === 'aerial' ? 6 : 5;
    g.append('circle')
      .attr('cx', px(d.x)).attr('cy', py(d.y)).attr('r', r)
      .attr('class', cls);
  });

  const lg = svg.append('g').attr('transform', `translate(${mg.left},${mg.top + H + 10})`);
  [
    { label: 'Ground won', filled: true,  color: '#000',     stroke: '#000'     },
    { label: 'Aerial won', filled: true,  color: '#000',     stroke: '#000'     },
    { label: 'Ground lost', filled: false, color: 'none',   stroke: '#9ca3af'  },
    { label: 'Aerial lost', filled: false, color: 'none',   stroke: '#e11d48'  },
  ].forEach(({ label, filled, color, stroke }, i) => {
    const off = i * 120;
    lg.append('circle').attr('cx', off + 6).attr('cy', 8).attr('r', 5)
      .attr('fill', filled ? color : 'none')
      .attr('stroke', stroke).attr('stroke-width', 1.5);
    lg.append('text').attr('x', off + 16).attr('y', 12)
      .attr('class', 'stats-duels-map-legend').text(label);
  });
}

export const DuelsMap = { render };
