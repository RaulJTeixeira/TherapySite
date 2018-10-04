let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let tokenTypesEnum = {
	pilotToken: 0,
	discordToken: 1
};

let tokenSchema = new Schema({
		"access_token": String,
		"token_type": Number,
		"refresh_token": String,
		"created": { type: Date, default: Date.now }
	}
);

exports.tokenTypesEnum = tokenTypesEnum;
exports.tokenSchema = tokenSchema;