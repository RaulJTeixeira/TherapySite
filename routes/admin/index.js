let express = require('express');

let settings 	= require( appRoot + '/settings');
let passport 	= require( appRoot + '/passport');
let esi 		= require( appRoot + '/esi');
let models 		= require( appRoot + '/models/index');

let CON 		= require( appRoot + '/constants.js' );

let router = express.Router();

router.use('/settings', 	require('./settings') );
router.use('/permissions', 	require('./permissions') );
router.use('/jobs', 		require('./jobs') );


module.exports = router;