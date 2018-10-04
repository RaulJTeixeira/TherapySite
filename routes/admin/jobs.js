let express = require('express');

let settings 	= require( appRoot + '/settings' );
let passport 	= require( appRoot + '/passport' );
let esi 		= require( appRoot + '/esi' );
let models 		= require( appRoot + '/models/index' );
let options 	= require( appRoot + '/options' );
let jobFuncs 	= require( appRoot + '/jobFunctions' );

let CON 		= require( appRoot + '/constants.js' );

let router = express.Router();

const JOBS_LIST = Object.keys( jobFuncs.jobs );

function buildView() {
	return Promise.all([
		models.jobModel.find().exec()
	]).then((r)=>{
		return {
			jobHistory: r[0],
			jobs: JOBS_LIST
		};
	})

}

router.post('/:name', function( req, res, next ){


});

router.get('/',
	passport.auth(['adminView']),
	function( req, res, next ) {

	return buildView().then(( data ) => {
		return res.render('admin/jobs', data );
	});
});


module.exports = router;