/**
 * Module to abstract all of the
 * @param server
 */
var sockets = function(server){

    var io = require('socket.io')(server);

    // in order to use the db need to install mongodb and start it (C:\Program Files\MongoDB 2.6 Standard\bin\mongod.exe --dbpath c:\mongodata)
    var userService = require('./services/user.js')();
    var gameService = require('./services/game.js')();

    //start the pruning function on an interval (10 sec)
    setInterval(function(){
        gameService.Prune(function(err, data){
            if(!err){
                io.emit('game:over', data);
            }
        })
    }, 10000);

    io.on('connection', function(socket){
        console.log('a user with socket ' + socket.id + ' connected');

        socket.on('disconnect', function(){
            console.log('user with socket ' + socket.id + ' disconnected');
        });

        /**
         * Handler for game initiation
         *
         */
        socket.on('game:start', function(msg, callback){
            console.log('Game starting for user ' + socket.id );
            //TODO:this is the unreadable username...don't think we want this (but we also don't want the entire msg added to the game record
            gameService.StartGame(msg.username,function(err, data){
                if(!err) {
                    socket.broadcast.emit('game:start', data);
                }
                if(typeof callback === 'function') {
                    callback(err, data);
                }
            });
        });

        /**
         * Emit game event updates
         */
        socket.on('game:update', function(msg){
            io.emit('game update', msg);
        });

        /**
         * Emit game over update
         */
        socket.on('game:over', function(msg, callback){
            console.log('Game over for user ' + socket.id );
            //TODO: again do we really want unreadable username??
            gameService.EndGame(msg.username,function(err, data){
                if(!err){
                    socket.broadcast.emit('game:over', data);
                }
                if(typeof callback === 'function'){
                    callback(err, data);
                }
            });
        });

        /**
         *
         */
        socket.on('round:increment', function(msg){

        });

        socket.on('checkUser', function(name, secret, callback){
            userService.isUserValid(name, secret, callback);
        });

        socket.on('addUser', function(name, secret, callback){
            userService.addUser( { "name" : name, "secret" :secret}, callback);
        });

        socket.on('getUsers', function(callback){
            userService.getUsers(callback);
        });
    });
};


module.exports = sockets;
