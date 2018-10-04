let fs = require('fs');
let path = require('path');

let morgan = require('morgan');
let rfs = require('rotating-file-stream');

let logDirectory = path.join( appRoot, 'logs');

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);


function pad(num) {
	return (num > 9 ? "" : "0") + num;
}

let accessLogNameGenerator = function( time, index) {
	if( !time )
		return 'access.log';

	let year = time.getFullYear();
	var month  = time.getFullYear() + "" + pad(time.getMonth() + 1);
	var day    = pad(time.getDate());

	return 	year  + "/" +
		month + "/" +
		year + month + day + "-" + index + "-access.log";
};

let accessLogStream = rfs( accessLogNameGenerator , {
	size:     '5M', // Max file size
	interval: '1d', // rotate daily
	path: 	  logDirectory,
	initialRotation: true,
	compress: 'gzip', // Compress the log files
	maxSize:  '500M' // Limits the number of log files to this
});

module.exports = function( app ) {
	app.use( morgan(':remote-addr :method :status :url - :response-time ms', { stream: accessLogStream } ) );
};