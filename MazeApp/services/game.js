function gameService() {

    var mongojs = require('mongojs');
    var db = require('./database');
    var runTime = require('../config/runTime');
    var _ = require('underscore');

    /**
     * Initializes the service
     * @constructor
     */
    var init = function (callback) {

        //if we don't have a round in the system, create the first
        getCurrentRound(function (err, data) {
            if (!data) {
                //create the first round
                incrementRound(callback);
            }
        })
    };

    /**
     * Ends all games that are stale in the system
     * @param callback
     */
    var prune = function (callback) {
        var subtractMinutes = function (d, minutes) {
            var millisecondsInMinute = 60000;
            return new Date(d.valueOf() - (minutes * millisecondsInMinute));
        }
        db.Games.find({
            runtime: runTime.runTimeId,
            status: 'running',
            startTime: {$lt: subtractMinutes(Date.now(), 3)} //here is where we determine what stale is
        }).forEach(function (err, data) {
            if (!data) {
                return;
            }
            endGame(data, callback);
        });
    }

    /**
     * Increments the round
     * @constructor
     */
    var incrementRound = function (callback) {
        db.Rounds.insert({runtime: runTime.runTimeId}, callback);
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
    var startGame = function (msg, callback) {
        getCurrentRound(function (err, data) {
            db.Games.insert({
                runtime: runTime.runTimeId,
                userName: msg.userName,
                secret: msg.secret,
                round: data,
                points: 0,
                status: 'running',
                startTime: new Date(Date.now()),
                prizeAwarded: false
            }, callback);
        });
    };

    /**
     * Updates the final score of a finished game
     * @param game - data used to update
     * @param callback
     */
    var endGame = function (game, callback) {
        db.Games.findAndModify(
            {
                query: {_id: mongojs.ObjectId(game._id)},
                update: {$set: {points: game.points, status: 'over'}},
                new: true
            }, callback);
    };

    /**
     * Sets the prize awarded to true
     * @param game
     * @param callback
     */
    var awardPrize = function (game, callback) {
        db.Games.findAndModify(
            {
                query: {_id: mongojs.ObjectId(game._id)},
                update: {$set: {prizeAwarded: true}},
                new: true
            }, callback);
    };

    /**
     * Gets all the currently running games
     * @param callback
     */
    var getCurrentRunningGames = function (callback) {
        getCurrentRound(function (err, data) {
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
     * Gets the round leaders for the given round
     * @param take - optional - how many to return
     * @param round - optional - which round. defaults to current
     * @param callback
     */
    var getRoundLeaders = function (take, round, callback) {
        if (take == null || typeof take !== 'number') {
            take = 5;
        }
        if (round == null || typeof round !== 'number') {
            //if we don't have a round provided, assume the current
            getCurrentRound(function (err, data) {
                if (err != null)
                    callback(err, data);
                getRoundLeaders(take, data, callback);
            });
        }
        else {
            db.Games.find({
                runtime: runTime.runTimeId,
                round: round,
                status: 'over'
            }).sort(
                {points: -1} //desc
            ).limit(take, callback);
        }
    };

    var getRoundGames = function (round, callback) {
        if (round == null || typeof round !== 'number') {
            //if we don't have a round provided, assume the current
            getCurrentRound(function (err, data) {
                if (err != null)
                    callback(err, data);
                getRoundLeaders(data, callback);
            });
        }
        else {
            db.Games.find({
                runtime: runTime.runTimeId,
                round: round
            }).sort({points: -1}, callback);
        }
    };

    /**
     * Gets the top games from this runtime
     * @param take - optional - how many to return default = 10
     * @param callback
     */
    var getOverallLeaders = function (take, callback) {
        if (take == null || typeof take !== 'number') {
            getOverallLeaders(10, callback)
        } else {
            db.Games.find({
                runtime: runTime.runTimeId
            }).sort({points: -1}).limit(take, callback);
        }
    };

    /**
     * Gets the winners from previous rounds                             DOESN'T WORK YET...
     * @param take - optional - how many winners/round
     * @param rounds - optional - how many previous rounds to check
     * @param callback
     */
    //var getWinners = function (take, rounds, callback) {
    //    var winners = [];
    //    var currentRound = 5; //Hardcode while debuggign loop
    //
    //    //getCurrentRound(function (err, data) {
    //    //    if(err == null) currentRound = data;
    //    //});
    //
    //    //set defaults
    //    if (take == null || typeof take !== 'number') take = 3;
    //    if (rounds == null || typeof rounds !== 'number') rounds = 2;
    //
    //    for(var i = currentRound - rounds; i < currentRound; i++) {
    //        getRoundLeaders(take, i, function (err, data) {
    //            if (err == null) winners = winners.concat(data);
    //            else alert(err);
    //        });
    //    }
    //    callback(null, winners); //throwing away errors at the moment. not terribly bright...
    //};


    /**
     * Gets all of the games from this runtime
     * @param callback
     */
    var getAllGames = function (callback) {
        db.Games.find({runTime: runTime.runTimeId}, callback);
    };

    //Call init before returning the singleton
    init(function (err, data) {
        //nothing to do at this point.
    });

    return {
        IncrementRound: incrementRound,
        GetCurrentRound: getCurrentRound,
        GetRoundLeaders: getRoundLeaders,
        GetRoundGames: getRoundGames,
        StartGame: startGame,
        EndGame: endGame,
        AwardPrize: awardPrize,
        GetCurrentRunningGames: getCurrentRunningGames,
        GetAllGames: getAllGames,
        GetOverallLeaders: getOverallLeaders,
       // GetWinners: getWinners,
        Prune: prune
    }
}

module.exports = gameService;