define(['react', 'socketio'], function(React, io){

    var socket = io();

    function Admin() {

        var MessageView = React.createClass({
            render: function(){

                var renderMessage = function(message){
                    return <div>{message}</div>
                };

                return(
                  <div>{this.props.messages.map(renderMessage)}</div>
                );
            }
        });

        this.AdminView = React.createClass({

            getInitialState: function(){
                var that = this;
                socket.on('game update', function (msg) {
                    that.state.messages.push('game update from ' + msg.playerName)
                    that.setState();
                });
                return {messages: []};
            },

            render: function () {
                return (
                    <div>
                        <MessageView messages={this.state.messages} />
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