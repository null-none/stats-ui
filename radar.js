(function (global) {
  /**
   * Radar.render(svgSelector, datasets, options)
   *
   * datasets – array of { label, color, values: [{ axis, value }] }
   * All values should be 0–100.
   *
   * options – { size, levels, labelOffset }
   */
  function render(svgSelector, datasets, options = {}) {
    const size        = options.size        || 300;
    const levels      = options.levels      || 5;
    const labelOffset = options.labelOffset || 18;
    const radius      = size / 2 - labelOffset - 10;
    const cx          = size / 2;
    const cy          = size / 2;

    const axes = datasets[0].values.map((d) => d.axis);
    const N    = axes.length;
    const step = (2 * Math.PI) / N;

    function angle(i) { return step * i - Math.PI / 2; }
    function px(r, i) { return cx + r * Math.cos(angle(i)); }
    function py(r, i) { return cy + r * Math.sin(angle(i)); }
    function toPoints(vals) {
      return vals.map((d, i) => [px((d.value / 100) * radius, i), py((d.value / 100) * radius, i)]);
    }
    function pointsStr(pts) { return pts.map((p) => p.join(",")).join(" "); }

    const svg = d3.select(svgSelector);
    svg.html("");
    svg.attr("width", size).attr("height", size);

    // Grid
    for (let l = 1; l <= levels; l++) {
      const r = (radius / levels) * l;
      const pts = Array.from({ length: N }, (_, i) => [px(r, i), py(r, i)]);
      svg.append("polygon")
        .attr("points", pointsStr(pts))
        .attr("class", "stats-radar-grid");
    }

    // Axes
    axes.forEach((_, i) => {
      svg.append("line")
        .attr("x1", cx).attr("y1", cy)
        .attr("x2", px(radius, i)).attr("y2", py(radius, i))
        .attr("class", "stats-radar-axis");
    });

    // Labels
    axes.forEach((label, i) => {
      const r = radius + labelOffset;
      svg.append("text")
        .attr("x", px(r, i)).attr("y", py(r, i))
        .attr("dy", "0.35em")
        .attr("class", "stats-radar-label")
        .text(label);
    });

    // Areas (drawn in reverse so first dataset is on top)
    [...datasets].reverse().forEach((ds) => {
      const pts = toPoints(ds.values);
      const cls = ds.cls || "";
      svg.append("polygon")
        .attr("points", pointsStr(pts))
        .attr("class", `stats-radar-area ${cls}`)
        .attr("stroke", ds.color || "#000")
        .attr("fill", ds.color || "#000");

      pts.forEach(([x, y]) => {
        svg.append("circle")
          .attr("cx", x).attr("cy", y).attr("r", 4)
          .attr("class", `stats-radar-dot ${cls}`)
          .attr("fill", ds.color || "#000");
      });
    });
  }

  global.Radar = { render };
})(window);
