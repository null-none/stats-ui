(function (global) {
  /**
   * Arrowmap.render(svgSelector, arrows, options)
   *
   * arrows – [{ x1, y1, x2, y2, type, value?, curve? }]
   *   x1,y1, x2,y2 – 0–100 pitch coordinates
   *   type  – "pass" | "run" | "shot" | "press" | "dribble"
   *   value – optional thickness multiplier
   *   curve – optional curvature px offset (overrides type default)
   *
   * options – { width, height, margin, showLegend }
   */

  const TYPES = {
    pass:    { color: "#000",     width: 2,   curve: 28, opacity: 0.7 },
    run:     { color: "#002b5b",  width: 2.5, curve: 0,  opacity: 0.8 },
    shot:    { color: "#e11d48",  width: 2,   curve: 0,  opacity: 0.9 },
    press:   { color: "#f97316",  width: 1.5, curve: 0,  opacity: 0.65 },
    dribble: { color: "#16a34a",  width: 2,   curve: 22, opacity: 0.8 },
    default: { color: "#9ca3af",  width: 1.5, curve: 10, opacity: 0.6 },
  };

  // Shared pitch outline (same proportions as pitchmap.js)
  const P = {
    penAreaX: 15.71, penAreaY1: 20.35, penAreaH: 59.3,
    boxX: 5.24, boxY1: 36.53, boxH: 26.94,
    goalY1: 44.62, goalH: 10.76, goalDepth: 2.33,
    halfX: 50, circleR: 8.71, penL: 10.48, penR: 89.52,
  };

  function drawPitch(g, W, H) {
    const px = (v) => (v / 100) * W;
    const py = (v) => (v / 100) * H;
    const rc = (x, y, w, h) =>
      g.append("rect").attr("x", px(x)).attr("y", py(y))
        .attr("width", px(w)).attr("height", py(h))
        .attr("class", "stats-arrowmap-line").attr("fill", "none");

    g.append("rect").attr("x", 0).attr("y", 0).attr("width", W).attr("height", H)
      .attr("class", "stats-arrowmap-bg");
    g.append("rect").attr("x", 0).attr("y", 0).attr("width", W).attr("height", H)
      .attr("class", "stats-arrowmap-line").attr("fill", "none");

    g.append("line").attr("x1", px(P.halfX)).attr("y1", 0)
      .attr("x2", px(P.halfX)).attr("y2", H).attr("class", "stats-arrowmap-line");

    g.append("circle").attr("cx", px(P.halfX)).attr("cy", py(50))
      .attr("r", px(P.circleR)).attr("class", "stats-arrowmap-circle");
    g.append("circle").attr("cx", px(P.halfX)).attr("cy", py(50))
      .attr("r", 2.5).attr("class", "stats-arrowmap-spot");

    rc(0, P.penAreaY1, P.penAreaX, P.penAreaH);
    rc(100 - P.penAreaX, P.penAreaY1, P.penAreaX, P.penAreaH);
    rc(0, P.boxY1, P.boxX, P.boxH);
    rc(100 - P.boxX, P.boxY1, P.boxX, P.boxH);

    g.append("rect").attr("x", -px(P.goalDepth)).attr("y", py(P.goalY1))
      .attr("width", px(P.goalDepth)).attr("height", py(P.goalH))
      .attr("class", "stats-arrowmap-goal");
    g.append("rect").attr("x", px(100)).attr("y", py(P.goalY1))
      .attr("width", px(P.goalDepth)).attr("height", py(P.goalH))
      .attr("class", "stats-arrowmap-goal");

    g.append("circle").attr("cx", px(P.penL)).attr("cy", py(50)).attr("r", 2.5).attr("class", "stats-arrowmap-spot");
    g.append("circle").attr("cx", px(P.penR)).attr("cy", py(50)).attr("r", 2.5).attr("class", "stats-arrowmap-spot");
  }

  function setupMarkers(defs) {
    Object.entries(TYPES).forEach(([type, cfg]) => {
      defs.append("marker")
        .attr("id", `am-arrow-${type}`)
        .attr("markerWidth", 7).attr("markerHeight", 7)
        .attr("refX", 5).attr("refY", 3)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,0 L0,6 L7,3 z")
        .attr("fill", cfg.color);
    });
  }

  function render(svgSelector, arrows, options = {}) {
    const mg = { top: 12, right: 16, bottom: 38, left: 16, ...options.margin };
    const totalW = options.width  || 700;
    const totalH = options.height || 440;
    const W = totalW - mg.left - mg.right;
    const H = totalH - mg.top  - mg.bottom;

    const svg = d3.select(svgSelector);
    svg.html("").attr("width", totalW).attr("height", totalH);

    const defs = svg.append("defs");
    setupMarkers(defs);

    const g = svg.append("g").attr("transform", `translate(${mg.left},${mg.top})`);
    drawPitch(g, W, H);

    const px = (v) => (v / 100) * W;
    const py = (v) => (v / 100) * H;

    arrows.forEach((a) => {
      const cfg = TYPES[a.type] || TYPES.default;
      const x1 = px(a.x1), y1 = py(a.y1);
      const x2 = px(a.x2), y2 = py(a.y2);

      // Curved quadratic bezier control point
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const curveAmount = a.curve !== undefined ? a.curve : cfg.curve;
      const cpx = mx + (-dy / len) * curveAmount;
      const cpy = my + ( dx / len) * curveAmount;

      const strokeW = a.value ? Math.max(1.5, Math.min(a.value * 0.6, 7)) : cfg.width;
      const type = a.type || "default";

      g.append("path")
        .attr("d", `M ${x1},${y1} Q ${cpx},${cpy} ${x2},${y2}`)
        .attr("fill", "none")
        .attr("stroke", cfg.color)
        .attr("stroke-width", strokeW)
        .attr("stroke-opacity", a.opacity ?? cfg.opacity)
        .attr("marker-end", `url(#am-arrow-${type})`);
    });

    if (options.showLegend !== false) {
      const types = [...new Set(arrows.map((a) => a.type).filter(Boolean))];
      const lg = svg.append("g")
        .attr("transform", `translate(${mg.left}, ${mg.top + H + 10})`);

      types.forEach((t, i) => {
        const cfg = TYPES[t] || TYPES.default;
        lg.append("line")
          .attr("x1", i * 120).attr("y1", 8)
          .attr("x2", i * 120 + 14).attr("y2", 8)
          .attr("stroke", cfg.color).attr("stroke-width", 2)
          .attr("marker-end", `url(#am-arrow-${t})`);
        lg.append("text").attr("x", i * 120 + 18).attr("y", 13)
          .attr("class", "stats-arrowmap-legend").text(t);
      });
    }
  }

  global.Arrowmap = { render };
})(window);
