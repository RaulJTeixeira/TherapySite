let mongoose = require('mongoose');

let Schema = mongoose.Schema;

// TODO: Finish building out the asset document
let jobSchema = new Schema({
	name: { type: String, index: true },
	lastRun: Date,
	endRun: Date,
	outcome: Boolean
});

exports.jobSchema = jobSchema;
