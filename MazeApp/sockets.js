/**
 * Module to abstract all of the
 * @param server
 */
var sockets = function(server){
    var io = require('socket.io')(server);

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
    });
}


module.exports = sockets;
