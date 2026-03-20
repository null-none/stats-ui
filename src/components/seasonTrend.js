/* global d3 */

function render(svgSelector, data, options = {}) {
  const mg     = { top: 20, right: 50, bottom: 44, left: 40, ...options.margin };
  const totalW = options.width  || 720;
  const totalH = options.height || 280;
  const W = totalW - mg.left - mg.right;
  const H = totalH - mg.top  - mg.bottom;

  const svg = d3.select(svgSelector);
  svg.html('').attr('width', totalW).attr('height', totalH);

  const g = svg.append('g').attr('transform', `translate(${mg.left},${mg.top})`);

  const weeks  = data.map((d, i) => d.week ?? i + 1);
  const keys   = ['gf', 'ga', 'xgf', 'xga'].filter((k) => data.some((d) => d[k] != null));
  const maxVal = d3.max(data, (d) => Math.max(...keys.map((k) => d[k] ?? 0))) || 1;

  const x = d3.scalePoint().domain(weeks).range([0, W]).padding(0.4);
  const y = d3.scaleLinear().domain([0, maxVal * 1.15]).range([H, 0]).nice();

  y.ticks(4).forEach((t) =>
    g.append('line').attr('x1', 0).attr('y1', y(t)).attr('x2', W).attr('y2', y(t))
      .attr('class', 'stats-season-trend-grid'));

  g.append('g').attr('transform', `translate(0,${H})`)
    .call(d3.axisBottom(x).tickFormat((d) => `W${d}`))
    .attr('class', 'stats-season-trend-axis');
  g.append('g').call(d3.axisLeft(y).ticks(4))
    .attr('class', 'stats-season-trend-axis');

  const series = [
    { key: 'gf',  cls: 'gf',  label: options.gfLabel  || 'GF',  dashed: false },
    { key: 'ga',  cls: 'ga',  label: options.gaLabel  || 'GA',  dashed: false },
    { key: 'xgf', cls: 'xgf', label: options.xgfLabel || 'xGF', dashed: true  },
    { key: 'xga', cls: 'xga', label: options.xgaLabel || 'xGA', dashed: true  },
  ].filter(({ key }) => keys.includes(key));

  const lineGen = (key) => d3.line()
    .x((d, i) => x(d.week ?? i + 1))
    .y((d) => y(d[key] ?? 0))
    .curve(d3.curveMonotoneX);

  series.forEach(({ key, cls, dashed }) => {
    g.append('path').datum(data)
      .attr('d', lineGen(key))
      .attr('class', `stats-season-trend-line stats-season-trend-line--${cls}`)
      .attr('stroke-dasharray', dashed ? '5 3' : null);

    if (!dashed) {
      g.selectAll(null).data(data).enter().append('circle')
        .attr('cx', (d, i) => x(d.week ?? i + 1))
        .attr('cy', (d) => y(d[key] ?? 0))
        .attr('r', 3)
        .attr('class', `stats-season-trend-dot stats-season-trend-dot--${cls}`);
    }
  });

  const lg = svg.append('g').attr('transform', `translate(${mg.left},${totalH - 6})`);
  series.forEach(({ cls, label, dashed }, i) => {
    const off = i * 72;
    lg.append('line').attr('x1', off).attr('y1', 0).attr('x2', off + 14).attr('y2', 0)
      .attr('class', `stats-season-trend-line stats-season-trend-line--${cls}`)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', dashed ? '5 3' : null);
    lg.append('text').attr('x', off + 18).attr('y', 4)
      .attr('class', 'stats-season-trend-legend').text(label);
  });
}

export const SeasonTrend = { render };
