/* global d3 */

function render(svgSelector, sectors, options = {}) {
  const size   = options.size  || 300;
  const rings  = options.rings || 4;
  const cx     = size / 2;
  const cy     = size / 2;
  const outerR = size / 2 - 28;
  const N      = sectors.length;
  const arc    = (2 * Math.PI) / N;

  const svg = d3.select(svgSelector);
  svg.html('').attr('width', size).attr('height', size);

  for (let r = 1; r <= rings; r++) {
    svg.append('circle')
      .attr('cx', cx).attr('cy', cy)
      .attr('r', (outerR / rings) * r)
      .attr('class', 'stats-pass-rose-ring');
  }

  sectors.forEach((_, i) => {
    const a = arc * i - Math.PI / 2;
    svg.append('line')
      .attr('x1', cx).attr('y1', cy)
      .attr('x2', cx + outerR * Math.cos(a))
      .attr('y2', cy + outerR * Math.sin(a))
      .attr('class', 'stats-pass-rose-spoke');
  });

  const maxCount = d3.max(sectors, (d) => d.count) || 1;
  const arcGen   = d3.arc()
    .innerRadius(0)
    .startAngle((_, i) => arc * i - arc / 2 - Math.PI / 2)
    .endAngle((_, i)   => arc * i + arc / 2 - Math.PI / 2)
    .outerRadius((d)   => (d.count / maxCount) * outerR);

  svg.selectAll('.stats-pass-rose-sector')
    .data(sectors).enter().append('path')
    .attr('transform', `translate(${cx},${cy})`)
    .attr('d', arcGen)
    .attr('class', 'stats-pass-rose-sector')
    .attr('fill', (d) => {
      const acc = d.accuracy ?? 0.75;
      return acc >= 0.8 ? '#000' : acc >= 0.65 ? '#555' : '#9ca3af';
    });

  const labelR = outerR + 14;
  sectors.forEach((d, i) => {
    const a = arc * i - Math.PI / 2;
    svg.append('text')
      .attr('x', cx + labelR * Math.cos(a))
      .attr('y', cy + labelR * Math.sin(a))
      .attr('class', 'stats-pass-rose-label')
      .text(d.label || '');
  });

  const total = d3.sum(sectors, (d) => d.count);
  svg.append('text').attr('x', cx).attr('y', cy - 7)
    .attr('class', 'stats-pass-rose-center-val').text(total);
  svg.append('text').attr('x', cx).attr('y', cy + 9)
    .attr('class', 'stats-pass-rose-center-lbl').text('passes');
}

export const PassRose = { render };
