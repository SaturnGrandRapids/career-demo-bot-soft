/**
 * Module to abstract all of the
 * @param server
 */
var sockets = function(server){
    var io = require('socket.io')(server);

    io.on('connection', function(socket){
        console.log('a user connected');

        socket.on('disconnect', function(){
            console.log('user disconnected');
        });

        /**
         * Emit points updates
         */
        socket.on('points update', function(msg){
            socket.broadcast.emit(msg);
        });

        socket.on('movement', function(msg){
            socket.broadcast.emit(msg);
        })

        socket.on('game over'), function(msg){
            socket.broadcast.emit(msg);
        }
    });
}


module.exports = sockets;
