//import { rejects } from "assert";

var samples = [];
var sampleNum = 5;
var started = false;
let curSamp;
var loaded;
var startTime;
var loadtime;
var biglat;
var big;
var BAN_ID = "c4c";
var neo = true;
var connectAttempts;
var client;

listenToWWSDataWithStomp();
function setup() {

    listenToWWSDataWithStomp();
}



function mousePressed() {
	sendWWS();
	
}

document.body.addEventListener("click", function(){
    console.log("sending");
    sendWWS();
});


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




	client = Stomp.client(url);

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
        console.log("Listening to " + BAN_ID)
        sendWWS();

		//client.subscribe(exchange+BAN_ID+".motion.sleeve", function(msg) {
    client.subscribe(exchange+BAN_ID, function(msg) {
			// Update motion information
			//console.log(msg.body);
			let data = JSON.parse(msg.body);
			curSamp = data.code;
			//console.log(data.code);

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


function sendWWS() {
	

	if (client) {		
		let payload = {
			code: "1"
		}

        client.send("/exchange/data/1001", {}, JSON.stringify(payload));
        console.log("sent " + JSON.stringify(payload));
	}
}



