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
var runTime = require('../config/runTime');

var userService = function () {

    /**
     * return true if the user is NOT found in the database
     * note this is an async routine
     * @param user - username of the user to check
     * @param secret - the secret word of the user to check
     * @param callback
     */
    var isUserValid = function (user, secret, callback) {
        getUser(user, function (err, data) {
            if (err != null) {
                fn(err, data);
            }
            if (data == null) { // user name not found
                callback(err, {IsNew: true, IsValid: true});
            }
            else {  //Username found
                if(data.secret === secret){
                    callback(err, {IsNew: false, IsValid: true});
                }
                else{
                    callback(err, {IsNew: false, IsValid: false});
                }
            }
        });
    };


    /**
     * Gets a user based on the current runtime and the provided username
     * @param userName
     * @param callback
     */
    var getUser = function (userName, callback) {
        db.Users.findOne({
            runtime: runTime.runTimeId,
            name: userName
        }, callback);
    }

    /**
     * Adds a user with a given user and secret
     * @param msg
     * @param callback
     */
    var addUser = function (msg, callback) {
        db.Users.insert({
            name: msg.name,
            secret: msg.secret,
            runtime: runTime.runTimeId
        }, callback);
    };

    /**
     * Gets all users associated with the current runtime
     * @param callback
     * @returns {*}
     */
    var getUsers = function (callback) {
        return db.Users.find({
            runtime: runTime.runTimeId
        }, callback);
    };


    return {
        getUsers: getUsers,
        getUser: getUser,
        addUser: addUser,
        isUserValid: isUserValid
    };
};


// this allows dbs to be called as a function when defined with a 'required'
module.exports = userService;


