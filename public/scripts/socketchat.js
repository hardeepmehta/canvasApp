var socket = io.connect();
var localStream, localPeerConnection, remotePeerConnection, x, y, remoteStream;
var globalVideo, globalStream, globalClose;
$(document).ready(function(){
	var canvas = document.getElementById('imageView');
	var context = canvas.getContext('2d');
	var video = $('#local-video');
	var width = (895/1301) * window.innerWidth;
	var height = (555.59/700) * window.innerHeight;
	var left = window.innerWidth/2 - width/2;
	var top = window.innerHeight/2 - height/2;
	var icontop = height - 93;
	var elem = video.find('video')[0];
	$('#toolbar').css({
		'position': 'relative',
		'top': icontop
	});
	x=top;
	y=height;
	$('input').eq(0).focus();
	//FULL SCREEN MODE
	globalClose = function(){
		socket.emit('force-disconnect',true);
		$('body').html('<div id="left-notification">You have successfully left the group</div>');
		localStream.stop();
		if(remoteStream!=undefined)
		{
			remoteStream.stop();
		}
		localPeerConnection=null;
		remotePeerConnection=null;
	};
	$('#icons-tools div').eq(0).on('click',function(e){
		if (globalVideo.requestFullscreen) {
		  globalVideo.requestFullscreen();
		} else if (globalVideo.msRequestFullscreen) {
		  globalVideo.msRequestFullscreen();
		} else if (globalVideo.mozRequestFullScreen) {
		  globalVideo.mozRequestFullScreen();
		} else if (globalVideo.webkitRequestFullscreen) {
		  globalVideo.webkitRequestFullscreen();
		}	
	});
	//FULL SCREEN MODE ENDS
	//REMOTE VIDEO STOP
	$('#icons-tools div').eq(1).on('click',function(e){
		 globalStream.getVideoTracks()[0].enabled =
         !(globalStream.getVideoTracks()[0].enabled);
	});
	//REMOTE VIDEO STOP ENDS
		//REMOTE AUDIO STOP
	$('#icons-tools div').eq(2).on('click',function(e){
		console.log('clicked!!');
		 localStream.getAudioTracks()[0].enabled =
         !(localStream.getAudioTracks()[0].enabled);
         elem.muted = !elem.muted;
	});
	//REMOTE AUDIO STOP ENDS
	//4th Button is clicked
	$(document).on('click','#icons-tools div:eq(3)',function(e){
		console.log('drop call clicked!!');
		globalClose();
	});
	//4th button is clicked --ENDS
	video.css({
		'width': width,
		'height': height,
		'left': left,
		'top': top
	});
	resizeUserPrompt();
	takeUserInput();	
	socket.on('available',function(data){
		console.log('New member has joined the room..');
		console.log(data);
		});
	socket.on('first-user',function(data){
		console.log('You are the first user..'+data);
		getSource();
	});

	socket.on('get-sink',function(data){
		console.log('You are NOT the first user..'+data);
		getSink();
	});

	socket.on('dimensions-start', function(dimensions) {
		var x = dimensions.x;
		var y = dimensions.y;
		context.beginPath();
		context.moveTo(x,y);
	});

	socket.on('dimensions-move', function(dimensions) {
		var x = dimensions.x;
		var y = dimensions.y;
		context.lineWidth = dimensions.lineWidth;
		context.strokeStyle = dimensions.strokeStyle;
		window.dimensions = dimensions;
		context.lineTo(x,y);
		context.stroke();
	});

//FUNCTIONS START
	function failure(){
		console.log('Sorry...Could not get the video !!!');
	}

	function resizeUserPrompt()
	{
		var userPrompt = $('#username-prompt');
		var left = window.innerWidth/2 - 250;
		var top = window.innerHeight/2 - 100;
		userPrompt.css({
			'position': 'absolute',
			'top': top,
			'left': left
		});
		userPrompt.addClass('fadeInDownBig');
	}
	function takeUserInput()
	{
		var userPrompt = $('#username-prompt');
		userPrompt.find('form').submit(function(e){
			e.preventDefault();
			var input = $.trim($(this).find('input').eq(0).val());
			if(input==='')
			{
				userPrompt.find('#errors').removeClass().addClass('wrong').text('You cannot leave it blank.');
			}
			else
			{
				userPrompt.find('#errors').removeClass().addClass('correct').text('Thank You..');
				setTimeout(function(){
					userPrompt.removeClass('fadeInDownBig').addClass('fadeOutUpBig');
					setTimeout(function(){
						userPrompt.hide();
					},1000);
				},1000);
				socket.emit('username',input);
			}
		});
	}

	function getSource()
	{
		console.log('Inside getSource function...');
		$('#canvasView').fadeIn(1000);
		loadCanvas();
	}

	function getSink()
	{
		console.log('You must be sink..');
		$('#canvasView').fadeIn(1000);
	}

	function loadCanvas() {
		$('#btn-panel').fadeIn(500);
		var clickBool = false;
		window.lineWidth = 5;
		window.strokeStyle = "#000";
		$('#imageView').on('mousedown', function(ev) {
			window.ev = ev;
			var x = ev.clientX;
			var y = ev.clientY;
			clickBool = true;
			context.beginPath();
			context.moveTo(x,y);
			var dimensions = {
				x: x,
				y: y
			};
			socket.emit('dimensions-start',dimensions);
		});

		$('#imageView').on('mousemove', function(ev) {
			if(clickBool) {
				var x = ev.clientX;
				var y = ev.clientY;
				context.lineTo(x,y);
				context.lineWidth = lineWidth;
				context.strokeStyle = strokeStyle;
				var dimensions = {
					x: x,
					y: y,
					lineWidth: lineWidth,
					strokeStyle: strokeStyle
				};
				socket.emit('dimensions-move',dimensions);
				context.stroke();
			}
		});

		$('#imageView').on('mouseup', function(ev) {
			clickBool = false;
		});

		$('#pencil').on('click', function() {
			window.lineWidth = 5;
			window.strokeStyle = "#000";
		});

		$('#erasor').on('click', function() {
			window.lineWidth = 15;
			window.strokeStyle = "#fff";
		});
	}
		
});

