let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let optionsSchema = new Schema({
	"name": { type: String, index: true },
	"value": String,
	"autoLoad": Boolean
});

exports.optionsSchema = optionsSchema;