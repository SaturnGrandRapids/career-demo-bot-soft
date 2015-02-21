require.config({
    // The shim config allows us to configure dependencies for
    // scripts that do not call define() to register a module
    shim: {
        'jquery': {
            exports: 'jQuery'
        },
        'socketio': {
            exports: 'io'
        },
        'flipclock': {
            deps: ['jquery'],
            exports: 'FlipClock'
        },
        'modernizr': {
            exports: 'Modernizr'
        },
        'hammer': {
            exports: 'Hammer'
        }
    },
    paths: {
        jquery: 'lib/jquery-1.8.2',
        mobile: 'lib/jquery.mobile-1.2.0',
        ui: 'lib/jquery-ui-1.8.24',
        modernizr: 'lib/modernizr-2.6.2',
        flipclock: 'lib/flipclock.min',
        hammer: 'lib/hammer.min',
        socketio: '../socket.io/socket.io'
    }
});

require(['jquery', 'socketio', 'flipclock', 'hammer', 'modernizr'],
    function ($, io, FlipClock, Hammer) {

        var socket = io();

        Node.prototype.add = function (tag, cnt, txt) {
            for (var i = 0; i < cnt; i++)
                this.appendChild(ce(tag, txt));
        }
        Node.prototype.ins = function (tag) {
            this.insertBefore(ce(tag), this.firstChild)
        }
        Node.prototype.kid = function (i) {
            return this.childNodes[i]
        }
        Node.prototype.cls = function (t) {
            this.className += ' ' + t
        }

        NodeList.prototype.map = function (g) {
            for (var i = 0; i < this.length; i++) g(this[i]);
        }

        var clock;
        var displayPoints;
        var gameLevel = 0;
        var gameTable;
        var gamePoints = 300;
        var gameMoves = 0;

        var commonFunctions = {

            startGame: function () {
                var player = gid('playerInfoBox').value;
                var secret = gid('playerSecretBox').value;
                if (player == "Enter Your Name Here" || player == "" || secret == "Enter Secret Word Here" || secret ==  "") {
                    alert("Enter your name and secret word before starting");
                    return;
                }
                else {
                    //calling function on server and expecting callback
                    //We no longer care about duplicate names
                    socket.emit('checkUser', player, secret, function (msg) {
                        console.log("hello" + player + secret + msg );
                        if (msg == "NewUser") {
                            //call add user message and move on
                            socket.emit('addUser', player, secret, function (err, msg) {
                                if (err == null) {
                                    //we don't have an error, so let's rock!!!
                                    //set to local storage and head to the maze
                                    localStorage.setItem('user', msg);
                                    window.location.href = 'maze';
                                }
                                else
                                    alert('Error trying to add User');
                            });
                        }
                        else {
                            if (msg == "ErrorUser") {
                                //We no longer have a problem if someone is rejoining , so let's rock!!!
                                //TODO: could add a welcome back your previous high score is xxx if same user / secret
                                alert('Oops, Player: "' + player + '" is already taken & the Secret Word does not match!');
                                return;
                            }
                            else{
//                                alert('Welcome Back ' + player);
                                localStorage.setItem('user', msg);
                                window.location.href = 'maze';

                            }
                        }
                    });
                }
            },
            endGame: function () {

                var tbl = gid('maze');
                tbl.innerHTML = '<tr><td>Game Ended</td></tr>';
                if (tbl.classList.contains('flipped')) {
                    tbl.classList.remove('flipped');
                }
                else {
                    tbl.classList.add('flipped');
                }
                socket.emit('game:over', {
                    username: socket.id,
                    points: gamePoints,
                    moves: gameMoves,
                    mazeHtml: gid('maze').outerHTML,
                    playerName: gid('playerInfoBox').value
                });
            }


        }

        function gid(e) {
            return document.getElementById(e)
        }

        function startNewGame() {

            commonFunctions.buildGameTable();

            var gestures = new Hammer(gid("maze"));
            gestures.get('swipe').set({direction: Hammer.DIRECTION_ALL, threshold: 2, velocity: 0.3});
            gestures.on("swipeleft swiperight swipeup swipedown tap press", captureGesture);

            clock = $('.clockCountDown').FlipClock(120, {
                countdown: true,
                clockFace: 'MinuteCounter',
                callbacks: {
                    stop: function () {
                        commonFunctions.endGame();
                    },
                    autostart: false
                }
            });

            displayPoints = $('.clockPoints').FlipClock(100, {
                clockFace: 'Counter'
            });

            clock.stop();
            commonFunctions.generateMaze();
            setTimeout(function () {
                setInterval(function () {
                    displayPoints.setValue(gamePoints);
                }, 1000);
            });
        }

        $(document).ready(function () {

            //add start and quit handlers
            $('#startbutton').click(function () {
                commonFunctions.startGame();
            });
            $('#quitbutton').click(function () {
                commonFunctions.endGame()
            });


        });
    });
