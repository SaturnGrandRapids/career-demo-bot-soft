function gameService() {

    var db = require('./database');
    var runTime = require('../config/runTime');
    var _ = require('underscore');

    /**
     * Initializes the service
     * @constructor
     */
    var init = function (callback) {

        //if we don't have a round in the system, create the first
        getCurrentRound(function(err, data){
            if(!data){
                //create the first round
                incrementRound(callback);
            }
        })
    };

    var prune = function(callback){
        var subtractMinutes = function(d, minutes){
            var millisecondsInMinute = 60000;
            return new Date(d.valueOf() - (minutes * millisecondsInMinute));
        }
        db.Games.find({
            runTime: runTime.runTimeId,
            status: 'running',
            startTime: {$lt:subtractMinutes(Date.now(), 3)}
        }).forEach(function(err, data){
            if(data){
                endGame(data, callback);
            }
        });
    }

    /**
     * Increments the round
     * @constructor
     */
    var incrementRound = function (callback) {
        db.Rounds.insert({runTime: runTime.runTimeId}, callback);
    };

    /**
     * Gets the current round
     * @param callback
     * @constructor
     */
    var getCurrentRound = function (callback) {
        db.Rounds.count({
            runtime: runTime.runTimeId
        }, callback);
    };

    /**
     * Starts a new game on the current round
     * @param userName
     * @param callback
     * @constructor
     */
    var startGame = function (userName, callback) {
        self.GetCurrentRound(function (err, data) {
            db.Game.insert({
                runtime: runTime.runTimeId,
                userName: userName,
                round: data,
                points: 0,
                status: 'running',
                startTime: Date.now(),
                priceAwarded: false
            }, callback);
        });
    };

    /**
     * Updates the final score of a finished game
     * @param game
     * @param callback
     * @constructor
     */
    var endGame = function (game, callback) {
        game.status = 'over';
        db.Games.update({_id: game.id}, game, {}, callback);
    };

    /**
     * Gets all the currently running games
     * @returns {*}
     * @constructor
     */
    var getCurrentRunningGames = function (callback) {
        self.GetCurrentRound(function (err, data) {
            if (err != null && typeof callback === 'function')
                callback(err, null);
            else
                db.Games.find({
                    runtime: runTime.runTimeId,
                    round: data,
                    status: 'running'
                }, callback);
        });
    };

    /**
     * Gets all of the games from this runtime
     * @param callback
     * @constructor
     */
    var getAllGames = function (callback) {
        db.Games.find({runTime: runTime.runTimeId}, callback);
    };

    //Call init before returning the singleton
    init(function(err, data){
        //nothing to do at this point.
    });

    return{
        IncrementRound: incrementRound,
        GetCurrentRound: getCurrentRound,
        StartGame: startGame,
        EndGame: endGame,
        GetCurrentRunningGames: getCurrentRunningGames,
        GetAllGames: getAllGames,
        Prune: prune
    }
}

module.exports = gameService;