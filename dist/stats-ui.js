var StatsUI = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.js
  var src_exports = {};
  __export(src_exports, {
    Arrowmap: () => Arrowmap,
    Bars: () => Bars,
    EventLog: () => EventLog,
    Formation: () => Formation,
    Heatmap: () => Heatmap,
    Momentum: () => Momentum,
    PassNetwork: () => PassNetwork,
    Pie: () => Pie,
    Pitch: () => Pitch,
    Pitchmap: () => Pitchmap,
    Radar: () => Radar,
    Scatter: () => Scatter,
    ShotQuality: () => ShotQuality,
    Shotmap: () => Shotmap,
    TacticalFlow: () => TacticalFlow,
    XgChart: () => XgChart
  });

  // src/components/bars.js
  function parseCSV(csv) {
    const [, ...rows] = csv.trim().split("\n");
    return rows.map((row) => {
      const [label, aStr, bStr] = row.split(",");
      return { label, a: Number(aStr), b: Number(bStr) };
    });
  }
  function render(containerId, csvData) {
    const data = parseCSV(csvData);
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    data.forEach(({ label, a, b }) => {
      const max = Math.max(a, b);
      const aW = a / max * 100;
      const bW = b / max * 100;
      const group = document.createElement("div");
      group.className = "stats-bar-group";
      group.innerHTML = `
      <div class="stats-bar-label">${label}</div>
      <div class="stats-bar-container">
        <div class="stats-bar-value">${a}</div>
        <div class="stats-bar-wrapper stats-bar-left-wrapper">
          <div class="stats-bar-bar stats-bar-left" style="width:${aW}%"></div>
        </div>
        <div class="stats-bar-wrapper stats-bar-right-wrapper">
          <div class="stats-bar-bar stats-bar-right" style="width:${bW}%"></div>
        </div>
        <div class="stats-bar-value">${b}</div>
      </div>`;
      container.appendChild(group);
    });
  }
  var Bars = { render };

  // src/components/pie.js
  function render2(containerSelector, data, options = {}) {
    const container = d3.select(containerSelector);
    container.html("");
    const width = options.width || 400;
    const height = options.height || 400;
    const radius = Math.min(width, height) / 2;
    const svg = container.append("svg").attr("width", width).attr("height", height + 40);
    const chart = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);
    const pie = d3.pie().value((d) => d.value).sort(null);
    const arc = d3.arc().innerRadius(0).outerRadius(radius - 10);
    const color = (d) => d.color || "#ccc";
    chart.selectAll("path").data(pie(data)).enter().append("path").attr("fill", (d) => color(d.data)).attr("stroke", "white").attr("stroke-width", 2).transition().duration(900).attrTween("d", function(d) {
      const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
      return (t) => arc(i(t));
    });
    chart.selectAll("text").data(pie(data)).enter().append("text").attr("transform", (d) => `translate(${arc.centroid(d)})`).text((d) => `${d.data.label}: ${d.data.value}`).style("font-size", "12px").style("fill", "white").style("text-anchor", "middle");
    const lg = svg.append("g").attr("transform", `translate(${width / 2},${height + 10})`);
    lg.selectAll(".legend-item").data(data).enter().append("g").attr("class", "legend-item").attr("transform", (d, i) => `translate(${(i - data.length / 2) * 100},0)`).call((g) => {
      g.append("rect").attr("width", 12).attr("height", 12).attr("fill", (d) => color(d));
      g.append("text").attr("x", 18).attr("y", 10).text((d) => d.label).style("font-size", "12px");
    });
  }
  var Pie = { render: render2 };

  // src/components/pitch.js
  function parseCSV2(csv) {
    return csv.trim().split("\n").map(
      (row) => row.trim().split(",").map((cell) => {
        const [g, b] = cell.trim().split(":").map(Number);
        return { good: g || 0, bad: b || 0 };
      })
    );
  }
  function zoneColor(good, bad) {
    const total = good + bad;
    if (total === 0) return "stats-pitch-green-1";
    const ratio = good / total;
    if (ratio >= 0.75) return "stats-pitch-green-3";
    if (ratio >= 0.5) return "stats-pitch-green-2";
    if (ratio >= 0.25) return "stats-pitch-orange";
    return "stats-pitch-red";
  }
  function render3(containerId, csvData) {
    const rows = parseCSV2(csvData);
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    const pitch = document.createElement("div");
    pitch.className = "stats-pitch";
    rows.forEach((row) => {
      row.forEach(({ good, bad }) => {
        const zone = document.createElement("div");
        zone.className = `stats-pitch-zone ${zoneColor(good, bad)}`;
        const total = good + bad;
        zone.innerHTML = `<span class="stats-pitch-label">${total > 0 ? `${good}/${bad}` : "\u2013"}</span>`;
        pitch.appendChild(zone);
      });
    });
    container.appendChild(pitch);
  }
  var Pitch = { render: render3 };

  // src/components/passNetwork.js
  function draw(svgSelector, players, passes) {
    const svg = d3.select(svgSelector);
    svg.selectAll("*").remove();
    function getPlayer(id) {
      return players.find((p) => p.id === id);
    }
    svg.selectAll(".stats-pass-network-link").data(passes).enter().append("line").attr("class", "stats-pass-network-link").attr("x1", (d) => getPlayer(d.source).x).attr("y1", (d) => getPlayer(d.source).y).attr("x2", (d) => getPlayer(d.target).x).attr("y2", (d) => getPlayer(d.target).y).attr("stroke-width", (d) => d.value);
    const pg = svg.selectAll(".playerGroup").data(players).enter().append("g").attr("transform", (d) => `translate(${d.x},${d.y})`);
    pg.append("circle").attr("class", "stats-pass-network-player").attr("r", 15);
    pg.append("text").attr("class", "stats-pass-network-label").attr("dy", 4).text((d) => d.id);
  }
  var PassNetwork = { draw };

  // src/components/tacticalFlow.js
  function render4(svgSelector, data, options = {}) {
    const svg = d3.select(svgSelector);
    const mg = options.margin || { top: 40, right: 20, bottom: 30, left: 50 };
    const W = (+svg.attr("width") || 960) - mg.left - mg.right;
    const H = (+svg.attr("height") || 500) - mg.top - mg.bottom;
    const g = svg.append("g").attr("transform", `translate(${mg.left},${mg.top})`);
    const attackData = data.filter((d) => d.attack !== void 0);
    const defenseData = data.filter((d) => d.defense !== void 0);
    const x = d3.scaleLinear().domain(d3.extent(data, (d) => d.index)).range([0, W]);
    const y = d3.scaleLinear().domain([
      d3.min(data, (d) => Math.min(d.attack ?? Infinity, d.defense ?? Infinity)),
      d3.max(data, (d) => Math.max(d.attack ?? -Infinity, d.defense ?? -Infinity))
    ]).nice().range([H, 0]);
    const line = (key) => d3.line().defined((d) => d[key] !== void 0).x((d) => x(d.index)).y((d) => y(d[key]));
    g.append("path").datum(attackData).attr("fill", "none").attr("stroke", options.attackColor || "#000").attr("stroke-width", 2).attr("d", line("attack"));
    g.append("path").datum(defenseData).attr("fill", "none").attr("stroke", options.defenseColor || "red").attr("stroke-width", 2).attr("d", line("defense"));
    const dot = (arr, key, color) => g.selectAll(null).data(arr).enter().append("circle").attr("r", 5).attr("fill", color).attr("cx", (d) => x(d.index)).attr("cy", (d) => y(d[key]));
    dot(attackData, "attack", options.attackColor || "#000");
    dot(defenseData, "defense", options.defenseColor || "red");
    g.append("g").attr("transform", `translate(0,${H})`).call(d3.axisBottom(x).ticks(data.length));
    g.append("g").call(d3.axisLeft(y));
    const lg = svg.append("g").attr("transform", `translate(${W / 2},10)`);
    lg.append("rect").attr("x", -30).attr("y", -10).attr("width", 120).attr("height", 25).attr("fill", "white").attr("opacity", 0.7);
    [
      { cx: 0, color: options.attackColor || "#000", label: options.attackLabel || "Attack" },
      { cx: 80, color: options.defenseColor || "red", label: options.defenseLabel || "Defense" }
    ].forEach(({ cx, color, label }) => {
      lg.append("circle").attr("cx", cx).attr("cy", -2).attr("r", 5).attr("fill", color);
      lg.append("text").attr("x", cx + 10).attr("y", 4).text(label);
    });
  }
  var TacticalFlow = { render: render4 };

  // src/components/radar.js
  function render5(svgSelector, datasets, options = {}) {
    const size = options.size || 300;
    const levels = options.levels || 5;
    const labelOffset = options.labelOffset || 18;
    const radius = size / 2 - labelOffset - 10;
    const cx = size / 2, cy = size / 2;
    const axes = datasets[0].values.map((d) => d.axis);
    const N = axes.length;
    const step = 2 * Math.PI / N;
    const angle = (i) => step * i - Math.PI / 2;
    const ptX = (r, i) => cx + r * Math.cos(angle(i));
    const ptY = (r, i) => cy + r * Math.sin(angle(i));
    const toPoints = (vals) => vals.map((d, i) => [
      ptX(d.value / 100 * radius, i),
      ptY(d.value / 100 * radius, i)
    ]);
    const pts2str = (pts) => pts.map((p) => p.join(",")).join(" ");
    const svg = d3.select(svgSelector);
    svg.html("").attr("width", size).attr("height", size);
    for (let l = 1; l <= levels; l++) {
      const r = radius / levels * l;
      const pts = Array.from({ length: N }, (_, i) => [ptX(r, i), ptY(r, i)]);
      svg.append("polygon").attr("points", pts2str(pts)).attr("class", "stats-radar-grid");
    }
    axes.forEach((_, i) => svg.append("line").attr("x1", cx).attr("y1", cy).attr("x2", ptX(radius, i)).attr("y2", ptY(radius, i)).attr("class", "stats-radar-axis"));
    axes.forEach((label, i) => {
      const r = radius + labelOffset;
      svg.append("text").attr("x", ptX(r, i)).attr("y", ptY(r, i)).attr("dy", "0.35em").attr("class", "stats-radar-label").text(label);
    });
    [...datasets].reverse().forEach((ds) => {
      const pts = toPoints(ds.values);
      svg.append("polygon").attr("points", pts2str(pts)).attr("class", `stats-radar-area ${ds.cls || ""}`).attr("stroke", ds.color || "#000").attr("fill", ds.color || "#000");
      pts.forEach(([x, y]) => svg.append("circle").attr("cx", x).attr("cy", y).attr("r", 4).attr("class", `stats-radar-dot ${ds.cls || ""}`).attr("fill", ds.color || "#000"));
    });
  }
  var Radar = { render: render5 };

  // src/components/shotmap.js
  function render6(svgSelector, shots, options = {}) {
    const W = options.width || 500;
    const H = options.height || 260;
    const mx = 60, my = 40;
    const gw = W - mx * 2;
    const gh = H - my * 2 - 30;
    const svg = d3.select(svgSelector);
    svg.html("").attr("width", W).attr("height", H);
    const g = svg.append("g").attr("transform", `translate(${mx},${my})`);
    g.append("rect").attr("x", 0).attr("y", 0).attr("width", gw).attr("height", gh).attr("class", "stats-shotmap-goal");
    g.append("line").attr("x1", 0).attr("y1", 0).attr("x2", gw).attr("y2", 0).attr("stroke", "#444").attr("stroke-width", 4);
    [[0, 0, 0, gh], [gw, 0, gw, gh]].forEach(([x1, y1, x2, y2]) => g.append("line").attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2).attr("stroke", "#444").attr("stroke-width", 4));
    for (let i = 1; i < 10; i++)
      g.append("line").attr("x1", gw / 10 * i).attr("y1", 0).attr("x2", gw / 10 * i).attr("y2", gh).attr("stroke", "#ddd").attr("stroke-width", 0.5);
    for (let j = 1; j < 4; j++)
      g.append("line").attr("x1", 0).attr("y1", gh / 4 * j).attr("x2", gw).attr("y2", gh / 4 * j).attr("stroke", "#ddd").attr("stroke-width", 0.5);
    shots.forEach((s) => g.append("circle").attr("cx", s.x / 100 * gw).attr("cy", s.y / 100 * gh).attr("r", 6).attr("class", `stats-shotmap-shot stats-shotmap-shot--${s.result || "saved"}`));
    const LEGEND = [
      { label: "Goal", cls: "stats-shotmap-shot--goal" },
      { label: "Saved", cls: "stats-shotmap-shot--saved" },
      { label: "Missed", cls: "stats-shotmap-shot--missed" }
    ];
    const lg = svg.append("g").attr("transform", `translate(${mx},${my + gh + 14})`);
    LEGEND.forEach((d, i) => {
      lg.append("circle").attr("cx", i * 110 + 6).attr("cy", 6).attr("r", 5).attr("class", `stats-shotmap-shot ${d.cls}`);
      lg.append("text").attr("x", i * 110 + 16).attr("y", 11).attr("class", "stats-shotmap-legend").text(d.label);
    });
  }
  var Shotmap = { render: render6 };

  // src/utils/pitchDraw.js
  var P = {
    penAreaX: 15.71,
    // 16.5 / 105
    penAreaY1: 20.35,
    // (68 - 40.32) / 2 / 68 * 100
    penAreaH: 59.3,
    boxX: 5.24,
    // 5.5 / 105
    boxY1: 36.53,
    boxH: 26.94,
    goalY1: 44.62,
    goalH: 10.76,
    goalDepth: 2.33,
    halfX: 50,
    circleR: 8.71,
    // 9.15 / 105
    penL: 10.48,
    penR: 89.52
  };
  function drawPitch(g, W, H, prefix = "stats-pitch-draw") {
    const px = (v) => v / 100 * W;
    const py = (v) => v / 100 * H;
    const cls = {
      bg: `${prefix}-bg`,
      line: `${prefix}-line`,
      circle: `${prefix}-circle`,
      spot: `${prefix}-spot`,
      goal: `${prefix}-goal`
    };
    g.append("rect").attr("x", 0).attr("y", 0).attr("width", W).attr("height", H).attr("class", cls.bg);
    g.append("rect").attr("x", 0).attr("y", 0).attr("width", W).attr("height", H).attr("class", cls.line).attr("fill", "none");
    g.append("line").attr("x1", px(P.halfX)).attr("y1", 0).attr("x2", px(P.halfX)).attr("y2", H).attr("class", cls.line);
    g.append("circle").attr("cx", px(P.halfX)).attr("cy", py(50)).attr("r", px(P.circleR)).attr("class", cls.circle);
    g.append("circle").attr("cx", px(P.halfX)).attr("cy", py(50)).attr("r", 2.5).attr("class", cls.spot);
    const rc = (x, y, w, h) => g.append("rect").attr("x", px(x)).attr("y", py(y)).attr("width", px(w)).attr("height", py(h)).attr("class", cls.line).attr("fill", "none");
    rc(0, P.penAreaY1, P.penAreaX, P.penAreaH);
    rc(100 - P.penAreaX, P.penAreaY1, P.penAreaX, P.penAreaH);
    rc(0, P.boxY1, P.boxX, P.boxH);
    rc(100 - P.boxX, P.boxY1, P.boxX, P.boxH);
    g.append("rect").attr("x", -px(P.goalDepth)).attr("y", py(P.goalY1)).attr("width", px(P.goalDepth)).attr("height", py(P.goalH)).attr("class", cls.goal);
    g.append("rect").attr("x", px(100)).attr("y", py(P.goalY1)).attr("width", px(P.goalDepth)).attr("height", py(P.goalH)).attr("class", cls.goal);
    g.append("circle").attr("cx", px(P.penL)).attr("cy", py(50)).attr("r", 2.5).attr("class", cls.spot);
    g.append("circle").attr("cx", px(P.penR)).attr("cy", py(50)).attr("r", 2.5).attr("class", cls.spot);
  }

  // src/components/pitchmap.js
  function render7(svgSelector, events, options = {}) {
    const mg = { top: 12, right: 16, bottom: 38, left: 16, ...options.margin };
    const totalW = options.width || 700;
    const totalH = options.height || 440;
    const W = totalW - mg.left - mg.right;
    const H = totalH - mg.top - mg.bottom;
    const svg = d3.select(svgSelector);
    svg.html("").attr("width", totalW).attr("height", totalH);
    const g = svg.append("g").attr("transform", `translate(${mg.left},${mg.top})`);
    drawPitch(g, W, H, "stats-pitchmap");
    const px = (v) => v / 100 * W;
    const py = (v) => v / 100 * H;
    events.forEach((e) => g.append("circle").attr("cx", px(e.x)).attr("cy", py(e.y)).attr("r", e.r || 7).attr("class", `stats-pitchmap-event stats-pitchmap-event--${e.type || "default"}`));
    if (options.showLegend !== false) {
      const types = [...new Set(events.map((e) => e.type).filter(Boolean))];
      const lg = svg.append("g").attr("transform", `translate(${mg.left},${mg.top + H + 10})`);
      types.forEach((t, i) => {
        lg.append("circle").attr("cx", i * 130 + 6).attr("cy", 8).attr("r", 5).attr("class", `stats-pitchmap-event stats-pitchmap-event--${t}`);
        lg.append("text").attr("x", i * 130 + 16).attr("y", 13).attr("class", "stats-pitchmap-legend").text(t.replace(/-/g, " "));
      });
    }
  }
  var Pitchmap = { render: render7 };

  // src/components/arrowmap.js
  var TYPES = {
    pass: { color: "#000", width: 2, curve: 28, opacity: 0.7 },
    run: { color: "#002b5b", width: 2.5, curve: 0, opacity: 0.8 },
    shot: { color: "#e11d48", width: 2, curve: 0, opacity: 0.9 },
    press: { color: "#f97316", width: 1.5, curve: 0, opacity: 0.65 },
    dribble: { color: "#16a34a", width: 2, curve: 22, opacity: 0.8 },
    default: { color: "#9ca3af", width: 1.5, curve: 10, opacity: 0.6 }
  };
  function render8(svgSelector, arrows, options = {}) {
    const mg = { top: 12, right: 16, bottom: 38, left: 16, ...options.margin };
    const totalW = options.width || 700;
    const totalH = options.height || 440;
    const W = totalW - mg.left - mg.right;
    const H = totalH - mg.top - mg.bottom;
    const svg = d3.select(svgSelector);
    svg.html("").attr("width", totalW).attr("height", totalH);
    const defs = svg.append("defs");
    Object.entries(TYPES).forEach(([type, cfg]) => defs.append("marker").attr("id", `am-arrow-${type}`).attr("markerWidth", 7).attr("markerHeight", 7).attr("refX", 5).attr("refY", 3).attr("orient", "auto").append("path").attr("d", "M0,0 L0,6 L7,3 z").attr("fill", cfg.color));
    const g = svg.append("g").attr("transform", `translate(${mg.left},${mg.top})`);
    drawPitch(g, W, H, "stats-arrowmap");
    const px = (v) => v / 100 * W;
    const py = (v) => v / 100 * H;
    arrows.forEach((a) => {
      const cfg = TYPES[a.type] || TYPES.default;
      const x1 = px(a.x1), y1 = py(a.y1);
      const x2 = px(a.x2), y2 = py(a.y2);
      const mx2 = (x1 + x2) / 2, my2 = (y1 + y2) / 2;
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const curve = a.curve !== void 0 ? a.curve : cfg.curve;
      const cpx = mx2 + -dy / len * curve;
      const cpy = my2 + dx / len * curve;
      const sw = a.value ? Math.max(1.5, Math.min(a.value * 0.6, 7)) : cfg.width;
      g.append("path").attr("d", `M ${x1},${y1} Q ${cpx},${cpy} ${x2},${y2}`).attr("fill", "none").attr("stroke", cfg.color).attr("stroke-width", sw).attr("stroke-opacity", a.opacity ?? cfg.opacity).attr("marker-end", `url(#am-arrow-${a.type || "default"})`);
    });
    if (options.showLegend !== false) {
      const types = [...new Set(arrows.map((a) => a.type).filter(Boolean))];
      const lg = svg.append("g").attr("transform", `translate(${mg.left},${mg.top + H + 10})`);
      types.forEach((t, i) => {
        const cfg = TYPES[t] || TYPES.default;
        lg.append("line").attr("x1", i * 120).attr("y1", 8).attr("x2", i * 120 + 14).attr("y2", 8).attr("stroke", cfg.color).attr("stroke-width", 2).attr("marker-end", `url(#am-arrow-${t})`);
        lg.append("text").attr("x", i * 120 + 18).attr("y", 13).attr("class", "stats-arrowmap-legend").text(t);
      });
    }
  }
  var Arrowmap = { render: render8 };

  // src/components/xgChart.js
  function cumulative(shots, maxMin) {
    const pts = [{ minute: 0, cumXg: 0 }];
    let sum = 0;
    shots.slice().sort((a, b) => a.minute - b.minute).forEach((s) => {
      sum += s.xg;
      pts.push({ minute: s.minute, cumXg: sum, shot: true });
    });
    pts.push({ minute: maxMin, cumXg: sum });
    return pts;
  }
  function render9(svgSelector, data, options = {}) {
    const mg = { top: 20, right: 40, bottom: 40, left: 50, ...options.margin };
    const totalW = options.width || 760;
    const totalH = options.height || 340;
    const homeC = options.homeColor || "#000";
    const awayC = options.awayColor || "#e11d48";
    const homeL = options.homeLabel || "Home";
    const awayL = options.awayLabel || "Away";
    const maxMin = options.maxMinute || 90;
    const W = totalW - mg.left - mg.right;
    const H = totalH - mg.top - mg.bottom;
    const svg = d3.select(svgSelector);
    svg.html("").attr("width", totalW).attr("height", totalH);
    const g = svg.append("g").attr("transform", `translate(${mg.left},${mg.top})`);
    const homePoints = cumulative(data.home || [], maxMin);
    const awayPoints = cumulative(data.away || [], maxMin);
    const allXg = [...homePoints, ...awayPoints].map((d) => d.cumXg);
    const x = d3.scaleLinear().domain([0, maxMin]).range([0, W]);
    const y = d3.scaleLinear().domain([0, (d3.max(allXg) || 1) * 1.1]).range([H, 0]).nice();
    y.ticks(4).forEach((t) => g.append("line").attr("x1", 0).attr("y1", y(t)).attr("x2", W).attr("y2", y(t)).attr("class", "stats-xgchart-grid"));
    g.append("line").attr("x1", x(45)).attr("y1", 0).attr("x2", x(45)).attr("y2", H).attr("class", "stats-xgchart-halftime");
    g.append("text").attr("x", x(45) + 4).attr("y", 12).attr("class", "stats-xgchart-halftime-label").text("HT");
    g.append("g").attr("transform", `translate(0,${H})`).call(d3.axisBottom(x).ticks(9).tickFormat((d) => `${d}'`)).attr("class", "stats-xgchart-axis");
    g.append("g").call(d3.axisLeft(y).ticks(4)).attr("class", "stats-xgchart-axis");
    const lineGen = d3.line().x((d) => x(d.minute)).y((d) => y(d.cumXg)).curve(d3.curveStepAfter);
    [
      { pts: awayPoints, color: awayC },
      { pts: homePoints, color: homeC }
    ].forEach(({ pts, color }) => {
      g.append("path").datum(pts).attr("d", lineGen).attr("fill", "none").attr("stroke", color).attr("stroke-width", 2.5).attr("class", "stats-xgchart-line");
      g.selectAll(null).data(pts.filter((d) => d.shot)).enter().append("circle").attr("cx", (d) => x(d.minute)).attr("cy", (d) => y(d.cumXg)).attr("r", 5).attr("fill", color).attr("class", "stats-xgchart-dot");
      const last = pts[pts.length - 1];
      g.append("text").attr("x", x(last.minute) + 4).attr("y", y(last.cumXg) + 4).attr("class", "stats-xgchart-endlabel").attr("fill", color).text(last.cumXg.toFixed(2));
    });
    const lg = svg.append("g").attr("transform", `translate(${mg.left},${totalH - 6})`);
    [{ label: homeL, color: homeC }, { label: awayL, color: awayC }].forEach(({ label, color }, i) => {
      lg.append("line").attr("x1", i * 120).attr("y1", 0).attr("x2", i * 120 + 16).attr("y2", 0).attr("stroke", color).attr("stroke-width", 2.5);
      lg.append("circle").attr("cx", i * 120 + 8).attr("cy", 0).attr("r", 4).attr("fill", color);
      lg.append("text").attr("x", i * 120 + 22).attr("y", 4).attr("class", "stats-xgchart-legend").text(label);
    });
  }
  var XgChart = { render: render9 };

  // src/components/scatter.js
  function render10(svgSelector, data, options = {}) {
    const mg = { top: 20, right: 30, bottom: 50, left: 55, ...options.margin };
    const totalW = options.width || 620;
    const totalH = options.height || 420;
    const W = totalW - mg.left - mg.right;
    const H = totalH - mg.top - mg.bottom;
    const svg = d3.select(svgSelector);
    svg.html("").attr("width", totalW).attr("height", totalH);
    const g = svg.append("g").attr("transform", `translate(${mg.left},${mg.top})`);
    const xExt = options.xDomain || d3.extent(data, (d) => d.x);
    const yExt = options.yDomain || d3.extent(data, (d) => d.y);
    const xPad = (xExt[1] - xExt[0]) * 0.1 || 1;
    const yPad = (yExt[1] - yExt[0]) * 0.1 || 1;
    const x = d3.scaleLinear().domain([xExt[0] - xPad, xExt[1] + xPad]).range([0, W]).nice();
    const y = d3.scaleLinear().domain([yExt[0] - yPad, yExt[1] + yPad]).range([H, 0]).nice();
    x.ticks(6).forEach((t) => g.append("line").attr("x1", x(t)).attr("y1", 0).attr("x2", x(t)).attr("y2", H).attr("class", "stats-scatter-grid"));
    y.ticks(5).forEach((t) => g.append("line").attr("x1", 0).attr("y1", y(t)).attr("x2", W).attr("y2", y(t)).attr("class", "stats-scatter-grid"));
    (options.refLines || []).forEach((rl) => {
      if (rl.axis === "x") {
        g.append("line").attr("x1", x(rl.value)).attr("y1", 0).attr("x2", x(rl.value)).attr("y2", H).attr("class", "stats-scatter-refline");
        if (rl.label) g.append("text").attr("x", x(rl.value) + 4).attr("y", 10).attr("class", "stats-scatter-reflabel").text(rl.label);
      } else {
        g.append("line").attr("x1", 0).attr("y1", y(rl.value)).attr("x2", W).attr("y2", y(rl.value)).attr("class", "stats-scatter-refline");
        if (rl.label) g.append("text").attr("x", 4).attr("y", y(rl.value) - 4).attr("class", "stats-scatter-reflabel").text(rl.label);
      }
    });
    g.append("g").attr("transform", `translate(0,${H})`).call(d3.axisBottom(x).ticks(6)).attr("class", "stats-scatter-axis");
    g.append("g").call(d3.axisLeft(y).ticks(5)).attr("class", "stats-scatter-axis");
    if (options.xLabel)
      g.append("text").attr("x", W / 2).attr("y", H + 40).attr("class", "stats-scatter-axislabel").text(options.xLabel);
    if (options.yLabel)
      g.append("text").attr("transform", `translate(-42,${H / 2}) rotate(-90)`).attr("class", "stats-scatter-axislabel").text(options.yLabel);
    g.selectAll(".stats-scatter-dot").data(data).enter().append("circle").attr("cx", (d) => x(d.x)).attr("cy", (d) => y(d.y)).attr("r", (d) => d.r || 6).attr("fill", (d) => d.color || "#000").attr("stroke", (d) => d.color || "#000").attr("class", "stats-scatter-dot");
    if (options.showLabels !== false)
      g.selectAll(".stats-scatter-label").data(data.filter((d) => d.label)).enter().append("text").attr("x", (d) => x(d.x) + (d.r || 6) + 4).attr("y", (d) => y(d.y) + 4).attr("class", "stats-scatter-label").text((d) => d.label);
  }
  var Scatter = { render: render10 };

  // src/components/formation.js
  function render11(svgSelector, players, options = {}) {
    const mg = { top: 36, right: 16, bottom: 16, left: 16, ...options.margin };
    const totalW = options.width || 520;
    const totalH = options.height || 420;
    const halfPitch = options.halfPitch !== false;
    const W = totalW - mg.left - mg.right;
    const H = totalH - mg.top - mg.bottom;
    const svg = d3.select(svgSelector);
    svg.html("").attr("width", totalW).attr("height", totalH);
    if (options.label || options.formation) {
      const hdr = svg.append("g").attr("transform", `translate(${mg.left},0)`);
      if (options.label)
        hdr.append("text").attr("x", W / 2).attr("y", 16).attr("class", "stats-formation-team").text(options.label);
      if (options.formation)
        hdr.append("text").attr("x", W / 2).attr("y", 30).attr("class", "stats-formation-label").text(options.formation);
    }
    const g = svg.append("g").attr("transform", `translate(${mg.left},${mg.top})`);
    if (halfPitch) {
      const defs = svg.append("defs");
      defs.append("clipPath").attr("id", "half-clip").append("rect").attr("x", 0).attr("y", 0).attr("width", W).attr("height", H);
      const pitchG = g.append("g").attr("clip-path", "url(#half-clip)");
      const scaleG = pitchG.append("g").attr("transform", `translate(${-W},0) scale(2,1)`);
      drawPitch(scaleG, W, H, "stats-formation-pitch");
    } else {
      drawPitch(g, W, H, "stats-formation-pitch");
    }
    const mapX = halfPitch ? (v) => (v - 50) / 50 * W : (v) => v / 100 * W;
    const mapY = (v) => v / 100 * H;
    players.forEach((p) => {
      const cx = mapX(p.x);
      const cy = mapY(p.y);
      const mod = p.highlight ? " stats-formation-player--highlight" : p.sub ? " stats-formation-player--sub" : "";
      g.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 18).attr("class", `stats-formation-player${mod}`);
      g.append("text").attr("x", cx).attr("y", cy + 5).attr("class", `stats-formation-number${mod}`).text(p.number);
      if (options.showNames !== false && p.name) {
        g.append("text").attr("x", cx).attr("y", cy + 32).attr("class", "stats-formation-name").text(p.name.split(" ").pop());
      }
    });
  }
  var Formation = { render: render11 };

  // src/components/momentum.js
  function render12(svgSelector, data, options = {}) {
    const mg = { top: 28, right: 16, bottom: 28, left: 16, ...options.margin };
    const totalW = options.width || 760;
    const totalH = options.height || 200;
    const homeC = options.homeColor || "#000";
    const awayC = options.awayColor || "#e11d48";
    const homeL = options.homeLabel || "Home";
    const awayL = options.awayLabel || "Away";
    const maxMin = options.maxMinute || 90;
    const W = totalW - mg.left - mg.right;
    const H = totalH - mg.top - mg.bottom;
    const mid = H / 2;
    const svg = d3.select(svgSelector);
    svg.html("").attr("width", totalW).attr("height", totalH);
    const g = svg.append("g").attr("transform", `translate(${mg.left},${mg.top})`);
    const x = d3.scaleLinear().domain([0, maxMin]).range([0, W]);
    const y = d3.scaleLinear().domain([-100, 100]).range([H, 0]);
    g.append("rect").attr("x", 0).attr("y", 0).attr("width", W).attr("height", mid).attr("class", "stats-momentum-bg-home");
    g.append("rect").attr("x", 0).attr("y", mid).attr("width", W).attr("height", mid).attr("class", "stats-momentum-bg-away");
    g.append("line").attr("x1", x(45)).attr("y1", 0).attr("x2", x(45)).attr("y2", H).attr("class", "stats-momentum-halftime");
    g.append("text").attr("x", x(45) + 3).attr("y", 10).attr("class", "stats-momentum-halftime-label").text("HT");
    g.append("line").attr("x1", 0).attr("y1", mid).attr("x2", W).attr("y2", mid).attr("class", "stats-momentum-zero");
    const barW = W / data.length;
    data.forEach((d) => {
      const bx = x(d.minute) - barW / 2;
      const isHome = d.value >= 0;
      const barH = Math.abs(y(d.value) - mid);
      const by = isHome ? mid - barH : mid;
      g.append("rect").attr("x", bx).attr("y", by).attr("width", Math.max(barW - 1, 1)).attr("height", barH).attr("class", isHome ? "stats-momentum-bar-home" : "stats-momentum-bar-away");
    });
    const areaHome = d3.area().x((d) => x(d.minute)).y0(mid).y1((d) => d.value >= 0 ? y(d.value) : mid).curve(d3.curveCatmullRom);
    const areaAway = d3.area().x((d) => x(d.minute)).y0(mid).y1((d) => d.value < 0 ? y(d.value) : mid).curve(d3.curveCatmullRom);
    g.append("path").datum(data).attr("d", areaHome).attr("class", "stats-momentum-area-home");
    g.append("path").datum(data).attr("d", areaAway).attr("class", "stats-momentum-area-away");
    const lbl = svg.append("g");
    lbl.append("text").attr("x", mg.left + 6).attr("y", mg.top / 2 + 5).attr("class", "stats-momentum-team-label").attr("fill", homeC).text(homeL);
    lbl.append("text").attr("x", mg.left + 6).attr("y", mg.top + H + mg.bottom / 2 + 4).attr("class", "stats-momentum-team-label").attr("fill", awayC).text(awayL);
    [0, 15, 30, 45, 60, 75, 90].forEach((m) => {
      if (m > maxMin) return;
      g.append("text").attr("x", x(m)).attr("y", H + 16).attr("class", "stats-momentum-tick").text(`${m}'`);
    });
  }
  var Momentum = { render: render12 };

  // src/components/heatmap.js
  function render13(svgSelector, points, options = {}) {
    const mg = { top: 12, right: 16, bottom: 16, left: 16, ...options.margin };
    const totalW = options.width || 700;
    const totalH = options.height || 440;
    const rows = options.rows || 8;
    const cols = options.cols || 12;
    const opacity = options.opacity !== void 0 ? options.opacity : 0.72;
    const W = totalW - mg.left - mg.right;
    const H = totalH - mg.top - mg.bottom;
    const svg = d3.select(svgSelector);
    svg.html("").attr("width", totalW).attr("height", totalH);
    svg.append("defs").append("clipPath").attr("id", "hm-clip").append("rect").attr("x", 0).attr("y", 0).attr("width", W).attr("height", H);
    const g = svg.append("g").attr("transform", `translate(${mg.left},${mg.top})`);
    drawPitch(g, W, H, "stats-heatmap-pitch");
    const grid = Array.from({ length: rows }, () => new Array(cols).fill(0));
    points.forEach((p) => {
      const col = Math.min(Math.floor(p.x / 100 * cols), cols - 1);
      const row = Math.min(Math.floor(p.y / 100 * rows), rows - 1);
      grid[row][col] += p.value !== void 0 ? p.value : 1;
    });
    const flat = grid.flat();
    const maxV = d3.max(flat) || 1;
    const scale = d3.scaleSequential().domain([0, maxV]).interpolator(d3[`interpolate${options.color || "YlOrRd"}`] || d3.interpolateYlOrRd);
    const cw = W / cols;
    const ch = H / rows;
    const heatG = g.append("g").attr("clip-path", "url(#hm-clip)");
    grid.forEach((row, ri) => row.forEach((val, ci) => {
      if (val === 0) return;
      heatG.append("rect").attr("x", ci * cw).attr("y", ri * ch).attr("width", cw).attr("height", ch).attr("fill", scale(val)).attr("opacity", opacity).attr("class", "stats-heatmap-cell");
    }));
    drawPitch(g, W, H, "stats-heatmap-lines");
  }
  var Heatmap = { render: render13 };

  // src/components/eventLog.js
  var TYPE_LABEL = {
    "goal": "Goal",
    "yellow-card": "Yellow card",
    "red-card": "Red card",
    "sub": "Substitution",
    "var": "VAR",
    "penalty": "Penalty",
    "foul": "Foul"
  };
  function render14(containerId, events, options = {}) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    container.className = "stats-eventlog";
    if (options.maxHeight)
      container.style.maxHeight = `${options.maxHeight}px`;
    const sorted = events.slice().sort((a, b) => {
      const at = a.minute * 60 + (a.second ?? 0);
      const bt = b.minute * 60 + (b.second ?? 0);
      return at - bt;
    });
    sorted.forEach((e) => {
      const item = document.createElement("div");
      item.className = [
        "stats-eventlog-item",
        `stats-eventlog-item--${e.team || "home"}`
      ].join(" ");
      const timeLabel = e.second != null ? `${e.minute}:${String(e.second).padStart(2, "0")}` : `${e.minute}'`;
      item.innerHTML = `
      <span class="stats-eventlog-time">${timeLabel}</span>
      <span class="stats-eventlog-icon stats-eventlog-icon--${e.type || "default"}"
            title="${TYPE_LABEL[e.type] || e.type}"></span>
      <span class="stats-eventlog-text">${e.text}</span>`;
      container.appendChild(item);
    });
  }
  var EventLog = { render: render14 };

  // src/components/shotQuality.js
  function render15(svgSelector, shots, options = {}) {
    const mg = { top: 12, right: 16, bottom: 38, left: 16, ...options.margin };
    const totalW = options.width || 700;
    const totalH = options.height || 440;
    const minR = options.minR || 6;
    const maxR = options.maxR || 22;
    const W = totalW - mg.left - mg.right;
    const H = totalH - mg.top - mg.bottom;
    const svg = d3.select(svgSelector);
    svg.html("").attr("width", totalW).attr("height", totalH);
    const g = svg.append("g").attr("transform", `translate(${mg.left},${mg.top})`);
    drawPitch(g, W, H, "stats-shotquality-pitch");
    const px = (v) => v / 100 * W;
    const py = (v) => v / 100 * H;
    const maxXg = d3.max(shots, (s) => s.xg) || 1;
    const rScale = d3.scaleSqrt().domain([0, maxXg]).range([minR, maxR]);
    const order = { missed: 0, saved: 1, goal: 2 };
    const sorted = shots.slice().sort((a, b) => (order[a.result] || 0) - (order[b.result] || 0));
    sorted.forEach((s) => {
      const r = rScale(s.xg || 0.05);
      g.append("circle").attr("cx", px(s.x)).attr("cy", py(s.y)).attr("r", r).attr("class", `stats-shotquality-dot stats-shotquality-dot--${s.result || "saved"}`);
      if (options.showLabels !== false && s.label) {
        g.append("text").attr("x", px(s.x)).attr("y", py(s.y) + r + 12).attr("class", "stats-shotquality-label").text(s.label);
      }
    });
    const totalXg = shots.reduce((sum, s) => sum + (s.xg || 0), 0);
    const goals = shots.filter((s) => s.result === "goal").length;
    svg.append("text").attr("x", mg.left).attr("y", mg.top + H + 22).attr("class", "stats-shotquality-summary").text(`${goals} goals \xB7 ${totalXg.toFixed(2)} xG`);
    const LEGEND = [
      { label: "Goal", cls: "stats-shotquality-dot--goal" },
      { label: "Saved", cls: "stats-shotquality-dot--saved" },
      { label: "Missed", cls: "stats-shotquality-dot--missed" }
    ];
    const lg = svg.append("g").attr("transform", `translate(${totalW / 2 - 100},${mg.top + H + 22})`);
    LEGEND.forEach((d, i) => {
      lg.append("circle").attr("cx", i * 110 + 6).attr("cy", -2).attr("r", 6).attr("class", `stats-shotquality-dot ${d.cls}`);
      lg.append("text").attr("x", i * 110 + 16).attr("y", 3).attr("class", "stats-shotquality-legend").text(d.label);
    });
  }
  var ShotQuality = { render: render15 };
  return __toCommonJS(src_exports);
})();
