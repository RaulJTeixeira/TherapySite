let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let categoryIDSchema = new Schema({
	"id": { type: Number, index: true },
	"name": String,
	"published": Boolean,
	"iconID": Number
});


exports.categoryIDSchema = categoryIDSchema;
