//TODO: use dispatch to coordinate clicks
//https://github.com/mbostock/d3/wiki/Internals#dispatch
//http://bl.ocks.org/mbostock/5872848

(function() {
  var selectKey = {a:['B01001_003E','B01001_027E'],b:['B01001_004E','B01001_028E'],c:['B01001_005E','B01001_029E'],d:['B01001_006E','B01001_030E'],e:['B01001_007E','B01001_031E'],f:['B01001_008E','B01001_032E'],g:['B01001_009E','B01001_033E'],h:['B01001_010E','B01001_034E'],i:['B01001_011E','B01001_035E'],j:['B01001_012E','B01001_036E'],k:['B01001_013E','B01001_037E'],l:['B01001_014E','B01001_038E'],m:['B01001_015E','B01001_039E'],n:['B01001_016E','B01001_040E'],o:['B01001_017E','B01001_041E'],p:['B01001_018E','B01001_042E'],q:['B01001_019E','B01001_043E'],r:['B01001_020E','B01001_044E'],s:['B01001_021E','B01001_045E'],t:['B01001_022E','B01001_046E'],u:['B01001_023E','B01001_047E'],v:['B01001_024E','B01001_048E'],w:['B01001_025E','B01001_049E'],x:['B01001_002E','B01001_026E']},
      categoryDict = {B01001_003E:"Under 5 years",B01001_004E:"5 to 9 years",B01001_005E:"10 to 14 years",B01001_006E:"15 to 17 years",B01001_007E:"18 and 19 years",B01001_008E:"20 years",B01001_009E:"21 years",B01001_010E:"22 to 24 years",B01001_011E:"25 to 29 years",B01001_012E:"30 to 34 years",B01001_013E:"35 to 39 years",B01001_014E:"40 to 44 years",B01001_015E:"45 to 49 years",B01001_016E:"50 to 54 years",B01001_017E:"55 to 59 years",B01001_018E:"60 and 61 years",B01001_019E:"62 to 64 years",B01001_020E:"65 and 66 years",B01001_021E:"67 to 69 years",B01001_022E:"70 to 74 years",B01001_023E:"75 to 79 years",B01001_024E:"80 to 84 years",B01001_025E:"85 years and over",B01001_027E:"Under 5 years",B01001_028E:"5 to 9 years",B01001_029E:"10 to 14 years",B01001_030E:"15 to 17 years",B01001_031E:"18 and 19 years",B01001_032E:"20 years",B01001_033E:"21 years",B01001_034E:"22 to 24 years",B01001_035E:"25 to 29 years",B01001_036E:"30 to 34 years",B01001_037E:"35 to 39 years",B01001_038E:"40 to 44 years",B01001_039E:"45 to 49 years",B01001_040E:"50 to 54 years",B01001_041E:"55 to 59 years",B01001_042E:"60 and 61 years",B01001_043E:"62 to 64 years",B01001_044E:"65 and 66 years",B01001_045E:"67 to 69 years",B01001_046E:"70 to 74 years",B01001_047E:"75 to 79 years",B01001_048E:"80 to 84 years",B01001_049E:"85 years and over"},
      categoryTitles = ["Under 5 years","5 to 9 years","10 to 14 years","15 to 17 years","18 and 19 years","20 years","21 years","22 to 24 years","25 to 29 years","30 to 34 years","35 to 39 years","40 to 44 years","45 to 49 years","50 to 54 years","55 to 59 years","60 and 61 years","62 to 64 years","65 and 66 years","67 to 69 years","70 to 74 years","75 to 79 years","80 to 84 years","85 years and over"],
      censusData

  var margin = {top: 10, left: 10, bottom: 10, right: 10},
      // width = parseInt(d3.select('#map_container').style('width')),
      width = 650,
      width = width - margin.left - margin.right,
      mapRatio = 1,
      height = width * mapRatio,
      barheight = height/2,
      scaleMultiplier = 300

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);

  var y = d3.scale.linear()
      .range([barheight, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10);

  var mapsvg = d3.select('#map_container').append('svg')
      .attr('height', height)
      .attr('id','map')

  var barsvg = d3.select('#barchart_container').append('svg')
      .attr('height', barheight)
      .attr('id','barchart')

  var colorMap = d3.map(),
      keymap = []

  var quantize = d3.scale.quantize()
      .range(d3.range(9).map(function(i) { return 'q' + i + '-9' }))

  var tiler = d3.geo.tile()
      .size([width, height])

  var projection = d3.geo.mercator()
      .center([-122.433701, 37.767683])
      .scale(width*scaleMultiplier)
      .translate([width / 2, height / 2])

  var path = d3.geo.path()
      .projection(projection)

  mapsvg
      .call(renderTiles, 'highroad') //remove to stop roads rendering
      .call(renderNeighborhoods) //remove to stop neighborhoods rendering

  mapsvg.call(renderCensusTract) //remove to stop neighborhoods rendering

  d3.json('data/age-sex.json', function(data) {
    censusData = data
    changeDemographic('B01001_002E')
    renderBarChart(barsvg)
  })

  d3.select('#dropdown').on('change', function(){
    var gender = d3.select('input[name=mf]:checked').node().value
    return changeDemographic(selectKey[this.value][gender] )
  })

  d3.selectAll('input[name=mf]').on('change', function(){
    var demog = d3.select('#dropdown').node().value
    // changeBarChart(demog)
    changeDemographic(selectKey[demog][this.value] )
  })

  function setTitle(newTitle){
    d3.select('#selected-title').text(newTitle)
  }

  function getDemographicCategories(gender,tract){
    var result = []
    for (var demog in selectKey){
      var acs = selectKey[demog][gender],
          val = censusData[tract][acs],
          category = categoryDict[acs]

      if ( !( (acs == 'B01001_002E') || (acs == 'B01001_026E') ) ){
        result.push({ acs:acs, val:+val, category:category })
      }
    }
    return result
  }

  function renderBarChart(svg){
    svg.append('g').attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var data = getDemographicCategories(0,'980501')
    var foo = [];
    data.forEach(function(el){
      foo.push(el.acs)
    })

    x.domain(categoryTitles);
    y.domain([0, d3.max(data, function(d) { return d.val; } )]);
    quantize.domain(y.domain())

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform",  function(d) {
          return 'translate(0,' + barheight + ')'
        })
        .attr('text-anchor', 'start')
        .call(xAxis)
      .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Population");

    svg.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        // .attr("class", "bar")
        .attr('class', function(d){
          return 'bar ' + quantize(d.val)
        })
        .attr("x", function(d) { return x(d.category); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.val); })
        .attr("height", function(d) { return barheight - y(d.val); });

    svg.append('text')
      .attr("y", height)
      .attr("x", 10)
      .attr("class", "tracttitle")
      .text('980501')
  }

  function changeBarChart(tract){
    var gender = d3.select('input[name=mf]:checked').node().value
    var data = getDemographicCategories(gender,tract)
    var foo = [];
    data.forEach(function(el){
      foo.push(el.acs)
    })

    x.domain(categoryTitles);
    y.domain([0, d3.max(data, function(d) { return d.val; } )]);
    quantize.domain(y.domain())
    var bars = d3.selectAll('.bar')

    bars.data(data)
        .attr('class', function(d){ return 'bar ' + quantize(d.val) })
        .attr("y", function(d) { return y(d.val); })
        .attr("height", function(d) { return barheight - y(d.val); });
    d3.select('.tracttitle')
      .text(tract)
  }

  function renderTiles(svg, type) {
    svg.append('g')
        .attr('class', type)
      .selectAll('g')
        .data(tiler
          .scale(projection.scale() * 2 * Math.PI)
          .translate(projection([0, 0])))
      .enter().append('g')
        .each(function(d) {
          var g = d3.select(this)
          // d3.json('http://' + ['a', 'b', 'c'][(d[0] * 31 + d[1]) % 3] + '.tile.openstreetmap.us/vectiles-' + type + '/' + d[2] + '/' + d[0] + '/' + d[1] + '.json', function(error, json) {
          // use the locally cached tiles
          d3.json('data/osm/' + ['a', 'b', 'c'][(d[0] * 31 + d[1]) % 3] + '-highroad-'+ d[2] + '-' + d[0] + '-' + d[1] + '.json', function(error, json) {
            g.selectAll('path')
                .data(json.features.sort(function(a, b) { return a.properties.sort_key - b.properties.sort_key }))
              .enter().append('path')
                .attr('class', function(d) { return d.properties.kind })
                .attr('d', path)
          })
        })
  }

  function renderNeighborhoods(svg){
    d3.json('data/sf-neighborhoods.json', function(error, sf) {
      if (error) return console.error(error)

      svg.append('g')
          .attr('class', 'neighborhoods')
        .selectAll('.neighborhood')
          .data(topojson.feature(sf, sf.objects.SFFind_Neighborhoods).features)
        .enter().append('a')
          .attr('xlink:href',function(d) { return d.properties.LINK || '#' }) //change property here to change link
        .append('path')
          .attr('class', 'neighborhood')
          .on('mouseover', function(d) { return setTitle(d.properties.name) })
          .attr('d', path)
          .append('svg:title')
          .text( function(d) { return d.properties.name })
    })
  }

  function renderCensusTract(svg){
    d3.json('data/tracts_topo.json', function(error, tract) {
      if (error) return console.error(error)

      svg.append('g')
          .attr('class', 'censustracts')
        .selectAll('.censustract')
          .data(topojson.feature(tract, tract.objects.sf).features)
        .enter().append('path')
          .attr('class', 'censustract')
          .attr('d', path)
          .on('click', function(d){ return changeBarChart(d.id) })
          .append('svg:title')
    })
  }

  function changeDemographic(demog){
    keymap.length = 0
    for (var tract in censusData) {
      colorMap.set(tract, +censusData[tract][demog])
      keymap.push(+censusData[tract][demog])
    }
    quantize.domain(d3.extent(keymap))
    var censustracts = mapsvg.select('.censustracts').selectAll('.censustract')
    censustracts
      .attr('class', function(d){
        return 'censustract ' + quantize(colorMap.get(d.id))
      })
      .on('mouseover', function(d) { return setTitle(colorMap.get(d.id)) })
      .select('title')
      .text( function(d) { return colorMap.get(d.id) })

  }


})()

function handleClick(cb) {
  d3.select('.' + cb.name).classed('hidden', !cb.checked)
}
