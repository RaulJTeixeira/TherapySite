let express = require('express');

let esi = require( appRoot + '/esi');
let models = require( appRoot + '/models/' );
let miningModel = models.miningModel;

let passport 	= require( appRoot + '/passport');


let router = express.Router();

function getUsers( value ) {
	return models.loginModel
		.find({})
		.select('CharacterID CharacterName token Scopes alts parent _id')
		.populate('alts','CharacterID CharacterName')
		.exec();
}

function whileDocuments( cursor, callback ) {
	return cursor.next().then( doc => {
		if( doc )
			return callback( doc ).then(()=>{
				return whileDocuments( cursor, callback );
			});
	});
}

function pilotHasRole( pilot, role ) {
	return pilot && pilot.Scopes && pilot.Scopes.indexOf( role ) > -1;
}

router.post('/', function(req, res, next ){

	let token = { refresh_token: req.body.refresh_token };

	if( token.refresh_token ) {
		esi.refresh(token.refresh_token)
			.then(( token ) => {
				// Get the EvE pilot
				return esi.verify( token ).then(( pilot )=>{

					pilot.token = token; // Attach the token

					return pilot;
				});
			})
			.then(function (character) {
				console.log(character);
				return models.loginModel
					.update({CharacterID: character.CharacterID}, character, {upsert: true})
					.exec()
			})
			.then(getUsers)
			.then(function (docs) {
				res.render('data/user', {output: docs, clean: req.query.clean, body: token});
			})
			.catch(function (err) {
				if (err.response && err.response.text)
					req.flash('warning', err.response.text);
				next();
			});
	} else if( req.body.useCharacter ) {
		models.loginModel
			.findOne({ CharacterID: req.body.useCharacter })
			.select('CharacterID CharacterName -_id')
			.exec()
			.then(function( user ){
				req.session.user = user;
				res.redirect('/dashboard');
			})
			.catch(function( err ){
				if( err.response && err.response.text )
					req.flash('warning', err.response.text );
				else
					req.flash('warning', err );
				next();
			});

	} else if( req.body.makeAlt && req.body.mainCharacterID && req.body.altCharacterID ) {
	    Promise.all([
            models.loginModel.findOne({ CharacterID: req.body.mainCharacterID }).exec(),
            models.loginModel.findOne({ CharacterID: req.body.altCharacterID }).exec()
        ]).then((users)=>{
        	let parent = users[0];
        	let child = users[1];

        	console.log( parent, child );

        	/// set the parents
            child.parent = parent._id;
            parent.parent = null;

			// remove the child's parent id from children
			if( child.alts ) {
				let parentIndex = child.alts.indexOf( parent._id );
				if( parentIndex !== -1 )
					child.alts.splice( parentIndex, 1 );

				// merge child alts
				for( let i = 0; i < child.alts.length; i++ ) {
					let alt = child.alts[ i ];

					if( parent.alts.indexOf( alt ) === -1 ) {
						parent.alts.push( alt );
					}
				}

			}

			if( !parent.alts ) parent.alts = [];

			// add child's id to alt list
			if( parent.alts.indexOf( child._id ) === -1 )
				parent.alts.push( child._id );

			// Remove child's alts
			child.alts = [];

            return Promise.all([
                parent.save(),
                child.save()
            ]);
        })
        .then(function(){
            next();
        })
        .catch(function( err ){
            req.flash('warning', err );
            next();
        });

	} else
		next();
});

router.use('/', function( req, res, next ) {
	getUsers().then(function( docs ){
		res.render('data/user', { output: docs, clean: req.query.clean, body: null });
	});
});


module.exports = router;
