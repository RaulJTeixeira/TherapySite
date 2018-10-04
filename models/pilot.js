let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let titleSchema = new Schema({
    "title_id": Number,
    "name": String
});

let tokenSchema = new Schema({
		"access_token": String,
		"token_type": String,
		"refresh_token": String,
		"created": { type: Date, default: Date.now }
	},{ _id: false }
);

let discordUserSchema = new Schema({
	"username": 		String, // Username xD
	"discriminator": 	String,	// Dunno
	"mfa_enabled":		false,	// Dunno
	"id": 				String, // Discord ID
	"avatar": 			String 	// URL
});

let pilotSchema = new Schema({
    CharacterID: 		{ type: Number, index: true },
    CharacterName: 		String,
    Scopes: 			String,
    CharacterOwnerHash: String,
    token: 				tokenSchema,
	discordToken: 		tokenSchema,
	discordUser: 		discordUserSchema,
    titles: 			[titleSchema],
	permissionGroups: 	[{ type: Schema.Types.ObjectId, ref: 'permissionGroup'}],
	notes: 				[{ type: Schema.Types.ObjectId, ref: 'notes' }],
	alts: 				[{ type: Schema.Types.ObjectId, ref: 'login' }],
	parent: 			{ type: Schema.Types.ObjectId,	ref: 'login', default: null }
});

exports.titleSchema 		= titleSchema;
exports.tokenSchema 		= tokenSchema;
exports.discordUserSchema 	= discordUserSchema;
exports.pilotSchema 		= pilotSchema;


/*
DATA Examples

[ { title_id: 4, name: 'Tech II Specialist' },
    { title_id: 4096, name: 'Recruiting Officer' },
    { title_id: 128, name: 'Sh0k' },
    { title_id: 512, name: 'Recruiter' } ]
{ roles:
    [ 'Personnel_Manager',
        'Security_Officer',
        'Factory_Manager',
        'Rent_Factory_Facility',
        'Rent_Research_Facility',
        'Communications_Officer' ],
        roles_at_hq:
    [ 'Hangar_Take_1',
        'Hangar_Take_2',
        'Hangar_Take_5',
        'Hangar_Query_1',
        'Hangar_Query_2',
        'Hangar_Query_5',
        'Container_Take_5' ],
        roles_at_base:
    [ 'Hangar_Take_1',
        'Hangar_Take_2',
        'Hangar_Take_3',
        'Hangar_Take_5',
        'Hangar_Query_1',
        'Hangar_Query_2',
        'Hangar_Query_3',
        'Hangar_Query_5',
        'Container_Take_5' ],
        roles_at_other:
    [ 'Hangar_Take_1',
        'Hangar_Take_2',
        'Hangar_Take_3',
        'Hangar_Take_4',
        'Hangar_Take_5',
        'Hangar_Query_1',
        'Hangar_Query_2',
        'Hangar_Query_3',
        'Hangar_Query_4',
        'Hangar_Query_5',
        'Container_Take_1',
        'Container_Take_2',
        'Container_Take_5' ] }*/