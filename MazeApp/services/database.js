var mongojs = require('mongojs');
var config = require('../config/mongoConfig');

module.exports = function(){
    try {  //TODO: change from try catch to async error handling
        var db = mongojs(config.url, config.collections);
        console.log("after connect" + db);
        return db;
    } catch (err) {
        console.log(err);
        console.log("Error!!!!, need to start the db server first (C:\Program Files\MongoDB 2.6 Standard\bin\mongod.exe --dbpath c:\mongodata) ");
        return null;
    }
}();