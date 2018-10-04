let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let notesSchema = new Schema({
	author: { type: Schema.Types.ObjectId, ref: 'login' },
	note: String,
	created: Date,
	deleted: { type: Boolean, default: false }
});

exports.notesSchema = notesSchema;