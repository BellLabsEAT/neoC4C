//import { rejects } from "assert";

var samples = [];
var sampleNum = 7;
var started = false;
let curSamp;
var loaded;
var noSleep = new NoSleep();
var dummyaudio = new Audio();
var startTime;
var loadtime;
var biglat;
var big;
var BAN_ID = "c4c"; 

function preload(){
  //dummyaudio.src = "confuse.wav";
	//dummyaudio.loop = true;
}

function setup() {
	biglat = 0;
	big = false;
	big = getQueryVariable("big")
	var newID = getQueryVariable("ban")
	if(newID!=false){
		console.log("new ban is " + newID)
		BAN_ID = newID;
	}
	var d = new Date();
	startTime = d.getSeconds();
	loaded = 0;
  curSamp = "1"
	//sample1.playMode('sustain');

	//canvas stuff
	loadSamples();
	createCanvas(350, 700);
  text('Loading C4C...', 10, 10);
  //background(255, 0, 0);
  listenToWWSDataWithStomp();
}

/*
document.addEventListener("touchstart", function(){
	console.log("clicked")
  if(!started){
		console.log("clicked!")
		dummyaudio.play();
	}
});
*/
function loadSamples(){
	
	samples[0] = loadSound('c1.wav', progress)
	samples[1] = loadSound('c2.wav', progress)
	samples[2] = loadSound('eb1.wav', progress)
	samples[3] = loadSound('g1.wav', progress)
	samples[4] = loadSound('Counting.wav', progress)
	samples[5] = loadSound('fields1.wav', progress)
	samples[6] = loadSound('fields2.wav', progress)
	if(big){
		console.log("big true");
	samples[7] = loadSound('Bei.wav', progress)
	samples[8] = loadSound('NYC.wav', progress)
	}
	for(var i = 0; i < sampleNum; i++){
		samples[i].playMode('sustain');
	}
}

function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

function draw(){

	if(loaded<sampleNum){
		//console.log("drawing");
		clear();
		stroke(0, 0, 0);
		noFill();
		rect(30, 30, 500, 80);
		

		noStroke();
		fill(0, 0, 255);
		rect(30, 30, 500*loaded/sampleNum, 80);
		var d = new Date();
		var s = d.getSeconds()-startTime;
		textSize(32);
		loadtime = s;
		text('Loading time: ' + s, 100, 170);
		console.log(s);
	}
}

function progress(){
	loaded++;
	if(loaded>=sampleNum){
		clear();
		fill(0, 0, 0)
		textSize(32);
		text('Welcome to C4C! Turn up your volume and ouch anywhere to begin', 10, 30, 350, 600);
	}
}


function play(){
	/*
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
	*/
	var index = parseInt(curSamp) - 1;
	samples[index].play();
}

function mousePressed() {
	if(loaded>=sampleNum&&!started){
		clear();
		text('Keep your phone open and Listen to the music', 10, 30, 350, 600);
		play();
		//dummyaudio.play();
		noSleep.enable();
		//started = true;
	}
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
	//const url = "ws://stream_bridge_user1:WWS2016@54.154.131.1:15674/ws"
	//EAT
	const url = "ws://stream_bridge_user1:WWS2016@34.237.136.223:15674/ws"

	const exchange = "/exchange/data/";

	// Check if we have a BAN_ID provided as an URL parameter




	let client = Stomp.client(url);

	function onError() {
		console.log('Stomp error');
		listenToWWSDataWithStomp();
	}

	function onConnectListener(x) {
		console.log("Listening to " + BAN_ID);

		//client.subscribe(exchange+BAN_ID+".motion.sleeve", function(msg) {
    client.subscribe(exchange+BAN_ID, function(msg) {
			// Update motion information
			console.log(msg.body);
			let data = JSON.parse(msg.body);
			curSamp = data.imagename;
			console.log(data.imagename);

			//Latency display
			clear();
			var d = new Date();
			console.log(d.getTime() - data.time);
			var lat = d.getTime() - data.time;
			if(lat>biglat){
				biglat = lat;
			}
			text('Latency:  ' + lat, 100, 170);
			text('Loaded Time:  ' + loadtime, 100, 270);
			text('Top Lat:  ' + biglat, 100, 370);

			play();

		});
	}

	client.connect("stream_bridge_user1", "WWS2016", onConnectListener, onError, "/test");
}


/*
<audio loop>
      <source src="horse.mp3" type="audio/mpeg">
    Your browser does not support the audio element.
		</audio>
		*/