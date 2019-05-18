//import { rejects } from "assert";

var samples = [];
var sampleNum = 5;
var started = false;
let curSamp;
var loaded;
//var noSleep = new NoSleep();
var dummyaudio = new Audio();
var startTime;
var loadtime;
var biglat;
var big;
var BAN_ID = "c4c";
var neo = true;
var connectAttempts;



/*
HAIP-related information: change values according to HAIP server address,
calibration / room size, and tags available.
*/
console.log("hello worldo")

var HAIP_SERVER_IP = "135.222.247.168";
var HAIP_SERVER_PORT = "18080";
var boundaries = {"x1": 0, "y1": 4, "y2": 8, "y3": 12}; // used to group HAIP x- and y-coordinates into zones
var tags = {"1001": true, "1002": true, "1003": true, "1004": true,
	"1005": true, "1006": true, "1007": true, "1008": true}; // **REPLACE** with all valid tag numbers

/*
Audio-related information: change values based on IP addresses of audio stream sources.
Streams are ordered such that audio_streams[m] corresponds with zone m-1.
*/
var audio_streams = ["http://52.15.74.163:8000/phono", "http://18.191.241.173:8000/phono",
	"http://18.218.48.101:8000/phono", "http://3.16.216.43:8000/phono", "http://18.216.106.143:8000/phono",
	"http://18.222.219.131:8000/phono", "http://3.16.143.147:8000/phono", "http://18.216.55.97:8000/phono"]; //audio streams using AWS EC2

//var audio_streams = ["http://18.224.190.207:8000/phono", "http://18.224.252.102:8000/phono",
//	"http://3.16.129.93:8000/phono", "http://18.218.85.251:8000/phono", "http://18.191.23.151:8000/phono",
//	"http://18.222.219.131:8000/phono", "http://3.16.143.147:8000/phono", "http://18.216.55.97:8000/phono"]; //audio streams using AWS EC2

// var audio_streams = ["http://c4cpis.ddns.net:1/phono", "http://c4cpis.ddns.net:2/phono",
// 	"http://c4cpis.ddns.net:3/phono", "http://c4cpis.ddns.net:4/phono", "http://c4cpis.ddns.net:5/phono",
// 	"http://c4cpis.ddns.net:6/phono", "http://c4cpis.ddns.net:7/phono", "http://c4cpis.ddns.net:8/phono"]; // DDNS through No-IP.com
// var audio_streams = ["http://192.168.1.201:8000/phono", "http://192.168.1.202:8000/phono", 
// 	"http://192.168.1.203:8000/phono", "http://192.168.1.204:8000/phono", "http://192.168.1.205:8000/phono",
// 	"http://192.168.1.206:8000/phono", "http://192.168.1.207:8000/phono", "http://192.168.1.208:8000/phono"]; // c4c

/*
User information: should not be changed. Includes variables referencing the user's tag
and zone numbers and current audio source.
*/
var tag_no;
var zone_no;
var room;
var startTime;
var enteringFirstTime = false;
var audio = new Audio();

new p5();

function setup() {
	connectAttempts = 0;
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
  curSamp = "34"
	//sample1.playMode('sustain');

	//canvas stuff
	
	//load samples
	
	//createCanvas(350, 700);
	//background(255, 0, 0);
  //text('Loading C4C...', 10, 10);
  
	//listenToWWSDataWithStomp();
	room = getUrlVars()["room"];
	//console.log(room)
	//Check whether a variable has been passed via reload function
	if(room>1000){
		tag_no = room;
		login();
	}
	document.getElementById("attempted_login").value = "";

}




/*
Attempts to login based on inputted tag number. Button is only activated if the inputted value is
a valid tag number (as defined in tags).  Zone (and the tags array) can be toggled to work with HAIP or to be
based on seat number based on which zone_no definition you use. The current non-localization format uses tags
numbered 1001-100n where n is the number of zones being used. 
*/
function attempt_activate_button() {
	//enteringFirstTime = true
	console.log("entering")
	tag_no = document.getElementById("attempted_login").value;
	if (tags[tag_no]) {
		document.getElementById("button").disabled = false; // enables ENTER button
	}
	else {
		document.getElementById("button").disabled = true;
	}
}

/*
Changes layout of page to reflect that you have logged in and starts audio, picking the stream based on zone_no.
User interaction at this point allows control over the streams being played over mobile devices (since mobile
browsers block autoplay of A/V sources in order to save data). Unfortunately, this means that refreshing the
page will require users to re-input their tag number, as "logging in" does not take you to another page.
*/
function login() {
	document.getElementById("login").style.display = "none"; // hides login page divs
	document.getElementById("player_info").style.display = "block"; // shows player page divs
	// zone_no = get_zone_no(tag_no); // used for HAIP localization zone definitions
	zone_no = tag_no - 1000; // used for non-localization zone definitions
	if(enteringFirstTime){
		console.log("reload")
		reloadRoom();
	} else{
		console.log("picking stream")
		pick_stream(zone_no); // picks initial stream based on zone
		if(!neo){
			audio.play();
		}
		//begin();
		document.getElementById("information").innerHTML = "Now playing stream " + zone_no + " for performance..."; // used for testing purposes
	}
}

/*
Picks appropriate audio source given zone number based on the logic that audio_streams[m] corresponds
with zone m-1.
*/
function pick_stream(zone_no) {
	console.log("network state " + audio.networkState)
	console.log("ready state " + audio.readyState)
	BAN_ID = tag_no;
	if(neo){
		loadSamples();
		changeToNeo();
	}
	else{
		changeToOG();
	}
	
}

function changeToNeo(){
	audio.pause();
	dummyaudio.play();
	neo = true;
	listenToWWSDataWithStomp();
}

function changeToOG(){
	neo = false;
	audio.src = audio_streams[zone_no - 1];
	audio = new Audio(audio_streams[zone_no - 1])
	dummyaudio.pause();
	audio.play();
}


//Added by Ethan to handle various timing events
function begin(){
	//console.log(tag_no)
	var d = new Date();
	startTime = d.getTime();
	
	for(var i = 0; i<500; i++){
		
		setTimeout(console.log, i*1000, "network state " + audio.networkState);
		setTimeout(console.log, i*1000, "ready state " + audio.readyState)
		//setTimeout(console.log, i*1000, "buffered state " + audio.buffered.end(0))
		setTimeout(console.log, i*1000, "volume " + audio.volume)
		setTimeout(console.log, i*1000, "ct " + audio.currentTime)
		setTimeout(console.log, i*1000, "dur " + audio.duration)
		setTimeout(console.log, i*1000, "er " + audio.error)
		setTimeout(console.log, i*1000, "pr " + audio.preload)
		setTimeout(console.log, i*1000, "sr " + audio.src.length)
	}
	//window.location.reload(true)
	
}

/*
function updateCurrentTime(){
	var d = new Date();
	ct = d.getTime() - startTime;
	audio.currentTime = ct/1000;
}
*/

function reloadRoom(){
	window.location.assign('https://www.c4cstream.com/?room='+tag_no); 
}

//Function borrowed from online
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

/*
Changes audio source if zone number changes. Interval is currently set to 10000ms (10s), but can be
adjusted if a more frequent update rate is preferred. Refresh will not do anything if the updated zone
has not changed. Since non-localization zone definitions are static, this means that refresh() is functionally
inactive when HAIP is not in use.
*/
function refresh() {
	console.log("refresh?")
	setInterval(function() {
		// zone_no = get_zone_no(tag_no); // used for HAIP localization zone definitions
		var old_zone_no = zone_no; // used for non-localization zone definitions
		if (old_zone_no != zone_no) {
			audio.pause();
			pick_stream(zone_no);
			audio.play();
		}
	}, 10000);
}

/*
Determines the zone of a HAIP tag based on its x- and y-coordinates. This (and the boundaries object)
is based on an eight-zone setup, where zones are defined as such:

       x1
 ---------------
|   7   |   8   |
|---------------| y3
|   5   |   6   |
|---------------| y2
|   3   |   4   |
|---------------| y1
|   1   |   2   |
 ---------------
      FRONT

This setup can quickly be changed to work with fewer zones than eight, and can also be redefined for
different setups by changing the logic.
*/
function get_zone_no(tag_no) {
	var request = "http://" + HAIP_SERVER_IP + ":" + HAIP_SERVER_PORT + "/locationOf?MAC=" + tag_no;
	var information = http_GET(request);
	var x = information["x_location"];
	var y = information["y_location"];
	var zone;
	if (x < boundaries["x1"]) {
		if (y < boundaries["y1"]) {zone = 1;}
		else if (y < boundaries["y2"]) {zone = 3;}
		else if (y < boundaries["y3"]) {zone = 5;}
		else {zone = 7;}
	}
	else {
		if (y < boundaries["y1"]) {zone = 2;}
		else if (y < boundaries["y2"]) {zone = 4;}
		else if (y < boundaries["y3"]) {zone = 6;}
		else {zone = 8;}
	}
	return x + " " + y;
}

/*
Places a synchronous request to a server. Used for querying HAIP for the
x- and y-coordinates of a tag in get_zone_no(tag_no).
*/
function http_GET(url) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", url, false); // false for synchronous request
	xmlHttp.send(null);
	var text = xmlHttp.responseText;
	return JSON.parse(text);

	
}




function preload(){
  dummyaudio.src = "samples/silence.wav";
		console.log("samp loaded")
		dummyaudio.loop = true;
}




/*
Initial page setup, solely related to the appearance of the interface.
Clears the login input box every time the user refreshes.

function setup() {
	room = getUrlVars()["room"];
	console.log(room)
	//Check whether a variable has been passed via reload function
	if(room>1000){
		tag_no = room;
		login();
	}
	document.getElementById("attempted_login").value = "";
}
*/



document.body.addEventListener("touchend", function(){
	console.log("clicked")
  if(!started){
		//dummyaudio.autoplay = true;
		console.log("toucheded")
		
		console.log("looped");
		
		dummyaudio.play();

	}
});

function loadSamples(){
	
	samples[34] = loadSound('samples/silence.wav')
	if(tag_no=='1001'){
		samples[0] = loadSound('samples/2_Fields_C4C_Sample1_Stream1.mp3', progress)
		samples[4] = loadSound('samples/2_Fields_C4C_Sample2_Stream1.mp3', progress)
		samples[8] = loadSound('samples/2_Fields_C4C_Sample3_Stream1.mp3', progress)
		samples[12] = loadSound('samples/2_Fields_C4C_Sample4_Stream1.mp3', progress)
		samples[16] = loadSound('samples/2_Fields_C4C_Sample5_Stream1.mp3', progress)
		samples[20] = loadSound('samples/2_Fields_C4C_Sample6_Stream1.mp3', progress)
		samples[24] = loadSound('samples/2_Fields_C4C_Sample7_Stream1.mp3', progress)
		samples[28] = loadSound('samples/2_Fields_C4C_Sample8_Stream1.mp3', progress)
		samples[32] = loadSound('samples/Fefferman19MayPiece_Streams1and3-VBR.mp3', progress)
	}
	else if(tag_no=='1002'){
		samples[1] = loadSound('samples/2_Fields_C4C_Sample1_Stream2.mp3', progress)
		samples[5] = loadSound('samples/2_Fields_C4C_Sample2_Stream2.mp3', progress)
		samples[9] = loadSound('samples/2_Fields_C4C_Sample3_Stream2.mp3', progress)
		samples[13] = loadSound('samples/2_Fields_C4C_Sample4_Stream2.mp3', progress)
		samples[17] = loadSound('samples/2_Fields_C4C_Sample5_Stream2.mp3', progress)
		samples[21] = loadSound('samples/2_Fields_C4C_Sample6_Stream2.mp3', progress)
		samples[25] = loadSound('samples/2_Fields_C4C_Sample7_Stream2.mp3', progress)
		samples[29] = loadSound('samples/2_Fields_C4C_Sample8_Stream2.mp3', progress)
		samples[33] = loadSound('samples/Fefferman19MayPiece_Streams2and4-VBR.mp3', progress)
	}
	else if(tag_no=='1003'){
		samples[2] = loadSound('samples/2_Fields_C4C_Sample1_Stream3.mp3', progress)
		samples[6] = loadSound('samples/2_Fields_C4C_Sample2_Stream3.mp3', progress)
		samples[10] = loadSound('samples/2_Fields_C4C_Sample3_Stream3.mp3', progress)
		samples[14] = loadSound('samples/2_Fields_C4C_Sample4_Stream3.mp3', progress)
		samples[18] = loadSound('samples/2_Fields_C4C_Sample5_Stream3.mp3', progress)
		samples[22] = loadSound('samples/2_Fields_C4C_Sample6_Stream3.mp3', progress)
		samples[26] = loadSound('samples/2_Fields_C4C_Sample7_Stream3.mp3', progress)
		samples[30] = loadSound('samples/2_Fields_C4C_Sample8_Stream3.mp3', progress)
		samples[32] = loadSound('samples/Fefferman19MayPiece_Streams1and3-VBR.mp3', progress)
	}
	else if(tag_no=='1004'){
		samples[3] = loadSound('samples/2_Fields_C4C_Sample1_Stream4.mp3', progress)
		samples[7] = loadSound('samples/2_Fields_C4C_Sample2_Stream4.mp3', progress)	
		samples[11] = loadSound('samples/2_Fields_C4C_Sample3_Stream4.mp3', progress)
		samples[15] = loadSound('samples/2_Fields_C4C_Sample4_Stream4.mp3', progress)
		samples[19] = loadSound('samples/2_Fields_C4C_Sample5_Stream4.mp3', progress)
		samples[23] = loadSound('samples/2_Fields_C4C_Sample6_Stream4.mp3', progress)	
		samples[27] = loadSound('samples/2_Fields_C4C_Sample7_Stream4.mp3', progress)
		samples[31] = loadSound('samples/2_Fields_C4C_Sample8_Stream4.mp3', progress)
		samples[33] = loadSound('samples/Fefferman19MayPiece_Streams2and4-VBR.mp3', progress)
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
/*
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
	*/
}

function progress(){
	loaded++;
	console.log("sampled loaded")
	if(loaded>=sampleNum){
		/*
		clear();
		fill(0, 0, 0)
		textSize(32);
		text('Welcome to C4C! Turn up your volume and touch anywhere to begin', 10, 30, 350, 600);
		*/
	}
}


function playSamp(){
	console.log("playsamp");
	if(curSamp=="neo"){
		changeToNeo();
	}
	else if(curSamp=="og"){
		changeToOG();
	}
	else{
		var code = parseInt(curSamp)
		var index = code - 1;
		console.log("playing sample " + index);
		samples[index].play();
	}
}

function mousePressed() {
	
	if(loaded>=sampleNum&&!started){
		clear();
		//text('Keep your phone open and Listen to the music', 10, 30, 350, 600);
		playSamp();
		console.log("mousepress");
		//dummyaudio.play();
		//noSleep.enable();
		started = true;
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
		connectAttempts++;
		if(connectAttempts>4){
			changeToOG();
			connectAttempts = 0;
		} else{
			listenToWWSDataWithStomp();
		}
	}

	function onConnectListener(x) {
		console.log("Listening to " + BAN_ID);

		//client.subscribe(exchange+BAN_ID+".motion.sleeve", function(msg) {
    client.subscribe(exchange+BAN_ID, function(msg) {
			// Update motion information
			//console.log(msg.body);
			let data = JSON.parse(msg.body);
			curSamp = data.code;
			console.log(data.code);

			//Latency display
			/*
			clear();
			var d = new Date();
			console.log(d.getTime() - data.time);
			var lat = d.getTime() - data.time;
			if(lat>biglat){
				biglat = lat;
			}
			*/
			//text('Latency:  ' + lat, 100, 170);
			//text('Loaded Time:  ' + loadtime, 100, 270);
			//text('Top Lat:  ' + biglat, 100, 370);

			playSamp();

		});
	}

	client.connect("stream_bridge_user1", "WWS2016", onConnectListener, onError, "/test");
}


/*
<audio loop>
      <source src="horse.mp3" type="audio/mpeg">
    Your browser does not support the audio element.
		</audio>


		function loadSamples(){
	
	samples[0] = loadSound('samples/Fields_C4C_Sample1_Stream1.wav', progress)
	samples[1] = loadSound('samples/Fields_C4C_Sample1_Stream2.wav', progress)
	samples[2] = loadSound('samples/Fields_C4C_Sample1_Stream3.wav', progress)
	samples[3] = loadSound('samples/Fields_C4C_Sample1_Stream4.wav', progress)
	samples[4] = loadSound('samples/Fields_C4C_Sample2_Stream1.wav', progress)
	samples[5] = loadSound('samples/Fields_C4C_Sample2_Stream2.wav', progress)
	samples[6] = loadSound('samples/Fields_C4C_Sample2_Stream3.wav', progress)
	samples[7] = loadSound('samples/Fields_C4C_Sample2_Stream4.wav', progress)
	samples[8] = loadSound('samples/Fields_C4C_Sample3_Stream1.wav', progress)
	samples[9] = loadSound('samples/Fields_C4C_Sample3_Stream2.wav', progress)
	samples[10] = loadSound('samples/Fields_C4C_Sample3_Stream3.wav', progress)
	samples[11] = loadSound('samples/Fields_C4C_Sample3_Stream4.wav', progress)
	samples[12] = loadSound('samples/Fields_C4C_Sample4_Stream1.wav', progress)
	samples[13] = loadSound('samples/Fields_C4C_Sample4_Stream2.wav', progress)
	samples[14] = loadSound('samples/Fields_C4C_Sample4_Stream3.wav', progress)
	samples[15] = loadSound('samples/Fields_C4C_Sample4_Stream4.wav', progress)
	samples[16] = loadSound('samples/Fields_C4C_Sample5_Stream1.wav', progress)
	samples[17] = loadSound('samples/Fields_C4C_Sample5_Stream2.wav', progress)
	samples[18] = loadSound('samples/Fields_C4C_Sample5_Stream3.wav', progress)
	samples[19] = loadSound('samples/Fields_C4C_Sample5_Stream4.wav', progress)
	samples[20] = loadSound('samples/Fields_C4C_Sample6_Stream1.wav', progress)
	samples[21] = loadSound('samples/Fields_C4C_Sample6_Stream2.wav', progress)
	samples[22] = loadSound('samples/Fields_C4C_Sample6_Stream3.wav', progress)
	samples[23] = loadSound('samples/Fields_C4C_Sample6_Stream4.wav', progress)
	samples[24] = loadSound('samples/Fields_C4C_Sample7_Stream1.wav', progress)
	samples[25] = loadSound('samples/Fields_C4C_Sample7_Stream2.wav', progress)
	samples[26] = loadSound('samples/Fields_C4C_Sample7_Stream3.wav', progress)
	samples[27] = loadSound('samples/Fields_C4C_Sample7_Stream4.wav', progress)
	samples[28] = loadSound('samples/Fields_C4C_Sample8_Stream1.wav', progress)
	samples[29] = loadSound('samples/Fields_C4C_Sample8_Stream2.wav', progress)
	samples[30] = loadSound('samples/Fields_C4C_Sample8_Stream3.wav', progress)
	samples[31] = loadSound('samples/Fields_C4C_Sample8_Stream4.wav', progress)
	samples[32] = loadSound('samples/Fefferman19MayPiece_Streams1and3.wav', progress)
	samples[33] = loadSound('samples/Fefferman19MayPiece_Streams2and4.wav', progress)
	for(var i = 0; i < sampleNum; i++){
		samples[i].playMode('sustain');
	}
}
		*/