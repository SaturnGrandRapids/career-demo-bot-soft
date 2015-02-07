var scoreboardData = [];
var socket = io();

socket.on('game over',function(msg){
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
    rebuildHallOfFame();
});
//TODO: Sort these results and present them in a nicer layout
function rebuildHallOfFame(){
    $('.halloffame').empty();
    $('.halloffame').append('<h1>The Amazing Maze Challenge Hall of Fame</h1>');

    $(scoreboardData).each(function(){
        $('.halloffame').append('<div>' + this.playerName + ':  ' + this.points + '         ' + this.username     +'</div>');
    });
}
