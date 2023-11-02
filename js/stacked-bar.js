// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 90, left: 50 },
  width_stackbar = 1300 - margin.left - margin.right,
  height_stackbar = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg_stack = d3.select("#stacked_bar")
  .append("svg")
  .attr("width", width_stackbar + margin.left + margin.right)
  .attr("height", height_stackbar + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");


svg_stack.append("text")
  .attr("text-anchor", "end")
  .attr("x", width - 300)
  .attr("y", height + margin.top + 30)
  .text("month-Year");

// Y axis label:
svg_stack.append("text")
  .attr("text-anchor", "end")
  .attr("transform", "rotate(-90)")
  .attr("y", -margin.left + 20)
  .attr("x", -margin.top - 80)
  .text("Vaccine Administered")
// Parse the Data
d3.csv("js/csv/processed_covid/stacked_bar_chart_vaccine_updated.csv", function (data) {

  // List of subgroups = header of the csv files = soil condition here
  var subgroups = data.columns.slice(1)
  console.log(subgroups)

  var parsetime = d3.timeParse("%Y-%m-%d");
  data.forEach(function (d) {
    var formatMonth = d3.timeFormat('%b-%Y');
    d.year = formatMonth(parsetime(d.date));
  });

  data.forEach(function (d) {
    d.year = d.year;
  });


  // List of groups = species here = value of the first column called group -> I show them on the X axis
  var groups = d3.map(data, function (d) { return (d.year) }).keys()
  console.log(groups)


  // Add X axis
  var x = d3.scaleBand()
    .domain(groups)
    .range([0, width_stackbar])
    .padding([0.6])
  svg_stack.append("g")
    .attr("transform", "translate(0," + height_stackbar + ")")
    .call(d3.axisBottom(x).tickSizeOuter(0));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 75000000000])
    .range([height_stackbar, 0]);
  svg_stack.append("g")
    .call(d3.axisRight(y));

  // color palette = one color per subgroup
  var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(["rgb(31,118,180)", "rgb(255,127,15)", "rgb(42,160,43)", "rgb(214,39,39)","rgb(31,128,180)", "rgb(212,147,145)", "rgb(12,164,123)", "rgb(14,239,139)","rgb(111,128,130)", "rgb(255,147,155)", "rgb(142,120,243)", "rgb(210,139,239)","rgb(241,135,30)", "rgb(235,117,152)" ])
    //.range(d3.schemeBlues[14])

  //stack the data? --> stack per subgroup
  var stackedData = d3.stack()
    .keys(subgroups)
    (data)

  // ----------------
  // Create a tooltip
  // ----------------
  var tooltip = d3.select("#stacked_bar")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function (d) {
    var subgroupName = d3.select(this.parentNode).datum().key;
    var subgroupValue = d.data[subgroupName];
    tooltip
      .html(subgroupName + "<br>" + d3.format(".2s")(subgroupValue))
      .style("opacity", 1)
  }
  var mousemove = function (d) {
    tooltip
      .style("left", (d3.mouse(this)[0] + 90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      .style("top", (d3.mouse(this)[1]) + "px")
  }
  var mouseleave = function (d) {
    tooltip
      .style("opacity", 0)
  }


// -------------
// ADD LEGENDS
//--------------

var size = 10;

  // Define the legend parameters
var legendsPerRow = 4; // Number of legends per row
var numRows = Math.ceil(subgroups.length / legendsPerRow); // Calculate the number of rows needed

// Define the x-coordinate for the first legend item
var legendX = 10;
// Define the y-coordinate for the first row
var legendY = 330;

svg_stack.selectAll("mydots")
    .data(subgroups)
    .enter()
    .append("rect")
    .attr("x", function (d, i) {
        var row = Math.floor(i / legendsPerRow);
        var col = i % legendsPerRow;
        return legendX + col * (size + 305);
    })
    .attr("y", function (d, i) {
        var row = Math.floor(i / legendsPerRow);
        return legendY + row * (size + 5);
    })
    .attr("width", size)
    .attr("height", size)
    .style("fill", function (d) { return color(d) });

// Define the x-coordinate for the first legend label
var labelX = 30 + size * 1.2;

svg_stack.selectAll("mylabels")
    .data(subgroups)
    .enter()
    .append("text")
    .attr("x", function (d, i) {
        var row = Math.floor(i / legendsPerRow);
        var col = i % legendsPerRow;
        return labelX + col * (size + 305);
    })
    .attr("y", function (d, i) {
        var row = Math.floor(i / legendsPerRow);
        return legendY + (size / 2) + row * (size + 5);
    })
    .style("fill", function (d) { return color(d) })
    .text(function (d) { return d })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle");



  // Show the bars
  svg_stack.append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .enter().append("g")
    .attr("fill", function (d) { return color(d.key); })
    .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    .data(function (d) { return d; })
    .enter().append("rect")
    .attr("x", function (d) { return x(d.data.year); })
    .attr("y", function (d) { return y(d[1]); })
    .attr("height", function (d) { return y(d[0]) - y(d[1]); })
    .attr("width", x.bandwidth())
    .attr("stroke", "grey")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)

})
