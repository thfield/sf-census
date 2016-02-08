//TODO: use dispatch to coordinate clicks
//https://github.com/mbostock/d3/wiki/Internals#dispatch
//http://bl.ocks.org/mbostock/5872848

(function() {
  var selectKey={a:["B01001_003E","B01001_027E","a"],b:["B01001_004E","B01001_028E","b"],c:["B01001_005E","B01001_029E","c"],d:["B01001_006E","B01001_030E","d"],e:["B01001_007E","B01001_031E","e"],f:["B01001_008E","B01001_032E","f"],g:["B01001_009E","B01001_033E","g"],h:["B01001_010E","B01001_034E","h"],i:["B01001_011E","B01001_035E","i"],j:["B01001_012E","B01001_036E","j"],k:["B01001_013E","B01001_037E","k"],l:["B01001_014E","B01001_038E","l"],m:["B01001_015E","B01001_039E","m"],n:["B01001_016E","B01001_040E","n"],o:["B01001_017E","B01001_041E","o"],p:["B01001_018E","B01001_042E","p"],q:["B01001_019E","B01001_043E","q"],r:["B01001_020E","B01001_044E","r"],s:["B01001_021E","B01001_045E","s"],t:["B01001_022E","B01001_046E","t"],u:["B01001_023E","B01001_047E","u"],v:["B01001_024E","B01001_048E","v"],w:["B01001_025E","B01001_049E","w"],x:["B01001_002E","B01001_026E","x"]},
      categoryDict={B01001_003E:"Under 5 years",B01001_004E:"5 to 9 years",B01001_005E:"10 to 14 years",B01001_006E:"15 to 17 years",B01001_007E:"18 and 19 years",B01001_008E:"20 years",B01001_009E:"21 years",B01001_010E:"22 to 24 years",B01001_011E:"25 to 29 years",B01001_012E:"30 to 34 years",B01001_013E:"35 to 39 years",B01001_014E:"40 to 44 years",B01001_015E:"45 to 49 years",B01001_016E:"50 to 54 years",B01001_017E:"55 to 59 years",B01001_018E:"60 and 61 years",B01001_019E:"62 to 64 years",B01001_020E:"65 and 66 years",B01001_021E:"67 to 69 years",B01001_022E:"70 to 74 years",B01001_023E:"75 to 79 years",B01001_024E:"80 to 84 years",B01001_025E:"85 years and over",B01001_027E:"Under 5 years",B01001_028E:"5 to 9 years",B01001_029E:"10 to 14 years",B01001_030E:"15 to 17 years",B01001_031E:"18 and 19 years",B01001_032E:"20 years",B01001_033E:"21 years",B01001_034E:"22 to 24 years",B01001_035E:"25 to 29 years",B01001_036E:"30 to 34 years",B01001_037E:"35 to 39 years",B01001_038E:"40 to 44 years",B01001_039E:"45 to 49 years",B01001_040E:"50 to 54 years",B01001_041E:"55 to 59 years",B01001_042E:"60 and 61 years",B01001_043E:"62 to 64 years",B01001_044E:"65 and 66 years",B01001_045E:"67 to 69 years",B01001_046E:"70 to 74 years",B01001_047E:"75 to 79 years",B01001_048E:"80 to 84 years",B01001_049E:"85 years and over",a:"Under 5 years",b:"5 to 9 years",c:"10 to 14 years",d:"15 to 17 years",e:"18 and 19 years",f:"20 years",g:"21 years",h:"22 to 24 years",i:"25 to 29 years",j:"30 to 34 years",k:"35 to 39 years",l:"40 to 44 years",m:"45 to 49 years",n:"50 to 54 years",o:"55 to 59 years",p:"60 and 61 years",q:"62 to 64 years",r:"65 and 66 years",s:"67 to 69 years",t:"70 to 74 years",u:"75 to 79 years",v:"80 to 84 years",w:"85 years and over"},
      categoryTitles = ["Under 5 years","5 to 9 years","10 to 14 years","15 to 17 years","18 and 19 years","20 years","21 years","22 to 24 years","25 to 29 years","30 to 34 years","35 to 39 years","40 to 44 years","45 to 49 years","50 to 54 years","55 to 59 years","60 and 61 years","62 to 64 years","65 and 66 years","67 to 69 years","70 to 74 years","75 to 79 years","80 to 84 years","85 years and over"],
      censusData

  var margin = {top: 10, left: 10, bottom: 10, right: 10},
      width = parseInt(d3.select('#map_container').style('width')),
      barchartWidth = parseInt(d3.select('#barchart_container').style('width')),
      // width = 650,
      width = width - margin.left - margin.right,
      mapRatio = 1,
      height = width * mapRatio,
      barchartHeight = (width)/3,
      scaleMultiplier = 300

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, barchartWidth], .1);

  var y = d3.scale.linear()
      .range([barchartHeight, 0]);

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
      .attr('height', barchartHeight)
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

  var currentTract = 'citywide'

  ttInit('body')

  mapsvg
      .call(renderTiles, 'highroad') //remove to stop roads rendering
      .call(renderNeighborhoods) //remove to stop neighborhoods rendering

  mapsvg.call(renderCensusTract) //remove to stop neighborhoods rendering

  d3.json('data/age-sex.json', function(data) {
    for (var letter in selectKey){
      for (var tract in data){
        data[tract][letter] = +data[tract][selectKey[letter][0]] + +data[tract][selectKey[letter][1]]
      }
    }
    censusData = data
    changeDemographic('B01001_002E')
    renderBarChart(barsvg)
  })

  /* page listeners */
  d3.select('#dropdown').on('change', function(){
    return dispatcher.changeDemo()
  })
  d3.selectAll('input[name=mf]').on('change', function(){
    return dispatcher.changeGender()
  })
  d3.select(window).on('resize', resize);
  d3.select("#citywide").on('click', function(){
    dispatcher.changeTract('citywide')
  });

  var dispatcher = d3.dispatch('changeTract', 'changeGender', 'changeDemo')
  dispatcher.on('changeTract', function(tract){
    currentTract = tract
    changeBarChart(tract)
  })
  dispatcher.on('changeGender', function(){
    var demog = d3.select('#dropdown').node().value,
        gender = getCurrentGender()
    changeBarChart(currentTract)

    changeDemographic(selectKey[demog][gender] )
  })
  dispatcher.on('changeDemo', function(inputDemog){
    if (inputDemog) {
      setActiveDropdown(inputDemog)
      return changeDemographic(inputDemog)
    }
    var demog = d3.select('#dropdown').node().value,
        gender = getCurrentGender()

    return changeDemographic(selectKey[demog][gender] )
  })

  function getCurrentGender(){
      return d3.select('input[name=mf]:checked').node().value
  }

  function setActiveDropdown(demog){
    var title = categoryDict[demog]
    var selList = document.getElementById('dropdown');
    for (var i = 0; i < selList.options.length; i++) {
     var tmpOptionText = selList.options[i].text;
     if(tmpOptionText == title) selList.selectedIndex = i;
    }
  }

  function setTitle(newTitle){
    d3.select('#selected-title').text(newTitle)
  }

  function getDemographicCategories(gender,tract){
    var result = []
    for (var demog in selectKey){
      var acs = selectKey[demog][gender],
          val = censusData[tract][acs],
          category = categoryDict[acs]//[0]

      if ( !( (acs == 'B01001_002E') || (acs == 'B01001_026E') || (acs == 'x') ) ){
        result.push({ acs:acs, val:+val, category:category })
      }
    }
    return result
  }

  function renderBarChart(svg){
    svg.append('g').attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var data = getDemographicCategories(0, currentTract)

    x.domain(categoryTitles);
    y.domain([0, d3.max(data, function(d) { return d.val; } )]);
    quantize.domain( y.domain() )

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform",  function(d) {
          return 'translate(0,' + barchartHeight + ')'
        })
        .attr('text-anchor', 'start')
        .call(xAxis)
      .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(-90)")
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
          return 'bar ' + quantize(d.val) + getCurrentGender()
        })
        .attr("x", function(d) { return x(d.category); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.val); })
        .attr("height", function(d) { return barchartHeight - y(d.val); })
        .on('click', function(d){
          return dispatcher.changeDemo(d.acs)
        })
        .on("mouseover", function(d){
          var me = d3.select(this),
              thisText = d.val;
          return ttFollow(me, thisText)
        } )
        .on("mouseout", ttHide );

    svg.append('text')
      .attr("y", 16)
      .attr("x", 25)
      .attr("class", "tracttitle")
      .text('Census Tract '+ currentTract )
  }

  function changeBarChart(tract){
    var gender = getCurrentGender()
    var scopedata = getDemographicCategories(gender,tract)
    // var foo = [];
    // data.forEach(function(el){
    //   foo.push(el.acs)
    // })
    x.domain(categoryTitles);
    y.domain([0, d3.max(scopedata, function(d) { return d.val; } )]);
    // debugger;
    quantize.domain(y.domain())
    var bars = d3.selectAll('.bar')
    bars.data(scopedata)
        .attr('class', function(d){
          return 'bar ' + quantize(d.val) + gender
        })
        .attr("y", function(d) { return y(d.val)} )
        .attr("height", function(d) { return barchartHeight - y(d.val); });
    d3.select('.tracttitle')
      .text('Census Tract ' + tract)
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
          .attr('class', 'neighborhoods hidden')
        .selectAll('.neighborhood')
          .data(topojson.feature(sf, sf.objects.SFFind_Neighborhoods).features)
        .enter().append('a')
          .attr('xlink:href',function(d) { return '#' || d.properties.LINK }) //change property here to change link
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
          .on('click', function(d){ return dispatcher.changeTract(d.id) })
          .on('mouseover', function(d) {
            var me = d3.select(this),
                pop = colorMap.get(d.id),
                thisText = 'census tract: ' + d.id + '<br> population: '+ pop;
            ttFollow(me, thisText)
            return setTitle(pop)
          })
          .on("mouseout", ttHide )
    })
  }

  function changeDemographic(demog){
    keymap.length = 0
    for (var tract in censusData) {
      if( tract == 'citywide') {continue}
      colorMap.set(tract, +censusData[tract][demog])
      keymap.push(+censusData[tract][demog])
    }
    quantize.domain(d3.extent(keymap))
    var censustracts = mapsvg.select('.censustracts').selectAll('.censustract')
    censustracts
      .attr('class', function(d){
        return 'censustract ' + quantize(colorMap.get(d.id)) + getCurrentGender()
      })
      // debugger;
  }

  function resize() {
    // adjust things when the window size changes
    width = parseInt(d3.select('#map_container').style('width'));
    barchartWidth = parseInt(d3.select('#barchart_container').style('width'));
    width = width - margin.left - margin.right;
    height = width * mapRatio;

    // update projection
    projection
        .translate([width / 2, height / 2])
        .scale(width*scaleMultiplier);
    x.rangeRoundBands([0, barchartWidth], .1);
    xAxis.scale(x)
    barsvg.select(".x.axis")
        .call(xAxis)
    barsvg.selectAll(".x text")
          .attr("y", 0)
          .attr("x", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "start")

    // resize the map container
    mapsvg
        .style('width', width + 'px')
        .style('height', height + 'px');
    barsvg
        .style('width', barchartWidth + 'px');

    barsvg.selectAll(".bar")
      .attr("width", x.rangeBand())
      .attr("x", function(d) { return x(d.category); })

    // resize the map
    mapsvg.select('.neighborhoods').attr('d', path);
    mapsvg.selectAll('.neighborhood').attr('d', path);
    mapsvg.select('.highroad').attr('d', path);
    mapsvg.selectAll('.minor_road').attr('d', path);
    mapsvg.selectAll('.major_road').attr('d', path);
    mapsvg.selectAll('.highway').attr('d', path);
    mapsvg.select('.censustracts').attr('d', path);
    mapsvg.selectAll('.censustract').attr('d', path);

}
})()

function layerHideShow(cb) {
  d3.select('.' + cb.name).classed('hidden', !cb.checked)
}

function ttInit(element){
  d3.select(element).append('div')
      .attr('id', 'tooltip')
      .attr('class', 'hidden')
    .append('span')
      .attr('class', 'value')
}

function ttFollow(element, caption, options) {
  element.on('mousemove', null);
  element.on('mousemove', function() {
    var position = d3.mouse(document.body);
    d3.select('#tooltip')
      .style('top', ( (position[1] + 30)) + "px")
      .style('left', ( position[0]) + "px");
    d3.select('#tooltip .value')
      .html(caption);
  });
  d3.select('#tooltip').classed('hidden', false);
};

function ttHide() {
  d3.select('#tooltip').classed('hidden', true);
}
