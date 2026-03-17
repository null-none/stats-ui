(function (global) {
  /**
   * Pitchmap.render(svgSelector, events, options)
   *
   * events – [{ x, y, type, r? }]
   *   x, y  – 0–100 pitch coordinates (0,0 = top-left attacking right)
   *   type  – "shot-goal" | "shot-saved" | "shot-missed" |
   *           "tackle" | "interception" | "key-pass" | "foul"
   *
   * options – { width, height, margin, showLegend }
   */

  // Pitch dimensions in meters (used for proportional markings)
  const P = {
    penAreaX:  15.71, // 16.5/105
    penAreaY1: 20.35, // (68-40.32)/2/68
    penAreaH:  59.3,  // 40.32/68
    boxX:       5.24, // 5.5/105
    boxY1:     36.53,
    boxH:      26.94,
    goalY1:    44.62,
    goalH:     10.76,
    goalDepth:  2.33,
    halfX:     50,
    circleR:    8.71, // 9.15/105 (uses W axis)
    penL:      10.48,
    penR:      89.52,
  };

  function drawPitch(g, W, H) {
    const px = (v) => (v / 100) * W;
    const py = (v) => (v / 100) * H;

    const ln = (x1, y1, x2, y2) =>
      g.append("line")
        .attr("x1", px(x1)).attr("y1", py(y1))
        .attr("x2", px(x2)).attr("y2", py(y2))
        .attr("class", "stats-pitchmap-line");

    const rc = (x, y, w, h) =>
      g.append("rect")
        .attr("x", px(x)).attr("y", py(y))
        .attr("width", px(w)).attr("height", py(h))
        .attr("class", "stats-pitchmap-line")
        .attr("fill", "none");

    // Pitch background
    g.append("rect").attr("x", 0).attr("y", 0)
      .attr("width", W).attr("height", H)
      .attr("class", "stats-pitchmap-bg");

    // Boundary
    g.append("rect").attr("x", 0).attr("y", 0)
      .attr("width", W).attr("height", H)
      .attr("class", "stats-pitchmap-line").attr("fill", "none");

    // Halfway line
    ln(P.halfX, 0, P.halfX, 100);

    // Center circle
    g.append("circle")
      .attr("cx", px(P.halfX)).attr("cy", py(50))
      .attr("r", px(P.circleR))
      .attr("class", "stats-pitchmap-circle");

    // Center dot
    g.append("circle").attr("cx", px(P.halfX)).attr("cy", py(50))
      .attr("r", 2.5).attr("class", "stats-pitchmap-spot");

    // Penalty areas
    rc(0, P.penAreaY1, P.penAreaX, P.penAreaH);
    rc(100 - P.penAreaX, P.penAreaY1, P.penAreaX, P.penAreaH);

    // 6-yard boxes
    rc(0, P.boxY1, P.boxX, P.boxH);
    rc(100 - P.boxX, P.boxY1, P.boxX, P.boxH);

    // Goals
    g.append("rect")
      .attr("x", -px(P.goalDepth)).attr("y", py(P.goalY1))
      .attr("width", px(P.goalDepth)).attr("height", py(P.goalH))
      .attr("class", "stats-pitchmap-goal");

    g.append("rect")
      .attr("x", px(100)).attr("y", py(P.goalY1))
      .attr("width", px(P.goalDepth)).attr("height", py(P.goalH))
      .attr("class", "stats-pitchmap-goal");

    // Penalty spots
    g.append("circle").attr("cx", px(P.penL)).attr("cy", py(50))
      .attr("r", 2.5).attr("class", "stats-pitchmap-spot");
    g.append("circle").attr("cx", px(P.penR)).attr("cy", py(50))
      .attr("r", 2.5).attr("class", "stats-pitchmap-spot");
  }

  function render(svgSelector, events, options = {}) {
    const mg = { top: 12, right: 16, bottom: 38, left: 16, ...options.margin };
    const totalW = options.width  || 700;
    const totalH = options.height || 440;
    const W = totalW - mg.left - mg.right;
    const H = totalH - mg.top  - mg.bottom;

    const svg = d3.select(svgSelector);
    svg.html("").attr("width", totalW).attr("height", totalH);

    const g = svg.append("g").attr("transform", `translate(${mg.left},${mg.top})`);
    drawPitch(g, W, H);

    const px = (v) => (v / 100) * W;
    const py = (v) => (v / 100) * H;

    events.forEach((e) => {
      g.append("circle")
        .attr("cx", px(e.x)).attr("cy", py(e.y))
        .attr("r", e.r || 7)
        .attr("class", `stats-pitchmap-event stats-pitchmap-event--${e.type || "default"}`);
    });

    if (options.showLegend !== false) {
      const types = [...new Set(events.map((e) => e.type).filter(Boolean))];
      const lg = svg.append("g")
        .attr("transform", `translate(${mg.left}, ${mg.top + H + 10})`);

      types.forEach((t, i) => {
        lg.append("circle").attr("cx", i * 130 + 6).attr("cy", 8).attr("r", 5)
          .attr("class", `stats-pitchmap-event stats-pitchmap-event--${t}`);
        lg.append("text").attr("x", i * 130 + 16).attr("y", 13)
          .attr("class", "stats-pitchmap-legend").text(t.replace(/-/g, " "));
      });
    }
  }

  global.Pitchmap = { render };
})(window);
