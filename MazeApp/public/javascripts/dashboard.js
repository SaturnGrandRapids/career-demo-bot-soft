var scoreboardData = [];
var socket = io();

socket.on('game update',function(msg){
    var isUpdate = false;
    $(scoreboardData).each(function(){
        if(this.username === msg.username){
            this.points = msg.points;
            this.mazeHtml = msg.mazeHtml;
            this.playerName = msg.playerName
            isUpdate = true;
        }
    });
    if(!isUpdate){
        scoreboardData.push(msg);
    }
    rebuildScoreboard();
});

function rebuildScoreboard(){
    $('.dashboard').empty();
    $(scoreboardData).each(function(){
        $('.dashboard').append('<div>' + this.mazeHtml + this.username + this.playerName + '</div>');
    });
}
