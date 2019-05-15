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

/*
Initial page setup, solely related to the appearance of the interface.
Clears the login input box every time the user refreshes.
*/
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
		audio.play();
		begin();
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
	audio.src = audio_streams[zone_no - 1];
	audio = new Audio(audio_streams[zone_no - 1])
	
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

function updateCurrentTime(){
	var d = new Date();
	ct = d.getTime() - startTime;
	audio.currentTime = ct/1000;
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