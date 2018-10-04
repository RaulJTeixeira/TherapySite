let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let miningSchema = new Schema({
    "characterID": { type: Number, index: true },
    "date": { type: Date, index: true },
    "solar_system_id": { type: Number, index: true },
    "type_id": { type: Number, index: true },
    "quantity": Number
});


exports.miningSchema = miningSchema;
