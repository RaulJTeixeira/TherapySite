let path = require('path');
appRoot = path.resolve( __dirname );
let models = require( 'D:/TherapyTool/models/index');

/*charIds.forEach(async function (id) {
    console.log("trying to remove " + id);
    await models.loginModel.remove({ CharacterID: 90903362 }, function(err) {
            console.log(err);
        });
});*/

models.loginModel.deleteOne({ CharacterID: 92643949 }, function(err) {
    console.log(err);
});

models.loginModel.deleteOne({ CharacterID: 1501833430 }, function(err) {
    console.log(err);
});

models.loginModel.deleteOne({ CharacterID: 1036937049 }, function(err) {
    console.log(err);
});

models.loginModel.deleteOne({ CharacterID: 1485299290 }, function(err) {
    console.log(err);
});

models.loginModel.deleteOne({ CharacterID: 827653312 }, function(err) {
    console.log(err);
});

models.loginModel.deleteOne({ CharacterID: 397676440 }, function(err) {
    console.log(err);
});