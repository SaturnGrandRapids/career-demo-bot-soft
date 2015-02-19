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

                if (player == "Enter Your Name Here" | "") {
                    alert("Enter your name before starting");
                    return;
                }
                else {
                    //calling function on server and expecting callback
                    console.log("hello" + player);
                    socket.emit('checkUser', player, function (msg) {
                        console.log("hello" + player);
                        if (msg) {
                            //call add user message and move on
                            socket.emit('addUser', player, function (err, msg) {
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
                            alert('Sorry, the name: "' + player + '" is already taken!');
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


        var move = {

            "left": function () {

                var y = document.getElementsByClassName('cur1');
                if (y[0].classList.contains('w')) {
                    gamePoints--;
                    gameMoves++;
                    var x = y[0].previousSibling;
                    y[0].classList.remove('cur1');
                    x.classList.add('cur1');
                    if (x.classList.contains('finish')) {
                        commonFunctions.generateMaze();
                    }
                }

                return true;


            },

            "up": function () {
                var y = document.getElementsByClassName('cur1');
                if (y[0].classList.contains('n')) {
                    gamePoints--;
                    gameMoves++;
                    y[0].parentNode.previousSibling.cells[y[0].cellIndex].classList.add('cur1');

                    y[1].classList.remove('cur1');
                    if (y[0].classList.contains('finish')) {
                        commonFunctions.generateMaze();
                    }
                }
                return true;
            },

            "down": function () {
                var y = document.getElementsByClassName('cur1');
                if (y[0].classList.contains('s')) {
                    gamePoints--;
                    gameMoves++;
                    y[0].parentNode.nextSibling.cells[y[0].cellIndex].classList.add('cur1');
                    y[0].classList.remove('cur1');
                    if (y[0].classList.contains('finish')) {
                        commonFunctions.generateMaze();
                    }

                }
                return true;
            },

            "right": function () {
                var y = document.getElementsByClassName('cur1');
                if (y[0].classList.contains('e')) {
                    gamePoints--;
                    gameMoves++;
                    var x = y[0].nextSibling;
                    y[0].classList.remove('cur1');
                    x.classList.add('cur1');
                    if (x.classList.contains('finish')) {
                        commonFunctions.generateMaze();
                    }
                }
                return true;
            }
        };


        function next(elem) {
            do {
                elem = elem.nextSibling;
            } while (elem && elem.nodeType !== 1);
            return elem;
        }

        function ce(tag, txt) {
            var x = document.createElement(tag);
            if (txt !== undefined) x.innerHTML = txt;
            return x
        }

        function gid(e) {
            return document.getElementById(e)
        }

        function irand(x) {
            return Math.floor(Math.random() * x)
        }

        function make_maze(w, h) {
            //var w = parseInt(gid('rows').value || 8, 10);
            //var h = parseInt(gid('cols').value || 8, 10);


            var tbl = gid('maze');


            tbl.innerHTML = '';
            if (tbl.classList.contains('flipped')) {
                tbl.classList.remove('flipped');
            }
            else {
                tbl.classList.add('flipped');
            }

            tbl.add('tr', h);
            tbl.childNodes.map(function (x) {
                x.add('th', 1);
                x.add('td', w, '*');
                x.add('th', 1)
            });
            tbl.ins('tr');
            tbl.add('tr', 1);
            tbl.firstChild.add('th', w + 2);
            tbl.lastChild.add('th', w + 2);
            for (var i = 1; i <= h; i++) {
                for (var j = 1; j <= w; j++) {
                    tbl.kid(i).kid(j).neighbors = [
                        tbl.kid(i + 1).kid(j),
                        tbl.kid(i).kid(j + 1),
                        tbl.kid(i).kid(j - 1),
                        tbl.kid(i - 1).kid(j)
                    ];
                }
            }
            walk(tbl.kid(irand(h) + 1).kid(irand(w) + 1));
            tbl.rows[h].cells[w].textContent = "END";
            tbl.rows[h].cells[w].className += ' finish';
            tbl.rows[1].cells[1].className += ' cur1';

            gid('solve').style.display = 'inline';
            document.onkeydown = function (ev) {
                keyMove(ev);
            };
            //tbl.className += ' flipped';


        }

        function shuffle(x) {
            for (var i = 3; i > 0; i--) {
                j = irand(i + 1);
                if (j == i) continue;
                var t = x[j];
                x[j] = x[i];
                x[i] = t;
            }
            return x;
        }

        var dirs = ['s', 'e', 'w', 'n'];

        function walk(c) {
            c.innerHTML = '&nbsp;';
            var idx = shuffle([0, 1, 2, 3]);
            for (var j = 0; j < 4; j++) {
                var i = idx[j];
                var x = c.neighbors[i];
                if (x.textContent != '*') continue;
                c.cls(dirs[i]), x.cls(dirs[3 - i]);
                walk(x);
            }
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
