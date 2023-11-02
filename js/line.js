
// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 90, left: 30 },
  width_line = 1300 - margin.left - margin.right,
  height_line = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg_line = d3.select("#line-chart")
  .append("svg")
  .attr("width", width_line + margin.left + margin.right)
  .attr("height", height_line + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

// X axis label
svg_line.append("text")
  .attr("text-anchor", "end")
  .attr("class", "label")
  .attr("x", width_line - 220)
  .attr("y", height_line + margin.top + 30)
  .text("Month");

// Y axis label:
svg_line.append("text")
  .attr("text-anchor", "end")
  .attr("transform", "rotate(-90)")
  .attr("y", -margin.left + 20)
  .attr("x", -margin.top - 80)
  .text("Deaths")


//Read the data
d3.csv("js/csv/processed_covid/monthly_death_data_processed_updated.csv", function (data) {

  var parsetime = d3.timeParse("%Y-%m-%d");
  data.forEach(function (d) {
    d.date = parsetime(d.date);
  });

  //  Load Average line data
  d3.csv("js/csv/processed_covid/line_chart_part2_average_monthwise_updated.csv", function (data2) {

    data2.forEach(function (d) {
      d.date = parsetime(d.date),
        d.avg = +d.avg
    });


    // List of groups (here I have one group per column)

    var allGroup = Object.keys(data[0]);
    allGroup.shift();

    // add the options to the button
    d3.select("#selectButton")
      .selectAll('myOptions')
      .data(allGroup)
      .enter()
      .append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; }) // corresponding value returned by the button

    // A color scale: one color for each group
    var myColor = d3.scaleOrdinal()
      .domain(allGroup)
      .range(["rgb(107,174,214)", "rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)", "rgb(3,19,43)"]);

    // Add X axis --> it is a date format
    var x = d3.scaleTime()
      .domain(d3.extent(data, function (d) { return (d.date); }))
      .range([0, width_line]);
    svg_line.append("g")
      .attr("transform", "translate(0," + height_line + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, 200000])
      .range([height_line, 0]);
    svg_line.append("g")
      .attr("class", "yaxis")
      .call(d3.axisRight(y));

    // Initialize line with group a
    var line = svg_line
      .append('g')
      .append("path")
      .datum(data)
      .attr("d", d3.line()
        .x(function (d) { return x(d.date) })
        .y(function (d) { return y(+d.Pakistan) })
      )
      .attr("stroke", "black")
      .style("stroke-width", 4)
      .style("fill", "none")

    // ----------------
    // Create a tooltip
    // ----------------
    var tooltip_ = d3.select("#line-chart")
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

      var count_deaths = +d.value;
      console.log(count_deaths);
      //var month = d.date.getFullYear();
      if (d.time) {
        var month = d.time;
        console.log("Month:", month);
    } else {
        console.log("Month: N/A (d.date is undefined)");
        // Handle the case where d.date is undefined
        // You can add specific logic here if needed
      }
      console.log(month);
      
      var changePerc = +d.percent_change;
      console.log(changePerc);
      if (changePerc > 0){
        tooltip_
        .html('Total Deaths: ' + d3.format(".2s")(count_deaths) + '<br>' + 'Month: ' + month +'<br>'+'Percent Change: '+'<i class="text-primary fa-solid fa-arrow-up"></i>'+d3.format("+20.2s")(+d.percent_change)+'%')
        .style("opacity", 1)
      } else
      {
        tooltip_
        .html('Total Deaths: ' + d3.format(".2s")(count_deaths) + '<br>' + 'Month: ' + month +'<br>'+'Percent Change: '+'<i class="text-danger fa-solid fa-arrow-down"></i>'+d3.format("+20.2s")(+d.percent_change)+'%')
        .style("opacity", 1)
      }

      
    }
    var mousemove = function (d) {
      tooltip_
        .style("left", (d3.mouse(this)[0]) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
        .style("top", (d3.mouse(this)[1]) + "px")
    }
    var mouseleave = function (d) {
      tooltip_
        .style("opacity", 0)
    }

    // Initialize dots with group a
    var dot = svg_line
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr("cx", function (d) { return x(+d.date) })
      .attr("cy", function (d) { return y(+d.Pakistan) })
      .attr("r", 5)
      .style("fill", "#69b3a2")
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)

    dot
      .data(data)
      .transition()
      .duration(1000)
      .attr("cx", function (d) { return x(+d.date) })
      .attr("cy", function (d) { return y(+d.Pakistan) })

    // A function that update the chart
    function update(selectedGroup) {

      // Create new data with the selection
      var dataFilter = data.map(function (d) { return { time: d.date, value: d[selectedGroup] } })
      console.log(dataFilter)
      for (let i = 1; i < dataFilter.length; i++) {
        let currentValue = dataFilter[i].value;
        let previousValue = dataFilter[i - 1].value;
        if (previousValue === 0) {
          dataFilter[i].percent_change = 0;
        } else {
          dataFilter[i].percent_change = (currentValue - previousValue) / previousValue * 100;
        }
      }


      var max = d3.max(data, function (d) { return +d[selectedGroup] })
      var min = d3.min(data, function (d) { return +d[selectedGroup] })

      y.domain([min, max]);

      // Give these new data to update line
      line
        .datum(dataFilter)
        .transition()
        .duration(1000)
        .attr("d", d3.line()
          .x(function (d) { return x(d.time) })
          .y(function (d) { return y(+d.value) })
        )
        .attr("stroke", function (d) { return myColor(selectedGroup) })
      console.log(dataFilter);
      svg_line.select('.yaxis')
        .transition()
        .duration(1000)
        .call(d3.axisRight(y));

      dot
        .data(dataFilter)
        .transition()
        .duration(1000)
        .attr("cx", function (d) { return x(+d.time) })
        .attr("cy", function (d) { return y(+d.value) })

    }

    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function (d) {
      // recover the option that has been chosen
      var selectedOption = d3.select(this).property("value")
      // run the updateChart function with this selected option
      update(selectedOption)
    })

    // do something with the data
  });

})
