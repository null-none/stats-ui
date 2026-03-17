/* global d3 */
function render(svgSelector, data, options = {}) {
  const mg     = { top: 20, right: 30, bottom: 50, left: 55, ...options.margin };
  const totalW = options.width  || 620;
  const totalH = options.height || 420;
  const W = totalW - mg.left - mg.right;
  const H = totalH - mg.top  - mg.bottom;

  const svg = d3.select(svgSelector);
  svg.html('').attr('width', totalW).attr('height', totalH);

  const g = svg.append('g').attr('transform', `translate(${mg.left},${mg.top})`);

  const xExt = options.xDomain || d3.extent(data, (d) => d.x);
  const yExt = options.yDomain || d3.extent(data, (d) => d.y);
  const xPad = (xExt[1] - xExt[0]) * 0.1 || 1;
  const yPad = (yExt[1] - yExt[0]) * 0.1 || 1;

  const x = d3.scaleLinear().domain([xExt[0] - xPad, xExt[1] + xPad]).range([0, W]).nice();
  const y = d3.scaleLinear().domain([yExt[0] - yPad, yExt[1] + yPad]).range([H, 0]).nice();

  x.ticks(6).forEach((t) =>
    g.append('line').attr('x1', x(t)).attr('y1', 0).attr('x2', x(t)).attr('y2', H)
      .attr('class', 'stats-scatter-grid'));
  y.ticks(5).forEach((t) =>
    g.append('line').attr('x1', 0).attr('y1', y(t)).attr('x2', W).attr('y2', y(t))
      .attr('class', 'stats-scatter-grid'));

  (options.refLines || []).forEach((rl) => {
    if (rl.axis === 'x') {
      g.append('line').attr('x1', x(rl.value)).attr('y1', 0)
        .attr('x2', x(rl.value)).attr('y2', H).attr('class', 'stats-scatter-refline');
      if (rl.label) g.append('text').attr('x', x(rl.value) + 4).attr('y', 10)
        .attr('class', 'stats-scatter-reflabel').text(rl.label);
    } else {
      g.append('line').attr('x1', 0).attr('y1', y(rl.value))
        .attr('x2', W).attr('y2', y(rl.value)).attr('class', 'stats-scatter-refline');
      if (rl.label) g.append('text').attr('x', 4).attr('y', y(rl.value) - 4)
        .attr('class', 'stats-scatter-reflabel').text(rl.label);
    }
  });

  g.append('g').attr('transform', `translate(0,${H})`).call(d3.axisBottom(x).ticks(6))
    .attr('class', 'stats-scatter-axis');
  g.append('g').call(d3.axisLeft(y).ticks(5)).attr('class', 'stats-scatter-axis');

  if (options.xLabel)
    g.append('text').attr('x', W / 2).attr('y', H + 40)
      .attr('class', 'stats-scatter-axislabel').text(options.xLabel);
  if (options.yLabel)
    g.append('text').attr('transform', `translate(-42,${H / 2}) rotate(-90)`)
      .attr('class', 'stats-scatter-axislabel').text(options.yLabel);

  g.selectAll('.stats-scatter-dot').data(data).enter().append('circle')
    .attr('cx', (d) => x(d.x)).attr('cy', (d) => y(d.y)).attr('r', (d) => d.r || 6)
    .attr('fill', (d) => d.color || '#000').attr('stroke', (d) => d.color || '#000')
    .attr('class', 'stats-scatter-dot');

  if (options.showLabels !== false)
    g.selectAll('.stats-scatter-label').data(data.filter((d) => d.label)).enter().append('text')
      .attr('x', (d) => x(d.x) + (d.r || 6) + 4).attr('y', (d) => y(d.y) + 4)
      .attr('class', 'stats-scatter-label').text((d) => d.label);
}

export const Scatter = { render };
