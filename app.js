var express = require('express');
var app = express();
app.set('port', (process.env.PORT || 5000));
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var util = require('util');
var rooms = [];
var users = {};
var socketio;
var trimmed;
server.listen(app.get('port'), function() {
	console.log("Node app is running at localhost:" + app.get('port'))
});
console.log('App started at port...5000');
app.use(express.static(__dirname + '/public'));
app.get('/',function(req,res){
	res.sendfile(__dirname+'/public/404.html');
});
app.get('/:key',function(req,res){
	trimmed = req.params.key.trim();
	if (req.url === '/favicon.ico')
	{
		res.writeHead(200, {'Content-Type': 'image/x-icon'} );
		res.end();
		return;
	}
	else
	{
		res.sendfile(__dirname+'/public/public.html');
	}

});
io.sockets.on('connection',function(socket){
	socket.key = trimmed;
	console.log('Room is '+socket.key);
	socket.on('disconnect',function(){
		if(socket.username === undefined)
		{
			console.log('User has disconnected!! without using the product!!');
		}
		else
		{
			console.log(socket.username + ' has disconnected!!');
			if(rooms.length > 0)
			{
				removeUserKey(socket.username,socket.users[socket.username],socket);
			}
		}

	});
	//Getting Username
	socket.on('username',function(data){
		console.log(data+' just joined..');
		addUserKey(data,socket);
	});

	socket.on('checked-stream',function(data){
		console.log('Inside checked stream!!');
		if(users[socket.key].length>1)
		{
			socket.broadcast.to(socket.key).emit('available',users[socket.key]);
		}
	});

	socket.on('dimensions-start', function(dimensions) {
		socket.broadcast.to(socket.key).emit('dimensions-start',dimensions);
	});

	socket.on('dimensions-move', function(dimensions) {
		socket.broadcast.to(socket.key).emit('dimensions-move',dimensions);
	});


});
//FUNCTIONS----start
function addUserKey(data,socket)
{
	if(rooms.indexOf(socket.key) === -1)
	{
		console.log('Generating new key!!');
		rooms.push(socket.key);
		users[socket.key]=[data];
		socket.users = {} ;
		socket.users[data] = socket.key;
		socket.username= data;
		socket.join(socket.key);
		console.log('Socket joins a room.');
		console.log('Adding socket.username --->'+ socket.username);
		console.log('Adding socket.users[data] --->'+socket.users[data]);
		console.log('Yes..this is the first user..!!');
		socket.emit('first-user',socket.username);
	}
	else
	{
		users[socket.key].push(data);
		console.log('Now rooms array is '+JSON.stringify(rooms));
		console.log('Now users array is '+JSON.stringify(users));
		socket.users = {};
		socket.users[data] = socket.key;
		socket.username= data;
		socket.join(socket.key);
		socket.emit('get-sink',socket.username);
	}

}

function removeUserKey(username,key,socket)
{
	console.log('Deleting inside removeUserKey() function...');
	users[socket.key].splice(users[socket.key].indexOf(username),1);
	if(users[socket.key].length === 0)
	{
		delete users[socket.key];
		rooms.splice(rooms.indexOf(username),1);
	}
	console.log('Now rooms array is '+JSON.stringify(rooms));
	console.log('Now users array is '+JSON.stringify(users));

}

//FUNCTIONS----end

