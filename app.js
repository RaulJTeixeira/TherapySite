let express = require('express');
let path = require('path');
let staticAsset = require('static-asset');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let compression = require('compression');
let session = require('express-session');
let MongoStore = require('connect-mongo')( session );
let flash = require('express-flash');

global.appRoot = path.resolve( __dirname );
global.isDevelopment = process.env.NODE_ENV != 'production';
global.options = [];
global.upTimeStart = Date.now();

let mongoose = require( appRoot + '/mongoose');
let settings = require( appRoot + '/settings' );

let app = express();

app.use( compression() );
app.use( staticAsset(path.join(appRoot, 'public')) );
app.use( express.static(appRoot + "/public/") );

// view engine setup
app.set('env', process.env.NODE_ENV );
app.set('views', path.join( appRoot, 'views' ) );
app.set('view engine', 'ejs' );
app.set('view cache', !isDevelopment );
app.set('view root', appRoot );
app.set('x-powered-by', false );

require( appRoot + "/bin/logging")( app );

// Used for parsing post and get requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser(settings.admin.secretkey));

app.use(session({
    secret: settings.admin.secretkey,
	store: new MongoStore({
		mongooseConnection: mongoose.connection,
		ttl: 14 * 24 * 60 * 60
	}),
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

require('./routes')( app );

process.on('unhandledRejection', r =>{
	console.error('#Tracing unhandledRejection: ');
	console.error(r);
	process.kill(1);
});


module.exports = app;
