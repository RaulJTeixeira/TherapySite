let express = require('express');

let settings 	= require( appRoot + '/settings');
let passport 	= require( appRoot + '/passport');
let esi 		= require( appRoot + '/esi');
let models 		= require( appRoot + '/models/index');

let CON 		= require( appRoot + '/constants.js' );

let miningModel = models.miningModel;
let priceModel 	= models.priceModel;
let typeIDModel = models.typeIDModel;

let router = express.Router();

const MONTH_DESCRIPTION = CON.months;
const ROCK_GROUPS 		= CON.rockGroups;

function storedCharacters() {
	return models.loginModel.find({})
		.select('CharacterID CharacterName alts -_id')
		.populate({ path: 'parent', select: 'CharacterID CharacterName -_id' })
		.populate({ path: 'alts', select: 'CharacterID CharacterName -_id' })
		.exec();
}

function getMembers( corpID, user ) {
	return esi.corporation.getCorporationMembers( corpID, user )
		.then(function( characters ){
			return esi.character.getCharacterNames( characters );
		});
}

function krabicusRender(req, res, next) {
	let user = res.locals.user;
	let n = new Date();
	let year,month,isMonth;

	if( req.params ) {
		year = parseInt( req.params.year );
        isMonth = MONTH_DESCRIPTION.indexOf( req.params.month ) > -1;
        month = MONTH_DESCRIPTION.indexOf( req.params.month );
	}


	year = year ? year : n.getFullYear();
	month = isMonth ? month : n.getMonth();

	let lastDate = new Date( year, month-1, 0 , 24, 0, 0 );
	let nextDate = new Date( year, month+1, 0 , 24, 0, 0 );

	let start = new Date( year, month, 0 );
	let end = new Date( year, month + 1, 0, 24, 0, 0 );

	Promise.all([
		getMembers( settings.eve.corpID, user ),
		storedCharacters(),
		miningModel.find({ date:
		{
			"$gte": start,
			"$lte": end
		}
		}).exec(),
		typeIDModel.find({groupID: { $in: ROCK_GROUPS }}).select('id name groupID volume average_price').exec()
	]).then((r)=>{
		console.log(r);
		return res.render('leadership/krabnomicon', {
			pilots: r[0],
			storePilots: r[1],
			mining: r[2],
			rocks: r[3],
			year: year,
			month: month,
			MONTH_DESCRIPTION: MONTH_DESCRIPTION,
			last: [ lastDate.getFullYear(), lastDate.getMonth() ],
			next: [ nextDate.getFullYear(), nextDate.getMonth() ]
		});
	});
}


router.get('/:year/:month', passport.auth( 'krabacusView' ), krabicusRender);
router.get('/', passport.auth( 'krabacusView' ), krabicusRender);

module.exports = router;