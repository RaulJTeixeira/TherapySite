let request = require('superagent');

let esi 	= require( appRoot + '/esi');
let models 	= require( appRoot + '/models/');
let settings= require( appRoot + '/settings');

let CON 	= require(  appRoot + '/constants' );

let permissionsList = new Map(); // This is populated by the

registerPermission('adminView');
registerPermission('coverageView');
registerPermission('krabacusView');
registerPermission('pilotViewOthers');
registerPermission('pilotRemoveAlt');
registerPermission('isAltOfUser', function( user, perm, req, res ) {
	let characterID = req.params.id;

	return user.CharacterID == characterID
		|| user.alts.filter(( alt ) => {
			return alt.CharacterID.toString() == characterID.toString();
		}).length > 0;
});

/* Document user flow
   1) passport.trackSession
   		Sets the path requested to local
   		Checks the session
   			Backdoors admin
   			Pulls the user from the database
   			Refreshes the user token || do we need this?
TODO -->	Build a permission list for the user
   			HITS ESI for titles (this is cached for an hour)
   				saves
			sets the user to the local variables
	2) buildNavigationHeader
		Checks user set
			Builds urls
			Builds dashboard urls

*/

function findUser( id ) {
	return models
		.loginModel
		.findOne({CharacterID: id })
        .populate('alts')
		.populate('parent')
        .populate('titles')
		.exec();
}
function updateUser( user ) {
	return new Promise(function( resolve, reject ){
	    user = JSON.parse( JSON.stringify( user ) );
        delete user.__v;

		models.loginModel.findOneAndUpdate(
				{CharacterID: user.CharacterID},
				user,
				{upsert: true, new: true }
			)
			.populate('parent')
			.exec(function( err, raw ){
				if( err ) reject( err );
				resolve( raw );
			});
	});
}
function refreshUser( user, populate ) {
    console.log( " --- Refreshing user ---" );

	return new Promise(function( resolve ){

		if(user.token.created.getTime() + 1100000 < Date.now() ) {

            console.log( " --- Token is old ---" );

			esi.refresh(user.token.refresh_token)
				.then(function (token) {

					user.token = token;

					//console.log( user );

					if (populate) {
						models.loginModel.findOneAndUpdate(
							{CharacterID: user.CharacterID},
							user,
							{new: true})
							.populate('parent')
							.populate('alts')
							.populate('titles')
							.exec()
							.then(function (user) {
								resolve(user);
							})
							.catch(function( ) {
								resolve(user);
							});
					} else {
						//console.log('update user');
						updateUser(user).then(function (user) {
							resolve(user);
						});
					}
				}).catch(function( error ){
					console.error( error );
					console.log( 'Error refreshing token' );
					resolve( undefined );
				});

		} else {
            console.log( " --- User is Ready ---" );
			resolve(user);
		}
	});
}
function hasPermission( user, permission ){
	return user.permissions[ permission ] !== undefined && user.permissions[ permission ] !== null;
}
function postDiscordToken( token ){
	return new Promise(function( resolve, reject ){
		request
			.post('https://discordapp.com/api/oauth2/token')
			.type('form')
			.send( 'client_id=' + settings.discord.clientID )
			.send( 'client_secret=' + settings.discord.secretKey )
			.send( 'grant_type=authorization_code' )
			.send( 'code=' + token )
			.send( 'redirect_uri=' + settings.discord.callbackURL )
			.end(function( err, result ){
				if( err ) return reject( err );

				return resolve( result.body );
			});

	});
}
function getDiscordUser( token ) {
	return new Promise(function( resolve, reject ){
		request.get( settings.discord.apiURL + 'users/@me' )
			.set('Authorization','Bearer ' + token.access_token )
			.set('User-Agent', 'DiscordAuth (https://www.sh0kTherapy.space/,v1)')
			.end(function( err, res ){
				if( err ) return reject( err );

				resolve( res.body );
			});
	});
}

function isAdmin( user ) {
	return settings.admin.directors.indexOf( user.CharacterID ) != -1;
}

/**
 * Scenario
 * @param permissions
 * @returns {Function}
 */

function auth( permissions ) { // Simple list of keys to checks that act as a conditional OR statement

    console.log(permissions);


    if(!permissions)
		permissions = [];
	if( permissions && !Array.isArray( permissions ) )
		permissions = [ permissions ];

	let keys = permissions;

	return function( req, res, next ) {
		// If the session is not set

        if( !( req.session && req.session.user ) ) {
			req.session.destroy();

			console.log('Destroying session');

			return res.redirect('/'); // User is trying to access an authorized part of the system
		}

		if( !res.locals.user ) {

			console.log('Locals is not defined');
			return res.redirect( '/' );
		}

		let user = res.locals.user;

		//console.log( user );
		console.log( user.permissions );

		for( let i = 0; i < keys.length; i++ ) {
			let operation = permissionsList.get( keys[i] );

			if( operation && operation( user, keys[i], req, res ) )
				return next(); // user has permission
		}

		if( isAdmin( user ) || !permissions.length ) {
			return next();
		}

		req.flash('warning', 'Sorry, you do not have the permission: ' + permissions );

		return res.redirect( '/dashboard' );
	}
}

function registerPermission( permission, callback ) {
	if( permissionsList.has( permission ) ) return ; // Permission already registered
	if( !callback ) callback = hasPermission; // Default check against the user's permission list

	permissionsList.set( permission, callback );
}


function buildEvELoginUrl( returnVar, state, scopes ) {

	return function( req, res, next ){
		res.locals[returnVar] = settings.eve.loginURL +
			'?' +
			'response_type=code' +
			'&redirect_uri=' + settings.eve.callbackURL +
			'&client_id=' + settings.eve.clientID +
			'&scope=' + scopes.join(' ') +
			'&state=' + state + req.session.id;

		next();
	};

}
function buildDiscordLoginUrl( returnVar, state ) {

	//discordapp.com/oauth2/authorize?client_id=306200035882827777&scope=identify%20guilds&response_type=code&state=meh

	return function( req, res, next ) {
		res.locals[ returnVar ] = settings.discord.loginURL +
			"?" +
			"response_type=code" +
			"&client_id=" + settings.discord.clientID +
			"&scope=" + settings.discord.scopes.join(' ') +
			"&state=" + state + req.session.id;

		next();
	};
}

function trackSession( req, res, next ) {
	res.locals.path = req.path;

/*	if( isDevelopment && !req.session.user ) {
		console.log( Date.now(), 'isDevelopment: Setting the admin as default user');

		req.session.user = {
			CharacterName: settings.admin.CharacterName,
			CharacterID: settings.admin.CharacterID
		};

		return res.redirect('/dashboard');
	}*/

    console.log( ' -- Tracking session started -- ' );

	//req.session.user = null;
	if( !req.session.user ) {
        console.log(' -- No user, moving on. -- ');
        return next();
    }

	res.locals.session = req.session;

	if( req.session.user ) {
        console.log(' -- Have a user, working with [' + req.session.user.CharacterName + '] -- ');

		models
			.loginModel
			.findOne({ CharacterID: req.session.user.CharacterID })
			.populate('alts')
			.populate('parent')
			.populate('permissionGroups')
			.exec()
			.then(( user )=>{
                console.log(' -- Building Login User -- ');

                //isDevelopment && console.log( user );
				// Checks for refreshing token
				return refreshUser( user, true ); // Refresh the API Token
			})
			.then( function( currChar ) {

				isDevelopment && console.log( 'TRACKING USER IS FRESH:', currChar != undefined );
				if( !currChar ) {
					req.session.user = undefined;
					req.flash('warning', 'User is not fresh and could not be refreshed.' );
					return next();
				}


				function permissionsFromPermissionGroups( permissionGroups ) {
					let permissions = {};

					if( permissionGroups && permissionGroups.length )
						for( let i = 0, len = permissionGroups.length; i < len; i++ ) {
							let group = permissionGroups[i];

							for( let j = 0, len2 = group.permissions.length; j < len2; j++ )
								permissions[user.permissionGroups[i].permissions[j]] = true;
						}

					return permissions;
				}

				let permissions = permissionsFromPermissionGroups( currChar );
				currChar.permissions = permissions;

				res.locals.user = currChar;

				return next();
			});

	} else {
		return next();
	}
}

function logout( req, res ) {
	req.session.destroy();

	res.redirect('/');
}



function callbackEVE( req, res ){

	console.log(" --- EVE Callback");
	let failURL = '/';
	let corpReturnURL = '/dashboard';

	// Must have code and state
	if( ! ( req.query && req.query.code && req.query.state ) ){
        console.log(" --- Does not have code and state?");
        return res.redirect( failURL );
    }

	let isCorpLogin = req.query.state == 'c' + req.session.id;
	let isLogin = req.query.state == 'l' + req.session.id;
	let isAltLogin = req.query.state == 'a' + req.session.id;

	let _alt;

	if( !( isCorpLogin || isLogin || isAltLogin ) ) { // This must match our callback url
        console.log(" --- Not an accepted login");
        return res.redirect(failURL);
    }

	if( isCorpLogin ) // Check that the user is set
		esi.authenticate( req.query.code ) // Authenticate to get active token
			.then( token  => {
				// Store this token
				// receive token via character
			});

	if( isLogin || isAltLogin ) {
        console.log(" --- Login or Alt Login");
        esi.authenticate(req.query.code) // Authenticate to get active token
            .then((token) => {
                console.log(" --- Have token, grabbing Pilot");
                // Get the EvE pilot
                return esi.verify(token).then((pilot) => {
                    console.log(" --- Returning pilot: " + pilot.CharacterName);
                    pilot.token = token; // Attach the token

                    return pilot;
                });
            })
            .then(character => {
                // Check if character is different than current session
                let user = req.session.user;
                console.log(" --- Creating Logged User");

                if (isLogin) // If it is a normal login skip to next step
                    return Promise.resolve(character);

                if (user.CharacterID == character.CharacterID) // User logged in their main as an alt (OH BOY WE GOT STUPID)
                    return Promise.resolve(character);

                // This is an alt login
                return models
                    .loginModel
                    .findOne({CharacterID: user.CharacterID})
                    .exec()
                    .then(function (parent) {
                        character.parent = parent._id;
                        console.log(" --- Logged in as an alt?");
                        _alt = character;

                        return updateUser(character).then(function (altUser) {
                            let unique = new Map();
                            unique.set(altUser._id.toString(), altUser._id);

                            for (let i = parent.alts.length; i-- > 0;) {
                                let id = parent.alts[i];
                                unique.set(id.toString(), id);
                            }

                            parent.alts = Array.from(unique.values());

                            return Promise.resolve(parent);
                        })
                    })
            })
            .then(updateUser)
            .then(character => {
                if (character.parent != null) // user logged in as an alt
                    return findUser(character.parent.CharacterID);
                else
                    return Promise.resolve(character);
            })
            .then((character) => {
                console.log(" --- Building Local user");
                req.session.user = {
                    CharacterName: character.CharacterName,
                    CharacterID: character.CharacterID
                };

                if (isAltLogin)
                    req.flash('info', _alt.CharacterName + ' successfully connected to your main account.');
                else {
                    req.flash('info', 'Successfully logged in.');
                    console.log(" --- Logged in? " + req.session.user.CharacterID +" - " + req.session.user.CharacterName)
                }

                console.log(" --- Logged in? " + req.session.user.CharacterID +" - " + req.session.user.CharacterName)
                return res.redirect(corpReturnURL);
            })
            .catch(function (err) {
                console.error(err);
                console.log(" --- Failed to Create Local user: " + err);

                req.flash('error', err.message);

                res.redirect(failURL);
            });
    }
}
function callbackDiscord( req, res, next ) {

	if( ! ( req.query && req.query.code && req.query.state ) )
		return res.redirect('/');


	let discordToken;
	let discordUser;

	postDiscordToken( req.query.code ).then(function( token ){
		return Promise.resolve( discordToken = token );
	})
		.then( getDiscordUser )
		.then(function( user ){
			discordUser = user;

		})
		.then(function(){
			return findUser( req.session.user.CharacterID ).then();
		})
		.then(function( user ){
			res.locals.response = user;

			user.discordUser = discordUser;
			user.discordToken = discordToken;

			return Promise.resolve( user );
		})
		.then( updateUser )
		.then( function(){
			req.flash( 'info', 'Successfully connected your discord account.' );
			res.redirect('/dashboard');
		})
		.catch( next );


}

module.exports = {
	registerPermission: 	registerPermission,
	hasPermission: 				hasPermission,
	findUser: 				findUser,
	buildEvELoginUrl: 		buildEvELoginUrl,
	buildDiscordLoginUrl: 	buildDiscordLoginUrl,
	trackSession: 			trackSession,
    logout: 				logout,
    auth: 					auth,
    refreshUser: 			refreshUser,
    callbackEVE: 			callbackEVE,
	callbackDiscord: 		callbackDiscord
};