var to = require('to');
var fs = require('fs');

var doc = to.format.yaml.load('./data/categoryIDs.yaml');

var docs = []; ;

Object.keys(doc).forEach(function( key ){
	doc[key].id = key;
    doc[key].name = doc[key].name.en;

    docs.push(doc[key]);
});

fs.writeFileSync('data/categoryIDs.json', to.format.json.stringify(docs));