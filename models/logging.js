let mongoose = require('mongoose');

let Schema = mongoose.Schema;

const loggingTypesEnum = {
	cronJob: 0,
	memberChange: 1
};

let loggingSchema = new Schema({
	name: { type: String, index: true },
	type: { type: Number, index: true },
	date: { type: Date, index: true },
	result: String,
	pilots: [{ type: Schema.Types.ObjectId, ref: 'login' }]
});

exports.loggingTypesEnum = loggingTypesEnum;
exports.loggingSchema = loggingSchema;
