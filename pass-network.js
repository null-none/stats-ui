const passNetwork = {
  draw: function (svgSelector, players, passes) {
    const svg = d3.select(svgSelector);
    svg.selectAll("*").remove();

    // Draw pass lines
    svg
      .selectAll(".stats-pass-network-link")
      .data(passes)
      .enter()
      .append("line")
      .attr("class", "stats-pass-network-link")
      .attr("x1", (d) => getPlayer(d.source).x)
      .attr("y1", (d) => getPlayer(d.source).y)
      .attr("x2", (d) => getPlayer(d.target).x)
      .attr("y2", (d) => getPlayer(d.target).y)
      .attr("stroke-width", (d) => d.value);

    // Draw players
    const playerGroup = svg
      .selectAll(".playerGroup")
      .data(players)
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    playerGroup
      .append("circle")
      .attr("class", "stats-pass-network-player")
      .attr("r", 15);

    playerGroup
      .append("text")
      .attr("class", "stats-pass-network-label")
      .attr("dy", 4)
      .text((d) => d.id);

    function getPlayer(id) {
      return players.find((p) => p.id === id);
    }
  },
};
