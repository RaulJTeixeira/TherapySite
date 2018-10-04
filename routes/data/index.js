let express = require('express');

let router = express.Router();

router.get('/',function( req, res ){
	res.render('data', {});
});

router.use('/users', require('./users') );
router.use('/typeIDs', require('./typeIDs') );
router.use('/groupIDs', require('./groupIDs') );
router.use('/categoryIDs', require('./categoryIDs') );
router.use('/krab', require('./krab') );
router.use('/jobs', require('./jobs') );

module.exports = router;
