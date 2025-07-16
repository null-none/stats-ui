(function (global) {
  function renderTacticalFlow(svgSelector, data, options = {}) {
    const svg = d3.select(svgSelector);
    const margin = options.margin || {
      top: 40,
      right: 20,
      bottom: 30,
      left: 50,
    };
    const width = (+svg.attr("width") || 960) - margin.left - margin.right;
    const height = (+svg.attr("height") || 500) - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const attackData = data.filter((d) => d.attack !== undefined);
    const defenseData = data.filter((d) => d.defense !== undefined);

    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.index))
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) =>
          Math.min(d.attack ?? Infinity, d.defense ?? Infinity)
        ),
        d3.max(data, (d) =>
          Math.max(d.attack ?? -Infinity, d.defense ?? -Infinity)
        ),
      ])
      .nice()
      .range([height, 0]);

    const attackLine = d3
      .line()
      .defined((d) => d.attack !== undefined)
      .x((d) => x(d.index))
      .y((d) => y(d.attack));

    const defenseLine = d3
      .line()
      .defined((d) => d.defense !== undefined)
      .x((d) => x(d.index))
      .y((d) => y(d.defense));

    g.append("path")
      .datum(attackData)
      .attr("class", "line")
      .attr("stroke", options.attackColor || "black")
      .attr("fill", "none")
      .attr("stroke-width", 2)
      .attr("d", attackLine);

    g.append("path")
      .datum(defenseData)
      .attr("class", "line")
      .attr("stroke", options.defenseColor || "red")
      .attr("fill", "none")
      .attr("stroke-width", 2)
      .attr("d", defenseLine);

    g.selectAll(".attack-dot")
      .data(attackData)
      .enter()
      .append("circle")
      .attr("r", 5)
      .attr("fill", options.attackColor || "black")
      .attr("cx", (d) => x(d.index))
      .attr("cy", (d) => y(d.attack));

    g.selectAll(".defense-dot")
      .data(defenseData)
      .enter()
      .append("circle")
      .attr("r", 5)
      .attr("fill", options.defenseColor || "red")
      .attr("cx", (d) => x(d.index))
      .attr("cy", (d) => y(d.defense));

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(data.length));

    g.append("g").call(d3.axisLeft(y));

    const legend = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, 10)`);

    legend
      .append("rect")
      .attr("x", -30)
      .attr("y", -10)
      .attr("width", 120)
      .attr("height", 25)
      .attr("fill", "white")
      .attr("opacity", 0.7);

    legend
      .append("circle")
      .attr("cx", 0)
      .attr("cy", -2)
      .attr("r", 5)
      .attr("fill", options.attackColor || "black");
    legend
      .append("text")
      .attr("x", 10)
      .attr("y", 4)
      .text(options.attackLabel || "Attack");

    legend
      .append("circle")
      .attr("cx", 80)
      .attr("cy", -2)
      .attr("r", 5)
      .attr("fill", options.defenseColor || "red");
    legend
      .append("text")
      .attr("x", 90)
      .attr("y", 4)
      .text(options.defenseLabel || "Defense");
  }

  global.TacticalFlow = {
    render: renderTacticalFlow,
  };
})(window);
