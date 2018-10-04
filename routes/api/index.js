let express = require('express');

let router = express.Router();

router.use('/discord', require('./discord') );

module.exports = router;
