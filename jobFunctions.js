let path = require('path');
global.appRoot = path.resolve( __dirname );

let esi = require('./esi');
let models 	= require( appRoot + '/models/');
let miningModel = models.miningModel;
let typeIDModel = models.typeIDModel;
let jobModel 	= models.jobModel;

let settings= require( appRoot + '/settings');

let passport = require('./passport');


function whileDocuments( cursor, callback ) {
    return cursor.next().then( doc => {
        if( doc )
            return callback( doc ).then(()=>{
                return whileDocuments( cursor, callback );
            });
    });
}

function pilotHasScope( pilot, role ) {
    return pilot && pilot.Scopes && pilot.Scopes.indexOf( role ) > -1;
}

function vanityJobBegin( name, vanity ) {
	let start = new Date();
	return start;
}
function vanityJobEnd( name, start, vanity ) {
	let end = new Date();
	let dif = end.getTime() - start.getTime();
}

function runJob( name, job, vanity ) {
	if( vanity === undefined ) vanity = true;

	let start = vanityJobBegin( name, vanity );

	let searchCrit = {
		name: name
	};
	let jobDocument = {
		name: name,
		lastRun: new Date(),
		endRun: new Date(),
		outcome: true
	};
	let options = {
		upsert: true
	};

	return job()
		.then( vanityJobEnd.bind( null, name, start, vanity ) )
		.then( () => {
			jobDocument.outcome = true;
			jobDocument.endRun = new Date();
			return jobModel.findOneAndUpdate(searchCrit, jobDocument, options )
		})
		.catch(( error )=>{
			console.log( error );
			jobDocument.outcome = false;
			jobDocument.endRun = new Date();
			return jobModel.findOneAndUpdate(searchCrit, jobDocument, options );
		});
}


// models.miningModel.remove({}).exec();

function krabingImport() {
    let pilotCursor = models.loginModel.find().cursor();

    return whileDocuments( pilotCursor, ( pilot ) => {
		console.log(pilot.CharacterName);
        delete pilot.__v;
		return passport.refreshUser(pilot).then(function (pilot) {

            if (pilot && pilotHasScope(pilot, 'esi-industry.read_character_mining'))
                return esi.industry.characterMiningLedger(pilot);
            else {
            console.log("	---Scope missing");
                return Promise.resolve([]);
        	}


		}).then((logs)=> {
			if( ! logs ){
                console.log("	--- nothing from miner!");
                return ;
            }
            console.log("	--- SOMETHING from the miner!");
			return;

			return logs.reduce((promise, log)=> {
				return promise.then(()=> {
					log.characterID = pilot.CharacterID;

					let parts = log.date.split('-');
					log.date = new Date(parts[0], parts[1] - 1, parts[2]);

					let searchConditions = JSON.parse(JSON.stringify(log));


					delete searchConditions.quantity;

					return miningModel
						.findOneAndUpdate(searchConditions, log,
						{upsert: true, new: true})
						.exec();
				});
			}, Promise.resolve());
		});
	});
}

function priceImport( ) {

	return esi.market.getMarketPrices().then(( prices )=> {
		return prices.reduce((r, p)=> {
			return r.then(()=> {
				let temp = {
					id: p.type_id,
					average_price: (p.average_price) ? p.average_price : 0,
					adjusted_price: (p.adjusted_price) ? p.adjusted_price : 0
				};
				return models.typeIDModel
					.findOneAndUpdate({id: p.type_id}, temp, {upsert: true})
					.exec();
			});
		}, Promise.resolve());
	});
}

function playerAssets( ) {


	return Promise.resolve();
	// TODO: Import assets into the local database
	let pilotCursor = models.loginModel.find().cursor();

	return whileDocuments( pilotCursor, ( pilot ) => {
		return passport.refreshUser(pilot).then(function (pilot) {

			if (pilotHasScope(pilot, 'esi-industry.read_character_mining'))
				return esi.assets.getCharacterAssets( pilot );
			else
				return Promise.resolve([]);

		}).then((logs)=> {

		});
	});
}

function locationImport( ) {
	return Promise.resolve();
	// TODO: Import locations into the local database
	let pilotCursor = models.loginModel.find().cursor();

	return whileDocuments( pilotCursor, ( pilot ) => {
		return passport.refreshUser(pilot).then(function (pilot) {

			if (pilotHasScope(pilot, 'esi-industry.read_character_mining'))
				return esi.assets.getCharacterAssets( pilot );
			else
				return Promise.resolve([]);

		}).then((logs)=> {

		});
	});
}

function playerTracking() {
	return Promise.resolve();
	// TODO: Track players
	let pilotCursor = models.loginModel.find().cursor();

	return whileDocuments( pilotCursor, ( pilot ) => {
		return passport.refreshUser(pilot).then(function (pilot) {

			if (pilotHasScope(pilot, 'esi-industry.read_character_mining'))
				return esi.assets.getCharacterAssets( pilot );
			else
				return Promise.resolve([]);

		}).then((logs)=> {

		});
	});
}

function corpPilotList() {
	return Promise.resolve();

	// Grab the corp API

	return esi.corporation.getCorporationMembers( corpID, user ) // 3600 seconds
		.then(function( characters ){
			return esi.character.getCharacterNames( characters ); // 3600 seconds
		});

}

function skillQueue() {
	// TODO: Read skill queues of all of our players
	// maybe send them a discord poke?
}

module.exports = {
	runJob: 			runJob,
	jobs: {
		krabingImport:		krabingImport,
		priceImport: 		priceImport,
		assetImport: 		playerAssets,
		locationImport: 	locationImport,
		corpPilotList: 		corpPilotList,
		playerTracking: 	playerTracking
	}
};