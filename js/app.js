(function() {

  var margin = {top: 10, left: 10, bottom: 10, right: 10}
      , width = parseInt(d3.select('#map_container').style('width'))
      , width = width - margin.left - margin.right
      , mapRatio = 1
      , height = width * mapRatio
      , scaleMultiplier = 300
      ;

  var svg = d3.select("#map_container").append("svg")
      .attr("height", height)
      .attr("id","neighborhood-map")
      ;

  var tiler = d3.geo.tile()
      .size([width, height]);

  var projection = d3.geo.mercator()
      .center([-122.433701, 37.767683])
      .scale(width*scaleMultiplier)
      .translate([width / 2, height / 2]);

  var path = d3.geo.path()
      .projection(projection);

  svg
      .call(renderTiles, "highroad") //remove to stop roads rendering
      .call(renderNeighborhoods) //remove to stop neighborhoods rendering
      ;


  function renderNeighborhoods(){
    d3.json("data/sf-neighborhoods.json", function(error, sf) {
      if (error) return console.error(error);

      var sfneighborhoods = topojson.feature(sf, sf.objects.SFFind_Neighborhoods);

      svg.append("g")
          .attr("class", "neighborhoods")
        .selectAll(".neighborhood")
          .data(topojson.feature(sf, sf.objects.SFFind_Neighborhoods).features)
        .enter().append('a')
          .attr("xlink:href",function(d) { return d.properties.LINK || '#'; }) //change property here to change link
        .append("path")
          .attr("class", "neighborhood")
          .on("mouseover", function(d) { return setTitle(d.properties.name); })
          .attr("d", path)
          .append("svg:title")
          .text( function(d) { return d.properties.name; });
    });
  }

  d3.select(window).on('resize', resize);

  function resize() {
    // adjust things when the window size changes
    width = parseInt(d3.select('#map_container').style('width'));
    width = width - margin.left - margin.right;
    height = width * mapRatio;

    // update projection
    projection
        .translate([width / 2, height / 2])
        .scale(width*scaleMultiplier);

    // resize the map container
    svg
        .style('width', width + 'px')
        .style('height', height + 'px');

    // resize the map
    svg.select('.neighborhoods').attr('d', path);
    svg.selectAll('.neighborhood').attr('d', path);
    svg.select('.highroad').attr('d', path);
    svg.selectAll('.minor_road').attr('d', path);
    svg.selectAll('.major_road').attr('d', path);
    svg.selectAll('.highway').attr('d', path);
}

  function renderTiles(svg, type) {
    svg.append("g")
        .attr("class", type)
      .selectAll("g")
        .data(tiler
          .scale(projection.scale() * 2 * Math.PI)
          .translate(projection([0, 0])))
      .enter().append("g")
        .each(function(d) {
          var g = d3.select(this);
          d3.json("http://" + ["a", "b", "c"][(d[0] * 31 + d[1]) % 3] + ".tile.openstreetmap.us/vectiles-" + type + "/" + d[2] + "/" + d[0] + "/" + d[1] + ".json", function(error, json) {
            g.selectAll("path")
                .data(json.features.sort(function(a, b) { return a.properties.sort_key - b.properties.sort_key; }))
              .enter().append("path")
                .attr("class", function(d) { return d.properties.kind; })
                .attr("d", path);
          });
        });
  }

  function setTitle(newTitle){
    d3.select("#selected-title").text(newTitle);
  }

})();

function handleClick(cb) {
  d3.select('.' + cb.name).classed("hidden", !cb.checked);
}
