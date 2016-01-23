'use strict'
let fs = require('fs');
let d3 = require('d3');

let sf = JSON.parse(fs.readFileSync('data/age-sex.json', 'utf8'));

let outputfile = 'report.json'

let output = []

const demog = "B01001_011E"

for (let tract in sf) {
  output.push(+sf[tract][demog])
}

console.log(d3.extent(output));

// fs.writeFile(outputfile, JSON.stringify(output),
//   function(err) {
//     if (err) { return console.log(err); }
//     console.log("The file was saved as", outputfile);
//   }
// );
