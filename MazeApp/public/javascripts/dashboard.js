
require.config({
    // The shim config allows us to configure dependencies for
    // scripts that do not call define() to register a module
    shim: {
        'socketio': {
            exports: 'io'
        }
    },
    paths: {
        jquery: 'lib/jquery-1.8.2',
        socketio: '../socket.io/socket.io'
    }
});

require(['jquery','socketio'], function($, io) {

    var scoreboardData = [];
    var socket = io();

    function rebuildScoreboard() {
        $('.dashboard').empty();
        $(scoreboardData).each(function () {
            $('.dashboard').append('<div>' + this.mazeHtml + this.username + '<br>' +
            this.playerName + ':  ' + this.points + '    ' + this.moves + '</div>');
        });
    }

    socket.on('game update', function (msg) {
        var isUpdate = false;
        $(scoreboardData).each(function () {
            if (this.username === msg.username) {
                this.points = msg.points;
                this.moves = msg.moves;
                this.mazeHtml = msg.mazeHtml;
                this.playerName = msg.playerName
                isUpdate = true;
            }
        });
        if (!isUpdate) {
            scoreboardData.push(msg);
        }
        rebuildScoreboard();
    });
});
