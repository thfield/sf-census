//save the vectiles from the osm server
var d3 = require('d3'),
		jsdom = require('jsdom'),
		fs = require('fs'),
		http = require('http');

		d3.geo.tile = function() {
		  var size = [960, 500],
		      scale = 256,
		      translate = [size[0] / 2, size[1] / 2],
		      zoomDelta = 0;

		  function tile() {
		    var z = Math.max(Math.log(scale) / Math.LN2 - 8, 0),
		        z0 = Math.round(z + zoomDelta),
		        k = Math.pow(2, z - z0 + 8),
		        origin = [(translate[0] - scale / 2) / k, (translate[1] - scale / 2) / k],
		        tiles = [],
		        cols = d3.range(Math.max(0, Math.floor(-origin[0])), Math.max(0, Math.ceil(size[0] / k - origin[0]))),
		        rows = d3.range(Math.max(0, Math.floor(-origin[1])), Math.max(0, Math.ceil(size[1] / k - origin[1])));

		    rows.forEach(function(y) {
		      cols.forEach(function(x) {
		        tiles.push([x, y, z0]);
		      });
		    });

		    tiles.translate = origin;
		    tiles.scale = k;

		    return tiles;
		  }

		  tile.size = function(_) {
		    if (!arguments.length) return size;
		    size = _;
		    return tile;
		  };

		  tile.scale = function(_) {
		    if (!arguments.length) return scale;
		    scale = _;
		    return tile;
		  };

		  tile.translate = function(_) {
		    if (!arguments.length) return translate;
		    translate = _;
		    return tile;
		  };

		  tile.zoomDelta = function(_) {
		    if (!arguments.length) return zoomDelta;
		    zoomDelta = +_;
		    return tile;
		  };

		  return tile;
		};


var preHtml = fs.readFileSync('index.html', 'utf8');
// fs.readFileSync('./bower_components/d3/tile.js', 'utf8');

jsdom.env({
	html: preHtml,
 	done: cb
})

function cb(errors, window){

  var el = window.document.querySelector('#map_container')

	var margin = {top: 10, left: 10, bottom: 10, right: 10},
	    width = 650,
	    width = width - margin.left - margin.right,
	    mapRatio = 1,
	    height = width * mapRatio,
	    scaleMultiplier = 300;

  var svg = d3.select(el).append("svg")
      .attr("height", height)
      .attr("id","neighborhood-map");

  var tiler = d3.geo.tile()
      .size([width, height]);

  var projection = d3.geo.mercator()
      .center([-122.433701, 37.767683])
      .scale(width*scaleMultiplier)
      .translate([width / 2, height / 2]);


  var path = d3.geo.path()
      .projection(projection);

  svg.call(renderTiles, "highroad");

	function renderTiles(svg, type) {
    svg.append("g")
        .attr("class", type)
      .selectAll("g")
        .data(tiler
          .scale(projection.scale() * 2 * Math.PI)
          .translate(projection([0, 0])))
      .enter().append("g")
        .each(function(d) {
          var g = d3.select(this),
							prefix = ["a", "b", "c"][(d[0] * 31 + d[1]) % 3];
					var path = 'http://' + prefix + '.tile.openstreetmap.us/vectiles-' + type + "/" + d[2] + "/" + d[0] + "/" + d[1] + ".json"
          http.request(path, function(response) {
						var str = '';
						//another chunk of data has been recieved, so append it to `str`
						response.on('data', function (chunk) {
						  str += chunk;
						});
						//the whole response has been recieved, so save it out here
						response.on('end', function () {
							fs.writeFile('data/osm/' + prefix + '-' + type + '-' + g[0][0]['__data__'][2] + '-' + g[0][0]['__data__'][0] + '-' + g[0][0]['__data__'][1]+ '.json', str, function(err) {
								if(err) {
									console.log('error saving document', err)
								} else {
									console.log('The file was saved!')
								}
							})
						});
          }).end();
        });
  }
}
