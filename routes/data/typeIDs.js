let express = require('express');
let fs = require( 'fs' );

let models = require( appRoot + '/models/' );

let router = express.Router();

function updateTypeID( promise, doc ) {
	return promise.then(function(){
		return new Promise(function( resolve, reject ){
			console.log( 'Queueing: ', doc.id );

			models.typeIDModel.update(
				{id: doc.id},
				doc,
				{
					upsert: true
				},
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
	models.typeIDModel.find({}).select('id name groupID -_id').exec().then(function( docs ){
		console.log(req.query);
		res.render('output', { output: docs, clean: req.query.clean });
	});
});
router.get('/add/', function( req, res, next ){
	let docs = fs.readFileSync( appRoot + '/data/typeIDs.json' );
	docs = JSON.parse(docs);

	docs.reduce( updateTypeID, Promise.resolve()).then(function(){
		res.redirect('/d/typeIDs');
	});
});
router.get('/GroupID/:id', function( req, res, next ){

	models.typeIDModel.find({ groupID: {$in: req.params.id.split(',') } })
		.select('-_id id name groupID published')
		.sort({ name: 1 })
		//.where({published: true})
		.exec()
		.then(function( docs ){
			res.render('output', { output: docs, clean: req.query.clean });
		});
});
router.get('/GroupIDs/(:ids)*', function( req, res, next ){
	models.typeIDModel.find({ groupID: req.params.id })
		.select('-_id id name groupID published')
		.sort({ name: 1 })
		//.where({published: true})
		.exec()
		.then(function( docs ){
			res.render('output', { output: docs, clean: req.query.clean });
		});
});
router.get('/:id/', function( req, res, next ) {
	models.typeIDModel.find({ id: req.params.id }).select('id name groupID -_id').exec().then(function( docs ){
		res.render('output', { output: docs, clean: req.query.clean });
	});
});

module.exports = router;