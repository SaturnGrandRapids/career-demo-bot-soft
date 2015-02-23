define(['react', 'socketio'], function (React, io) {

    var socket = io();

    function Admin() {

        var RoundDropdownView = React.createClass({
            onRoundSelected: function(e){
                this.props.onRoundSelected(e.target.value);
            },
            render: function () {
                var createRoundArrayFromCurrent = function(currentRound){
                    var newArray = [];
                    for(var i = currentRound; i > 0; i--){
                        if(i == currentRound){
                            newArray.push({value:i, text: 'Round ' + i + ' (Current)'});
                        }
                        else{
                            newArray.push({value:i, text: 'Round ' + i});
                        }
                    }
                    return newArray;
                };

                var renderRoundSelectListItem = function(roundItem){
                    return (
                        <option value={roundItem.value}>{roundItem.text}</option>
                    )
                };

                return (
                    <select onChange={this.onRoundSelected} value={this.props.visibleRound}>
                    {createRoundArrayFromCurrent(this.props.currentRound).map(renderRoundSelectListItem)}
                    </select>
                );
            }
        });

        var GameListView = React.createClass({
            onAwardPrize: function(game, index){
                var that = this;
                socket.emit('game:awardPrize', game, function(err, data){
                   if(err == null){
                       that.props.games[index] = data;
                       that.forceUpdate();
                   }
                });
            },
            render: function () {
                var that = this;
                var renderGame= function(game, index){
                    var renderPrizeAwarded = function(game){
                        return game.prizeAwarded ? 'Awarded' : (
                            <a href='#' onClick={that.onAwardPrize.bind(that, game, index)}>
                                Click When Awarded
                            </a>
                        );
                    };
                    return (
                        <div className="grid">
                            <div className="col-1-4">{game.userName}</div>
                            <div className="col-1-4">{game.secret}</div>
                            <div className="col-1-4">{game.points}</div>
                            <div className="col-1-4">{renderPrizeAwarded(game)}</div>
                        </div>
                    )
                };

                return (
                    <div>
                        <div className="grid">
                            <div className="col-1-4">UserName</div>
                            <div className="col-1-4">Secret</div>
                            <div className="col-1-4">Score</div>
                            <div className="col-1-4">Prize Awarded</div>
                        </div>
                        {this.props.games.length > 0 ? this.props.games.map(renderGame) : ''}
                    </div>
                );
            }
        });

        /**
         * Represents the view of the games
         */
        var GamesView = React.createClass({
            updateModel: function () {
                var that = this;
                socket.emit('round:getCurrent', {}, function (err, data) {
                    if (err == null) {
                        that.setState({currentRound: data}, function(err, data){
                            //flip through all of the rounds and update
                            //this gets weird thanks to closures within loops, so we have to loop twice
                            //first loop builds functions and binds closure
                            var updateRoundModelFunctions = [];
                            for (var i = that.state.currentRound; i > 0; i--) {
                                updateRoundModelFunctions[i] = (function(index){
                                    return function() {
                                        socket.emit('round:getGames', {round: index}, function (err, data) {
                                            if (err != null) {
                                                return;
                                            }
                                            else {
                                                that.state.rounds[index] = data;
                                                if (that.state.visibleRound == index) {
                                                    that.state.games = data;
                                                }
                                                that.setState();
                                            }
                                        });
                                    }
                                }(i));
                            }
                            //second loop executes functions
                            for (var j = that.state.currentRound; j > 0; j--){
                                updateRoundModelFunctions[j]();
                            }
                        });
                    }
                });
            },
            getInitialState: function () {
                var that = this;
                //sign up for events we care about
                socket.on('game:start', function (msg) {
                    that.updateModel();
                });
                socket.on('game:over', function (msg) {
                    that.updateModel();
                });
                socket.on('round:increment', function (msg) {
                    that.updateModel();
                });

                return {currentRound: 1, rounds: [], visibleRound: 1, games: []};
            },
            componentDidMount: function(){
                var that = this;
                socket.emit('round:getCurrent', {}, function (err, data) {
                    if (err == null){
                        that.setState({currentRound: data});
                        that.updateModel();
                    }
                });
            },
            incrementRound: function(){
                socket.emit('round:increment');
            },
            onRoundSelected: function(val){
                this.state.visibleRound = val;
                if(typeof this.state.rounds[val] === 'undefined'){
                    this.state.rounds[val] = [];
                }
                this.state.games = this.state.rounds[val];
                this.setState();
            },
            render: function () {
                return (
                    <div className="col-1-2">
                        <div className="grid">
                            <button onClick={this.incrementRound}>Add Round</button>
                            <RoundDropdownView visibleRound={this.state.visibleRound} currentRound={this.state.currentRound} onRoundSelected={this.onRoundSelected}/>
                            <GameListView games={this.state.games}/>
                        </div>
                    </div>
                );
            }
        });

        this.AdminView = React.createClass({

            getInitialState: function () {
                var that = this;
                socket.on('game update', function (msg) {
                    that.state.messages.push('game update from ' + msg.playerName)
                    that.setState();
                });
                return {messages: []};
            },

            render: function () {
                return (
                    <div className="grid">
                        <GamesView messages={this.state.messages} />
                    </div>
                );
            }
        });
    }

    Admin.prototype.init = function () {
        React.renderComponent(<this.AdminView />, document.body);
    };

    return Admin;

});