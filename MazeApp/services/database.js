var mongojs = require('mongojs');
var config = require('../config/mongoConfig');

module.exports = function(){

    function init(db){
        //run any things here that need to happen when the db is created
        //some ideas would be building indexes and initializing data
        db.createCollection('Users');
        db.Users.ensureIndex({name: 1}, {unique: true});
        db.createCollection('Games');
        db.Games.ensureIndex({
            runtime: 1,
            userName: 1,
            round: -1,
            points: -1,
            status: 1
        }, {background: true});
        db.createCollection('Rounds');
        db.Rounds.ensureIndex({runtime: 1});
    }

    try {
        var db = mongojs(config.url, config.collections);
        init(db);
        return db;
    } catch (err) {
        console.log(err);
        console.log("Error!!!!, need to start the db server first (C:\Program Files\MongoDB 2.6 Standard\bin\mongod.exe --dbpath c:\mongodata) ");
        return null;
    }
}();