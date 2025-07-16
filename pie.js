(function (global) {
  function render(containerSelector, data, options = {}) {
    const container = d3.select(containerSelector);
    container.html(""); // очистить контейнер

    const width = options.width || 400;
    const height = options.height || 400;
    const radius = Math.min(width, height) / 2;

    const svg = container
      .append("svg")
      .attr("width", width)
      .attr("height", height + 40);

    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3
      .pie()
      .value((d) => d.value)
      .sort(null);

    const arc = d3
      .arc()
      .innerRadius(0)
      .outerRadius(radius - 10);

    const color = (d) => d.color || "#ccc";

    chartGroup
      .selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data))
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .transition()
      .duration(1000)
      .attrTween("d", function (d) {
        const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return (t) => arc(i(t));
      });

    chartGroup
      .selectAll("text")
      .data(pie(data))
      .enter()
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .text((d) => `${d.data.label}: ${d.data.value}`)
      .style("font-size", "12px")
      .style("fill", "white")
      .style("text-anchor", "middle");

    const legendGroup = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height + 10})`);

    const legend = legendGroup
      .selectAll(".legend-item")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr(
        "transform",
        (d, i) => `translate(${(i - data.length / 2) * 100}, 0)`
      );

    legend
      .append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", (d) => color(d));

    legend
      .append("text")
      .attr("x", 18)
      .attr("y", 10)
      .text((d) => d.label)
      .style("font-size", "12px");
  }
  global.Pie = {
    render: render,
  };
})(window);
