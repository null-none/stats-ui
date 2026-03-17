/* global d3 */
function render(svgSelector, datasets, options = {}) {
  const size        = options.size        || 300;
  const levels      = options.levels      || 5;
  const labelOffset = options.labelOffset || 18;
  const radius      = size / 2 - labelOffset - 10;
  const cx = size / 2, cy = size / 2;

  const axes = datasets[0].values.map((d) => d.axis);
  const N    = axes.length;
  const step = (2 * Math.PI) / N;

  const angle  = (i) => step * i - Math.PI / 2;
  const ptX    = (r, i) => cx + r * Math.cos(angle(i));
  const ptY    = (r, i) => cy + r * Math.sin(angle(i));
  const toPoints = (vals) => vals.map((d, i) => [
    ptX((d.value / 100) * radius, i),
    ptY((d.value / 100) * radius, i),
  ]);
  const pts2str  = (pts) => pts.map((p) => p.join(',')).join(' ');

  const svg = d3.select(svgSelector);
  svg.html('').attr('width', size).attr('height', size);

  // Grid rings
  for (let l = 1; l <= levels; l++) {
    const r   = (radius / levels) * l;
    const pts = Array.from({ length: N }, (_, i) => [ptX(r, i), ptY(r, i)]);
    svg.append('polygon').attr('points', pts2str(pts)).attr('class', 'stats-radar-grid');
  }

  // Axes
  axes.forEach((_, i) =>
    svg.append('line')
      .attr('x1', cx).attr('y1', cy)
      .attr('x2', ptX(radius, i)).attr('y2', ptY(radius, i))
      .attr('class', 'stats-radar-axis'));

  // Labels
  axes.forEach((label, i) => {
    const r = radius + labelOffset;
    svg.append('text')
      .attr('x', ptX(r, i)).attr('y', ptY(r, i))
      .attr('dy', '0.35em')
      .attr('class', 'stats-radar-label')
      .text(label);
  });

  // Areas (reverse so first dataset is on top)
  [...datasets].reverse().forEach((ds) => {
    const pts = toPoints(ds.values);
    svg.append('polygon').attr('points', pts2str(pts))
      .attr('class', `stats-radar-area ${ds.cls || ''}`)
      .attr('stroke', ds.color || '#000').attr('fill', ds.color || '#000');

    pts.forEach(([x, y]) =>
      svg.append('circle').attr('cx', x).attr('cy', y).attr('r', 4)
        .attr('class', `stats-radar-dot ${ds.cls || ''}`).attr('fill', ds.color || '#000'));
  });
}

export const Radar = { render };
