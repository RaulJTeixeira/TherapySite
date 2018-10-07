const ESI_PUBLIC_DATA 				= "publicData";

const ESI_CHARACTER_READ_ASSETS 	      = "esi-assets.read_assets.v1";
const ESI_CHARACTER_READ_BLUEPRINTS       = "esi-characters.read_blueprints.v1";
const ESI_CHARACTER_READ_CHANNELS 	      = "esi-characters.read_chat_channels.v1";
const ESI_CHARACTER_READ_CONTACTS 	      = "esi-characters.read_contacts.v1";
const ESI_CHARACTER_READ_CONTRACTS 	      = "esi-contracts.read_character_contracts.v1";
const ESI_CHARACTER_READ_FLEET 		      = "esi-fleets.read_fleet.v1";
const ESI_CHARACTER_READ_JOBS 		      = "esi-industry.read_character_jobs.v1";
const ESI_CHARACTER_READ_LOCATION 	      = "esi-location.read_location.v1";
const ESI_CHARACTER_READ_MAIL 		      = "esi-mail.read_mail.v1";
const ESI_CHARACTER_READ_MINING 	      = "esi-industry.read_character_mining.v1";
const ESI_CHARACTER_READ_ONLINE 	      = "esi-location.read_online.v1";
const ESI_CHARACTER_READ_ORDERS 	      = "esi-markets.read_character_orders.v1";
const ESI_CHARACTER_READ_ROLES 		      = "esi-characters.read_corporation_roles.v1";
const ESI_CHARACTER_READ_KILLMAILS 	      = "esi-killmails.read_killmails.v1";
const ESI_CHARACTER_READ_SHIPTYPE 	      = "esi-location.read_ship_type.v1";
const ESI_CHARACTER_READ_SKILLQUEUE       = "esi-skills.read_skillqueue.v1";
const ESI_CHARACTER_READ_STRUCTURES       = "esi-universe.read_structures.v1";
const ESI_CHARACTER_READ_SKILLS 	      = "esi-skills.read_skills.v1";
const ESI_CHARACTER_READ_TITLES 	      = "esi-characters.read_titles.v1";
const ESI_CHARACTER_READ_WALLET 	      = "esi-wallet.read_character_wallet.v1";

const ESI_CORPORATION_READ_BLUEPRINTS	= "esi-corporations.read_blueprints.v1";
const ESI_CORPORATION_READ_CONTACTS		= "esi-corporations.read_contacts.v1";
const ESI_CORPORATION_READ_CONTRACTS	= "esi-contracts.read_corporation_contracts.v1";
const ESI_CORPORATION_READ_JOBS 		= "esi-industry.read_corporation_jobs.v1";
const ESI_CORPORATION_READ_KILLMAILS	= "esi-killmails.read_corporation_killmails.v1";
const ESI_CORPORATION_READ_MEMBERSHIP 	= "esi-corporations.read_corporation_membership.v1";
const ESI_CORPORATION_READ_MINING 		= "esi-industry.read_corporation_mining.v1";
const ESI_CORPORATION_READ_ORDERS 		= "esi-markets.read_corporation_orders.v1";
const ESI_CORPORATION_READ_STRUCTURES 	= "esi-corporations.read_structures.v1";
const ESI_CORPORATION_READ_WALLET 		= "esi-wallet.read_corporation_wallets.v1";

const ESI_ALLIANCE_READ_CONTACTS 		= "esi-alliances.read_contacts.v1";

module.exports = {
	"admin": {
		"username": 		"saaj",
		"password": 		"saaj",
		"CharacterName": 	"SaaJ Vrikul",
		"CharacterID": 		90903362,
		"directors": [
			1501833430, // Iron
            996642987 // Thaer
		],
		"secretkey": 		"PlanetOliverTwist" // Make sure this is not blank
	},
	"eve": {
		"allianceID": 	499005583,
		"corpID": 		439896599,
		"clientID": 	"27d7cc7f01cc422788d9239175010293",
		"secretKey": 	"rfHBQQsI5xonei3uMdBg7pA7elZyqlip6ZXaXObV",
		"esiURL": 		"https://esi.tech.ccp.is/latest/",
		"loginURL": 	"https://login.eveonline.com/oauth/authorize",
		"callbackURL": 	"http://sh0ktherapy.space/callback/eve",
		"tokenURL": 	"https://login.eveonline.com/oauth/token",
		"verifyURL": 	"https://login.eveonline.com/oauth/verify",
		"esi": {
			"PUBLIC_DATA":				 	ESI_PUBLIC_DATA,
			"CHARACTER_READ_TITLES":		ESI_CHARACTER_READ_TITLES,
			"CHARACTER_READ_WALLET":		ESI_CHARACTER_READ_WALLET,
			"CHARACTER_READ_ASSETS":		ESI_CHARACTER_READ_ASSETS,
			"CHARACTER_READ_ORDERS":		ESI_CHARACTER_READ_ASSETS,
			"CHARACTER_READ_CONTRACTS":		ESI_CHARACTER_READ_CONTRACTS,
			"CHARACTER_READ_CHANNELS":		ESI_CHARACTER_READ_CHANNELS,
			"CHARACTER_READ_MAIL":			ESI_CHARACTER_READ_MAIL,
			"CHARACTER_READ_BLUEPRINTS":	ESI_CHARACTER_READ_BLUEPRINTS,
			"CHARACTER_READ_ROLES":			ESI_CHARACTER_READ_ROLES,
			"CHARACTER_READ_CONTACTS":		ESI_CHARACTER_READ_CONTACTS,
			"CHARACTER_READ_KILLMAILS":		ESI_CHARACTER_READ_KILLMAILS,
			"CHARACTER_READ_SKILLQUEUE":	ESI_CHARACTER_READ_SKILLQUEUE,
			"CHARACTER_READ_SKILLS":		ESI_CHARACTER_READ_SKILLS,
			"CHARACTER_READ_LOCATION":		ESI_CHARACTER_READ_LOCATION,
			"CHARACTER_READ_SHIPTYPE":		ESI_CHARACTER_READ_SHIPTYPE,
			"CHARACTER_READ_ONLINE":		ESI_CHARACTER_READ_ONLINE,
			"CHARACTER_READ_MINING":		ESI_CHARACTER_READ_MINING,
			"CHARACTER_READ_JOBS":			ESI_CHARACTER_READ_JOBS,
			"CHARACTER_READ_FLEET":			ESI_CHARACTER_READ_FLEET,
			"CHARACTER_READ_STRUCTURES":	ESI_CHARACTER_READ_STRUCTURES,
			"CORPORATION_READ_MEMBERSHIP":	ESI_CORPORATION_READ_MEMBERSHIP,
			"CORPORATION_READ_STRUCTURES":	ESI_CORPORATION_READ_STRUCTURES
		},
		"scopes": [  // I might need a second login scope for Corporation Admin data
			ESI_PUBLIC_DATA, // Required for auth
			ESI_CHARACTER_READ_TITLES, // Required for auth
			ESI_CHARACTER_READ_WALLET, // Jack knife
			ESI_CHARACTER_READ_ASSETS,
			ESI_CHARACTER_READ_ORDERS,
            ESI_CHARACTER_READ_CONTRACTS,
			ESI_CHARACTER_READ_CHANNELS,
			ESI_CHARACTER_READ_MAIL,
			ESI_CHARACTER_READ_BLUEPRINTS,
			ESI_CHARACTER_READ_ROLES,
			ESI_CHARACTER_READ_CONTACTS,
			ESI_CHARACTER_READ_KILLMAILS,
			ESI_CHARACTER_READ_SKILLQUEUE, // can remove queue if needed
			ESI_CHARACTER_READ_SKILLS,
			ESI_CHARACTER_READ_LOCATION, // Activity Spying
			ESI_CHARACTER_READ_SHIPTYPE,
			ESI_CHARACTER_READ_ONLINE,
			ESI_CHARACTER_READ_MINING,
			ESI_CHARACTER_READ_JOBS,
			ESI_CHARACTER_READ_FLEET,
			ESI_CHARACTER_READ_STRUCTURES, // Structures by user access
		],
		"corporation_scopes": [
			ESI_CORPORATION_READ_MEMBERSHIP,
			ESI_CORPORATION_READ_STRUCTURES
            // TODO: figure out the scopes required for corporation controls
		]
	},
	"discord": {
		"clientID": 	"306200035882827777",
		"secretKey": 	"",
		"loginURL" : 	"https://discordapp.com/oauth2/authorize",
		"callbackURL": 	"https://www.sh0ktherapy.space/callback/discord",
		"apiURL": 		"https://discordapp.com/api/v6/",
		"scopes": [
			"identify",
			"guilds"
		]
	}
};
