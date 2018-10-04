let express = require('express');

let esi = require( appRoot + '/esi');
let models = require( appRoot + '/models/' );
let miningModel = models.miningModel;

let passport 	= require( appRoot + '/passport');


let router = express.Router();


router.use('/', function( req, res, next ) {
	return models.miningModel.find().select('characterID date  type_id quantity -_id').exec().then(( docs )=>{
        res.render('data/krab', { docs: docs, clean: req.query.clean, body: null });
    });
});


module.exports = router;
