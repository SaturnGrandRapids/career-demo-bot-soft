define(['react', 'socketio'], function (React, io) {

    var socket = io();

    function Admin() {

        var RoundDropdownView = React.createClass({
            onRoundSelected: function(e){
                e.disable()
                this.props.games = this.props.rounds[this.props.visibleRound];
            },
            render: function () {
                var createRoundArrayFromCurrent = function(currentRound){
                    var newArray = [];
                    for(var i = currentRound; i > 0; i--){
                        newArray.push({value:i, text: 'Round ' + i});
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
            render: function () {

                var renderGame= function(game){

                    var renderPrizeAwarded = function(hasBeenAwarded){
                        return hasBeenAwarded ? 'Awarded' : 'Not Awarded';
                    }

                    return (
                        <div className="grid">
                            <div className="col-1-4">{game.userName}</div>
                            <div className="col-1-4">{game.secretName}</div>
                            <div className="col-1-4">{game.points}</div>
                            <div className="col-1-4">{renderPrizeAwarded(game.prizeAwarded)}</div>
                        </div>
                    )
                };

                return (
                    <div>
                        <div className="grid">
                            <div className="col-1-4">UserName</div>
                            <div className="col-1-4">Secret</div>
                            <div className="col-1-4">Score</div>
                            <div className="col-1-4">UserName</div>
                        </div>
                        {this.props.games.map(renderGame)}
                    </div>
                );
            }
        });

        /**
         * Represents the view of the games
         */
        var GamesView = React.createClass({
            getInitialState: function () {
                var that = this;
                /**
                 * Updates the view model by getting data from the server
                 */
                var updateModel = function () {
                    socket.emit('round:getCurrent', {}, function (err, data) {
                        if (err == null) {
                            that.setState({currentRound: data}, function(err, data){
                                //flip through all of the rounds and update
                                for (var i = that.state.currentRound; i > 0; i--) {
                                    var localIteration = i;
                                    socket.emit('round:getGames', {round: i}, function (err, data) {
                                        if (err != null) {
                                            return;
                                        }
                                        else {
                                            that.state.rounds[localIteration] = data;
                                            if(that.state.visibleRound === localIteration){
                                                that.state.games = data;
                                            }
                                            that.setState();
                                        }
                                    });
                                }
                            });

                        }
                    });
                };

                //sign up for events we care about
                socket.on('game:start', function (msg) {
                    updateModel();
                });
                socket.on('game:over', function (msg) {
                    updateModel();
                });
                socket.on('round:increment', function (msg) {
                    updateModel();
                });

                //initialize the current round 1 second after load
                var round = 1;
                setTimeout(function(){
                    socket.emit('round:getCurrent', {}, function (err, data) {
                        if (err == null){
                            that.setState({currentRound: data});
                            updateModel();
                        }
                    });
                }, 1000);

                return {currentRound: round, rounds: [], visibleRound: round, games: []};
            },
            incrementRound: function(){
                socket.emit('round:increment');
            },
            render: function () {
                return (
                    <div className="col-1-2">
                        <div className="grid">
                            <button onClick={this.incrementRound}>Add Round</button>
                            <RoundDropdownView visibleRound={this.state.visibleRound} currentRound={this.state.currentRound}
                                games={this.state.games} rounds={this.state.rounds}/>
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