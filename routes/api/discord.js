let express = require('express');
let esi 		= require( appRoot + '/esi');
let models 		= require( appRoot + '/models/index');
let settings 	= require( appRoot + '/settings');

let router = express.Router();

// 1 Get the current pilots
// 2 Get their discord Auth
// 3 Lame ass shit
// Some thing some thing

function getData() {

	// Need a default member ESI
	return Promise.all([
		models.loginModel.find({ discordUser: null }), // The mains
		esi.corporation.getCorporationMembers( settings.eve.corpID, user )
	]).then(( result ) => {
		return {
			pilots: result[0],
			ESIMembers: result[1]
		};
	});
}



router.get('/members-list',
	function(req, res, next) {
		res.render('output', { output: {} });
	});




module.exports = router;
