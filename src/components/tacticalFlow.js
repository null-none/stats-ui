/* global d3 */
function render(svgSelector, data, options = {}) {
  const svg = d3.select(svgSelector);
  const mg  = options.margin || { top: 40, right: 20, bottom: 30, left: 50 };
  const W   = (+svg.attr('width')  || 960) - mg.left - mg.right;
  const H   = (+svg.attr('height') || 500) - mg.top  - mg.bottom;

  const g = svg.append('g').attr('transform', `translate(${mg.left},${mg.top})`);

  const attackData  = data.filter((d) => d.attack  !== undefined);
  const defenseData = data.filter((d) => d.defense !== undefined);

  const x = d3.scaleLinear().domain(d3.extent(data, (d) => d.index)).range([0, W]);
  const y = d3.scaleLinear()
    .domain([
      d3.min(data, (d) => Math.min(d.attack ?? Infinity,  d.defense ?? Infinity)),
      d3.max(data, (d) => Math.max(d.attack ?? -Infinity, d.defense ?? -Infinity)),
    ]).nice().range([H, 0]);

  const line = (key) => d3.line()
    .defined((d) => d[key] !== undefined)
    .x((d) => x(d.index)).y((d) => y(d[key]));

  g.append('path').datum(attackData)
    .attr('fill', 'none').attr('stroke', options.attackColor  || '#000').attr('stroke-width', 2)
    .attr('d', line('attack'));
  g.append('path').datum(defenseData)
    .attr('fill', 'none').attr('stroke', options.defenseColor || 'red').attr('stroke-width', 2)
    .attr('d', line('defense'));

  const dot = (arr, key, color) =>
    g.selectAll(null).data(arr).enter().append('circle')
      .attr('r', 5).attr('fill', color)
      .attr('cx', (d) => x(d.index)).attr('cy', (d) => y(d[key]));

  dot(attackData,  'attack',  options.attackColor  || '#000');
  dot(defenseData, 'defense', options.defenseColor || 'red');

  g.append('g').attr('transform', `translate(0,${H})`).call(d3.axisBottom(x).ticks(data.length));
  g.append('g').call(d3.axisLeft(y));

  const lg = svg.append('g').attr('transform', `translate(${W / 2},10)`);
  lg.append('rect').attr('x', -30).attr('y', -10).attr('width', 120).attr('height', 25)
    .attr('fill', 'white').attr('opacity', 0.7);

  [
    { cx: 0,  color: options.attackColor  || '#000', label: options.attackLabel  || 'Attack' },
    { cx: 80, color: options.defenseColor || 'red',  label: options.defenseLabel || 'Defense' },
  ].forEach(({ cx, color, label }) => {
    lg.append('circle').attr('cx', cx).attr('cy', -2).attr('r', 5).attr('fill', color);
    lg.append('text').attr('x', cx + 10).attr('y', 4).text(label);
  });
}

export const TacticalFlow = { render };
