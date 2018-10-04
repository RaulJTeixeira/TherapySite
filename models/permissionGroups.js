let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let permissionGroupSchema = new Schema({
	name: String,
	permissions: [String]
});

exports.permissionGroupSchema = permissionGroupSchema;

/*
let permissions = {
	"krabacus": {},
	"coverage": {},
	"coverageUpdate": {},
	"dashboardNotesRead": {},
	"dashboardNotesUpdate": {}
};

let group = {
	ID: Number,
	name: String,
	permissions: [listOfPermissionStrings]
};

// Does the group relation


// User lookup
// -> permissions

let pilot = {
	groupID: [Number]
};
*/