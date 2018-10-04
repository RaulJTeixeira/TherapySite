var express = require('express');
var fs = require( 'fs' );

var models = require( appRoot + '/models/' );

var router = express.Router();

function updateGroupID( promise, doc ) {
	return promise.then(function(){
		return new Promise(function( resolve, reject ){
			console.log( 'Queueing: ', doc.id );

			models.groupIDModel.update(
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
		res.render('output', { output: docs, query: req.query });
	});
});
router.get('/add/', function( req, res, next ){
	var docs = fs.readFileSync( appRoot + '/data/groupIDs.json' );
	docs = JSON.parse(docs);
	docs.reduce( updateGroupID, Promise.resolve()).then(function(){
		res.redirect('/d/groupIDs');
	});
});
router.get('/GroupID/:id', function( req, res, next ){
	models.groupIDModel.find({ groupID: req.params.id })
		.select('-_id id name groupID published')
		.sort({ name: 1 })
		.where({published: true})
		.exec()
		.then(function( docs ){
			res.render('output', { output: docs, clean: req.query.clean });
		});
});
router.get('/:id/', function( req, res, next ) {
	models.groupIDModel.find({ id: req.params.id }).select('id name categoryID -_id').exec().then(function( docs ){
		res.render('output', { output: docs, clean: req.query.clean });
	});
});

module.exports = router;