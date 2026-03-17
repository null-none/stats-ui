/**
 * Shared pitch-drawing utility.
 *
 * drawPitch(g, W, H, prefix?)
 *   g       – D3 selection (group element)
 *   W, H    – pixel dimensions
 *   prefix  – CSS class prefix (default: 'stats-pitch-draw')
 *
 * Generated class names: {prefix}-bg, -line, -circle, -spot, -goal
 */

// Real pitch measurements → percent of pitch dimensions
const P = {
  penAreaX:  15.71,  // 16.5 / 105
  penAreaY1: 20.35,  // (68 - 40.32) / 2 / 68 * 100
  penAreaH:  59.30,
  boxX:       5.24,  // 5.5 / 105
  boxY1:     36.53,
  boxH:      26.94,
  goalY1:    44.62,
  goalH:     10.76,
  goalDepth:  2.33,
  halfX:     50,
  circleR:    8.71,  // 9.15 / 105
  penL:      10.48,
  penR:      89.52,
};

export function drawPitch(g, W, H, prefix = 'stats-pitch-draw') {
  const px = (v) => (v / 100) * W;
  const py = (v) => (v / 100) * H;

  const cls = {
    bg:     `${prefix}-bg`,
    line:   `${prefix}-line`,
    circle: `${prefix}-circle`,
    spot:   `${prefix}-spot`,
    goal:   `${prefix}-goal`,
  };

  // Background
  g.append('rect').attr('x', 0).attr('y', 0).attr('width', W).attr('height', H)
    .attr('class', cls.bg);

  // Boundary
  g.append('rect').attr('x', 0).attr('y', 0).attr('width', W).attr('height', H)
    .attr('class', cls.line).attr('fill', 'none');

  // Halfway line
  g.append('line')
    .attr('x1', px(P.halfX)).attr('y1', 0)
    .attr('x2', px(P.halfX)).attr('y2', H)
    .attr('class', cls.line);

  // Center circle
  g.append('circle')
    .attr('cx', px(P.halfX)).attr('cy', py(50))
    .attr('r', px(P.circleR))
    .attr('class', cls.circle);

  // Center spot
  g.append('circle')
    .attr('cx', px(P.halfX)).attr('cy', py(50))
    .attr('r', 2.5).attr('class', cls.spot);

  // Penalty areas
  const rc = (x, y, w, h) =>
    g.append('rect').attr('x', px(x)).attr('y', py(y))
      .attr('width', px(w)).attr('height', py(h))
      .attr('class', cls.line).attr('fill', 'none');

  rc(0, P.penAreaY1, P.penAreaX, P.penAreaH);
  rc(100 - P.penAreaX, P.penAreaY1, P.penAreaX, P.penAreaH);
  rc(0, P.boxY1, P.boxX, P.boxH);
  rc(100 - P.boxX, P.boxY1, P.boxX, P.boxH);

  // Goals
  g.append('rect')
    .attr('x', -px(P.goalDepth)).attr('y', py(P.goalY1))
    .attr('width', px(P.goalDepth)).attr('height', py(P.goalH))
    .attr('class', cls.goal);
  g.append('rect')
    .attr('x', px(100)).attr('y', py(P.goalY1))
    .attr('width', px(P.goalDepth)).attr('height', py(P.goalH))
    .attr('class', cls.goal);

  // Penalty spots
  g.append('circle').attr('cx', px(P.penL)).attr('cy', py(50))
    .attr('r', 2.5).attr('class', cls.spot);
  g.append('circle').attr('cx', px(P.penR)).attr('cy', py(50))
    .attr('r', 2.5).attr('class', cls.spot);
}
