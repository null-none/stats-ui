const Bars = (function () {
  function parseCSV(csv) {
    const lines = csv.trim().split("\n");
    const [header, ...rows] = lines;
    return rows.map((row) => {
      const [label, aStr, bStr] = row.split(",");
      return {
        label,
        a: Number(aStr),
        b: Number(bStr),
      };
    });
  }

  function render(containerId, csvData) {
    const data = parseCSV(csvData);
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    data.forEach(({ label, a, b }) => {
      const max = Math.max(a, b);
      const aWidth = (a / max) * 100;
      const bWidth = (b / max) * 100;

      const group = document.createElement("div");
      group.className = "stats-bar-group";
      group.innerHTML = `
        <div class="stats-bar-label">${label}</div>
        <div class="stats-bar-container">
          <div class="stats-bar-value">${a}</div>
          <div class="stats-bar-wrapper stats-bar-left-wrapper">
            <div class="stats-bar-bar stats-bar-left" style="width: ${aWidth}%"></div>
          </div>
          <div class="stats-bar-wrapper stats-bar-right-wrapper">
            <div class="stats-bar-bar stats-bar-right" style="width: ${bWidth}%"></div>
          </div>
          <div class="stats-bar-value">${b}</div>
        </div>
      `;
      container.appendChild(group);
    });
  }

  return {
    render,
  };
})();
