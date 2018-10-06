var to = require('to');
var fs = require('fs');

var doc = to.format.yaml.load('data/typeIDs.yaml');

var docs = [];

Object.keys(doc).forEach(function( key ){
    doc[key].name = doc[key].name.en;

    if(doc[key].description) {
        doc[key].description = doc[key].description.en;
    }

    if(doc[key].traits && doc[key].traits.roleBonuses )
        doc[key].traits.roleBonuses.forEach(function( bonus ){
            bonus.bonusText = bonus.bonusText.en;
        });

    if(doc[key].traits && doc[key].traits.types ) {
        var traits = doc[key].traits.types;
        Object.keys(doc[key].traits.types).forEach(function (traitKey) {
            traits[traitKey].forEach(function (bonus) {
                bonus.bonusText = bonus.bonusText.en;
            });
        });
    }
    doc[key].id = +key;
    docs.push(doc[key]);
});

fs.writeFileSync('data/typeIDs.json', to.format.json.stringify(docs));