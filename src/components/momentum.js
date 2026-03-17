/* global d3 */
/**
 * Momentum.render(svgSelector, data, options)
 *
 * data – [{ minute, value }]
 *   value  +1 to +100 = home dominance
 *   value  -1 to -100 = away dominance
 *   (use integer minute buckets, e.g. one entry per 5 minutes)
 *
 * options – {
 *   width, height, margin,
 *   homeColor, awayColor,
 *   homeLabel, awayLabel,
 *   maxMinute (default 90)
 * }
 */
function render(svgSelector, data, options = {}) {
  const mg     = { top: 28, right: 16, bottom: 28, left: 16, ...options.margin };
  const totalW = options.width    || 760;
  const totalH = options.height   || 200;
  const homeC  = options.homeColor  || '#000';
  const awayC  = options.awayColor  || '#e11d48';
  const homeL  = options.homeLabel  || 'Home';
  const awayL  = options.awayLabel  || 'Away';
  const maxMin = options.maxMinute  || 90;
  const W = totalW - mg.left - mg.right;
  const H = totalH - mg.top  - mg.bottom;
  const mid = H / 2;

  const svg = d3.select(svgSelector);
  svg.html('').attr('width', totalW).attr('height', totalH);

  const g = svg.append('g').attr('transform', `translate(${mg.left},${mg.top})`);

  const x  = d3.scaleLinear().domain([0, maxMin]).range([0, W]);
  const y  = d3.scaleLinear().domain([-100, 100]).range([H, 0]);

  // Background split
  g.append('rect').attr('x', 0).attr('y', 0).attr('width', W).attr('height', mid)
    .attr('class', 'stats-momentum-bg-home');
  g.append('rect').attr('x', 0).attr('y', mid).attr('width', W).attr('height', mid)
    .attr('class', 'stats-momentum-bg-away');

  // Halftime line
  g.append('line').attr('x1', x(45)).attr('y1', 0).attr('x2', x(45)).attr('y2', H)
    .attr('class', 'stats-momentum-halftime');
  g.append('text').attr('x', x(45) + 3).attr('y', 10)
    .attr('class', 'stats-momentum-halftime-label').text('HT');

  // Zero line
  g.append('line').attr('x1', 0).attr('y1', mid).attr('x2', W).attr('y2', mid)
    .attr('class', 'stats-momentum-zero');

  // Bars
  const barW = W / data.length;
  data.forEach((d) => {
    const bx = x(d.minute) - barW / 2;
    const isHome = d.value >= 0;
    const barH   = Math.abs(y(d.value) - mid);
    const by     = isHome ? mid - barH : mid;

    g.append('rect')
      .attr('x', bx).attr('y', by)
      .attr('width', Math.max(barW - 1, 1)).attr('height', barH)
      .attr('class', isHome ? 'stats-momentum-bar-home' : 'stats-momentum-bar-away');
  });

  // Smooth area overlay (optional visual polish)
  const areaHome = d3.area()
    .x((d) => x(d.minute))
    .y0(mid).y1((d) => d.value >= 0 ? y(d.value) : mid)
    .curve(d3.curveCatmullRom);

  const areaAway = d3.area()
    .x((d) => x(d.minute))
    .y0(mid).y1((d) => d.value < 0 ? y(d.value) : mid)
    .curve(d3.curveCatmullRom);

  g.append('path').datum(data).attr('d', areaHome).attr('class', 'stats-momentum-area-home');
  g.append('path').datum(data).attr('d', areaAway).attr('class', 'stats-momentum-area-away');

  // Team labels
  const lbl = svg.append('g');
  lbl.append('text').attr('x', mg.left + 6).attr('y', mg.top / 2 + 5)
    .attr('class', 'stats-momentum-team-label').attr('fill', homeC).text(homeL);
  lbl.append('text').attr('x', mg.left + 6).attr('y', mg.top + H + mg.bottom / 2 + 4)
    .attr('class', 'stats-momentum-team-label').attr('fill', awayC).text(awayL);

  // Minute axis (simplified)
  [0, 15, 30, 45, 60, 75, 90].forEach((m) => {
    if (m > maxMin) return;
    g.append('text').attr('x', x(m)).attr('y', H + 16)
      .attr('class', 'stats-momentum-tick').text(`${m}'`);
  });
}

export const Momentum = { render };
