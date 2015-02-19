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


var db = require('./database.js');

var userService = function () {

    /**
     * return true if the user is NOT found in the database
     * note this is an async routine
     * @param user
     * @param fn
     */
    var isUserValid = function (user, fn) {
        console.log("Need to check the user here " + user);
        db.Users.findOne({name: user}, function (err, data) {
            // docs is an array of all the documents in mycollection
            if (data == null) {
                fn(true);
            }
            else {
                console.log("got one of these already " + data.id.toString());
                fn(false);
            }
        });
    };

    var addUser = function (user, callback) {
        console.log("here we are in addUser function " + user);
        db.Users.insert(user, callback);
    };

    var getUsers = function (callback) {
        console.log("here we are in getUsers function");
        return db.Users.find({}, callback);
    };

    return {
        getUsers: getUsers,
        addUser: addUser,
        isUserValid: isUserValid
    };
};


// this allows dbs to be called as a function when defined with a 'required'
module.exports = userService;


