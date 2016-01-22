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

  var keymap = [],
      censusData;

    d3.json("data/age-sex.json", function(data) {
        censusData = data
        changeColorVar('B01001_002E')
    })


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
    d3.json("data/tracts_topo.json", function(error, tract) {
      if (error) return console.error(error);

      svg.append("g")
          .attr("class", "censustracts")
        .selectAll(".censustract")
          .data(topojson.feature(tract, tract.objects.sf).features)
        .enter().append("path")
          .attr("class", "censustract")
          .attr("d", path)
          .append("svg:title")
    });
  }

  function changeColorVar(demog){
    console.log('color '+ demog);
    keymap.length = 0
    for (var tract in censusData) {
      colorMap.set(tract, censusData[tract][demog])
      keymap.push(censusData[tract][demog])
    }
    quantize.domain(d3.extent(keymap))
    var censustracts = svg.select(".censustracts").selectAll(".censustract")
    censustracts
      .attr("class", function(d){
        return "censustract " + quantize(colorMap.get(d.id))
      })
      .on("mouseover", function(d) { return setTitle(colorMap.get(d.id)); })
      .select("title")
      .text( function(d) { return colorMap.get(d.id); });


  }

  var selectKey={a:["B01001_003E","B01001_027E"],b:["B01001_004E","B01001_028E"],c:["B01001_005E","B01001_029E"],d:["B01001_006E","B01001_030E"],e:["B01001_007E","B01001_031E"],f:["B01001_008E","B01001_032E"],g:["B01001_009E","B01001_033E"],h:["B01001_010E","B01001_034E"],i:["B01001_011E","B01001_035E"],j:["B01001_012E","B01001_036E"],k:["B01001_013E","B01001_037E"],l:["B01001_014E","B01001_038E"],m:["B01001_015E","B01001_039E"],n:["B01001_016E","B01001_040E"],o:["B01001_017E","B01001_041E"],p:["B01001_018E","B01001_042E"],q:["B01001_019E","B01001_043E"],r:["B01001_020E","B01001_044E"],s:["B01001_021E","B01001_045E"],t:["B01001_022E","B01001_046E"],u:["B01001_023E","B01001_047E"],v:["B01001_024E","B01001_048E"],w:["B01001_025E","B01001_049E"],x:["B01001_002E","B01001_026E"]};

  d3.select(window).on('resize', resize);
  d3.select('#dropdown').on('change', function(){
    var gender = d3.select('input[name=mf]:checked').node().value
    return changeColorVar(selectKey[this.value][gender] )
  });
  d3.selectAll('input[name=mf]').on('change', function(){
    var demog = d3.select('#dropdown').node().value
    return changeColorVar(selectKey[demog][this.value] )
  });

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
