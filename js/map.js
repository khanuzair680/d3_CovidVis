

var width = 700,
  height = 400;

var svg_map = d3.select("#map")
  .append("svg")
  .style("cursor", "move");

svg_map.attr("viewBox", "50 10 " + width + " " + height)
  .attr("preserveAspectRatio", "xMinYMin");




var zoom = d3.zoom()
  .on("zoom", function () {
    var transform = d3.zoomTransform(this);
    map.attr("transform", transform);
  });

var selectedCountry;
svg_map.call(zoom);

var map = svg_map.append("g")
  .attr("class", "map");
var tooltip = d3.select("div.tooltip");

d3.queue()
d3.queue()
  .defer(d3.json, "js/50m.json")
  .defer(d3.csv, "js/csv/processed_covid/merged_population_stats.csv")
  .await(function (error, world, data) {
    if (error) {
      console.error('Oh dear, something went wrong: ' + error);
    } else {
      drawMap(world, data);
    }
  });


function drawMap(world, data) {
  // geoMercator projection
  var projection = d3.geoMercator() //d3.geoOrthographic()
    .scale(150)
    // .scale(100)
    .translate([width / 2, height]);

  // geoPath projection
  var path = d3.geoPath().projection(projection);

  var color = d3.scaleThreshold()
    .domain([10000, 100000, 100000, 3000000, 1000000, 50000000, 10000000, 400000000, 100000000])
    // .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)", "rgb(3,19,43)"]);
    .range(d3.schemeGreens[9]);
  var features = topojson.feature(world, world.objects.countries).features;
  var populationById = {};


  data.forEach(function (d) {
    // Calculate % of public universities.
    const cases_percentage = ((+d.total_cases_per_million) / (+d.total_deaths_per_million + +d.total_cases_per_million)) * 100;
    // Calculate % of private universities.
    const deaths_percentage = 100 - cases_percentage;
    let private01 = +d.private01 ? "Private" : "Public";

    populationById[d.id] = {
      deaths: +d.total_deaths_per_million,
      cases: +d.total_cases_per_million,
      population: d.population,
      deaths_p: deaths_percentage,
      cases_p: cases_percentage,
      founded_year: d.founded_in,
      deaths_pm: +d.total_deaths_per_million
    }
  });

  features.forEach(function (d) {
    d.details = populationById[d.id] ? populationById[d.id] : {};
  });




  // Add circles to map

  map.append("g")
    .selectAll("path")
    .data(features)
    .enter().append("path")
    .attr("name", function (d) {
      return d.properties.name;
    })
    .attr("id", function (d) {
      return d.properties.name;
    })
    .attr("d", path)
    .style("fill", function (d) {
      return d.details && d.details.population ? color(d.details.population) : undefined;
    })
    .attr("fill", "blue")
    .attr("d", path)
    .on("mouseover", function (d, i) {
      d3.select(this).attr("fill", "grey").attr("stroke-width", 2);
      return tooltip.style("hidden", false).html(d.properties.name);
    })
    .on("mousemove", function (d) {
      tooltip.classed("hidden", false)
        .style("left", (d3.mouse(this)[0] - 90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
        .style("top", (d3.mouse(this)[1]) + "px")
        .style("cursor", "pointer")
        .html(d.properties.name);


    })
    .on('click', function (d) {
      d3.select(this)
        .style("stroke", "white")
        .style("stroke-width", 1)
        .style("cursor", "pointer");

      d3.selectAll(".Country")
        .text(d.properties.name);

      d3.select(".deaths")
        .text(d.details.deaths);

      d3.select(".cases")
        .text(d.details.cases);

      d3.select(".population_count")
        .text(d3.format(".2s")(d.details.population));


      d3.select("#death_percentage")
        .text(d3.format(".2s")(d.details.deaths_p) + '%');

      d3.select("#death_percentage_progressbar")
        .style("width", d3.format(".2s")(d.details.deaths_p) + '%')
        .text('deaths');

      d3.select("#case_percentage_progressbar")
        .style("width", d3.format(".2s")(d.details.cases_p) + '%')
        .text('cases')

      d3.select('.deaths_per_million')
        .text(d.details.deaths_pm)


      d3.selectAll(".hover-on-map")
        .style("display", "none")
      // .text('')

    })
    .on('mouseout', function (d) {
      d3.select(this)
        .style("stroke", null)
        .style("stroke-width", 0.25);

      // d3.select('.details')
      //   .style('visibility', "hidden");
    });

}