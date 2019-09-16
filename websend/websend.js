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
var banID = '1001'
var banID2 = '1002'
var banID3 = '1003'
var banID4 = '1004'
var banID5 = '1005'
var banID6 = '1006'
var c1
var c2
var c3
var c4
var c5
var c6
var timer1
var timer2
var updateTimer;
var allMode;
var meowMode;
var fluteMode;

setup();
//listenToWWSDataWithStomp();
function setup() {
  console.log("helloWorld!!!!!")
  //document.getElementById("demo").innerHTML = 5+6;
  //document.write("hello");
  c1 = 0;
  c2 = 0;
  c3 = 0;
  c4 = 0;
  c5 = 0;
  c6 = 0;
  allMode = true;
  meowMode = false;
  fluteMode = false;
  document.getElementById("mode").innerHTML = "allMode";
    listenToWWSDataWithStomp();
}

function activateSending(){
    WebMidi.enable(function (err) {

        if (err) {
          console.log("WebMidi could not be enabled.", err);
        } else {
            console.log("WebMidi enabled!");

            console.log(WebMidi.inputs);
            console.log(WebMidi.outputs);
            input = WebMidi.inputs[2];
            input.addListener('noteon', "all",
                function (e) {
                    var note = "" + e.note.name + e.note.octave;
                    console.log(e.note.number)
                    console.log("Received 'noteon' message (" + e.note.name + e.note.octave + ").");
                    sendMIDI(e.note.number)
                    if(note=="D5"){
                        sendWWS();
                    }
                }
            );
        }
        
      });
}

function sendMIDI(note){
    switch (note){
        case 48:
          console.log('C2');
          sendTrigger(banID, "1");
          sendTrigger(banID2, "2");
          sendTrigger(banID3, "3");
          sendTrigger(banID4, "4");
          break;
    
        case 50:
          console.log('D2');
          sendTrigger(banID, "5");
          sendTrigger(banID2, "6");
          sendTrigger(banID3, "7");
          sendTrigger(banID4, "8");
          break;
    
        case 52:
          console.log('E2');
          sendTrigger(banID, "9");
          sendTrigger(banID2, "10");
          sendTrigger(banID3, "11");
          sendTrigger(banID4, "12");
          break;
    
        case 53:
          console.log('F2');
          sendTrigger(banID, "13");
          sendTrigger(banID2, "14");
          sendTrigger(banID3, "15");
          sendTrigger(banID4, "16");
          break;
    
        case 55: 
          console.log('G2');
          sendTrigger(banID, "17");
          sendTrigger(banID2, "18");
          sendTrigger(banID3, "18");
          sendTrigger(banID4, "20");
          break;
    
        case 57: 
          console.log('A2');
          sendTrigger(banID, "21");
          sendTrigger(banID2, "22");
          sendTrigger(banID3, "23");
          sendTrigger(banID4, "24");
          break;
    
        case 59:
          console.log('B2');
          sendTrigger(banID, "25");
          sendTrigger(banID2, "26");
          sendTrigger(banID3, "27");
          sendTrigger(banID4, "28");
          break;
    
        case 60:
          console.log('C3');
          sendTrigger(banID, "29");
          sendTrigger(banID2, "30");
          sendTrigger(banID3, "31");
          sendTrigger(banID4, "32");
          break;
    
        case 62:
          console.log('D3');
          sendTrigger(banID, "33");
          sendTrigger(banID2, "34");
          sendTrigger(banID3, "33");
          sendTrigger(banID4, "34");
          break;
    
        default:
          console.log('Pressed key outside of mapped range');
          console.log(note);
      }
}

document.body.addEventListener("keypress", function(event){
  key = event.which;
  console.log(key);
  if(String.fromCharCode(key)=='a'){
    console.log("setUpdate");
    sendTriggers('0');
    var d = new Date();
    startTime = d.getTime();
    clearTimeout(updateTimer);
    updateTimer = setTimeout(update, 2000);
    
  }
  else if(String.fromCharCode(key)=='1'){
    sendTriggers("1");
  }
  else if(String.fromCharCode(key)=='2'){
    allMode = true;
    meowMode = false;
    fluteMode = false;
    document.getElementById("mode").innerHTML = "allMode";
  }
  else if(String.fromCharCode(key)=='3'){
    allMode = false;
    meowMode = true;
    fluteMode = false;
    document.getElementById("mode").innerHTML = "meowMode";
  }
  else if(String.fromCharCode(key)=='4'){
    allMode = false;
    meowMode = false;
    fluteMode = true;
    document.getElementById("mode").innerHTML = "fluteMode";
  }
  else if(String.fromCharCode(key)=='x'){
    sendTriggers("stopall");
    clearTimeout(updateTimer);
  }
  else if(String.fromCharCode(key)=='t'){
    sendTriggers("1");
  }
  else if(String.fromCharCode(key)=='n'){
    clearTimeout(updateTimer);
  }
  
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
	const url = "ws://stream_bridge_user1:WWS2016@3.83.188.186:15674/ws"

	const exchange = "/exchange/data/";

	// Check if we have a BAN_ID provided as an URL parameter




	client = Stomp.client(url);

	function onError() {
		console.log('Stomp error');
		connectAttempts++;
		if(connectAttempts>4){

		} else{
			listenToWWSDataWithStomp();
		}
	}

	function onConnectListener(x) {
        console.log("Listening to " + BAN_ID)
        activateSending();

		//client.subscribe(exchange+BAN_ID+".motion.sleeve", function(msg) {
    client.subscribe(exchange+BAN_ID, function(msg) {
			// Update motion information
			//console.log(msg.body);
      let data = JSON.parse(msg.body);
      parseReceived(data);
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

		});
	}

	client.connect("stream_bridge_user1", "WWS2016", onConnectListener, onError, "/test");
}

function parseReceived(data){
  console.log(data);
  console.log(data.code)
  if(String(data.code).includes("fully loaded")){
    var k = parseInt(String(data.code));
    console.log("parsed is " + k);
    if(k!=NaN){
      switch(k){
        case 1001:
          document.getElementById("1001").innerHTML = "phone 1 loaded " + String(c1);
          c1++;
          break;
        case 1002:
          document.getElementById("1002").innerHTML = "phone 2 loaded " + String(c2);
          c2++;
          break;
        case 1003:
          document.getElementById("1003").innerHTML = "phone 3 loaded " + String(c3);
          c3++;
          break;
        case 1004:
          document.getElementById("1004").innerHTML = "phone 4 loaded " + String(c4);
          c4++;
          break;
        case 1005:
          document.getElementById("1005").innerHTML = "phone 5 loaded " + String(c5);
          c5++;
          break;
        case 1006:
          document.getElementById("1006").innerHTML = "phone 6 loaded " + String(c6);
          c6++;
          break;

      }
  }
  }
}

function sendTime(){
  payload = String(document.getElementById("timeSend").value) + "time";
  sendTriggers(payload);
}

function update(){
  console.log("update!");
  var d = new Date();
  payload = String(d.getTime()-startTime) + "update";
  sendTriggers(payload);
  updateTimer = setTimeout(update, 1000);
}

function sendTriggers(samp){
  if(meowMode||allMode){
    sendTrigger(banID, samp)
    sendTrigger(banID2, samp)
  }
  if(fluteMode||allMode){
    sendTrigger(banID3, samp)
    sendTrigger(banID4, samp)
    sendTrigger(banID5, samp)
    sendTrigger(banID6, samp)
  }
}

function sendTrigger(ban, samp) {
	

	if (client) {		
		let payload = {
			code: samp
		}

        client.send("/exchange/data/" + ban, {}, JSON.stringify(payload));
        console.log("sent " + JSON.stringify(payload));
        //document.getElementById("lastsent").innerHTML = 5+6;
        //document.write("sent " + JSON.stringify(payload));
	}
}



