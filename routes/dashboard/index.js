let express = require('express');

let passport 	= require( appRoot + '/passport');
let esi 		= require( appRoot + '/esi');
let models 		= require( appRoot + '/models/index');

let dashboard = require( appRoot + '/routes/dashboard/dashboardFunctions' );

let settings = require( appRoot + '/settings');

let router = express.Router();

function handlePost( req, res, next ) {
    let _user = res.locals.user;
    let id = req.params.id;
    let characterID = req.body.removeAlt.toString();

    if( characterID  ) {
        let target = id? id: _user.CharacterID;

        return models.loginModel.findOne({ CharacterID: target }).exec().then(( user )=>{
            if(!user) {
                req.flash('warning', 'Pilot was not found');
                return res.redirect( req.originalUrl );
            }

            let isAlt = user.alts.map(a => a.toString()).indexOf(characterID) > -1;
            let hasRights = passport.hasPermission( _user, 'pilotRemoveAlt' );
            let isOwner = _user.CharacterID === id // user is
                || _user._id === user.parent; // user is the owner

            if ( isAlt && ( hasRights || isOwner ) ) {
                return models.loginModel.findOne({_id: user._id}, function (err, _user) {
                    _user.alts.remove(characterID);

                    return _user.save()
                        .then(() => {
                            return models.loginModel.findOne({_id: characterID}).exec()
                        }).then(alt => {
                            req.flash('info', alt.CharacterName + ' removed from your alt list.');
                            alt.parent = null;
                            return alt.save();

                        })
                        .then(() => {
                            return passport.findUser(_user.CharacterID).then(user => {
                                res.locals.user = user;
                            });
                        })
                        .then(() => {
                            return res.redirect(req.originalUrl);
                        });

                });
            } else {
                return models.loginModel.findOne({ _id: characterID}).then( alt =>{
                    if( alt )
                        req.flash('warning', alt.CharacterName + ' is not your pilot.');
                    else
                        req.flash('warning', 'This is not your pilot.');

                    return res.redirect(req.originalUrl);
                });
            }

        });
    }

    return res.redirect(req.originalUrl);
}



router.post('/:id',passport.auth(), handlePost );
router.post('/',passport.auth(), handlePost );

router.get('/:id',
    passport.auth(['isAltOfUser','pilotViewOthers']),
    passport.buildEvELoginUrl( 'altLoginURL', 'a', settings.eve.scopes ),
    passport.buildDiscordLoginUrl('discordLoginURL','discord'),
    function(req, res, next) {

        // If its our login user then redirect to base
        if( req.session.user.CharacterID.toString() === req.params.id.toString() )
            return res.redirect('/dashboard');

        passport.findUser( req.params.id )
            .then(function( user ){
                return passport.refreshUser( user, true );
            })
            .then( function( user ) {
				if( !user ) { // We couldn't get a fresh one
					req.flash('warning', 'User is not fresh and could not be refreshed.' );
					return res.redirect('/dashboard');
				}

				return dashboard.getDashboard( user );
			})
            .then( dash => res.render('dashboard/index', dash ) );
    });

router.get('/',
    passport.auth(),
    passport.buildEvELoginUrl( 'altLoginURL', 'a', settings.eve.scopes ),
    passport.buildDiscordLoginUrl('discordLoginURL','discord'),
    function(req, res, next) {
        passport.refreshUser( res.locals.user, true )
            .then( dashboard.getDashboard )
            .then( dash => res.render('dashboard/index', dash ) );
    });

router.use('/', require('./contacts'));
router.use('/', require('./history'));
router.use('/', require('./journal'));
router.use('/', require('./transactions'));
router.use('/', require('./assets'));
router.use('/', require('./skills'));






module.exports = router;