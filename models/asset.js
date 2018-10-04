let mongoose = require('mongoose');

let Schema = mongoose.Schema;

// TODO: Finish building out the asset document
let assetSchema = new Schema({
	pilot: { type: Schema.Types.ObjectId, ref: 'login' },
	type_id: { type: Number, index: true }
});

exports.assetSchema = assetSchema;
