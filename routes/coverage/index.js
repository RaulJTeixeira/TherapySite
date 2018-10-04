let express = require('express');

let settings 	= require( appRoot + '/settings');
let passport 	= require( appRoot + '/passport');
let esi 		= require( appRoot + '/esi');
let models 		= require( appRoot + '/models/index');

let router = express.Router();

function storedCharacters() {
	return models.loginModel.find({})
		.select('CharacterID CharacterName alts -_id')
		.populate({ path: 'parent', select: 'CharacterID CharacterName -_id' })
		.populate({ path: 'alts', select: 'CharacterID CharacterName -_id' })
		.exec();
}

function getMembers( corpID, user ) {

	// This fetches a list of members
	// Instead of hitting the ESI we should check to

	return esi.corporation.getCorporationMembers( corpID, user ) // 3600 seconds
		.then(function( characters ){
			return esi.character.getCharacterNames( characters ); // 3600 seconds
		});
}

router.get('/', passport.auth(['coverageView']), function(req, res, next) {
    let user = res.locals.user;

    Promise.all([
        storedCharacters()
        , getMembers( settings.eve.corpID, user )
    ]).then(function (results) {
        return res.render('leadership/coverage', {
            characters: results[0],
            corpMembers: results[1],
			AUTH_SCOPES: settings.eve.scopes
        });
    });
});

module.exports = router;