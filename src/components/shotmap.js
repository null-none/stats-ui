/* global d3 */
function render(svgSelector, shots, options = {}) {
  const W  = options.width  || 500;
  const H  = options.height || 260;
  const mx = 60, my = 40;
  const gw = W - mx * 2;
  const gh = H - my * 2 - 30;

  const svg = d3.select(svgSelector);
  svg.html('').attr('width', W).attr('height', H);

  const g = svg.append('g').attr('transform', `translate(${mx},${my})`);

  // Frame
  g.append('rect').attr('x', 0).attr('y', 0).attr('width', gw).attr('height', gh)
    .attr('class', 'stats-shotmap-goal');
  g.append('line').attr('x1', 0).attr('y1', 0).attr('x2', gw).attr('y2', 0)
    .attr('stroke', '#444').attr('stroke-width', 4);
  [[0, 0, 0, gh], [gw, 0, gw, gh]].forEach(([x1, y1, x2, y2]) =>
    g.append('line').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2)
      .attr('stroke', '#444').attr('stroke-width', 4));

  // Net grid
  for (let i = 1; i < 10; i++)
    g.append('line').attr('x1', (gw / 10) * i).attr('y1', 0)
      .attr('x2', (gw / 10) * i).attr('y2', gh).attr('stroke', '#ddd').attr('stroke-width', 0.5);
  for (let j = 1; j < 4; j++)
    g.append('line').attr('x1', 0).attr('y1', (gh / 4) * j)
      .attr('x2', gw).attr('y2', (gh / 4) * j).attr('stroke', '#ddd').attr('stroke-width', 0.5);

  // Shots
  shots.forEach((s) =>
    g.append('circle')
      .attr('cx', (s.x / 100) * gw).attr('cy', (s.y / 100) * gh).attr('r', 6)
      .attr('class', `stats-shotmap-shot stats-shotmap-shot--${s.result || 'saved'}`));

  // Legend
  const LEGEND = [
    { label: 'Goal',   cls: 'stats-shotmap-shot--goal' },
    { label: 'Saved',  cls: 'stats-shotmap-shot--saved' },
    { label: 'Missed', cls: 'stats-shotmap-shot--missed' },
  ];
  const lg = svg.append('g').attr('transform', `translate(${mx},${my + gh + 14})`);
  LEGEND.forEach((d, i) => {
    lg.append('circle').attr('cx', i * 110 + 6).attr('cy', 6).attr('r', 5)
      .attr('class', `stats-shotmap-shot ${d.cls}`);
    lg.append('text').attr('x', i * 110 + 16).attr('y', 11)
      .attr('class', 'stats-shotmap-legend').text(d.label);
  });
}

export const Shotmap = { render };
