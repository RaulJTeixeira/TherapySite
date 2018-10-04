let express = require('express');

let passport = require( appRoot + '/passport');
let esi = require('./../esi');
let settings = require('./../settings');

module.exports = function( app ){

	app.use(passport.trackSession);
	app.use(function buildNavigationHeader( req, res, next ) {
		let header = {};

        console.log(" ****** Building Navigation Header ******");
		if( res.locals.user ) {
            console.log(" ****** Is User ******");

			header = {
				"Dashboard": {
					url: "/dashboard",
					children: [
						{
							name: res.locals.user.CharacterName,
							url: '/' + res.locals.user.CharacterID
						}
					]
				},
                "Coverage": { url: "/coverage" },
                "Krabacus": { url: "/krabacus" }
			};

			if( res.locals.user.CharacterID == settings.admin.CharacterID ) {
                console.log(" ****** Is Admin ******");
                header["Admin"] = {
					url: "/admin",
					children: [
						{
							name: "Settings",
							url: '/settings'
						},{
							name: "Permissions",
							url: '/permissions'
						},{
							name: "Jobs",
							url: '/jobs'
						}
					]
				}
			}

			res.locals.user.alts.sort((a,b)=>{
                if( a.CharacterName > b.CharacterName )
                    return 1;
                if( a.CharacterName < b.CharacterName )
                    return -1;
                return 0;
            }).map(function (alt) {
				header.Dashboard.children.push({
					name: alt.CharacterName,
					url: '/' + alt.CharacterID
				});
			});


		}
		res.locals.headerURLs = header;

        next();
	});

	app.get('/', passport.buildEvELoginUrl('loginURL','l', settings.eve.scopes ), function( req, res ) {
		return res.render('index', {
            forumURL: 'http://localhost:3000/?test'
        });
	});
	app.get('/front-page', passport.buildEvELoginUrl('loginURL','l', settings.eve.scopes ), function( req, res ) {
		return res.render('front-page', {
            forumURL: 'http://localhost:3000/?test'
        });
	});

    app.get("/info", function( req, res ) {
        res.type("text/plain").send("The URL fingerprint for jQuery is: " +
            req.assetFingerprint("/css/style.css") );
    });

    app.use('/users', 		require( appRoot + '/routes/user'));
    app.use('/callback', 	require( appRoot + '/routes/callback' ));
	app.use('/dashboard', 	require( appRoot + '/routes/dashboard'));
	app.use('/coverage', 	require( appRoot + '/routes/coverage'));
	app.use('/krabacus', 	require( appRoot + '/routes/krabacus'));
	app.use('/admin', 		require( appRoot + '/routes/admin'));
	app.use('/api',			require( appRoot + '/routes/api'));
	app.use('/d', 			require( appRoot + '/routes/data' ));

    app.get('/login', function( req, res ) {
        return res.render('login/login', {});
    });
    app.get('/logout', passport.logout);

    require('./404')( app );
};
