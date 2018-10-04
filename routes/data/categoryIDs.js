var express = require('express');
var fs = require( 'fs' );

var models = require( appRoot + '/models/' );

var router = express.Router();

function updateID( promise, doc ) {
	return promise.then(function(){
		return new Promise(function( resolve, reject ){
			console.log( 'Queueing: ', doc.id );

			models.categoryIDModel.update(
				{id: doc.id},
				doc,
				{ upsert: true },
				function( err, raw ){
					if( err )
						return reject( err );

					console.log( 'Added: ', doc.id );

					resolve();

				}
			);
		});
	});
}


router.get('/', function( req, res, next ) {
	models.groupIDModel.find({}).select('id name categoryID -_id').where({published: true}).exec().then(function( docs ){
		console.log(req.query);
		res.render('output', { output: docs, query: req.query });
	});
});
router.get('/add/', function( req, res, next ){
	let docs = fs.readFileSync( appRoot + '/data/groupIDs.json' );
	docs = JSON.parse(docs);
	console.log( 'Total docs:', docs.length );
	docs.reduce( updateID, Promise.resolve()).then(function(){
		res.redirect('/d/groupIDs');
	});
});
router.get('/:id', function( req, res, next ){
	models.groupIDModel.find({ categoryID: req.params.id })
		.select('-_id id name groupID published')
		.sort({ name: 1 })
		.where({published: true})
		.exec()
		.then(function( docs ){
			res.render('output', { output: docs, clean: req.query.clean });
		});
});
router.get('/:id/', function( req, res, next ) {
	models.groupIDModel.find({ id: req.params.id }).select('id name -_id').exec().then(function( docs ){
		res.render('output', { output: docs, clean: req.query.clean });
	});
});

module.exports = router;