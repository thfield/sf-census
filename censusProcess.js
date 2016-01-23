'use strict'
let fs = require('fs');

let male = JSON.parse(fs.readFileSync('raw/male.json', 'utf8'));
let female = JSON.parse(fs.readFileSync('raw/female.json', 'utf8'));
let outputfile = 'data/age-sex.json'

let output = {}
let extras = ["name","state","county","tract"]

function process(data){
  data.data.forEach(function(el){
    for (let prop in el) {
      output[el.tract] = output[el.tract] || {}
      output[el.tract][prop] = el[prop]
      extras.forEach(function(extra){
        delete output[el.tract][extra]
      })
    }
  })
}

process(male)
process(female)

fs.writeFile(outputfile, JSON.stringify(output),
  function(err) {
    if (err) { return console.log(err); }
    console.log("The file was saved as", outputfile);
  }
);
