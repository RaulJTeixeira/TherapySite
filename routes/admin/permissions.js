/**
 * Created by br006093 on 4/13/2018.
 */
let express = require('express');

let settings 	= require( appRoot + '/settings');
let passport 	= require( appRoot + '/passport');
let esi 		= require( appRoot + '/esi');
let models 		= require( appRoot + '/models/index');

let router = express.Router();



function buildView() {


	let permissionsGroupPromise = models.permissionGroupModel.find({})
		.select('name permissions')
		.exec();

	let mainAccountsPromise = models.loginModel.find({})
		.select('CharacterID CharacterName') // Get the characterID and Name
		.populate('permissionGroups')
		.where('parent').equals( null ) // Find only main accounts
		.exec();

	return Promise.all([
		permissionsGroupPromise,
		mainAccountsPromise
	]).then(( r )=>{
		return Promise.resolve({
			permissionGroups: r[0],
			pilots: r[1]
		});
	});
}


router.post('/',passport.auth(), function( req, res, next ) {

});

router.get('/', passport.auth(), function( req, res, next ){

	buildView().then(( data )=>{
		return res.render('admin/permissions', data );
	});
});

module.exports = router;