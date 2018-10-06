let express = require('express');

let settings 	= require( appRoot + '/settings' );
let passport 	= require( appRoot + '/passport' );
let esi 		= require( appRoot + '/esi' );
let models 		= require( appRoot + '/models/index' );
let options 	= require( appRoot + '/options' );

let CON 		= require( appRoot + '/constants.js' );

let router = express.Router();

/**
 * Things I need to do first
 * 	Move the token keys to they own table
 * 	Link them with the pilot
 *
 */



function buildView() {
	return Promise.all([
		options.getOptions()
	]).then((r)=>{
		return {
			options: r[0],
			upTimeStart: upTimeStart
		};
	})

}

router.post('/', function( req, res, next ){


});

router.get('/',
	passport.buildEvELoginUrl( 'corpLoginUrl', 'c', settings.eve.corporation_scopes ),
	function( req, res, next ) {
	/*
	What do I need for the admin panel?
		Admin navigation
		Website stats
		CorpESI key
		Options posting
	 */

	return buildView().then(( data )=>{
		return res.render('admin/settings', data );
	});


});


module.exports = router;