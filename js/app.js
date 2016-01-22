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

  var colorMap = d3.map();

  var quantize = d3.scale.quantize()
      // .domain([0, .15])
      .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

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
      .call(renderCensusTract) //remove to stop neighborhoods rendering
      ;


  function renderNeighborhoods(){
    d3.json("data/sf-neighborhoods.json", function(error, sf) {
      if (error) return console.error(error);

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

  function renderCensusTract(){
    d3.json("data/censustopo.json", censusColor);
  }
  var keymap = [],
      censusData;

  function censusColor(error, tract, opt) {
    if (error) return console.error(error);
    censusData = tract

    var def_prop = 'B01001_001E'

    tract.objects.census.geometries.forEach(function(el){
      keymap.push(el.properties[def_prop])
      colorMap.set(el.properties.TRACT , el.properties[def_prop])
    })
    quantize.domain(d3.extent(keymap))

    svg.append("g")
        .attr("class", "censustracts")
      .selectAll(".censustract")
        .data(topojson.feature(tract, tract.objects.census).features)
      .enter().append("path")
        .attr("class", function(d){
          return "censustract " + quantize(colorMap.get(d.properties.TRACT))
        })
        .on("mouseover", function(d) { return setTitle(d.properties[def_prop]); })
        .attr("d", path)
        .append("svg:title")
        .text( function(d) { return d.properties[def_prop]; });
  }

  function changeColorVar(prop){
    console.log('change '+prop);
    // var censustracts = svg.select(".censustracts").selectAll(".censustract")
    // data.objects.census.geometries.forEach(function(el){
    //   keymap.push(el.properties[prop])
    //   colorMap.set(el.properties.TRACT , el.properties[prop])
    // })
    // quantize.domain(d3.extent(keymap))
    // censustracts.attr("class", function(d){
    //   return "censustract " + quantize(colorMap.get(d.properties.TRACT))
    // })
  }

  d3.select(window).on('resize', resize);
  d3.select('#select').on('change', changeColorVar.call(null, this.value ));

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
    svg.selectAll('.censustract').attr('d', path);
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
          // d3.json("http://" + ["a", "b", "c"][(d[0] * 31 + d[1]) % 3] + ".tile.openstreetmap.us/vectiles-" + type + "/" + d[2] + "/" + d[0] + "/" + d[1] + ".json", function(error, json) {
          // use the locally cached tiles
          d3.json("data/osm/" + ["a", "b", "c"][(d[0] * 31 + d[1]) % 3] + "-highroad-"+ d[2] + "-" + d[0] + "-" + d[1] + ".json", function(error, json) {
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
