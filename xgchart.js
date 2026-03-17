(function (global) {
  /**
   * XgChart.render(svgSelector, data, options)
   *
   * data – {
   *   home: [{ minute, xg }],   // individual shot events
   *   away: [{ minute, xg }],
   * }
   * Builds cumulative xG lines with shot dots.
   *
   * options – {
   *   width, height, margin,
   *   homeColor, awayColor,
   *   homeLabel, awayLabel,
   *   maxMinute  (default 90)
   * }
   */

  function cumulative(shots, maxMin) {
    const points = [{ minute: 0, cumXg: 0 }];
    let sum = 0;
    shots.slice().sort((a, b) => a.minute - b.minute).forEach((s) => {
      sum += s.xg;
      points.push({ minute: s.minute, cumXg: sum, shot: true });
    });
    points.push({ minute: maxMin, cumXg: sum });
    return points;
  }

  function render(svgSelector, data, options = {}) {
    const mg = { top: 20, right: 40, bottom: 40, left: 50, ...options.margin };
    const totalW  = options.width    || 760;
    const totalH  = options.height   || 340;
    const homeC   = options.homeColor  || "#000";
    const awayC   = options.awayColor  || "#e11d48";
    const homeL   = options.homeLabel  || "Home";
    const awayL   = options.awayLabel  || "Away";
    const maxMin  = options.maxMinute  || 90;

    const W = totalW - mg.left - mg.right;
    const H = totalH - mg.top  - mg.bottom;

    const svg = d3.select(svgSelector);
    svg.html("").attr("width", totalW).attr("height", totalH);

    const g = svg.append("g").attr("transform", `translate(${mg.left},${mg.top})`);

    const homePoints = cumulative(data.home || [], maxMin);
    const awayPoints = cumulative(data.away || [], maxMin);
    const allXg = [...homePoints, ...awayPoints].map((d) => d.cumXg);

    const x = d3.scaleLinear().domain([0, maxMin]).range([0, W]);
    const y = d3.scaleLinear().domain([0, d3.max(allXg) * 1.1 || 1]).range([H, 0]).nice();

    // Grid lines
    y.ticks(4).forEach((t) => {
      g.append("line")
        .attr("x1", 0).attr("y1", y(t))
        .attr("x2", W).attr("y2", y(t))
        .attr("class", "stats-xgchart-grid");
    });

    // Halftime line
    g.append("line")
      .attr("x1", x(45)).attr("y1", 0)
      .attr("x2", x(45)).attr("y2", H)
      .attr("class", "stats-xgchart-halftime");

    g.append("text")
      .attr("x", x(45) + 4).attr("y", 12)
      .attr("class", "stats-xgchart-halftime-label")
      .text("HT");

    // Axes
    g.append("g").attr("transform", `translate(0,${H})`).call(
      d3.axisBottom(x).ticks(9).tickFormat((d) => `${d}'`)
    ).attr("class", "stats-xgchart-axis");

    g.append("g").call(
      d3.axisLeft(y).ticks(4)
    ).attr("class", "stats-xgchart-axis");

    // xG lines
    const lineGen = d3.line()
      .x((d) => x(d.minute))
      .y((d) => y(d.cumXg))
      .curve(d3.curveStepAfter);

    function drawSeries(points, color) {
      g.append("path")
        .datum(points)
        .attr("d", lineGen)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2.5)
        .attr("class", "stats-xgchart-line");

      // Shot dots
      g.selectAll(null)
        .data(points.filter((d) => d.shot))
        .enter()
        .append("circle")
        .attr("cx", (d) => x(d.minute))
        .attr("cy", (d) => y(d.cumXg))
        .attr("r", 5)
        .attr("fill", color)
        .attr("class", "stats-xgchart-dot");
    }

    drawSeries(awayPoints, awayC);
    drawSeries(homePoints, homeC);

    // End-of-line xG labels
    [
      { pts: homePoints, color: homeC },
      { pts: awayPoints, color: awayC },
    ].forEach(({ pts, color }) => {
      const last = pts[pts.length - 1];
      g.append("text")
        .attr("x", x(last.minute) + 4)
        .attr("y", y(last.cumXg) + 4)
        .attr("class", "stats-xgchart-endlabel")
        .attr("fill", color)
        .text(last.cumXg.toFixed(2));
    });

    // Legend
    const lg = svg.append("g").attr("transform", `translate(${mg.left}, ${totalH - 6})`);
    [
      { label: homeL, color: homeC },
      { label: awayL, color: awayC },
    ].forEach(({ label, color }, i) => {
      lg.append("line")
        .attr("x1", i * 120).attr("y1", 0)
        .attr("x2", i * 120 + 16).attr("y2", 0)
        .attr("stroke", color).attr("stroke-width", 2.5);
      lg.append("circle").attr("cx", i * 120 + 8).attr("cy", 0).attr("r", 4).attr("fill", color);
      lg.append("text").attr("x", i * 120 + 22).attr("y", 4)
        .attr("class", "stats-xgchart-legend").text(label);
    });
  }

  global.XgChart = { render };
})(window);
