let sample1;
let sample2;
let sample3;
let sample4;
let curSamp;
var noSleep = new NoSleep();

function preload(){
  sample1 = loadSound('happy.wav');
  sample2 = loadSound('confuse.wav');
  sample3 = loadSound('sad.wav');
  sample4 = loadSound('duoSynth.wav');
}
function setup() {
  curSamp = "1"
	sample1.playMode('sustain');

	//canvas stuff
	createCanvas(720, 200);
	textSize(32);
	text('Welcome to C4C! Touch anywhere to begin!', 10, 30);
  
  //background(255, 0, 0);
  listenToWWSDataWithStomp();
}



function play(){
  if(curSamp=="1"){
    sample1.play();
  }
  if(curSamp=="2"){
    sample2.play();
  }
  if(curSamp=="3"){
    sample3.play();
  }
  if(curSamp=="4"){
    sample4.play();
  }
}

function mousePressed() {
	clear();
  text('Keep your phone open and Listen to the music', 10, 30);
	play();
	noSleep.enable();
}

// Simple function for generating readable timestamps (in local timezone)
function generateReadableTimestamp(timestamp) {
	let dateTime = new Date(timestamp);

	let hours   = dateTime.getHours();
	let minutes = dateTime.getMinutes();
	let seconds = dateTime.getSeconds();
	let msecs   = dateTime.getMilliseconds();

	let hourString = (hours < 10) ? "0" + hours : "" + hours;
	let minuteString = (minutes < 10) ? "0" + minutes : "" + minutes;
	let secondString = (seconds < 10) ? "0" + seconds : "" + seconds;
	let msecsString = (msecs < 10) ? "00" + msecs : (msecs < 100) ? "0" + msecs : msecs;

	let result = hourString + ":" + minuteString + ":" + secondString + "." + msecsString;
	// console.log("Readable timestamp: " + result);
	return result;
}


// STOMP-based stream listener (no polling)
function listenToWWSDataWithStomp() {

//	const url = "ws://stream_bridge_user1:WWS2016@194.137.84.174:15674/ws";
	//const url = "ws://stream_bridge_user1:WWS2016@34.241.186.209:15674/ws";
  //const url = "ws://stream_bridge_user1:WWS2016@135.112.86.21:15674/ws";
	//const url = "ws://stream_bridge_user1:WWS2016@10.12.82.58:5672/ws"
	
	//MH
	//const url = "ws://stream_bridge_user1:WWS2016@10.4.82.58/ws"
	//Paris
	const url = "ws://stream_bridge_user1:WWS2016@54.154.131.1:15674/ws"
	const exchange = "/exchange/egress_exchange/";

	// Check if we have a BAN_ID provided as an URL parameter
	let BAN_ID = "c4c"; 




	let client = Stomp.client(url);

	function onError() {
		console.log('Stomp error');
	}

	function onConnectListener(x) {
		console.log("Listening to " + BAN_ID);

		//client.subscribe(exchange+BAN_ID+".motion.sleeve", function(msg) {
    client.subscribe(exchange+BAN_ID+'.button.sleeve', function(msg) {
			// Update motion information
			console.log(msg.body);
			let data = JSON.parse(msg.body);
			curSamp = data.imagename;
			console.log(data.imagename);
			play();

		});
	}

	client.connect("stream_bridge_user1", "WWS2016", onConnectListener, onError, "/test");
};

listenToWWSDataWithStomp();