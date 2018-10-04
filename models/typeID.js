let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let typeIDSchema = new Schema({
    "id": { type: Number, index: true },
    "groupID": { type: Number, index: true },
    "marketGroupID": { type: Number, index: true },
    "name": String,
    "description": String,
    "volume": Number,
    "portionSize": Number,
	"published": Boolean,
	"average_price": Number,
	"adjusted_price": Number
});

exports.typeIDSchema = typeIDSchema;