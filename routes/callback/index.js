var express = require('express');
var flash = require('express-flash');

var passport = require( appRoot + '/passport');

var router = express.Router();

router.get( '/eve', passport.callbackEVE );
router.get( '/discord', passport.callbackDiscord, function( req, res ){
	res.locals.query = req.query;
	res.render('output', { output: res.locals.response });
});


module.exports = router;
