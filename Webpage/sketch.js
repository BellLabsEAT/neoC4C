//import { rejects } from "assert";

var samples = [];

var hornsamp = [];
var horntimes = [];

var sampleNum = 9;
var started = true;
let curSamp;
var loaded;
var noSleep = new NoSleep();
var dummyaudio = new Audio();
var startTime;
var loadtime;
var biglat;
var big;
var BAN_ID = "c4c";
var neo = true;
var connectAttempts;
var sendClient;
var silencesamp;
var testTone;
var connected = false;



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
	started = false;
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
  curSamp = "35"
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
	//dummyaudio.play();
	neo = true;
	listenToWWSDataWithStomp();
}

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
  //dummyaudio.src = "silent.wav";
		console.log("samp loaded")
		//dummyaudio.loop = true;
		silencesamp = loadSound('silence.wav', loopSilence)
}



document.body.addEventListener("touchend", function(){
	console.log("clicked")
  if(!started){
		//dummyaudio.autoplay = true;
		console.log("toucheded")
		
		console.log("looped");
		
		//dummyaudio.play();

	}
});

function loadSamples(){

	//silencesamp = loadSound('samples/silence.wav', loopSilence)
	if(tag_no=='1001'){
		samples[0] = loadSound("VASamples/kittenL.mp3", progress)
	}
	else if(tag_no=='1002'){
		samples[0] = loadSound("VASamples/kittenR.mp3", progress)
	}
	else if(tag_no=='1003'){
		samples[0] = loadSound("VASamples/kalimba.mp3", progress)
	}
	else if(tag_no=='1004'){
		samples[0] = loadSound("VASamples/wind.mp3", progress)
	}
	else if(tag_no=='1005'){
		samples[0] = loadSound("VASamples/sandwind.mp3", progress)
	}
	else if(tag_no=='1006'){
		samples[0] = loadSound("VASamples/trin.mp3", progress)
	}
	testTone = loadSound('test.wav', progress)
	
}

function playHorn(samp, time){
	for(i = 0; i < samp.length; i++){
		setTimeout(playSample, time[i], samp[i]);
		//print(time[i]);
	}
}

//literally timeout will not work with just the sample.play() method so you need this dumb
//thing
function playSample(sample){
	sample.play();
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

function loopSilence(){
	silencesamp.loop();
	silencesamp.play();
}

function progress(){
	loaded++;
	console.log("sampled " + loaded + "loaded");
	if(connected){
		sendMessage("c4c", "sample loaded");
	}

	if(loaded>=1){
		console.log("All samples loaded " + tag_no);
		sendMessage("c4c", tag_no + " fully loaded");
		//playHorn(hornsamp1, horntimes1);
		/*
		clear();
		fill(0, 0, 0)
		textSize(32);
		text('Welcome to C4C! Turn up your volume and touch anywhere to begin', 10, 30, 350, 600);
		*/
	}
}


function playSamp(receivedSamp){
	console.log("playsamp");
	curSamp = receivedSamp;
	if(receivedSamp=="neo"){
		changeToNeo();
	}
	else if(receivedSamp=="og"){
		changeToOG();
	}
	else if(receivedSamp=="stopall"){
		//stopAll();
		fadeDown();
	}
	else if(receivedSamp=="test"){
		testTone.play();
	}
	else if(String(receivedSamp).includes("time")){
		console.log("playing sample at " + parseInt(curSamp));
		samples[0].play(0, 1, 1, parseInt(curSamp));
	}
	else if(String(receivedSamp).includes("update")){
		if(!samples[0].isPlaying()){
			console.log("playing from update");
			samples[0].setVolume(0, 0);
			tim = parseInt(receivedSamp)/1000;
			if(tim>samples[0].duration()){
				tim = tim%samples[0].duration();
				console.log("Looped, playing from " + tim);
			}
			samples[0].stop();
			samples[0].play(0, 1, 1, tim);
			samples[0].setVolume(1, 3);
		}
	}
	else{
		var code = parseInt(receivedSamp)
		var index = code;
		console.log("playing sample " + index);
		try{
				samples[0].setVolume(1, 0);
			if(index==0){
				samples[index].loop();
			} else{
				samples[index].play();
			}
		}
		catch(err){
			console.log("Error! " + err);
		}
	}
}
function fadeDown(){
	if(samples[0].isPlaying()){
		samples[0].setVolume(0, 1);	
		setTimeout(stop0, 1000);
	}
}
function stop0(){
	console.log("Stopping sample");
	samples[0].stop();
}

function stopAll(){
	for(var i = 0; i < samples.length; i++){
		samples[i].stop();
	}
}

function sustainMode(){
	for(var i = 0; i < sampleNum; i++){
		samples[i].playMode('sustain');
	}
}

function mousePressed() {
	console.log("mousepress");
	if(!started){
		//clear();
		//text('Keep your phone open and Listen to the music', 10, 30, 350, 600);
		curSamp = 1;
		//playSamp();
		silencesamp.play();
		console.log("mousepress");
		//dummyaudio.play();
		noSleep.enable();
		started = true;
	}
	
}

function sendMessage(ban, message) {
	

	if (sendClient) {		
		let payload = {
			code: message
		}
		if(connected){
        	sendClient.send("/exchange/data/" + ban, {}, JSON.stringify(payload));
			console.log("sent " + JSON.stringify(payload));
		} else{
			console.log("Not connected yet, message not sent");
		}
	}
}


// STOMP-based stream listener (no polling)
function listenToWWSDataWithStomp() {
	
	//MH
	//const url = "ws://stream_bridge_user1:WWS2016@10.4.82.58/ws"
	//Paris
	//const url = "ws://stream_bridge_user1:WWS2016@54.154.131.1:15674/ws"
	//EAT
	const url = "ws://stream_bridge_user1:WWS2016@3.83.188.186:15674/ws"

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
		connected = true;
		sendMessage('c4c', 'online')

		//client.subscribe(exchange+BAN_ID+".motion.sleeve", function(msg) {
    client.subscribe(exchange+BAN_ID, function(msg) {
			// Update motion information
			//console.log(msg.body);
			let data = JSON.parse(msg.body);
			curSamp = data.code;
			console.log("received" + data.code);

			playSamp(data.code);

		});
	}

	client.connect("stream_bridge_user1", "WWS2016", onConnectListener, onError, "/test");
	sendClient = client;
}


/*
<audio loop>
      <source src="horse.mp3" type="audio/mpeg">
    Your browser does not support the audio element.
		</audio>


		*/