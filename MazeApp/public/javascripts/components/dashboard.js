define(['react', 'socketio'], function (React, io) {

    function Dashboard() {

        var socket = io();

        var GameSnapshotView = React.createClass({

            getInitialState: function () {
                var that = this;
                //start getting updates
                socket.on('game:update', function (msg) {
                    var isUpdate = false;
                    that.state.games.forEach(function (game) {
                        if (game._id === msg._id) {
                            game.points = msg.points;
                            game.moves = msg.moves;
                            game.mazeHtml = msg.mazeHtml;
                            game.userName = msg.userName;
                            isUpdate = true;
                        }
                    });
                    if (!isUpdate)
                        that.state.games.push(msg);
                    that.setState();
                });
                socket.on('game:over', function (msg) {
                    for (var i = 0; i < that.state.games.length; i++) {
                        if (that.state.games[i]._id === msg._id) {
                            that.state.games.splice(i, 1);
                        }
                    }
                    that.setState();
                });

                return {games: []};
            },

            render: function () {
                var that = this;
                var count = 0;
                var renderGame = function (game) {
                    return (
                        <div className='col-1-3' >
                            <div className='grid'>
                                <div className='col-1-3'>{game.userName}</div>
                                <div className='col-1-3'>Round {game.round}</div>
                            </div>

                            <div dangerouslySetInnerHTML={{__html: game.mazeHtml}} className='col-2-3' ></div>
                        </div>
                    )
                };
                return (
                    <div className="grid">
                    {this.state.games.length > 0 ? this.state.games.map(renderGame) : "it's lonely..."}
                    </div>
                );
            }
        });

        var renderGame = function (game) {
            return (
                <div>{game.userName} + {game.round} + {game.points}</div>
            )
        };


        var LeaderBoardView = React.createClass({
            getInitialState: function () {
                var that = this;

                socket.on('game:over', function () {
                    socket.emit('game:getOverallLeaders', {take: 5}, function (err, data) {
                        if (err == null){
                            that.state.allTimeLeaders = data;
                            that.setState();
                        }
                    });
                });

                return {allTimeLeaders: []};
            },

            componentDidMount: function() {
                var that = this;

                socket.emit('game:getOverallLeaders', {take: 5}, function (err, data) {
                    if (err == null){
                        that.state.allTimeLeaders = data;
                        that.setState();
                    }
                });


            },

            render: function () {
                return (
                    <div>
                        {this.state.allTimeLeaders.length > 0 ? this.state.allTimeLeaders.map(renderGame) : "No data"}
                    </div>
                );
            }


        });

        var SummaryView = React.createClass({
            getInitialState: function () {
                var that = this;
                socket.on('leaders:round', function (msg) {
                    that.state.round = msg.round;
                    that.state.roundLeaders = msg.roundLeaders;
                    that.setState();
                });

                return {currentRound: 1, roundLeaders: [], allTimeLeaders: []};
            },
            render: function () {
                return (
                    <div>SUMMARIES ALL NEEED CSS VOODOO
                        <div className="summarySection">
                            <div className="summarySectionTitle">Current Round Leaders (temp: really just all)</div>
                        </div>
                        <div className="summarySection">
                            <div className="summarySectionTitle">Previous Round Winners (temp: really just all)</div>
                        </div>
                        <div className="summarySection">
                            <div className="summarySectionTitle">Overall Leaders</div>
                            <LeaderBoardView/>
                        </div>
                    </div>
                );
            }
        });

        this.DashboardView = React.createClass({
            render: function () {
                return (
                    <div className="grid">
                        <div className="col-2-3">
                            <GameSnapshotView />
                        </div>
                        <div className="col-1-3">
                            <SummaryView />
                        </div>
                    </div>
                );
            }
        });
    }

    Dashboard.prototype.init = function () {
        React.renderComponent(<this.DashboardView />, document.body)
    };

    return Dashboard;
});