# Stats UI

Component library for football statistics visualization.
Plain HTML + D3.js. Styles compiled from SCSS.

## Quick start

```bash
npm install
npm run build
```

Open `index.html` in a browser — no server required.

## Build

| Command | Description |
|---------|-------------|
| `npm run build` | Build JS + CSS |
| `npm run build:js` | Bundle JS only (`dist/stats-ui.js`) |
| `npm run build:css` | Compile SCSS only (`dist/stats-ui.css`) |
| `npm run watch` | Watch both in parallel |

Output goes to `dist/`. D3.js v7 is loaded separately from CDN.

## Usage

```html
<link rel="stylesheet" href="dist/tiny-grid.min.css" />
<link rel="stylesheet" href="dist/stats-ui.css" />
<script src="https://d3js.org/d3.v7.min.js"></script>
<script src="dist/stats-ui.js"></script>

<script>
  const { Bars, Radar, Heatmap } = StatsUI;
  Bars.render("container-id", csvData);
</script>
```

## Components

### Layout
| Component | Class / Usage | Description |
|-----------|---------------|-------------|
| `Header` | `.stats-header` | Top bar with logo and season metadata |
| `Card` | `.stats-card` | Container with title, meta, and body |
| `Score` | `.stats-score` | Match score widget with team names and result badge |
| `Section` | `.stats-section` | Report section header with title and subtitle |
| `Divider` | `.stats-divider` | Horizontal rule with optional label |

### Data
| Component | Class / Usage | Description |
|-----------|---------------|-------------|
| `Number` | `.stats-number` | Large stat value with label and delta indicator |
| `Form` | `.stats-form` | Recent results strip (W / D / L) |
| `Metric` | `.stats-metric` | Horizontal progress bar for a single metric |
| `EventLog` | `EventLog.render(id, events, opts)` | Chronological match events with icons |
| `Stat Row` | `.stats-stat-row` | Label + value row with optional progress underline (`--bar`) |

### Badges & Players
| Component | Class | Description |
|-----------|-------|-------------|
| `Badge` | `.stats-badge` | Position/role badge with color variants (`--black`, `--red`, `--accent`, `--green`, `--orange`, `--outline-*`) and size variants (`--sm`, `--lg`) |
| `Player Card` | `.stats-player-card` | Compact player card with number, name, position badge, and stat list |

### Tables
| Component | Description |
|-----------|-------------|
| `Dual` | Side-by-side team comparison table |
| `Table` | Player statistics table |

### Visualizations
| Component | API | Description |
|-----------|-----|-------------|
| `Bars` | `Bars.render(id, csv)` | Dual comparison bars (CSV input) |
| `Pie` | `Pie.render(sel, data, opts)` | Pie chart with animation |
| `TacticalFlow` | `TacticalFlow.render(sel, data, opts)` | Attack/defense line chart |
| `Radar` | `Radar.render(sel, datasets, opts)` | Spider/radar chart |
| `Pitch` | `Pitch.render(id, csv)` | Zone heatmap on pitch grid |
| `PassNetwork` | `PassNetwork.draw(sel, players, passes)` | Player pass network |
| `Shotmap` | `Shotmap.render(sel, shots, opts)` | Shots on goal frame |
| `Pitchmap` | `Pitchmap.render(sel, events, opts)` | Action dots on full pitch |
| `Arrowmap` | `Arrowmap.render(sel, arrows, opts)` | Directional arrows on pitch |
| `XgChart` | `XgChart.render(sel, data, opts)` | Cumulative xG over time |
| `Scatter` | `Scatter.render(sel, data, opts)` | 2D scatter plot |
| `Formation` | `Formation.render(sel, players, opts)` | Team formation on pitch |
| `Momentum` | `Momentum.render(sel, data, opts)` | Match momentum timeline |
| `Heatmap` | `Heatmap.render(sel, points, opts)` | Density heatmap on pitch |
| `ShotQuality` | `ShotQuality.render(sel, shots, opts)` | xG bubble map on pitch |

### Analytics
| Component | API | Description |
|-----------|-----|-------------|
| `MatchStats` | `MatchStats.render(id, data, opts)` | Two-team stat comparison rows with centred bars and optional score header |
| `SeasonTrend` | `SeasonTrend.render(sel, data, opts)` | GF/GA and xGF/xGA line chart by match week |
| `PassRose` | `PassRose.render(sel, sectors, opts)` | Radial compass chart of pass direction distribution |
| `DuelsMap` | `DuelsMap.render(sel, duels, opts)` | Ground and aerial duel locations on full pitch (won/lost) |
| `SetPiece` | `SetPiece.render(sel, deliveries, opts)` | Corner and free kick delivery arcs with outcome encoding |

#### MatchStats data format
```js
MatchStats.render("container-id", [
  { label: "Possession %", a: 58, b: 42 },
  { label: "Shots",        a: 12, b: 8  },
  { label: "xG",           a: 1.82, b: 0.74 },
], { teamA: "Home", teamB: "Away", scoreA: 2, scoreB: 1 });
```

#### SeasonTrend data format
```js
SeasonTrend.render("#sel", [
  { week: 1, gf: 2, ga: 1, xgf: 1.8, xga: 0.9 },
  { week: 2, gf: 0, ga: 2, xgf: 1.2, xga: 2.1 },
], { width: 720, height: 280 });
// xgf / xga are optional — omit to show goals only
```

#### PassRose data format
```js
PassRose.render("#sel", [
  { label: "N",  count: 18, accuracy: 0.83 },
  { label: "NE", count: 42, accuracy: 0.91 },
  // ... 8 or any number of sectors
], { size: 300 });
// accuracy: ≥0.80 → dark, ≥0.65 → grey, <0.65 → light
```

#### DuelsMap data format
```js
DuelsMap.render("#sel", [
  { x: 55, y: 40, won: true,  type: "aerial" },
  { x: 70, y: 60, won: false, type: "ground" },
], { width: 700, height: 440 });
```

#### SetPiece data format
```js
SetPiece.render("#sel", [
  { fromX: 100, fromY: 2,  toX: 80, toY: 25, type: "corner",   outcome: "goal"    },
  { fromX: 72,  fromY: 8,  toX: 85, toY: 38, type: "freekick", outcome: "chance"  },
  { fromX: 65,  fromY: 50, toX: 88, toY: 48, type: "freekick", outcome: "cleared" },
], { width: 700, height: 440 });
// outcome: "goal" | "chance" | "cleared"
```

## Grid — tiny-grid

`dist/tiny-grid.min.css` ships a 12-column responsive grid. Breakpoints: `sm` 600 px · `md` 900 px · `lg` 1200 px · `xl` 1800 px.

```html
<div class="container">
  <div class="row">
    <div class="col-md-6">Left half</div>
    <div class="col-md-6">Right half</div>
  </div>
</div>
```

Column classes follow the pattern `.col-{breakpoint}-{1…12}`. Columns stack on smaller viewports automatically.

## Structure

```
src/
  utils/
    pitchDraw.js     Shared pitch outline utility
    colors.js        Design token constants
  components/        One file per component (ES modules)
    matchStats.js    Match stats panel
    seasonTrend.js   Season GF/GA/xG trend
    passRose.js      Passing direction rose
    duelsMap.js      Duels map on pitch
    setPiece.js      Set piece delivery zones
    ...              (all other components)
  index.js           Exports all components
scss/
  _variables.scss    Design tokens
  _mixins.scss       Reusable mixins
  _match-stats.scss  Match stats panel
  _season-trend.scss Season trend chart
  _pass-rose.scss    Passing direction rose
  _duels-map.scss    Duels map
  _set-piece.scss    Set piece zones
  _*.scss            One partial per component
  main.scss          Entry point
dist/
  stats-ui.js        Bundled output (window.StatsUI)
  stats-ui.css       Compiled CSS
  tiny-grid.min.css  12-column responsive grid
```

## Coordinates

Pitch-based components (`Pitchmap`, `Arrowmap`, `Heatmap`, `Formation`, `ShotQuality`) use a **0–100 coordinate system** where `(0, 0)` is the top-left corner and attack goes left → right.

Shot map (`Shotmap`) uses **0–100** relative to the goal frame face.
