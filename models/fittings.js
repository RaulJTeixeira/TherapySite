let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let moduleSchema = new Schema({
	id: Number,
	name: String
});

let fittingSchema = new Schema({
	name: String,
	ship: String,
	type: String, // Alliance fitting, Corporation fitting
	fitting: String, // The stored string value of the fitting
	hs: [moduleSchema],
	ms: [moduleSchema],
	ls: [moduleSchema],
	rs: [moduleSchema],
	bay: [moduleSchema],
	cargo: [moduleSchema]
});

exports.moduleSchema = moduleSchema;
exports.fittingSchema = fittingSchema;