/* global d3 */
function draw(svgSelector, players, passes) {
  const svg = d3.select(svgSelector);
  svg.selectAll('*').remove();

  function getPlayer(id) { return players.find((p) => p.id === id); }

  svg.selectAll('.stats-pass-network-link').data(passes).enter()
    .append('line')
    .attr('class', 'stats-pass-network-link')
    .attr('x1', (d) => getPlayer(d.source).x)
    .attr('y1', (d) => getPlayer(d.source).y)
    .attr('x2', (d) => getPlayer(d.target).x)
    .attr('y2', (d) => getPlayer(d.target).y)
    .attr('stroke-width', (d) => d.value);

  const pg = svg.selectAll('.playerGroup').data(players).enter()
    .append('g').attr('transform', (d) => `translate(${d.x},${d.y})`);

  pg.append('circle').attr('class', 'stats-pass-network-player').attr('r', 15);
  pg.append('text').attr('class', 'stats-pass-network-label').attr('dy', 4).text((d) => d.id);
}

export const PassNetwork = { draw };
