var width = 960,
    height = 960;

var svg = d3.select("#map_container").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("data/sf.json", function(error, sf) {
  if (error) return console.error(error);

  var sfneighborhoods = topojson.feature(sf, sf.objects.SFFind_Neighborhoods);

  var projection = d3.geo.mercator()
      .center([-122.433701, 37.767683])
      .scale(250000)
      .translate([width / 2, height / 2])
      .precision(.1);

  var path = d3.geo.path()
      .projection(projection);

  svg.append("path")
      .datum(sfneighborhoods)
      .attr("d", path);

  svg.selectAll(".neighborhood")
        .data(topojson.feature(sf, sf.objects.SFFind_Neighborhoods).features)
      .enter().append("path")
        .attr("class", "neighborhood")
        .on("mouseover", function(d) { return setTitle(d.properties.name); })
        //.attr("data-name", function(d) { return d.properties.name; })
        .attr("d", path)
        .attr("fill", "#fff")
        .attr("stroke", "#000")
        .append("svg:title")
        .text( function(d) { return d.properties.name; });

});

function setTitle(newTitle){
  d3.select("#selected-title").text(newTitle);
}
