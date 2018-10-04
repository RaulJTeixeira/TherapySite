var express = require('express');

var passport 	= require( appRoot + '/passport');
var esi 		= require( appRoot + '/esi');
var models 		= require( appRoot + '/models/index');

var fittingsModel	= require( appRoot + '/models/fittings').fittingsModel;
var router = express.Router();

// This is getting into the dangerous area of not being able to complete

function decodeFitting( fitting ) {
	let shipRegex = /\[(.*), (.*)\]/ig;

	let shipParts = shipRegex.exec( fitting );
	let ship = shipParts[1];
	let name = shipParts[2];

	// Pull out per line
	// loop lines
	//    split commas for ammo

	return {
		name: name,
		ship: ship,
		high: [],
		mid: [],
		low: [],
		rigs: [],
		drone: [],
		cargo: []
	}
}

router.post('/', passport.auth(), function( req, res, next ){

	if( req.body['addFitting'] === 'add' ) {

		let decoded = decodeFitting( req.body['fitting'] );

		let newFitting = new fittingsModel({
			type: 'Alliance',
			name: decoded.name,
			ship: decoded.ship,
			fitting: req.body['fitting']
		});

		newFitting.save().then(()=>{
			req.flash('info', 'Fitting successfully saved');
			return res.redirect( req.originalUrl );
		});
	}
});

router.use('/', passport.auth(), function(req, res, next) {
	fittingsModel.find().select(['name', 'ship']).exec().then(( fittings )=>{
		return res.render('fittings/index', { fittings: fittings});
	});
});

module.exports = router;