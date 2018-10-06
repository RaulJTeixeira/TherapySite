let express = require('express');

let passport 	= require( appRoot + '/passport');
let esi 		= require( appRoot + '/esi');
let models 		= require( appRoot + '/models/index');

let dashboard = require( './dashboardFunctions' );

const util = require('util');


let router = express.Router();

router.get('/:id/history', passport.auth(['isAltOfUser','pilotViewOthers']), function(req, res, next) {
    
	passport.findUser( req.params.id )
		.then(function( user ){
			return passport.refreshUser( user, true );
		})
		.then(async function (user) {
            res.locals.char = user;

            let result = await dashboard.getCorpHistory(user);
            res.render('dashboard/history', result);

        })
		.catch(function( err ){
			console.log( err.response );
			next();
		});
});

module.exports = router;