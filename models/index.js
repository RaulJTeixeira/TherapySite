let mongoose = require('mongoose');

require( appRoot + '/mongoose');

let asset			= require( './asset' );
let category		= require( './categoryID' );
let fittings 		= require( './fittings' );
let groupID 		= require( './groupID' );
let job		 		= require( './job' );
let location 		= require( './location' );
let logging			= require( './logging' );
let mining			= require( './mining' );
let notes			= require( './notes' );
let permissionGroup = require( './permissionGroups' );
let pilot			= require( './pilot' );
let prices 			= require( './prices' );
let token 			= require( './token' );
let typeID 			= require( './typeID' );
let options			= require( './options' );

let schema = {
	asset: 				asset.assetSchema,
	categoryID: 		category.categoryIDSchema,
	fittings:			fittings.fittingSchema,
	groupID:			groupID.groupIDSchema,
	job:				job.jobSchema,
	location:			location.locationSchema,
	logging: 			logging.loggingSchema,
	mining:				mining.miningSchema,
	module:				fittings.moduleSchema,
	notes:				notes.notesSchema,
	options: 			options.optionsSchema,
	permissionGroup:	permissionGroup.permissionGroupSchema,
	pilot:				pilot.pilotSchema,
	prices:				prices.pricesSchema,
	token:				token.tokenSchema,
	typeID:				typeID.typeIDSchema

};

module.exports = {
	schema: schema,
	assetModel:				mongoose.model( 'asset', 			schema.asset ),
	categoryIDModel: 		mongoose.model( 'categoryID', 		schema.categoryID ),
	fittings: 				mongoose.model( 'fittings', 		schema.fittings ),
	groupIDModel: 			mongoose.model( 'groupID', 			schema.groupID ),
	jobModel: 				mongoose.model( 'job', 				schema.job ),
	locationModel: 			mongoose.model( 'location', 		schema.location ),
	loginModel: 			mongoose.model( 'login', 			schema.pilot ),
	loggingModel: 			mongoose.model( 'logging', 			schema.logging ),
	miningModel: 			mongoose.model( 'mining', 			schema.mining ),
	notesModel:				mongoose.model( 'notes', 			schema.notes ),
	priceModel: 			mongoose.model( 'prices', 			schema.prices ),
	options: 				mongoose.model( 'options', 			schema.options ),
	permissionGroupModel: 	mongoose.model( 'permissionGroup', 	schema.permissionGroup ),
	token: 					mongoose.model( 'token', 			schema.token ),
	typeIDModel: 			mongoose.model( 'typeID', 			schema.typeID ),
	enums: {
		locationTypes: location.locationTypesEnum,
		loggingTypes: logging.loggingTypesEnum,
		tokenTypes: token.tokenTypesEnum
	}
};

