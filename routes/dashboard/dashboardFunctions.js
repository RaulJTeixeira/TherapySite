let passport 	= require( appRoot + '/passport');
let esi 		= require( appRoot + '/esi');
let models 		= require( appRoot + '/models/index');

const util = require('util');

const SKILL_IDS = ["255", "256", "257", "258", "266", "268", "269", "270", "272", "273", "274", "275", "278", "1209", "1210", "1213", "1216", "1217", "1218", "1220", "1240", "1241", "1545"];
const CORPSE_IDS = [25,29148];
const NOOBSHIP_IDS = [601];
let SHIP_IDS;
let AMMO_IDS;
let MATERIALS_IDS;


models.typeIDModel
	.find()
	.where('groupID')
	.in([324, 1201, 27, 898, 1202, 883, 547, 419, 906, 1534, 540, 237, 830, 26, 380, 420, 485, 893, 543, 1283, 1538, 833, 513, 25, 358, 894, 28, 941, 831, 541, 902, 832, 1527, 900, 463, 1022, 31, 834, 963, 659, 1305, 30])
	.select("id -_id")
	.exec().then((r)=>{
		SHIP_IDS = r.map(s=>s.id);
	});
models.typeIDModel
	.find()
	.where('groupID')
	.in([376, 372, 374, 377, 656, 654, 655, 653, 375, 373, 648, 657, 1678, 1677, 1774, 396, 395, 394, 90, 863, 864, 87, 386, 88, 500, 1701, 1702, 86, 1569, 772, 385, 85, 1773, 548, 384, 663, 482, 1771, 1400, 916, 83, 387, 479, 910, 911, 1769, 1772, 1546, 1547, 1549, 1548, 492, 89, 909, 907, 908, 1019, 476])
	.select("id -_id")
	.exec().then((r)=>{
		AMMO_IDS = r.map(s=>s.id);
	});
models.typeIDModel
	.find()
	.where('groupID')
	.in([966, 712, 429, 1136, 974, 423, 428, 18, 427, 1676, 886, 754])
	.select("id -_id")
	.exec().then((r)=>{
		MATERIALS_IDS = r.map(s=>s.id);
	});



function getAllAlliances() {
	return esi.alliance.getAllAllianceIDs()
		.then( esi.alliance.getAlliancesNames )
}


function getTypeIDs( ids ) {
	return models.typeIDModel.find().where('id').in(ids).select('id name groupID -_id').exec();
}
function getTypeIDsByGroupIDs( ids ) {
	return models.typeIDModel.find()
		.where('groupID').in(ids)
		.select('-_id id name groupID')
		.exec()
}

function getPublicInfoPlusOrgNames( user ) {
	var _info = {};
	return esi.character.getCharactersPublicInformation( user.CharacterID ).then(info => {
			_info = info;
			_info.corporation_name = '';
			_info.alliance_id = '';
			_info.alliance_name = '';

			return esi.corporation.getCorporation( info.corporation_id );
		})
		.then(corpInfo=>{
			_info.corporation_name = corpInfo.name;
			_info.alliance_id = corpInfo.alliance_id;

			if(_info.alliance_id)
				return esi.alliance.getAllianceInformation( corpInfo.alliance_id ).then( alliance => {
					_info.alliance_name = alliance.name;

					return _info;
				});
			else
				return _info;
		});
}

function getCharacterSkills( user ) {
    return new Promise(function( resolve ){
        esi.skills.getCharacterSkills( user )
            .then(function( skills ) {
                let SKILL_IDS = skills.skills.map(function(skill){
                    return skill.skill_id;
                });

                return getTypeIDs( SKILL_IDS ).then(function( ids ) {

                    return resolve({ skills: skills, typeIDs: ids });
                })
            })
    });
}



function getAssets( user ) {
	let _assets, _locations;

	return esi.assets.getCharacterAssets( user )
		.then( assets => {
			_assets = assets;

			// TODO: Find names of ships, corpses and containers
			let named = models.typeIDModel.find().where('groupID').in(
				[25, 26, 27, 28, 237, 324, 419, 420, 463, 540, 541, 543, 830, 831, 834, 894, 906, 1305, 1527, 1534, 448, 649, 14 ]
			)	.select("id -_id")
				.exec();
			let typeNamed = models.typeIDModel.find().where('id').in( assets.map( a => a.type_id ) ).select("id name -_id").exec();

			// Find Type names of ships, corpses and containers
			return Promise.all([ named, typeNamed ]);
		})
		.then( r => {

			let nameMap = r[0].reduce((map,type)=> map.set( type.id, true ), new Map());
			let typeNameMap = r[1].reduce((map,type)=> map.set( type.id, type.name ), new Map());
			let lookupIDs = [];



			_assets.map( ( a, i ) => {
				a.type_name = typeNameMap.get( a.type_id );
				if( nameMap.get( a.type_id ) )
					lookupIDs.push( a.item_id );
				return a;
			});


			return esi.assets.getCharacterAssetNames( lookupIDs, user );
		})
		.then( ( names ) => {
            let namesMap = names.reduce((map,type)=> map.set( type.item_id, type.name ), new Map());

			let hangerLocations = {};
			for( let i = 0, l = _assets.length; i < l; i++ ) {
				let s = _assets[i];
				if( namesMap.get( s.item_id ) )
					s.name = namesMap.get( s.item_id );
				if( s.location_id < 60000000 || s.location_flag == "Hangar" || s.location_flag == "AssetSafety")
					hangerLocations[s.location_id] = true;
			}

			let promised = Object
				.keys(hangerLocations)
				.map( s => getLocation( user, s ) );

			return Promise.all( promised )
		})
		.then( r => {
            _locations = r;
			for( let i = 0, l = r.length; i++ < l; ) ;

			return r
		})
		.then(( result )=>{
			return { assets: _assets, locations: _locations, ids: {
				corpses: CORPSE_IDS,
				ships: SHIP_IDS,
				noobShips: NOOBSHIP_IDS,
				ammo: AMMO_IDS,
				materials: MATERIALS_IDS
			} };
		});
}

async function getCorporationHistory(user) {
    return await esi.character.getCorporationHistory(user.CharacterID);
}

function getTransactions( user ) {
	let _transactions = [];
	return esi.wallet.getCharacterTransactions( user )
		.then( transactions =>{
			_transactions = transactions;

			let ids = transactions.reduce(function(a, trany ){
				a.push( trany.type_id );

				return a;
			},[]);

			let clientsIDs = transactions.reduce(function(a, trany ){
				a.push( trany.client_id );

				return a;
			},[]);

			return Promise.all([getTypeIDs( ids ),esi.character.getCharacterNames(clientsIDs)])
		})
		.then( r => {
			return Promise.resolve({types: r[0], clients: r[1], transactions: _transactions });
		})
		.catch( err => Promise.resolve([]));
}

function getSkillGroupIDs () {
    return models.groupIDModel.find().where('id').in(SKILL_IDS).select("id name -_id").exec();
}


function DBGetLocation( id ) {
	return models.locationModel.findOne({ id: id }).exec()
}


/**
 * Get assets
 * filter locationIDs
 * read locations from DB
 * query ESI for locations not in DB
 * merge
 *
 */

function resolveLocation( locationID, user ) {
	return Promise.resolve()
		.then(()=>{
			if( locationID < 60000000 ) {
				return esi.universe.getSystem( locationID );
			} else if( locationID < 1000000000000 ) {
				return esi.universe.getStation( locationID );
			} else if( locationID < 9000000000000000000 )  {
				return esi.universe.getStructure( locationID, user );
			} else {
				return Promise.resolve({ id: locationID, name: "unknown" });
			}
		})
		.then(( location )=>{
			if( location.name == "forbidden" || location.name == "broken" || location.name == "unknown" )
				return location;

			location.id = locationID;

			let optionUpsertAndReturn = {upsert: true, new: true };

			return models.locationModel.findOneAndUpdate(
				{id: location.id},
				location,
				optionUpsertAndReturn
			)
				.populate('position')
				.exec();
		})
		.catch(( err )=>{
			console.log( err );
		});
}

function getLocation( user, locationID ) {
	return DBGetLocation( locationID )
			.then( ( location ) => {
				if( location && location !== null )
					return location;
				else {
					return resolveLocation( locationID, user );
				}
			});
}

function isPilot( user, characterID ) {
	return user.CharacterID == characterID
		|| user.alts.filter(( alt ) => {
			return alt.CharacterID.toString() == characterID.toString();
		}).length > 0;
}

function hasRights( user, roles ){
    return !roles
        || user.titles.filter(t=>{
            return roles.indexOf( t.name ) > -1;
        }).length
}


module.exports = {
	getAllAlliances: getAllAlliances,
    getDashboard: function( user ) {
        return Promise.all([
			getPublicInfoPlusOrgNames( user ), //esi.character.getCharactersPublicInformation( user.CharacterID ),
            getCharacterSkills( user ),
            esi.skills.getAttributes( user ).catch(function( error ){ return Promise.resolve('No scope'); }),
			esi.wallet.getCharacterBalance( user ).catch(function( error ){ return Promise.resolve('No scope'); }),
			esi.character.getCharacterCorporationTitles( user ).catch(function( error ){ return Promise.resolve('No scope'); })
        ]).then( r => Promise.resolve({
            char: user,
            publicInfo: r[0],
            skills: r[1].skills,
            attributes: r[2],
			balance: r[3],
			titles: r[4]
        }));
    },
	getAssets: getAssets,
    getCorpHistory: async function (user) {
        return Promise.all([
            await getCorporationHistory(user),
            esi.corporation.getNPCCorporations()
        ]).then(r => Promise.resolve({
            corpHistory: r[0],
            npcCorps: r[1]
        }));
    },
	getJournal: function( user ) {
		return Promise.all([
			esi.wallet.getCharacterJournal( user ),
			getTypeIDsByGroupIDs([565]) // Fetched rat types
		]).then( r => Promise.resolve({
			journal: r[0],
			ratTypeIDs: r[1]
		}));
	},
	getContacts: function( user ) {
		let _contacts = [];
		return esi.contacts.getContacts( user ).then( contacts => {
			let AIDS = [];
			let CIDS = [];
			let PIDS = [];
			for( let i = 0; i < contacts.length; i++ ) {
				_contacts[i] = contacts[i];
                switch(contacts[i].contact_type) {
					case 'alliance':
						AIDS.push( contacts[i].contact_id);
						break;
					case 'character':
						CIDS.push( contacts[i].contact_id);
						break;
					case 'corporation':
						PIDS.push( contacts[i].contact_id);
						break;
				}
			}

			return Promise.all([
				esi.character.getCharacterNames( CIDS ),
				esi.alliance.getAlliancesNames( AIDS ),
				esi.corporation.getCorporationNames( PIDS )
			]);
		}).then( r => {

			let cn = r[0];
			let an = r[1];
			let pn = r[2];

			let it = [];

			cn.forEach(function (char) {
				let __c = _contacts.find(cont => cont.contact_id === char.id);
				if (__c !== undefined){
                    it.push({
						contact_type : "character",
						standing : __c.standing,
						contact_id : char.id,
						name : char.name,
					})
				}
			});

            an.forEach(function (al) {
                let __c = _contacts.find(cont => cont.contact_id === al.id);
                if (__c !== undefined){
                    it.push({
                        contact_type : "alliance",
                        standing : __c.standing,
                        contact_id : al.id,
                        name : al.name,
                    })
                }
            });

            pn.forEach(function (corp) {
                let __c = _contacts.find(cont => cont.contact_id === corp.id);
                if (__c !== undefined){
                    it.push({
                        contact_type : "corporation",
                        standing : __c.standing,
                        contact_id : corp.id,
                        name : corp.name,
                    })
                }
            });

            return it;
		});
	},
	getTransactions: function( user ) {
		return Promise.all([
			getTransactions( user )
		]).then( r => Promise.resolve({
			transactions: r[0].transactions,
			transactionsTypeIDs: r[0].types,
			transactionsClients: r[0].clients
		}));
	},
	getSkills: function( user ) {
		return Promise.all([
			getPublicInfoPlusOrgNames( user ), //esi.character.getCharactersPublicInformation( user.CharacterID ),
			getCharacterSkills( user ),
			esi.skills.getAttributes( user ),
			getSkillGroupIDs(),
			esi.wallet.getCharacterBalance( user )
		]).then( r => Promise.resolve({
			char: user,
			publicInfo: r[0],
			skills: r[1].skills,
			typeIDs: r[1].typeIDs,
			attributes: r[2],
			skillGroupIDs: r[3]
		}));
	},
    isAlt: isPilot,
    hasRights: hasRights
};