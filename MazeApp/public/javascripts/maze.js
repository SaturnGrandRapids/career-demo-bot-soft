
require.config({
    // The shim config allows us to configure dependencies for
    // scripts that do not call define() to register a module
    shim: {
        'jquery' : {
            exports : 'jQuery'
        },
        'socketio': {
            exports: 'io'
        },
        'flipclock':{
            deps: ['jquery'],
            exports: 'FlipClock'
        },
        'modernizr': {
            exports: 'Modernizr'
        },
        'hammer':{
            exports: 'Hammer'
        },
        'bootstrap': {
            exports: 'BootStrap'
        }
    },
    paths: {
        jquery: 'lib/jquery-1.8.2',
        mobile: 'lib/jquery.mobile-1.2.0',
        ui: 'lib/jquery-ui-1.8.24',
        modernizr: 'lib/modernizr-2.6.2',
        flipclock: 'lib/flipclock.min',
        hammer: 'lib/hammer.min',
        socketio: '../socket.io/socket.io',
        bootstrap: 'lib/bootstrap.min'
    }
});

require(['jquery','socketio','flipclock', 'hammer', 'modernizr','bootstrap'],
    function($, io, FlipClock,Hammer) {

        var socket = io();

        Node.prototype.add = function (tag, cnt, txt) {
            for (var i = 0; i < cnt; i++)
                this.appendChild(ce(tag, txt));
        };
        Node.prototype.ins = function (tag) {
            this.insertBefore(ce(tag), this.firstChild)
        };
        Node.prototype.kid = function (i) {
            return this.childNodes[i]
        };
        Node.prototype.cls = function (t) {
            this.className += ' ' + t
        };

        NodeList.prototype.map = function (g) {
            for (var i = 0; i < this.length; i++) g(this[i]);
        };

        var clock;
        var displayPoints;
        var displayUser;
        var gameLevel = 0;
        var gameTable;
        var gamePoints = 300;
        var gameMoves = 0;
//start the Clock

        var currentGame = null;
        var commonFunctions = {

            startGame: function () {

                var player = gid('playerInfoBox').value;
                if (player == "Enter Your Name Here") {
                    alert("Enter your name before starting!!!");
                }
                else {
                    startNewGame();
                    clock.start();
                }
            },
            endGame: function () {

                var tbl = gid('maze');
                tbl.innerHTML = '<tr><td style="color:white;font-size:x-large;padding-left:10%" >Game Ended Try Again...</td></tr>';
                if (tbl.classList.contains('flipped')) {
                    tbl.classList.remove('flipped');
                }
                else {
                    tbl.classList.add('flipped');
                }
                if(currentGame){
                    socket.emit('game:over', currentGame);
                    currentGame = null;
                }
            },
            buildGameTable: function () {
                gameTable = {
                    level: [
                        {row: 5, column: 5},
                        {row: 5, column: 6},
                        {row: 6, column: 6},
                        {row: 7, column: 7},
                        {row: 7, column: 8},
                        {row: 7, column: 9},
                        {row: 8, column: 8},
                        {row: 8, column: 9},
                        {row: 9, column: 9},
                        {row: 10, column: 10},
                        {row: 10, column: 12},
                        {row: 11, column: 12},
                        {row: 12, column: 12},
                        {row: 13, column: 13},
                        {row: 14, column: 14},
                        {row: 15, column: 15},
                        {row: 15, column: 16},
                        {row: 15, column: 17},
                        {row: 16, column: 17},
                        {row: 17, column: 17}
                    ]
                }

            },


            generateMaze: function () {

                gameLevel++;
                make_maze(gameTable.level[gameLevel].row, gameTable.level[gameLevel].column);
                gamePoints += gameLevel * 1000;
                //gameMoves = 0;
            }


        };


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

        function sendToSocket()
        {

             currentGame.points = gamePoints;
             currentGame.moves = gameMoves;
             currentGame.mazeHtml = gid('maze').outerHTML;
             socket.emit('game:update', currentGame);
            return false;
        }
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

            //gid('solve').style.display = 'inline';
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

        function solve(c, t) {
            if (c === undefined) {
                c = gid('maze').kid(1).kid(1);
                c.cls('v');
            }
            if (t === undefined)
                t = gid('maze').lastChild.previousSibling
                    .lastChild.previousSibling;

            if (c === t) return 1;
            c.vis = 1;
            for (var i = 0; i < 4; i++) {
                var x = c.neighbors[i];
                if (x.tagName.toLowerCase() == 'th') continue;
                if (x.vis || !c.className.match(dirs[i]) || !solve(x, t))
                    continue;

                x.cls('v');
                return 1;
            }
            c.vis = null;

            return 0;
        }

        function moveClick(keyStroke)
        {
            alert(keyStroke);
        }

        function keyMove(ev) {
            var y = document.getElementsByClassName('cur1');

            if (ev.keyCode > 36 && ev.keyCode < 41) {
                if (clock.running != true) {
                    return false;
                    //need to press the start button to start
                    //clock.start();

                }

            }
            switch (ev.keyCode) {
                case 37: /* left */
                    move.left();
                    currentGame.points = gamePoints;
                    currentGame.moves = gameMoves;
                    currentGame.mazeHtml = gid('maze').outerHTML;
                    socket.emit('game:update', currentGame);
                    return false;
                case 38: /* up */
                    move.up();
                    currentGame.points = gamePoints;
                    currentGame.moves = gameMoves;
                    currentGame.mazeHtml = gid('maze').outerHTML;
                    socket.emit('game:update', currentGame);
                    return false;
                case 39: /* right */
                    move.right();
                    currentGame.points = gamePoints;
                    currentGame.moves = gameMoves;
                    currentGame.mazeHtml = gid('maze').outerHTML;
                    socket.emit('game:update', currentGame);
                    return false;
                case 40: /* down */
                    move.down();
                    currentGame.points = gamePoints;
                    currentGame.moves = gameMoves;
                    currentGame.mazeHtml = gid('maze').outerHTML;
                    socket.emit('game:update', currentGame);
                    return false;
                default:
                    //   log("interaction", "Key press: %d", ev.keyCode);
                    return true;
            }
        }


        function captureGesture(ev) {

            ev.preventDefault();

            switch (ev.type) {
                case "swipeleft":
                    sendToSocket();
                    move.left();
                    return true;

                case "swipeup":
                    sendToSocket();
                    move.up();

                    return false;
                case "swiperight":
                    sendToSocket();
                    move.right();
                    return false;
                case "swipedown":
                    sendToSocket();
                    move.down();
                    return false;
                default:
                    return true;
            }
        }

        function startNewGame() {
            gamePoints = 1000;
            gameLevel = 0;

            commonFunctions.buildGameTable();

            var gestures = new Hammer(gid("maze"));
            gestures.get('swipe').set({direction: Hammer.DIRECTION_ALL, threshold: 2, velocity: 0.3});
            gestures.on("swipeleft swiperight swipeup swipedown tap press", captureGesture);

            var currentUser = JSON.parse(sessionStorage.getItem('user'));
            
            socket.emit('game:start', {
                userName: currentUser.name,
                secret: currentUser.secret
            }, function(err, data){
                if(err == null){
                    currentGame = data;
                }
            });

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

            if (sessionStorage.getItem('user')==null) {
                alert('Sorry you need to log in');
                window.location.href = '/';
            }
            var curUser = JSON.parse(sessionStorage.getItem('user'));
            document.getElementById("playerInfoBox").innerHTML = "<br><b>Now Playing:</b>    " + curUser.name ;

            //playerInfoBox.setValue(sessionStorage.getItem('user'));
            //add start and quit handlers
            $('#startbutton').click(function(){
                commonFunctions.startGame();
            });
            $('#quitbutton').click(function(){
                commonFunctions.endGame();
                window.location.href = '/';
            });
            gamePoints = 1000;
            gameLevel = 0;

            $('.leftClickMaze').click(function(evt) {
                evt.preventDefault();
                sendToSocket();
                move.left();
            });

            $('.rightClickMaze').click(function(evt) {
                evt.preventDefault();
                sendToSocket();
                move.right();
            });
            $('.upClickMaze').click(function(evt) {
                evt.preventDefault();
                sendToSocket();
                move.up();
           });
            $('.downClickMaze').click(function(evt) {

                evt.preventDefault();
                sendToSocket();
                move.down();
            });

            var winHeight = window.innerWidth;
            var winInnerHer = window.innerHeight;
            //alert(winHeight + ':' + winInnerHer);
            $('#maze').css('height',function()
                {
                    if (winHeight > winInnerHer)
                    {   return winInnerHer * 0.7;}
                    else
                    {   return winHeight * 0.7;}

                }
            )
            commonFunctions.buildGameTable();
        });
    });
