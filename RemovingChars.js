let path = require('path');
appRoot = path.resolve( __dirname );
let models = require( 'D:/TherapyTool/models/index');

let charIds = [90903362, 95623437 ];

charIds.forEach(function (id) {
    let char = models.loginModel.findOne({_id: id});
    if(char !== undefined)
        char.delete();
});
