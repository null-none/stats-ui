
const Pitch = (function () {
  function parseCSV(csv) {
    const lines = csv.trim().split("\n");
    return lines.map(line => {
      return line.split(",").map(cell => {
        const [good, bad] = cell.split(":").map(Number);
        return { good: good || 0, bad: bad || 0 };
      });
    });
  }

  function getColor(good, bad) {
    const total = good + bad;
    const ratio = total > 0 ? good / total : null;
    if (ratio === null) return "stats-pitch-green-1";
    if (ratio >= 0.75) return "stats-pitch-green-3";
    if (ratio >= 0.5) return "stats-pitch-green-2";
    if (ratio >= 0.25) return "stats-pitch-orange";
    return "stats-pitch-red";
  }

  function render(containerId, csvData) {
    const data = parseCSV(csvData);
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    const pitch = document.createElement("div");
    pitch.className = "stats-pitch";

    data.forEach((row, y) => {
      row.forEach((cell, x) => {
        const zone = document.createElement("div");
        const colorClass = getColor(cell.good, cell.bad);
        zone.className = `stats-pitch-zone ${colorClass}`;

        const debugText = `${cell.good} / ${cell.bad}`;
        const label = document.createElement("span");
        label.className = "stats-pitch-label";
        label.textContent = debugText;
        zone.appendChild(label);

        pitch.appendChild(zone);
      });
    });

    container.appendChild(pitch);
  }

  return {
    render
  };
})();
