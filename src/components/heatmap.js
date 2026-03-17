/* global d3 */
import { drawPitch } from '../utils/pitchDraw.js';

/**
 * Heatmap.render(svgSelector, points, options)
 *
 * points – [{ x, y }]  or  [{ x, y, value }]
 *   x, y    – 0–100 pitch coordinates
 *   value   – optional weight (default 1)
 *
 * options – {
 *   width, height, margin,
 *   rows    (default 8),
 *   cols    (default 12),
 *   color   (d3 color scale name: 'YlOrRd' | 'Blues' | 'Greens' | 'RdBu', default 'YlOrRd')
 *   opacity (default 0.7)
 * }
 *
 * Bins points into a grid, normalises values, and colours cells.
 */
function render(svgSelector, points, options = {}) {
  const mg      = { top: 12, right: 16, bottom: 16, left: 16, ...options.margin };
  const totalW  = options.width   || 700;
  const totalH  = options.height  || 440;
  const rows    = options.rows    || 8;
  const cols    = options.cols    || 12;
  const opacity = options.opacity !== undefined ? options.opacity : 0.72;
  const W = totalW - mg.left - mg.right;
  const H = totalH - mg.top  - mg.bottom;

  const svg = d3.select(svgSelector);
  svg.html('').attr('width', totalW).attr('height', totalH);

  // Clip path so heatmap cells don't overflow pitch boundary
  svg.append('defs').append('clipPath').attr('id', 'hm-clip')
    .append('rect').attr('x', 0).attr('y', 0).attr('width', W).attr('height', H);

  const g = svg.append('g').attr('transform', `translate(${mg.left},${mg.top})`);

  // Pitch background (drawn before heat cells)
  drawPitch(g, W, H, 'stats-heatmap-pitch');

  // --- Binning ---
  const grid = Array.from({ length: rows }, () => new Array(cols).fill(0));
  points.forEach((p) => {
    const col = Math.min(Math.floor((p.x / 100) * cols), cols - 1);
    const row = Math.min(Math.floor((p.y / 100) * rows), rows - 1);
    grid[row][col] += p.value !== undefined ? p.value : 1;
  });

  const flat  = grid.flat();
  const maxV  = d3.max(flat) || 1;
  const scale = d3.scaleSequential()
    .domain([0, maxV])
    .interpolator(d3[`interpolate${options.color || 'YlOrRd'}`] || d3.interpolateYlOrRd);

  const cw = W / cols;
  const ch = H / rows;

  const heatG = g.append('g').attr('clip-path', 'url(#hm-clip)');

  grid.forEach((row, ri) =>
    row.forEach((val, ci) => {
      if (val === 0) return;
      heatG.append('rect')
        .attr('x', ci * cw).attr('y', ri * ch)
        .attr('width', cw).attr('height', ch)
        .attr('fill', scale(val))
        .attr('opacity', opacity)
        .attr('class', 'stats-heatmap-cell');
    }));

  // Pitch lines drawn on top of heat cells
  drawPitch(g, W, H, 'stats-heatmap-lines');
}

export const Heatmap = { render };
