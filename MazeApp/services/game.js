function gameService() {

    var db = require('./database');
    var runTime = require('../config/runTime');
    var _ = require('underscore');

    return {

        /**
         * Initializes the service
         * @constructor
         */
        Init: function (callback) {
            IncrementRound(callback);
        },

        /**
         * Increments the round
         * @constructor
         */
        IncrementRound: function (callback) {
            db.Rounds.insert({
                runTime: runTime.runTimeId
            }, callback);
        },

        /**
         * Gets the current round
         * @param callback
         * @constructor
         */
        GetCurrentRound: function (callback) {
            db.Rounds.count({
                runtime: runTime.runTimeId
            }, callback);
        },

        /**
         * Starts a new game on the current round
         * @param userName
         * @param callback
         * @constructor
         */
        StartGame: function (userName, callback) {
            self.GetCurrentRound(function (err, data) {
                db.Game.insert({
                    runtime: runTime.runTimeId,
                    user: userName,
                    round: data,
                    points: 0,
                    status: 'running'
                }, callback);
            });
        },

        /**
         * Updates the final score of a finished game
         * @param game
         * @param callback
         * @constructor
         */
        EndGame: function (game, callback) {
            game.status = 'over';
            db.Games.update({_id: game.id}, game, {}, callback);
        },

        /**
         * Gets all the currently running games
         * @returns {*}
         * @constructor
         */
        GetCurrentRunningGames: function (callback) {
            self.GetCurrentRound(function (err, data) {
                if (err != null && typeof callback === 'function')
                    callback(err, null);
                else
                    db.Games.find({
                        runtime: runTime.runTimeId,
                        round: data,
                        sttus: 'running'
                    }, callback);
            });
        },

        /**
         * Gets all of the games from this runtime
         * @param callback
         * @constructor
         */
        GetAllGames: function (callback) {
            self.GetCurrentRound(function (err, data) {
                if (err != null && typeof callback === 'function')
                    callback(err, null);
                else
                    db.Games.count({
                        round: data
                    }, callback);
            });
        }
    }
}


module.exports = gameService;