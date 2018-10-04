/**
 * Created by Brandon on 11/12/2017.
 */

let mongoose = require('mongoose');

let uriLocal = "mongodb://" +
        //"username:password@" + // Username Password
    "localhost:27017" + // Host 1 or many
    "/sh0k";

mongoose.Promise = global.Promise;
mongoose.connect( uriLocal, {
    config: {
        autoIndex: true // Set this to false in production
    }
} ).then(function( ) {
    console.log('Connected to the Database');
});

module.exports = mongoose;