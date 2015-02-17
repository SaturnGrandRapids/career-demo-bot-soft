/**
 * Module to handle all the db actions for users in the Maze Challenge
 * To use the database, install Mongodb http://docs.mongodb.org/manual/installation/*
 * Create a data folder c:\mongodata *
 * I find it is also useful to install a database client like https://github.com/agirbal/umongo *
 * This code assumes we will use a database called testData and a collection called Players*
 * To start the database, run the command:
 * (C:\Program Files\MongoDB 2.6 Standard\bin\mongod.exe --dbpath c:\mongodata
 * To use umongo, start the app and connect, a "Default" prompt will appear, press the edit button, fill in testData for the Databases
 */
mongojs = require("mongojs");

var mazeUsers = function(){
    /// return msg();
    console.log("here we are in dbs2");
    var self = this;
    
    connect = function (){
        console.log("here we are in connect function");

        try {  //TODO: change from try catch to async error handling
            var uri = "mongodb://localhost:27017/testData",
                playerdb = mongojs.connect(uri, ["Players"]);
            console.log("after connect" + playerdb);
        } catch (err) {
            console.log(err);
            console.log("Error!!!!, need to start the db server first (C:\Program Files\MongoDB 2.6 Standard\bin\mongod.exe --dbpath c:\mongodata) ");

        }
        return playerdb;
    };

    var playerdb = connect();


    /**
     * return true if the user is NOT found in the database
     * note this is an async routine
     * @param user
     * @param fn
     */
    self.isUserValid = function (user, fn){
        console.log("Need to check the user here " + user);
//      check to see if that name is already in use
        var docs;
        playerdb.Players.findOne({id:user},function(err, docs) {
            var x = 1;
            // docs is an array of all the documents in mycollection
            if (docs == null) {
                fn(true);
            }
            else {
                console.log("got one of these already " + docs.id.toString());
                fn(false);
            }
        });
    };
    
    
    self.addUser = function (user){
        console.log("here we are in addUser function " + user);
//        db.Players.insert({ "id" : "mary3", "score" : "1"})
        playerdb.Players.insert(user)

    };
    
    self.getUsers = function (){
        console.log("here we are in getUsers function" );
        return playerdb.Players.find();
    };
};


// this allows dbs to be called as a function when defined with a 'required'
module.exports = mazeUsers;


