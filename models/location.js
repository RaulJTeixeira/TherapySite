let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let locationTypesEnum = [
	"station",
	"other"
];

let positionSchema = new Schema({
	x: Number,
	y: Number,
	z: Number
});

let locationSchema = new Schema({
	"id": 			{ type: Number, index: true },
	"name": 		String,
	"system_id": 	Number,
	"type_id": 		String,
	"position": 	positionSchema
});

exports.locationTypesEnum = locationTypesEnum;
exports.positionSchema = positionSchema;
exports.locationSchema = locationSchema;
