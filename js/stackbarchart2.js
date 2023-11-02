// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 90, left: 30 },
    width_stack2 = 1300 - margin.left - margin.right,
    height_stack2 = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg_stack2 = d3.select("#stacked_bar2")
    .append("svg")
    .attr("width", width_stack2 + margin.left + margin.right)
    .attr("height", height_stack2 + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");



svg_stack2.append("text")
    .attr("text-anchor", "end")
    .attr("x", width_stack2 - 300)
    .attr("y", height_stack2 + margin.top + 30)
    .text("Month-Year");

// Y axis label:
svg_stack2.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20)
    .attr("x", -margin.top - 80)
    .text("Number of covid cases and deaths")



// Parse the Data
d3.csv("js/csv/processed_covid/merged_death_case_stacked_updated.csv", function (data) {

    var parsetime = d3.timeParse("%Y-%m-%d");
    data.forEach(function (d) {
        var formatMonth = d3.timeFormat('%b-%Y');
        const sum = +parseFloat(d.covid_cases) + parseFloat(d.deaths);
        d.year = formatMonth(parsetime(d.date));
        d.Covid_cases_perc = +(parseFloat(d.covid_cases) / sum) * 100;
        d.Deaths_perc = +(parseFloat(d.deaths) / sum) * 100;
        console.log(d.Covid_cases_perc);

    });
    data.forEach(function (d) {
        
        d.year = d.year;
    });

    // List of subgroups = header of the csv files
    var subgroups = data.columns.slice(1);
    console.log(subgroups);

    // List of groups = species here = value of the first column called group -> I show them on the X axis
    var groups = d3.map(data, function (d) { return (d.year) }).keys();

    const capitalized = subgroups.map(element => {
        return element.toUpperCase();
    });

    // Add X axis
    var x = d3.scaleBand()
        .domain(groups)
        .range([0, width_stack2])
        .padding([0.6]);
    svg_stack2.append("g")
        .attr("transform", "translate(0," + height_stack2 + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 1200000000])
        .range([height_stack2, 0]);
    svg_stack2.append("g")
        .call(d3.axisRight(y));

    // color palette = one color per subgroup
    var color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['rgb(107,174,214)', "rgb(33,154,131)"])

    //stack the data? --> stack per subgroup
    var stackedData = d3.stack()
        .keys(subgroups)
        (data)


    // -------------
    // ADD LEGENDS
    //--------------
    // Add one dot in the legend for each name.
    var size = 10
    svg_stack2.selectAll("mydots")
        .data(capitalized)
        .enter()
        .append("rect")
        // .attr("transform", function (d, i) { return "translate(" + i * (100 / color.domain().length) + ",350)"; })
        .attr("x", 10)
        .attr("y", function (d, i) { return 355 + i * (size + 5) }) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("fill", function (d) { return color(d) })


    // Add one dot in the legend for each name.
    svg_stack2.selectAll("mylabels")
        .data(capitalized)
        .enter()
        .append("text")
        // .attr("transform", function (d, i) { return "translate(" + i * (450 / color.domain().length) + ",350)"; })
        .attr("x", 10 + size * 1.2)
        .attr("y", function (d, i) { return 355 + i * (size + 5) + (size / 2) }) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function (d) { return color(d) })
        .text(function (d) { return d })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")


    // ----------------
    // Create a tooltip
    // ----------------
    var tooltip = d3.select("#stacked_bar2")
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
        console.log(subgroupName);
        console.log(subgroupName + '_perc')
        var subgroupValue = d.data[subgroupName];
        var PercentageToShow = d.data[subgroupName + '_perc'];
        console.log(PercentageToShow);
        tooltip
            .html(subgroupName + "<br>" + d3.format(".2s")(subgroupValue) + "<br>" + "Percentage: " + d3.format("20.2s")(PercentageToShow) + '%')
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
    // Show the bars
    svg_stack2.append("g")
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
