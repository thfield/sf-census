var fs = require('fs');
var apiKey = JSON.parse(fs.readFileSync('raw/census-api-key.json', 'utf8')).apikey;
// file 'raw/census-api-key.json' looks like {"apikey":"string-of-numbers-and-digits"}

var census = require('citysdk')(apiKey);
//https://github.com/chadhuber/citysdk-node

var request = {
    "level": "county",
    "zip": "94102",
    "sublevel": true,
    "variables": [
      "age"
    ]
};

var outputfile = 'raw/shapes.json'

// census.APIRequest(request, function (response) {
census.GEORequest(request, function (response) {

  fs.writeFile(outputfile, JSON.stringify(response),
    function(err) {
      if (err) { return console.log(err); }
      console.log("The file was saved as", outputfile);
    }
  );

});
