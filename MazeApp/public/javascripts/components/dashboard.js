define(['react', 'socketio'], function(React, io){

    function Dashboard(){

        var socket = io();

        var GameSnapshotView = React.createClass({

            getInitialState: function(){
                var that = this;
                //start getting updates
                socket.on('game update', function (msg) {
                    var isUpdate = false;
                    that.state.games.forEach(function(game){
                        if (game.username === msg.username) {
                            game.points = msg.points;
                            game.moves = msg.moves;
                            game.mazeHtml = msg.mazeHtml;
                            game.playerName = msg.playerName
                            isUpdate = true;
                        }
                    });
                    if(!isUpdate)
                        that.state.games.push(msg);
                    that.setState();
                });
                return {games: []};
            },

            render: function(){
                var that = this;
                var count = 0;
                var renderGame = function(game){
                    return (
                        <div className="col-1-3" dangerouslySetInnerHTML={{__html: game.mazeHtml}}></div>
                    )
                };
                return(
                    <div className="grid">
                    {this.state.games.length > 0 ? this.state.games.map(renderGame) : "it's lonely..."}
                    </div>
                );
            }
        });

        var SummaryView = React.createClass({
            getInitialState: function(){
                var that = this;
                socket.on('leaders:round', function (msg) {
                    that.state.round = msg.round;
                    that.state.roundLeaders = msg.roundLeaders;
                    that.setState();
                });
                socket.on('leaders:alltime', function (msg) {
                    that.state.allTimeLeaders = msg.allTimeLeaders;
                    that.setState();
                });
                return {currentRound: 1, roundLeaders: [], allTimeLeaders: []};
            },
            render: function(){
               return(
                   <div className="col-1-4">summary to be filled in further</div>
               );
            }
        });

        this.DashboardView = React.createClass({
            render: function(){
                return(
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

    Dashboard.prototype.init = function(){
        React.renderComponent(<this.DashboardView />, document.body)
    };

    return Dashboard;
});