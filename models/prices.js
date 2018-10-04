let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let pricesSchema = new Schema({
	"type_id": { type: Number, index: true },
	"average_price": Number,
	"adjusted_price": Number
});


exports.pricesSchema = pricesSchema;
