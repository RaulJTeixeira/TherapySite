var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var groupIDSchema = new Schema({
	"id": { type: Number, index: true },
	"anchorable": Boolean,
	"anchored": Boolean,
	"categoryID": Number,
	"fittableNonSingleton": Boolean,
	"name": String,
	"published": Boolean,
	"useBasePrice": Boolean
});

exports.groupIDSchema = groupIDSchema;