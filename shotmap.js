(function (global) {
  /**
   * Shotmap.render(svgSelector, shots, options)
   *
   * shots – array of { x, y, result }
   *   x, y  – 0–100 coords relative to goal frame (0,0 = top-left)
   *   result – "goal" | "saved" | "missed"
   *
   * options – { width, height }
   *
   * Renders shots on a goal face (front view).
   * Goal frame fills the SVG with margin for labels.
   */
  function render(svgSelector, shots, options = {}) {
    const W  = options.width  || 500;
    const H  = options.height || 260;
    const mx = 60;  // margin x (for post depth visual)
    const my = 40;  // margin y
    const gw = W - mx * 2;
    const gh = H - my * 2 - 30; // reserve bottom for legend

    const svg = d3.select(svgSelector);
    svg.html("");
    svg.attr("width", W).attr("height", H);

    const g = svg.append("g").attr("transform", `translate(${mx},${my})`);

    // Goal frame
    g.append("rect")
      .attr("x", 0).attr("y", 0)
      .attr("width", gw).attr("height", gh)
      .attr("class", "stats-shotmap-goal");

    // Crossbar line
    g.append("line")
      .attr("x1", 0).attr("y1", 0).attr("x2", gw).attr("y2", 0)
      .attr("stroke", "#444").attr("stroke-width", 4);

    // Post lines
    [[0, 0, 0, gh], [gw, 0, gw, gh]].forEach(([x1, y1, x2, y2]) => {
      g.append("line")
        .attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2)
        .attr("stroke", "#444").attr("stroke-width", 4);
    });

    // Goal net lines (vertical)
    const netCols = 10;
    for (let i = 1; i < netCols; i++) {
      g.append("line")
        .attr("x1", (gw / netCols) * i).attr("y1", 0)
        .attr("x2", (gw / netCols) * i).attr("y2", gh)
        .attr("stroke", "#ddd").attr("stroke-width", 0.5);
    }
    // horizontal
    const netRows = 4;
    for (let j = 1; j < netRows; j++) {
      g.append("line")
        .attr("x1", 0).attr("y1", (gh / netRows) * j)
        .attr("x2", gw).attr("y2", (gh / netRows) * j)
        .attr("stroke", "#ddd").attr("stroke-width", 0.5);
    }

    // Shots
    shots.forEach((shot) => {
      const sx = (shot.x / 100) * gw;
      const sy = (shot.y / 100) * gh;
      const cls = `stats-shotmap-shot stats-shotmap-shot--${shot.result || "saved"}`;
      g.append("circle")
        .attr("cx", sx).attr("cy", sy).attr("r", 6)
        .attr("class", cls);
    });

    // Legend
    const legendData = [
      { label: "Goal",   cls: "stats-shotmap-shot--goal" },
      { label: "Saved",  cls: "stats-shotmap-shot--saved" },
      { label: "Missed", cls: "stats-shotmap-shot--missed" },
    ];
    const lg = svg.append("g").attr("transform", `translate(${mx}, ${my + gh + 14})`);
    legendData.forEach((d, i) => {
      const lx = i * 110;
      lg.append("circle").attr("cx", lx + 6).attr("cy", 6).attr("r", 5).attr("class", `stats-shotmap-shot ${d.cls}`);
      lg.append("text").attr("x", lx + 16).attr("y", 11).attr("class", "stats-shotmap-legend").text(d.label);
    });
  }

  global.Shotmap = { render };
})(window);
