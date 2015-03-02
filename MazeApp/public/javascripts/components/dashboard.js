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
                                <div className='col-1-3'>Points: {game.points}</div>
                            </div>

                            <div dangerouslySetInnerHTML={{__html: game.mazeHtml}}  ></div>
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

            render: function() {
                var items = this.state.allTimeLeaders.map(function (item, i) {
                    var style = {  background: i % 2 ? 'lightblue' : null};
                    return <tr style={style}><td id="td-2">{item.userName}</td><td id="td-2">{item.round}</td><td id="td-2">{item.points}</td></tr>;
                });
                return (
                <div >
                    <div className="summarySectionTitle">All Time Leaders</div>
                    <table id="table-2">
                        <thead><th>Player</th><th>Round</th><th>Score</th></thead>
                        {items}
                    </table>
                </div>
                );
            }
            
            //render: function () {
            //    return (
            //        <div>
            //            <div className="summarySectionTitle">Overall Leaders</div>
            //            {this.state.allTimeLeaders.length > 0 ? this.state.allTimeLeaders.map(renderGame) : "No data"}
            //        </div>
            //    );
            //}
        });

        var RoundLeaderView = React.createClass({
            getInitialState: function () {
                var that = this;

                socket.on('game:over', function () {
                    socket.emit('round:getLeaders', {take: 5}, function (err, data) {
                        if (err == null){
                            that.state.roundLeaders = data;
                            that.setState();
                        }
                    });
                });

                return {roundLeaders: []};
            },

            componentDidMount: function() {
                var that = this;

                socket.emit('round:getLeaders', {take: 5}, function (err, data) {
                    if (err == null){
                        that.state.roundLeaders = data;
                        that.setState();
                    }
                });
            },

            render: function() {
                var items = this.state.roundLeaders.map(function (item, i) {
                    var style = {background: i % 2 ? 'lightblue' : null};
                    return <tr style={style}><td id="td-2">{item.userName}</td><td id="td-2">{item.round}</td><td id="td-2">{item.points}</td></tr>;
                });
                return <div className="summaryTable">
                    <div className="summarySectionTitle">Current Round Leaders</div>
                    <table id="table-2">
                    <thead><tr><th>Player</th><th> Round</th><th> Score</th></tr></thead>
                {items}
                </table>
                </div>
            }
            
            
            //render: function () {
            //    return (
            //        <div>
            //            <div className="summarySectionTitle">Current Round Leaders</div>
            //            {this.state.roundLeaders.length > 0 ? this.state.roundLeaders.map(renderGame) : "No data"}
            //        </div>
            //    );
            //}


        });


        var PreviousWinnersView = React.createClass({
            getInitialState: function () {
                var that = this;
                //need listeners
                socket.on('game:over', function () {
                    that.updateModel();
                });
                socket.on('round:increment', function () {
                    that.updateModel();
                });
                return {lastRoundWinners: [], olderRoundWinners: [], currentRound: 0}
            },

            componentDidMount: function() {
                var that = this;
               that.updateModel();
            },

            updateModel: function() {
                var that = this;
                socket.emit('round:getCurrent', {}, function (err, data) {
                        if (err == null){
                            that.setState({currentRound: data});
                            that.updateModel();
                        }
                });

                socket.emit('round:getLeaders', {take: 3, round: that.state.currentRound - 1}, function (err, data) {
                    if (err == null){
                        that.state.lastRoundWinners = data;
                        that.setState();
                    }
                });

                socket.emit('round:getLeaders', {take: 3, round: that.state.currentRound - 2}, function (err, data) {
                    if (err == null){
                        that.state.olderRoundWinners = data;
                        that.setState();
                    }
                });
            },
            render: function () {
                var items = this.state.lastRoundWinners.concat(this.state.olderRoundWinners).map(function (item, i) {
                    var style = {background: i % 2 ? 'lightblue' : null};
                    return <tr style={style}><td id="td-2">{item.userName}</td><td id="td-2">{item.round}</td><td id="td-2">{item.points}</td><td id="td-2">{item.prizeAwarded.toString()}</td></tr>;
                });
                var headers = this.state.lastRoundWinners.map(function (item, i) {
                    return ;
                });
                //var headers = ["Player", "Round", "Prize Awarded"];
                var newitems =  items.concat(headers);
  //              return <div>{headers}</div>;
                return (
                    
                    <div > <div className="summarySectionTitle">Previous Round Winners</div>
                        <table id="table-2">
                        <thead ><th>Player</th><th>Round</th><th>Score</th><th>Prize Awarded</th></thead>
                        {items}
                   </table>
                    </div>
                );
            }
            //render: function () {
            //    return(
            //        <div>
            //            <div className="summarySectionTitle">Previous Round Winners</div>
            //          {this.state.lastRoundWinners.concat(olderRoundWinners).length > 0 ? this.state.lastRoundWinners.concat(olderRoundWinners).map(renderGame) : "No data"}
            //            <br/>
            //            <br/>
            //          {this.state.olderRoundWinners.length > 0 ? this.state.olderRoundWinners.map(renderGame) : "No data"}
            //
            //        </div>
            //    );
            //}
        })

        var SummaryView = React.createClass({
            getInitialState: function () {

                return {currentRound: 1, roundLeaders: [], allTimeLeaders: []};
            },
            render: function () {
                return (
                    <div>
                        <div className="summarySection">
                            <RoundLeaderView/>
                        </div>
                        <div className="summarySection">
                            <PreviousWinnersView/>
                        </div>
                        <div className="summarySection">
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