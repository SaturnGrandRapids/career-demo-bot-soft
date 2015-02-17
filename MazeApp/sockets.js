/**
 * Module to abstract all of the
 * @param server
 */
var sockets = function(server){
    var io = require('socket.io')(server);

    // in order to use the db need to install mongodb and start it (C:\Program Files\MongoDB 2.6 Standard\bin\mongod.exe --dbpath c:\mongodata)
    var users = require('./mazeUsers.js');
//    var dbInstance = new users();

    console.log("here in sockets.js");


    io.on('connection', function(socket){
        console.log('a user with socket ' + socket.id + ' connected');

        socket.on('disconnect', function(){
            console.log('user with socket ' + socket.id + ' disconnected');
        });

        /**
         * Emit game event updates
         */
        socket.on('game update', function(msg){
            //broadcast to everyone including (for now) the sender
            console.log('user with socket ' + socket.id + ' posted game update');
            io.emit('game update', msg);
        });

        /**
         * Emit game over update
         */
        socket.on('game over', function(msg){
            //broadcast to everyone but the sender
            socket.broadcast.emit('game over', msg);
            console.log('Game over for user ' + socket.id );
            io.emit('game over', msg);
        });
        
        socket.on('givemeplayers', function(msg){ //TODO

        });

        socket.on('checkUser', function(id, fn){
            console.log('checkUserxxx??' + id);
            var results = isUserValid(id, fn);
            //TODO: because findOne is Async, checkUser is not working
            console.log('resultsinSockets:' + results);
            console.log('checkUserxxx??' + id);
        })

        socket.on('addUser', function(id, fn){
            console.log('addUser?? ' + id);
            addUser( { "id" : id, "score" : "0", "moves" : "0"});
            //TODO error handling if add fails
            console.log('endofaddUser');
        })

        socket.on('getUsers', function(fn){
            console.log('getUsers?? ');
            //TODO: this function will be needed to return a list (JSON) of players
            //will need to sort/subset by round
            getUsers();
            //TODO error handling if add fails
            console.log('endofgetUsers');
        })


    });
}


module.exports = sockets;
