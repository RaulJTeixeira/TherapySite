let request = require('superagent');
let settings = require('./settings');

const util = require('util')


// TODO: DB level caching for locations

function esiGetAgent( url, query ) {
    return new Promise(function ( resolve, reject ) {
        request
            .get( settings.eve.esiURL + url )
            .query( query )
            .end(function (err, res ) {
				// TODO: store headers for paged queries
				// console.log(res);
				let body;
				try {
					body = JSON.parse(res.text);
				}catch( err ) {
					console.error( res.text );
					console.error( err );
				}

                if( err ) {
					console.error( err );
                    if( body && body.error && body.error == "expired")
                        return reject( "expired" );

                    return reject( err );
                }
                return resolve( body );
            });
    })

}

function esiGetAgent_v2( url, query, id ) {
    return new Promise(function ( resolve, reject ) {
        request
            .get( settings.eve.esiURL + url )
            .query( query )
            .end(function (err, res ) {
                // TODO: store headers for paged queries
                // console.log(res);
                let body;
                let kept_id = id;
                try {
                    body = JSON.parse(res.text);
                }catch( err ) {
                    console.error( res.text );
                    console.error( err );
                }

                if( err ) {
                    console.error( err );
                    if( body && body.error && body.error == "expired")
                        return reject( "expired" );

                    return reject( err );
                }
                return resolve( [body, kept_id] );
            });
    })

}


function esiGet( url, query, user ) {
	if( !query || query == null ) query = {};
	if( query && !query.datasource ) query.datasource = 'tranquility';

    if( user ) query.token = user.token.access_token;
    return esiGetAgent( url, query );
}

function esiGet_v2( url, id, query, user, ) {
    if( !query || query == null ) query = {};
    if( query && !query.datasource ) query.datasource = 'tranquility';

    if( user ) query.token = user.token.access_token;
    return esiGetAgent_v2( url, query, id );
}

function esiGetPaged( url, query, user ) {
    if( !query || query == null ) query = {};
    if( query && !query.datasource ) query.datasource = 'tranquility';

    if( user ) query.token = user.token.access_token;

    return new Promise(function ( resolve, reject ) {
        request
            .get( settings.eve.esiURL + url )
            .query( query )
            .end(function (err, res ) {
                // TODO: store headers for paged queries
                //console.log(res.headers);
                let body;
                try {
                    body = JSON.parse(res.text);
                }catch( err ) {
                    console.log( res.text );
                    console.log( err );
                }

                if( err ) {
                    //console.log( err );
                    if( body.error == "expired")
                        return reject( "expired" );

                    return reject( err );
                }
                return resolve( { headers: res.headers, body: body } );
            });
    })

}

function esiPost( url, query, body, user ){
	if( !query || query == null ) query = {};
	if( query && !query.datasource ) query.datasource = 'tranquility';

	if( user ) query.token = user.token.access_token;

	return new Promise(function ( resolve, reject ) {
		request
			.post( settings.eve.esiURL + url + '?datasource=tranquility&token=' + user.token.access_token )
			.send( body )
			.end(function (err, res ) {
				var body;
				try {
					body = JSON.parse(res.text);
				}catch( err ) {
					console.log( res.text );
					console.log( err );
				}

				if( err ) {
					if( body.error == "expired")
						return reject( "expired" );

					return reject( err );
				}
				return resolve( body );
			});
	})
}

function tokenHandler( resolve, reject ) {
    return function( err, res ) {
        if( err )
            reject( err );

        let token = res.body;

        token.created = Date.now();

        resolve( token );
    }
}

/**
 * Authenticate
 * Returns a new token for the given callback code
 * @param code
 * @returns {Promise}
 */
function authenticate( code ) {
	return new Promise( function( resolve, reject ){
		request
			.post( settings.eve.tokenURL )
			.send({
				grant_type: "authorization_code",
				code: code
			})
			.set('Authorization','Basic '+( new Buffer( settings.eve.clientID + ':' + settings.eve.secretKey ).toString('base64') ))
			.set('Content-type','application/json')
			.end(tokenHandler(resolve,reject));
	});
}

/**
 * Refresh
 * Using a refresh token returns an active token for ESI use.
 * @param refreshToken
 * @returns {Promise}
 */
function refresh( refreshToken ) {

	return new Promise( function( resolve, reject ){
		request
			.post( settings.eve.tokenURL )
			.send({
				grant_type: "refresh_token",
				refresh_token: refreshToken
			})
			.set('Authorization','Basic '+( new Buffer( settings.eve.clientID + ':' + settings.eve.secretKey ).toString('base64') ))
			.set('Content-type','application/json')
			.end(tokenHandler(resolve,reject));
	});
}

/**
 * Given a token returns a pilot from EVE Online
 * @param token
 * @returns {Promise}
 */
function verify( token ) {
	return new Promise( function( resolve, reject ){
		request
			.get( settings.eve.verifyURL )
			.set('Authorization','Bearer ' + token.access_token )
			.end(function( err, res ){
				if( err ) {
					console.log( err );
					reject(err)
				}
				let character;
				try {
					character = JSON.parse( res.text );
				} catch( nerr) {
					reject( err );
				}
				resolve( character );
			});
	});

}



module.exports = esi = {
	authenticate: authenticate,
    refresh: refresh,
    verify: verify,
	alliance: {
		getAllianceInformation: function( allianceID ){ return esiGet( 'alliances/' + allianceID + '/' ); },
		getCorporationsByAllianceID: function( allianceID ){
			return esiGet( 'alliances/' + allianceID + '/corporations/' );
		},
		getAlliancesNames: function( ids ){
            let promises =[];

            for( let i = 0; i < ids.length; i++ ) {
                promises.push(esiGet('alliances/' + ids[i] + '/', ids[i]));
            }

            let names = [];

            return Promise.all( promises ).then( r =>{
                for( let i = 0; i < r.length; i++ ) {
                    let item = r[i][0];
                    item.id = r[i][1];
                    names = names.concat(item);
                }
                return names;
            });
        },
		getAllianceIcon: function( id ){ },
		getAllAllianceIDs: function(){
			return esiGet( 'alliances/' );
		}
	},
	assets: {
		/**
		 * Fetches all pages of assets for a user.
		 * @param user
		 * @returns [{
		 * 	type_id: Number,
		 * 	location: Number
		 * }]
		 */
		getCharacterAssets: function( user ){

			let _assets = [];

			return esiGetPaged( 'characters/' + user.CharacterID + '/assets/', {page: 1}, user )
				.then(( res )=>{

					_assets = res.body;

					let promises = [];

					for( let i = 2; i <= res.headers['x-pages']; i++ ) {
						promises.push(esiGetPaged('characters/' + user.CharacterID + '/assets/', {page: i}, user ));
					}

					return Promise.all( promises );
				})
				.then((r)=>{
					for( let i = 0, len = r.length; i < len; i++ ) {
						_assets = _assets.concat( r[i] );
					}

					return _assets;
				});
		},
		getCorporationAssets: function(){},
		getCharacterAssetNames: function( ids, user ){
			let promises = [], chunks = [], size = 100; // This has a limit of a hundred ids per request

			while( ids.length )
				chunks.push( ids.splice( 0, size ));

			promises = chunks.map( chunk => esiPost( 'characters/' + user.CharacterID + '/assets/names/', {},  chunk , user ) );

			let names = [];

			return Promise.all( promises ).then( r =>{
				for( let i = 0; i < r.length; i++ )
					names = names.concat( r[i] );

				return names;
			});
		},
		getCharacterAssetLocations: function(){},
		getCoporationAssetNames: function(){},
		getCorporationAssetLocations: function(){}
	},
	bookmarks: {
		listBookmarks: function() {},
		listBookmarkFolders: function() {},
		listCorporationBookmarks: function() {},
		listCorporationBookmarkFolders: function() {}
	},
	calendar: {
		listCalendarEventSummaries: function(){},
		getAnEvent: function() {},
		respondToAnEvent: function() {},
		getAttendees: function() {}
	},
	character: {
		getCharactersPublicInformation: function( id ) {
            return esiGet( 'characters/'+id + '/' );
        },
		characterAffiliation: function() {},
		calculateACSPAChargeCost: function() {},
		getCharacterNames: function( ids ) {
			let promises = [];

            for( let i = 0; i < ids.length; i++ ) {
                promises.push(esiGet_v2('characters/' + ids[i] + '/', ids[i]));
            }

			let names = [];

			return Promise.all( promises ).then( r =>{
				for( let i = 0; i < r.length; i++ ) {
				    let item = r[i][0];
                    item.id = r[i][1];
                    names = names.concat(item);
                }
				return names;
			});
        },
		getCharacterPortraits: function() {},
		getCorporationHistory: async function (id) {
            let corphistory = await esiGet('characters/' + id + '/corporationhistory/');

            for(let i = 0; i < corphistory.length; i++) {

                let alliance_info;
                let corp_info = await esiGet('corporations/' + corphistory[i].corporation_id + '/');
                corphistory[i].corporation_name = corp_info.name;
                corphistory[i].corporation_ticker = corp_info.ticker;

                if (corp_info.alliance_id !== undefined) {
                    alliance_info = await esiGet('alliances/' + corp_info.alliance_id + '/');
                    corphistory[i].alliance_id = corp_info.alliance_id;
                    corphistory[i].alliance_name = alliance_info.name;
                    corphistory[i].alliance_ticker = alliance_info.ticker;
                }
            }
            return corphistory;
        },
		getChatChannels: function( user ) {
			return esiGet( 'characters/' + user.CharacterID + '/chat_channels/',  null, user );
		},
		getMedals: function() {},
		getStandings: function() {},
		getAgentsResearch: function() {},
		getBlueprints: function() {},
		getJumpFatigue: function() {},
		getNewContactNotifications: function() {},
		getCharacterNotifications: function() {},
		getCharacterCorporationRoles: function( user ) {
			return esiGet( 'characters/' + user.CharacterID + '/roles/', null, user );
		},
		getCharacterCorporationTitles: function( user ) {
			return esiGet( 'characters/' + user.CharacterID + '/titles/', null, user );
		}
	},
	clones: {
		getClones: function () {},
		getActiveImplants: function () {}
	},
	contacts: {
		deleteContacts: function() {},
		getContacts: function( user ) {
			return esiGet( 'characters/' + user.CharacterID + '/contacts/', {page: 1}, user );
		},
		addContacts: function() {},
		editContacts: function() {},
		getCorporationContacts: function() {},
		getAllianceContacts: function() {},
		getContactLabels: function() {}
	},
	contracts: {
		getContracts: function() {},
		getContractItems: function() {},
		getContractBids: function() {},
		getCorporationContracts: function() {},
		getCorporationContractItems: function() {},
		getCorporationContractBids: function() {}
	},
	corporation: {
		getCorporation: function( id ) {
			return esiGet( 'corporations/'+ id +'/' );
		},
		getAllianceHistory: function( id ) {
			return esiGet( 'corporations/'+ id +'/alliancehistory/' );
		},
		getCorporationNames: function( ids ) {
            let promises =[];

            for( let i = 0; i < ids.length; i++ ) {
                promises.push(esiGet('corporations/' + ids[i] + '/', ids[i]));
            }

            let names = [];

            return Promise.all( promises ).then( r =>{
                for( let i = 0; i < r.length; i++ ) {
                    let item = r[i][0];
                    item.id = r[i][1];
                    names = names.concat(item);
                }
                return names;
            });
        },
		getCorporationMembers: function( corporationId, user ) {
            return esiGet('corporations/'+ corporationId +'/members/', null, user );
        },
		getCorporationMemberRoles: function() {},
		getCorporationMemberRolesHistory: function() {},
		getCorporationIcon: function() {},
		getNPCCorporations: function() {
			return esiGet('corporations/npccorps/' );
		},
		getCorporationStructures: function() {},
		updateStructureVulnerabilitySchedule: function() {},
		trackCorporationMembers: function() {},
		getCorporationDivisions: function() {},
		getCorporationMemberLimit: function() {},
		getCorporationTitles: function() {},
		getCorporationsMemberTitles: function() {},
		getCorporationBlueprints: function() {},
		getCorporationStandings: function() {},
		getCorporationStarbases: function() {},
		getStarbaseDetail: function() {},
		getAllCorporationALSClogs: function() {},
		getCorporationFacilities: function() {},
		getCorporationMedals: function() {},
		getCorporationIssuedMedals: function() {},
		getCorporationShareholders: function() {}
	},
	dogma: {
		getAttributes: function() {},
		getAttributeInformation: function() {},
		getEffects: function() {},
		getEffectInformation: function() {}
	},
	factionWarfare: {
		wars: function () {},
		statistics: function () {},
		systems: function () {},
		leaderboards: function () {},
		topPilots: function () {},
		topCorporations: function () {},
		corporationInvolved: function() {},
		characterInvolved: function() {}
	},
	fittings: {
		deleteFitting: function() {},
		getFittings: function() {},
		createFitting: function() {}
	},
	fleets: {
		getFleetInformation: function() {},
		updateFleetInformation: function() {},
		getCharacterFleetInfo: function() {},
		getFleetMembers: function() {},
		createFleetInvite: function() {},
		kickFleetMember: function() {},
		moveFleetMember: function() {},
		getFleetWings: function() {},
		createFleetWings: function() {},
		deleteFleetWings: function() {},
		renameFleetWings: function() {},
		createFleetSquad: function() {},
		deleteFleetSquad: function() {},
		renameFleetSquad: function() {}
	},
	incursions: {
		listIncursions: function() {}
	},
	industry: {
		listIndustryFacilities: function() {},
		listSolarSystemCostIndicies: function() {},
		listCharacterIndustryJobs: function() {},
		characterMiningLedger: function( user ) {
			let _ledger = [];
			let _url = 'characters/' + user.CharacterID + '/mining/';
			return esiGetPaged( _url, {}, user )
				.then(( res )=>{
					_ledger = res.body;

					let promises = [];

					for( let i = 2; i <= res.headers['x-pages']; i++ ) {
						promises.push(
							esiGetPaged( _url, {page: i}, user )
						);
					}

					return Promise.all( promises );
				})
				.then((r)=>{
					for( let i = 0; i < r.length; i++ ) {
						_ledger = _ledger.concat( r[i].body );
					}

					return _ledger;
				});
        },
		corporationMiningObservers: function() {},
		observedCorporationMining: function() {},
		listCorporationIndustryJobs: function() {},
		moonExtrationTimers: function() {}
	},
	insurance: {
		listInsuranceLevels: function() {}
	},
	killMails: {
		getKillmail: function() {},
		getCharacterKillmails: function() {},
		getCorporationKillmails: function() {}
	},
	location: {
		getLoction: function() {},
		getCurrentShip: function() {},
		getCharacterOnline: function() {}
	},
	loyalty: {
		listLoyaltyStoreOffers: function() {},
		getLoyaltyPoints: function() {}
	},
	mail: {
		getMailHeaders: function() {},
		sendMail: function() {},
		getMailLabels: function() {},
		createMailLabel: function() {},
		deleteMailLabel: function() {},
		getSubscribedMailingLists: function() {},
		deleteMail: function() {},
		getMail: function() {},
		updateMailStatus: function() {}
	},
	market: {
		getMarketPrices: function() {
			return esiGet('markets/prices/');
		},
		getMarketRegionOrders: function() {},
		getMarketRegionHistory: function() {},
		getStructureOrders: function() {},
		getItemGroups: function() {},
		getItemGroupInformation: function() {},
		getCharacterOrders: function() {},
		getActiveTypeIdsByRegion: function() {},
		getCorporationOrder: function() {}
	},
	opportunities: {
		getGroups: function() {},
		getGroup: function() {},
		getTasks: function() {},
		getTask: function() {},
		getCharacterCompletedTasks: function() {}
	},
	planetaryInteraction: {
		getColonies: function() {},
		getColonyLayout: function() {},
		getSchematic: function() {},
		getCorporationCustomOffices: function() {}
	},
	routes: {
		getRoute: function() {}
	},
	search: {
		searchCharacter: function() {},
		search: function() {}
	},
	skills: {
		getSkillQueue: function() {},
		getCharacterSkills: function( user ) { return esiGet('characters/' + user.CharacterID + '/skills/', {}, user ) },
		getAttributes: function( user ) { return esiGet('characters/' + user.CharacterID + '/attributes/', {}, user ) }
	},
	sovereignty: {
		structures: function() {},
		campaigns: function() {},
		map: function() {}
	},
	status: {
		status: function() {
			return esiGet('status/');
		}
	},
	universe: {
		getPlanet: function() {},
		getStation: function( id ) {
			return esiGet('universe/stations/' + id + '/').catch( () => { return Promise.resolve({ id: id, name: "Unknown Station" });});
		},
		getStructure: function( id, user ) {
			return esiGet('universe/structures/' + id + '/', null, user ).catch( () => { return Promise.resolve({ id: id, name: "Unknown Structure" });});
		},
		getSystem: function( id ) {
			return esiGet('universe/systems/' + id + '/').catch( () => { return Promise.resolve({ id: id, name: "Unknown System" });});
		},
		getSystems: function() {},
		getTypeIDInformation: function(){},
		getTypeIDs: function() {},
		getGroups: function() {},
		getGroup: function() {},
		getCategories: function() {},
		getCategory: function() {},
		getNames: function( ids ) {
			let promises, chunks = [], size = 100; // This has a limit of a hundred ids per request

			while( ids.length )
				chunks.push( ids.splice( 0, size ));

			promises = chunks.map( chunk => esiGet( 'universe/names/', { ids: chunk.join() }) );

			let names = [];

			return Promise.all( promises ).then( r => {
				for( let i = 0; i < r.length; i++ )
					names = names.concat( r[i] );

				return names;
			});
		},
		getPublicStructures: function() {},
		getRaces: function() {},
		getFactions: function() {},
		getBloodlines: function() {},
		getRegions: function(){},
		getRegion: function() {},
		getConstellations: function() {},
		getConstellation: function() {},
		getMoon: function() {},
		getStargate: function() {},
		getGraphics: function() {},
		getGraphic: function() {},
		getSystemJumps: function() {},
		getSystemKills: function() {},
		getStar: function() {}
	},
	userInterface: {
		openMarket: function() {},
		openContract: function() {},
		openInformation: function() {},
		setWaypoint: function() {},
		openNewmail: function() {}
	},
	wallet: {
		getCharacterBalance: function( user ) {
		    return esiGet('characters/' + user.CharacterID + '/wallet/', {}, user );
        },
		getCharacterJournal: function( user ) {
            return esiGet('characters/' + user.CharacterID + '/wallet/journal/', {}, user );
        },
		getCharacterTransactions: function( user ) {
            return esiGet('characters/' + user.CharacterID + '/wallet/transactions/', {}, user );
        },
		getCorporationWallets: function() {},
		getCorporationJournal: function() {},
		getCorporationTransactions: function() {}
	},
	wars: {
		listAll: function() {},
		warInformation: function() {},
		warKillMails: function() {}
	}
};