let express = require('express');

let models = require( appRoot + '/models/' );

let router = express.Router();



router.get('/', function( req, res, next ) {
	models.groupIDModel.find({}).select('id name categoryID -_id').where({published: true}).exec().then(function( docs ){
		res.render('output', { output: docs, query: req.query });
	});
});

module.exports = router;