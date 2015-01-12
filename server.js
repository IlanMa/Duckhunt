// this is our server.js file

// require express so that we can build an express app
var express = require('express');
// require http so we can use http request and response stuff
var http = require('http');
// require path so we can use path stuff like path.join
var path = require('path');

// create the express app
// express is a set of tools that allows us to more easily deal with http actions and some other stuff 
// involving setting variables and getting them
var app = express();


// so that we can parse post data through the req.body
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

// allows us to use put, patch, and delete http verbs
var methodOverride = require('method-override');
app.use(methodOverride('X-HTTP-Method-Override'));


// sets up a static file server that points to the client directory 
app.use(express.static(path.join(__dirname, 'client')));

//var mongoose = require('./config/mongoose.js')

var routes = require('./config/routes.js')(app)
// sets the port
app.set('port', 3000);

// starts listening
var server = app.listen(app.get('port'), function(){
    console.log('sup brah')
})

/*#################################################*/

var io = require('socket.io')(server);

var all_players = {};
var all_sockets = [];
var time_left = 0;
var total_players = 0;
var players_ready = 0;
var ducks = [];
var rate = 3000;
var velocity = 5;
var duck_count = 0;
var timer = ''
var messages = [];
var leaderboard = [];
insertBlank()
function insertBlank(){
    for(t=0;t<10;t++){
        leaderboard.push({
            name: "",
            score: -1,
        })
    }
}
io.on('connection', function (socket) {
    socket.on('message', function(data){
        messages.push({
            name: all_players[socket.id].name,
            message: data.message
        })
        socket.emit('all_messages', {messages: messages})
        socket.broadcast.emit('all_messages', {messages: messages})
    })
    function createDuck(){
            ducks.push({
                x: 10,  
                y: Math.floor(Math.random()*100)+100,
                vx: Math.random()*velocity+1,
                vy: Math.random() *(1 - -1 + 1) + -1,
                side: Math.floor(Math.random()*2),
                id: duck_count
            })  
            if (rate > 1000){
                rate -= 100;
                velocity += 1
            }
            socket.emit('duck_created', {ducks: ducks})
            socket.broadcast.emit('duck_created', {ducks: ducks})
            duck_count ++;
            clearInterval(timer)
            timer = setInterval(function(){createDuck()},rate)
            }

    socket.on('new_player', function(data){
        all_players[socket.id] = {
            name: data.player,
            score: 0,
            ready: 0
        }
        socket.emit('leader', {'leader': leaderboard})
        socket.emit('all_messages', {messages: messages})
        socket.broadcast.emit('all_messages', {messages: messages})
        total_players += 1;
        all_sockets.push(socket.id)
        socket.emit('players', {players: all_players, sockets: all_sockets})
        socket.broadcast.emit('players', {players: all_players, sockets: all_sockets})
    })
    socket.on('updated_score', function(data){
        all_players[socket.id].score += data.score
        socket.emit('change_score', {players: all_players, id: socket.id})
        socket.broadcast.emit('change_score', {players: all_players, id: socket.id})
    })
    socket.on('player_ready', function(){
        if (all_players[socket.id].ready == 0){
            all_players[socket.id].ready = 1
            players_ready += 1;
            socket.emit('change_color', {id: socket.id})
            socket.broadcast.emit('change_color', {id: socket.id})
            if (players_ready == total_players){
                time_left = 10;
                socket.emit('start_game', {all_id: all_sockets})
                socket.broadcast.emit('start_game', {all_id: all_sockets})
                createDuck();
                for (v=0; v<total_players;v++){
                    all_players[all_sockets[v]].score = 0
                }
                var time_interval = setInterval(function(){
                    socket.emit('new_time', {time: time_left, id: socket.id})
                    socket.broadcast.emit('new_time', {time: time_left})
                    time_left -= 1
                    if (time_left == -1){
                        clearInterval(time_interval)
                        clearInterval(timer)
                        players_ready = 0;
                        ducks = [];
                        rate = 3000;
                        velocity = 5;
                        duck_count = 0;
                        for (p=0; p<total_players;p++){
                            all_players[all_sockets[p]].ready = 0
                            socket.emit('change_to_red', {id: all_sockets})
                            socket.broadcast.emit('change_to_red', {id: all_sockets})
                        }
                        setTimeout(function(){
                            for (q=0; q<total_players;q++){
                                 leaderboard.push({
                                    name: all_players[all_sockets[q]].name,
                                    score: all_players[all_sockets[q]].score
                                })
                            }
                            var max = all_players[all_sockets[0]].score
                            var winner_id = all_sockets[0]
                            var winner_name = all_players[all_sockets[0]].name
                            for (r=0; r<total_players;r++){
                                if (max < all_players[all_sockets[r]].score){
                                    max = all_players[all_sockets[r]].score
                                    winner_id = all_sockets[r]
                                    winner_name = all_players[all_sockets[r]].name
                                }
                            }
                            leaderboard.sort(compare);
                            socket.emit('winner', {name: winner_name, id: winner_id, max: max})
                            socket.broadcast.emit('winner', {name: winner_name, id: winner_id, max: max}) 
                            socket.emit('leader', {'leader': leaderboard})
                            socket.broadcast.emit('leader', {'leader': leaderboard})
                        }, 1520)
                    }
                },1000)
            }
        }
    })
    function compare(a,b) {
      if (a.score > b.score)
         return -1;
      if (a.score < b.score)
        return 1;
      return 0;
    }
    socket.on('duck_was_clicked', function(data){
        socket.emit('remove_clicked_duck', {id: data})
        socket.broadcast.emit('remove_clicked_duck', {id: data, users: all_players, display: socket.id})
    })
    socket.on('disconnect', function(){
        var prop = socket.id
        if(all_players[prop]){
            if(all_players[prop].ready == 1){
                players_ready -= 1;
            }
        }
        total_players -= 1;
        delete (all_players[prop])
        var index = all_sockets.indexOf(prop)
        if(all_sockets[index]){
            all_sockets.splice(index, 1)
        }
        socket.broadcast.emit('players', {players: all_players, sockets: all_sockets})
    })
})