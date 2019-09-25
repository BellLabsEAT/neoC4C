//import { rejects } from "assert";

var samples = [];

var hornsamp = [];
var horntimes = [];

var sampleNum = 3;
var started = true;
let curSamp;
var loaded;
var noSleep = new NoSleep();
var dummyaudio = new Audio();
var startTime;
var sendban = "c4c";
var neo = true;
var connectAttempts;
var sendClient;
var silencesamp;
var testTone;
var connected = false;
var uniqueName;
var debugSending = false;
var localDebug = true;
var loadTimeout = 10000;
var updateTimeout;
var updateTime = 5000;
var sampleLoadNumber = 0;
var loadReceived = false;



/*
HAIP-related information: change values according to HAIP server address,
calibration / room size, and tags available.
*/

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


//Initializes everything after preload
function setup() {
	document.getElementById("button").disabled = false;
	started = false;

	//Connect attempts for continuing to query the wws server
	connectAttempts = 0;
	//allows one to set banID by url, mostly unused
	var newID = getQueryVariable("ban")
	if(newID!=false){
		if(localDebug){
			console.log("new ban is " + newID)
		}
		if(debugMode){
			sendMessage(sendban, uniqueName + " new ban is " + newID);
		}
		BAN_ID = newID;
	}
	//Get start time
	var d = new Date();
	startTime = d.getSeconds();

	//Sets samples loaded to 0
	loaded = 0;
	//Default value of 0
	curSamp = "0";
	  

	room = getUrlVars()["room"];
	//Check whether a variable has been passed via reload function
	if(room>1000){
		tag_no = room;
		login();
	}

	//REMOVE THIS for tag login
	//document.getElementById("attempted_login").value = "";

}




/*
Attempts to login based on inputted tag number. Button is only activated if the inputted value is
a valid tag number (as defined in tags).  Zone (and the tags array) can be toggled to work with HAIP or to be
based on seat number based on which zone_no definition you use. The current non-localization format uses tags
numbered 1001-100n where n is the number of zones being used. 
*/
function attempt_activate_button() {
	//enteringFirstTime = true
	if(localDebug){
		console.log("entering")
	}
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
	console.log("Login!");
	document.getElementById("login").style.display = "none"; // hides login page divs
	document.getElementById("player_info").style.display = "block"; // shows player page divs
	// zone_no = get_zone_no(tag_no); // used for HAIP localization zone definitions
	if(!(tag_no>1001&&tag_no<1009)){
		tag_no = Math.floor(Math.random() * 8) + 1;
		if(localDebug){
			console.log("Tag no is " + tag_no);
		}
		//tag_no = 1001;
	}
	zone_no = tag_no - 1000; // used for non-localization zone definitions
	if(enteringFirstTime){
		if(localDebug){
			console.log("reload");
		}
		reloadRoom();
	} else{
		if(localDebug){
			console.log("picking stream");
		}
		pick_stream(zone_no); // picks initial stream based on zone
		if(!neo){
			audio.play();
		}
		document.getElementById("information").innerHTML = "Now playing stream " + zone_no + " for performance... <br><br> Can't hear any audio? <br> Try turning the sound on for your device and turning the volume all the way up! <br> Remember to turn off WiFi and put your device on Do Not Disturb."; // used for testing purposes
	}
}

function genName(tag){
	var name = String(tag);
	let r = Math.random().toString(36).substring(7);
	name = name + " " + String(r);
	return name;
}

/*
Picks appropriate audio source given zone number based on the logic that audio_streams[m] corresponds
with zone m-1.
*/
function pick_stream(zone_no) {
	if(localDebug){
		console.log("network state " + audio.networkState);
		console.log("ready state " + audio.readyState);
	}
	BAN_ID = tag_no;
	//loadSamples();
	setTimeout(lateLoad, 1000);
	listenToWWSDataWithStomp();
	
}
//Allows for reload with room url variable, mostly unused
function reloadRoom(){
	window.location.assign('https://www.c4cstream.com/?room='+tag_no); 
}

//Function borrowed from online
//For getting url variables, mostly unused
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
	if(localDebug){
		console.log("refresh?");
	}
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

//For getting the url variables, mostly unused
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



//This loads before the main page loads, used to load the crucial silence sample which
//keeps phones from falling alseep, then executes loopSilence
function preload(){
	if(localDebug){
		console.log("samp loaded");
	}
		silencesamp = loadSound('silence.wav', loopSilence);
}

//Loops the silence sample forever to keep the phones awake
function loopSilence(){
	silencesamp.loop();
	silencesamp.play();
}

//Crucial function which starts audio using p5.js's mouse function
//Audio of other samples will not play unless the user activiates it with this
//If browser audio standards change, this will have to be changed as well
function mousePressed() {
	if(localDebug){
		console.log("mousepress");
	}
	if(!started){
		//Should already be looping from above loopSilence function
		silencesamp.play();
		if(localDebug){
			console.log("start user interaction audio");
		}
		//Enables no sleep, which keeps the phone screen alive as an extra precaution
		noSleep.enable();
		//Ensures this does not run again
		started = true;
	}
	
}

/*
//Replaced by mousepressed, Be wary of deleting in case of emergency
document.body.addEventListener("touchend", function(){
	console.log("clicked")
  if(!started){
		//dummyaudio.autoplay = true;
		//dummyaudio.play();
		console.log("toucheded")
		
		console.log("looped");
		
		

	}
});
*/





//Loads performance samples based on input code and then updates the progress bar
function loadSamples(){
	setTimeout(loadTimer, loadTimeout);
	switch(tag_no){
		case 1001:
			switch(sampleLoadNumber){
				//Note that this switch statement intentionally does not include breaks
				//All code should execute from the starting point
				case 0:
					samples[0] = loadSound("samples/test_zone1.mp3", progress);
					console.log("1 loaded here");
				case 1:
					samples[1] = loadSound("samples/Fefferman19MayPiece_Streams1and3-VBR.mp3", progress);
					console.log("2 loaded here");
			}
			break;
		case 1002:
			switch(sampleLoadNumber){
				case 0:
					samples[0] = loadSound("samples/test_zone1.mp3", progress);
				case 1:
					samples[1] = loadSound("samples/Fefferman19MayPiece_Streams1and3-VBR.mp3", progress);
			}
			break;
			
		case 1003:
			switch(sampleLoadNumber){
				case 0:
					samples[0] = loadSound("samples/test_zone2.mp3", progress);
				case 1:
					samples[1] = loadSound("samples/Fefferman19MayPiece_Streams1and3-VBR.mp3", progress);
			}
			break;
		case 1004:
				switch(sampleLoadNumber){
					case 0:
						samples[0] = loadSound("samples/test_zone2.mp3", progress);
					case 1:
						samples[1] = loadSound("samples/Fefferman19MayPiece_Streams1and3-VBR.mp3", progress);
				}
				break;
		case 1005:
			switch(sampleLoadNumber){
				case 0:
					samples[0] = loadSound("samples/test_zone3.mp3", progress);
				case 1:
					samples[1] = loadSound("samples/Fefferman19MayPiece_Streams2and4-VBR.mp3", progress);
			}
			break;
		case 1006:
			switch(sampleLoadNumber){
				case 0:
					samples[0] = loadSound("samples/test_zone3.mp3", progress);
				case 1:
					samples[1] = loadSound("samples/Fefferman19MayPiece_Streams2and4-VBR.mp3", progress);
			}
			break;
		case 1007:
			switch(sampleLoadNumber){
				case 0:
					samples[0] = loadSound("samples/test_zone4.mp3", progress);
				case 1:
					samples[1] = loadSound("samples/Fefferman19MayPiece_Streams2and4-VBR.mp3", progress);
			}
			break;
		case 1008:
			switch(sampleLoadNumber){
				case 0:
					samples[0] = loadSound("samples/test_zone4.mp3", progress);
				case 1:
					samples[1] = loadSound("samples/Fefferman19MayPiece_Streams2and4-VBR.mp3", progress);
			}
			break;

	}
	//All ones could use this test tone, however it is non-essential and left 
	//till the end
	testTone = loadSound('test.wav', progress)
	
}

//literally timeout will not work with just the sample.play() method so you need this dumb
//thing
function playSample(sample){
	sample.play();
}

function loadTimer(){
	if(loaded<sampleNum){
		sendMessage(sendban, uniqueName + " had failed to load in " + loadTimeout/1000.0 + "seconds");
	}
}




//Method which keeps track of how many samples have been loaded, keep global variable
//updated
function progress(){
	loaded++;
	if(localDebug){
		console.log("sampled " + loaded + " loaded");
	}
	if(connected){
		sendMessage(sendban, uniqueName + " sample loaded");
	}
	//If all samples are loaded, send a message
	if(loaded>=sampleNum){
		if(localDebug){
			console.log("All samples loaded " + tag_no);
		}
		sendMessage(sendban, uniqueName + " fully loaded");
	}
}

//Handles incoming samples
function playSamp(receivedSamp){
	if(localDebug){
		console.log("playsamp for " + receivedSamp);
	}
	if(debugMode){
		sendMessage(sendban, uniqueName + " playsamp for " + receivedSamp);
	}
	//Sets curSamp to ensure proper state management
	

	//Fades down all samples
	if(receivedSamp=="stopall"){
		//stopAll();
		fadeDown();
		if(localDebug){
			console.log("stopping all")
		}
		if(debugMode){
			sendMessage(sendban, uniqueName + " stopping all");
		}
	}
	//Plays test tone with this reserved keyword
	else if(receivedSamp=="test"){
		testTone.play();
		if(localDebug){
			console.log("playing test tone")
		}
		if(debugMode){
			sendMessage(sendban, uniqueName + " playing test tone");
		}
	}

	//If time keywored is included, will play at that specific time
	else if(String(receivedSamp).includes("time")){
		var code = parseInt(receivedSamp);
		curSamp = code;
		var index = code;
		//console.log("playing sample " + index);
		stringSamp = String(receivedSamp);
		var len = stringSamp.length;
		playTime = parseInt(stringSamp.substring(stringSamp.lastIndexOf("e")+1, len));
		if(debugMode){
			console.log("playing sample " + index + " at " + playTime);
		}	
		if(debugMode){
			sendMessage(sendban, uniqueName + " playing sample " + index + " at " + playTime);
		}
		samples[index].play(0, 1, 1, playTime);
	}

	//Update function, will handle update signals from the sender to sync all playing
	//samples
	else if(String(receivedSamp).includes("update")){
		//checks whether curSamp is already playing, will not interrupt if so
		var code = parseInt(receivedSamp);
		curSamp = code;
		var index = code;
		if(debugMode){
			console.log("update received at index " + String(index));
		}
		
		if(!samples[index].isPlaying()){
			samples[parseInt(curSamp)].setVolume(0, 0);
			//Gets the int for the time stamp of the sample
			stringSamp = String(receivedSamp);
			var len = stringSamp.length;
			partial = stringSamp.substring(stringSamp.lastIndexOf("e")+1, len);
			tim = parseInt(stringSamp.substring(stringSamp.lastIndexOf("e")+1, len));
			tim = tim/1000;
			//I don't think this works, disabled for now

			
			if(tim>samples[index].duration()){
				tim = tim%samples[index].duration();
				if(debugMode){
					console.log("Looped, playing from " + tim);
				}				
				if(debugMode){
					sendMessage(sendban, uniqueName + " Looped, playing from " + tim);
				}
			}
			
			if(debugMode){
				console.log("playing from update at " + tim);
			}
			if(debugMode){
				sendMessage(sendban, uniqueName + " playing from update at " + tim);
			}
			//Plays the sample at the appropriate time
			
			samples[index].stop();
			samples[index].play(0, 1, 1, tim);
			samples[index].setVolume(1, 3);
		}
	}

	//Handles normal case where the message is the index of a sample
	else if(String(receivedSamp).includes("looping")){
		var code = parseInt(receivedSamp);
		curSamp = code;
		var index = code;
		if(debugMode){
			console.log("playing looping sample " + index);
		}
		if(debugMode){
			sendMessage(sendban, uniqueName + " playing looping sample " + index);
		}
		try{
				samples[index].setVolume(1, 0);
				samples[index].loop();
				samples[index].play();
			}
		catch(err){
			console.log("Error! " + err);
		}
	}
	else if(String(receivedSamp).includes("unlooping")){
		var code = parseInt(receivedSamp);
		curSamp = code;
		var index = code;
		if(debugMode){
			console.log("playing unlooping sample " + index);
		}
		if(debugMode){
			sendMessage(sendban, uniqueName + " playing unlooping sample " + index);
		}
		try{
			samples[index].setVolume(1, 0);
			samples[index].play();
		}
		catch(err){
			console.log("Error! " + err);
		}
	}
	else if(String(receivedSamp).includes("debug")){
		var debugState = parseInt(receivedSamp);
		debugMode = debugState;
		if(debugMode){
			console.log("Debug mode changed to " + debugState);
		}
		if(debugMode){
			sendMessage(sendban, uniqueName + " Debug mode changed to " + debugState);
		}
	}
	else if(String(receivedSamp).includes("load")){
		if(!loadReceived){
			if(localDebug){
				var loadNum = parseInt(receivedSamp);
			}
			console.log("load number received " + loadNum)
			sampleLoadNumber = loadNum;
			loadReceived = true;
			loadSamples();
		}
	}
	else{
		console.log("malformed message received: " + receivedSamp);
	}
}

function lateLoad(){
	if(!loadReceived){
		sampleLoadNumber = 0;
		loadSamples();
		console.log("loaded late!");
	}
}

//Fades current sample gradually down
function fadeDown(){
	if(samples[parseInt(curSamp)].isPlaying()){
		samples[parseInt(curSamp)].setVolume(0, 1);	
		setTimeout(stopSamp, 1000);
	}
}
//Finally stops the current sample
function stopSamp(){
	if(localDebug){
		console.log("Stopping sample");
	}
	samples[curSamp].stop();
}

//Stops all samples, currently not used in favor of fade down
function stopAll(){
	for(var i = 0; i < samples.length; i++){
		samples[i].stop();
	}
}

//Changes all samples to sustain mode
function sustainMode(){
	for(var i = 0; i < samples.length; i++){
		samples[i].playMode('sustain');
	}
}


//Sends messages back to the central process
function sendMessage(ban, message) {
	

	if (sendClient) {		
		let payload = {
			code: message
		}
		//Uses the ban as an identifier, then sends the message
		if(connected){
        	sendClient.send("/exchange/data/" + ban, {}, JSON.stringify(payload));
			console.log("sent " + JSON.stringify(payload));
		} else{
			console.log("Not connected yet, message not sent");
		}
	}
}

function sendUpdate(){
	var d = new Date();
	if(localDebug){
		console.log("sending update");
	}
	sendMessage(sendban, uniqueName + " still " + d.getTime());
	updateTimeout = setTimeout(sendUpdate, updateTime);
}


//Listens to WWS
// STOMP-based stream listener (no polling)
function listenToWWSDataWithStomp() {
	

	//Different wws instances, Paris is best if EAT is done since Murray Hill has inconsistent
	//uptime and will often block outside signals

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
		//Wait after repeated attempts to connect
		if(connectAttempts>4){
			setTimeout(listenToWWSDataWithStomp, 5000);
		} else{
			listenToWWSDataWithStomp();
		}
	}

	//Connected
	function onConnectListener(x) {
		console.log("Listening to " + BAN_ID);
		connected = true;
		uniqueName = genName(tag_no);
		console.log("Generated new name which is " + uniqueName)
		sendMessage(sendban, uniqueName + ' online')
		sendUpdate();

	//Subscribing to the BANID, receives these messages
    client.subscribe(exchange+BAN_ID, function(msg) {
			// Update motion information
			//console.log(msg.body);
			//curSamp is not set here, but only when a new sample is played
			//curSamp = data.code;
			let data = JSON.parse(msg.body);
			if(debugMode){
				console.log("received" + data.code);
			}
			

			playSamp(data.code);

		});
	}

	//The actual connection function
	client.connect("stream_bridge_user1", "WWS2016", onConnectListener, onError, "/test");
	sendClient = client;
}