var scoreboardData = [];
var socket = io();

socket.on('game over',function(msg){
    var isUpdate = false;
    $(scoreboardData).each(function(){
        if(this.username === msg.username){
            this.points = msg.points;
            this.moves = msg.moves;
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
 //   $('.halloffame').append('<div class="halltable">');
    $(scoreboardData).each(function(){
        $('.halloffame').append('<tr><td text-align:left>' + this.playerName + '</td><td align="right">' + this.points + '</td><td align="right">' + this.moves + '</td><td>       ' + this.username     +'</td></tr>');
    });
 //   $('.halloffame').append('</div>');
}
