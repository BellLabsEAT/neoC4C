//import { rejects } from "assert";

var users = [];
var userBan_IDs = [];
var samples = [];
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
var phones;
var updateCheckTimeout;
var updateTime = 7000;
var offlineTime = 12000;
// var stream1_idNum, stream2_idNum, stream3_idNum, stream4_idNum;
// var stream1_IDs, stream2_IDs, stream3_IDs, stream4_IDs;

setup();
//listenToWWSDataWithStomp();
function setup() {
  updateCheck();
  phones = {};
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

/*
Enables WebMIDI protocol to send triggers via MIDI ports.
Currently looking for MIDI port 2, but should be variable in the future.
*/
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


/*
MIDI Input: Currently using MIDI notes C2-D3 (48-62) 
to send triggers to all clients to play their respective samples. 

This was last used for Times Square ICE performance.
But can be adapted for future MIDI use.
*/
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

/*
Parses through keypress events to send triggers to the clients.
	a = Play sample 0 on all clients
	1 = Play sample 1 on all clients
	2 = Switches to allMode (sends sample triggers to all clients)
	3 = Switches to meowMode, 2 individual streams (used in Vault Allure #3 performance)
	4 = Switches to fluteMode, 4 individual streams (used in Vault Allure #3 performance)
	x = Stop all samples from playing
	t = Play test tone (in this case test tone is sample [1])
	n = Update timer variable
*/
document.body.addEventListener("keypress", function(event){
  key = event.which;
  console.log(key);
  if(String.fromCharCode(key)=='a'){
    console.log("setUpdate");
    sendTriggers('0 unlooping');
    var d = new Date();
    startTime = d.getTime();
    clearTimeout(updateTimer);
    updateTimer = setTimeout(update, 2000, 0);
    
  }
  else if(String.fromCharCode(key)=='1'){
    sendTriggers("1 unlooping");
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
    sendTriggers("1 unlooping");
  }
  else if(String.fromCharCode(key)=='n'){
    clearTimeout(updateTimer);
  }
  
});

function updateCheck(){
  var i = 0;
  for(var phone in phones){
    var d = new Date();
    var value = phones[phone];
    if(d.getTime()>value+offlineTime){
      console.log("Phone " + phone + " is not sending");
      var ID = "phone"+String(i);
      console.log(ID);
      document.getElementById(ID).innerHTML = "Phone " + phone + " is not sending";
    }
    i++;
  }

  updateCheckTimeout = setTimeout(updateCheck, updateTime);
}


/*
 STOMP-based stream listener (no polling)
 Listens to WWS stream for exchange data if connected to an existing stream_no
 Activates sending from webpage to connected clients.
*/
function listenToWWSDataWithStomp() {

//  const url = "ws://stream_bridge_user1:WWS2016@194.137.84.174:15674/ws";
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


/*
When a client has fully buffered the sample bank onto their device,
server webpage displays debug message to inform the user for each tag. 
*/
function parseReceived(data){
  console.log(data);
  console.log(data.code)
  if(String(data.code).includes("fully loaded")){
    var userID = data.code.split(" ");
    var k = parseInt(String(data.code));
    console.log("parsed is " + k);
    if(k!=NaN){
      switch(k){
        case 1001:
          document.getElementById("1001").innerHTML = "phone 1 loaded ID: " + userID[1] + ", total on stream: " + String(c1);
          c1++;
          break;
        case 1002:
          document.getElementById("1002").innerHTML = "phone 2 loaded ID: " + userID[1] + ", total on stream: " + String(c2);
          c2++;
          break;
        case 1003:
          document.getElementById("1003").innerHTML = "phone 3 loaded ID:" + userID[1] + ", total on stream: " + String(c3);
          c3++;
          break;
        case 1004:
          document.getElementById("1004").innerHTML = "phone 4 loaded ID: " + userID[1] + ", total on stream: " + String(c4);
          c4++;
          break;
        case 1005:
          document.getElementById("1005").innerHTML = "phone 5 loaded ID: " + userID[1] + ", total on stream: " + String(c5);
          c5++;
          break;
        case 1006:
          document.getElementById("1006").innerHTML = "phone 6 loaded ID: " + userID[1] + ", total on stream: " + String(c6);
          c6++;
          break;

      }
    }
  }
  if(String(data.code).includes("online")){
    var userID = data.code.split(" ");
    //Populates dictionary
    var d = new Date();
    phones[userID[1]] = d.getTime();

    //Populates array
    var i;
    for (i = 0; i < users.length; i++){
      if (userID[1] == users[i]){
        console.log("Generating new name...");
      }
    } 
    users.push(userID[1]);
    console.log(users);
  }
  else if(String(data.code).includes("still")){
    var userID = data.code.split(" ");
    console.log(userID);
    var d = new Date();
    phones[userID[1]] = d.getTime();
    console.log("Updated phone " + userID[1] + " to " + d.getTime());
  }
}

function sendTime(samp){
  payload = samp + " time" + String(document.getElementById("timeSend").value);
  sendTriggers(payload);
}

/*
Actives debug console on the sender/server webpage
Shows current mode and status of sample loading on clients with tags 1001-1006.
*/
function debugMode(){
	var debugMode = document.getElementById("debug").checked;
  if (debugMode){
    document.getElementById("mode").style.display = "block";
    document.getElementById("1001").style.display = "block";
    document.getElementById("1002").style.display = "block";
    document.getElementById("1003").style.display = "block";
    document.getElementById("1004").style.display = "block";
    document.getElementById("1005").style.display = "block";
    document.getElementById("1006").style.display = "block";
    document.getElementById("phone0").style.display = "block";
document.getElementById("phone1").style.display = "block";
document.getElementById("phone2").style.display = "block";
document.getElementById("phone3").style.display = "block";
document.getElementById("phone4").style.display = "block";
document.getElementById("phone5").style.display = "block";
document.getElementById("phone6").style.display = "block";
document.getElementById("phone7").style.display = "block";
document.getElementById("phone8").style.display = "block";
document.getElementById("phone9").style.display = "block";
document.getElementById("phone10").style.display = "block";
document.getElementById("phone11").style.display = "block";
document.getElementById("phone12").style.display = "block";
document.getElementById("phone13").style.display = "block";
document.getElementById("phone14").style.display = "block";
document.getElementById("phone15").style.display = "block";
document.getElementById("phone16").style.display = "block";
document.getElementById("phone17").style.display = "block";
document.getElementById("phone18").style.display = "block";
document.getElementById("phone19").style.display = "block";
document.getElementById("phone20").style.display = "block";
document.getElementById("phone21").style.display = "block";
document.getElementById("phone22").style.display = "block";
document.getElementById("phone23").style.display = "block";
document.getElementById("phone24").style.display = "block";
document.getElementById("phone25").style.display = "block";
document.getElementById("phone26").style.display = "block";
document.getElementById("phone27").style.display = "block";
document.getElementById("phone28").style.display = "block";
document.getElementById("phone29").style.display = "block";
document.getElementById("phone30").style.display = "block";
document.getElementById("phone31").style.display = "block";
document.getElementById("phone32").style.display = "block";
document.getElementById("phone33").style.display = "block";
document.getElementById("phone34").style.display = "block";
document.getElementById("phone35").style.display = "block";
document.getElementById("phone36").style.display = "block";
document.getElementById("phone37").style.display = "block";
document.getElementById("phone38").style.display = "block";
document.getElementById("phone39").style.display = "block";
document.getElementById("phone40").style.display = "block";
document.getElementById("phone41").style.display = "block";
document.getElementById("phone42").style.display = "block";
document.getElementById("phone43").style.display = "block";
document.getElementById("phone44").style.display = "block";
document.getElementById("phone45").style.display = "block";
document.getElementById("phone46").style.display = "block";
document.getElementById("phone47").style.display = "block";
document.getElementById("phone48").style.display = "block";
document.getElementById("phone49").style.display = "block";
document.getElementById("phone50").style.display = "block";
document.getElementById("phone51").style.display = "block";
document.getElementById("phone52").style.display = "block";
document.getElementById("phone53").style.display = "block";
document.getElementById("phone54").style.display = "block";
document.getElementById("phone55").style.display = "block";
document.getElementById("phone56").style.display = "block";
document.getElementById("phone57").style.display = "block";
document.getElementById("phone58").style.display = "block";
document.getElementById("phone59").style.display = "block";
document.getElementById("phone60").style.display = "block";
document.getElementById("phone61").style.display = "block";
document.getElementById("phone62").style.display = "block";
document.getElementById("phone63").style.display = "block";
document.getElementById("phone64").style.display = "block";
document.getElementById("phone65").style.display = "block";
document.getElementById("phone66").style.display = "block";
document.getElementById("phone67").style.display = "block";
document.getElementById("phone68").style.display = "block";
document.getElementById("phone69").style.display = "block";
document.getElementById("phone70").style.display = "block";
document.getElementById("phone71").style.display = "block";
document.getElementById("phone72").style.display = "block";
document.getElementById("phone73").style.display = "block";
document.getElementById("phone74").style.display = "block";
document.getElementById("phone75").style.display = "block";
document.getElementById("phone76").style.display = "block";
document.getElementById("phone77").style.display = "block";
document.getElementById("phone78").style.display = "block";
document.getElementById("phone79").style.display = "block";
document.getElementById("phone80").style.display = "block";
document.getElementById("phone81").style.display = "block";
document.getElementById("phone82").style.display = "block";
document.getElementById("phone83").style.display = "block";
document.getElementById("phone84").style.display = "block";
document.getElementById("phone85").style.display = "block";
document.getElementById("phone86").style.display = "block";
document.getElementById("phone87").style.display = "block";
document.getElementById("phone88").style.display = "block";
document.getElementById("phone89").style.display = "block";
document.getElementById("phone90").style.display = "block";
document.getElementById("phone91").style.display = "block";
document.getElementById("phone92").style.display = "block";
document.getElementById("phone93").style.display = "block";
document.getElementById("phone94").style.display = "block";
document.getElementById("phone95").style.display = "block";
document.getElementById("phone96").style.display = "block";
document.getElementById("phone97").style.display = "block";
document.getElementById("phone98").style.display = "block";
document.getElementById("phone99").style.display = "block";
document.getElementById("phone100").style.display = "block";
document.getElementById("phone101").style.display = "block";
document.getElementById("phone102").style.display = "block";
document.getElementById("phone103").style.display = "block";
document.getElementById("phone104").style.display = "block";
document.getElementById("phone105").style.display = "block";
document.getElementById("phone106").style.display = "block";
document.getElementById("phone107").style.display = "block";
document.getElementById("phone108").style.display = "block";
document.getElementById("phone109").style.display = "block";
document.getElementById("phone110").style.display = "block";
document.getElementById("phone111").style.display = "block";
document.getElementById("phone112").style.display = "block";
document.getElementById("phone113").style.display = "block";
document.getElementById("phone114").style.display = "block";
document.getElementById("phone115").style.display = "block";
document.getElementById("phone116").style.display = "block";
document.getElementById("phone117").style.display = "block";
document.getElementById("phone118").style.display = "block";
document.getElementById("phone119").style.display = "block";
document.getElementById("phone120").style.display = "block";
document.getElementById("phone121").style.display = "block";
document.getElementById("phone122").style.display = "block";
document.getElementById("phone123").style.display = "block";
document.getElementById("phone124").style.display = "block";
document.getElementById("phone125").style.display = "block";
document.getElementById("phone126").style.display = "block";
document.getElementById("phone127").style.display = "block";
document.getElementById("phone128").style.display = "block";
document.getElementById("phone129").style.display = "block";
document.getElementById("phone130").style.display = "block";
document.getElementById("phone131").style.display = "block";
document.getElementById("phone132").style.display = "block";
document.getElementById("phone133").style.display = "block";
document.getElementById("phone134").style.display = "block";
document.getElementById("phone135").style.display = "block";
document.getElementById("phone136").style.display = "block";
document.getElementById("phone137").style.display = "block";
document.getElementById("phone138").style.display = "block";
document.getElementById("phone139").style.display = "block";
document.getElementById("phone140").style.display = "block";
document.getElementById("phone141").style.display = "block";
document.getElementById("phone142").style.display = "block";
document.getElementById("phone143").style.display = "block";
document.getElementById("phone144").style.display = "block";
document.getElementById("phone145").style.display = "block";
document.getElementById("phone146").style.display = "block";
document.getElementById("phone147").style.display = "block";
document.getElementById("phone148").style.display = "block";
document.getElementById("phone149").style.display = "block";
document.getElementById("phone150").style.display = "block";
document.getElementById("phone151").style.display = "block";
document.getElementById("phone152").style.display = "block";
document.getElementById("phone153").style.display = "block";
document.getElementById("phone154").style.display = "block";
document.getElementById("phone155").style.display = "block";
document.getElementById("phone156").style.display = "block";
document.getElementById("phone157").style.display = "block";
document.getElementById("phone158").style.display = "block";
document.getElementById("phone159").style.display = "block";
document.getElementById("phone160").style.display = "block";
document.getElementById("phone161").style.display = "block";
document.getElementById("phone162").style.display = "block";
document.getElementById("phone163").style.display = "block";
document.getElementById("phone164").style.display = "block";
document.getElementById("phone165").style.display = "block";
document.getElementById("phone166").style.display = "block";
document.getElementById("phone167").style.display = "block";
document.getElementById("phone168").style.display = "block";
document.getElementById("phone169").style.display = "block";
document.getElementById("phone170").style.display = "block";
document.getElementById("phone171").style.display = "block";
document.getElementById("phone172").style.display = "block";
document.getElementById("phone173").style.display = "block";
document.getElementById("phone174").style.display = "block";
document.getElementById("phone175").style.display = "block";
document.getElementById("phone176").style.display = "block";
document.getElementById("phone177").style.display = "block";
document.getElementById("phone178").style.display = "block";
document.getElementById("phone179").style.display = "block";
document.getElementById("phone180").style.display = "block";
document.getElementById("phone181").style.display = "block";
document.getElementById("phone182").style.display = "block";
document.getElementById("phone183").style.display = "block";
document.getElementById("phone184").style.display = "block";
document.getElementById("phone185").style.display = "block";
document.getElementById("phone186").style.display = "block";
document.getElementById("phone187").style.display = "block";
document.getElementById("phone188").style.display = "block";
document.getElementById("phone189").style.display = "block";
document.getElementById("phone190").style.display = "block";
document.getElementById("phone191").style.display = "block";
document.getElementById("phone192").style.display = "block";
document.getElementById("phone193").style.display = "block";
document.getElementById("phone194").style.display = "block";
document.getElementById("phone195").style.display = "block";
document.getElementById("phone196").style.display = "block";
document.getElementById("phone197").style.display = "block";
document.getElementById("phone198").style.display = "block";
document.getElementById("phone199").style.display = "block";
document.getElementById("phone200").style.display = "block";
document.getElementById("phone201").style.display = "block";
document.getElementById("phone202").style.display = "block";
document.getElementById("phone203").style.display = "block";
document.getElementById("phone204").style.display = "block";
document.getElementById("phone205").style.display = "block";
document.getElementById("phone206").style.display = "block";
document.getElementById("phone207").style.display = "block";
document.getElementById("phone208").style.display = "block";
document.getElementById("phone209").style.display = "block";
document.getElementById("phone210").style.display = "block";
document.getElementById("phone211").style.display = "block";
document.getElementById("phone212").style.display = "block";
document.getElementById("phone213").style.display = "block";
document.getElementById("phone214").style.display = "block";
document.getElementById("phone215").style.display = "block";
document.getElementById("phone216").style.display = "block";
document.getElementById("phone217").style.display = "block";
document.getElementById("phone218").style.display = "block";
document.getElementById("phone219").style.display = "block";
document.getElementById("phone220").style.display = "block";
document.getElementById("phone221").style.display = "block";
document.getElementById("phone222").style.display = "block";
document.getElementById("phone223").style.display = "block";
document.getElementById("phone224").style.display = "block";
document.getElementById("phone225").style.display = "block";
document.getElementById("phone226").style.display = "block";
document.getElementById("phone227").style.display = "block";
document.getElementById("phone228").style.display = "block";
document.getElementById("phone229").style.display = "block";
document.getElementById("phone230").style.display = "block";
document.getElementById("phone231").style.display = "block";
document.getElementById("phone232").style.display = "block";
document.getElementById("phone233").style.display = "block";
document.getElementById("phone234").style.display = "block";
document.getElementById("phone235").style.display = "block";
document.getElementById("phone236").style.display = "block";
document.getElementById("phone237").style.display = "block";
document.getElementById("phone238").style.display = "block";
document.getElementById("phone239").style.display = "block";
document.getElementById("phone240").style.display = "block";
document.getElementById("phone241").style.display = "block";
document.getElementById("phone242").style.display = "block";
document.getElementById("phone243").style.display = "block";
document.getElementById("phone244").style.display = "block";
document.getElementById("phone245").style.display = "block";
document.getElementById("phone246").style.display = "block";
document.getElementById("phone247").style.display = "block";
document.getElementById("phone248").style.display = "block";
document.getElementById("phone249").style.display = "block";
document.getElementById("phone250").style.display = "block";
document.getElementById("phone251").style.display = "block";
document.getElementById("phone252").style.display = "block";
document.getElementById("phone253").style.display = "block";
document.getElementById("phone254").style.display = "block";
document.getElementById("phone255").style.display = "block";
document.getElementById("phone256").style.display = "block";
document.getElementById("phone257").style.display = "block";
document.getElementById("phone258").style.display = "block";
document.getElementById("phone259").style.display = "block";
document.getElementById("phone260").style.display = "block";
document.getElementById("phone261").style.display = "block";
document.getElementById("phone262").style.display = "block";
document.getElementById("phone263").style.display = "block";
document.getElementById("phone264").style.display = "block";
document.getElementById("phone265").style.display = "block";
document.getElementById("phone266").style.display = "block";
document.getElementById("phone267").style.display = "block";
document.getElementById("phone268").style.display = "block";
document.getElementById("phone269").style.display = "block";
document.getElementById("phone270").style.display = "block";
document.getElementById("phone271").style.display = "block";
document.getElementById("phone272").style.display = "block";
document.getElementById("phone273").style.display = "block";
document.getElementById("phone274").style.display = "block";
document.getElementById("phone275").style.display = "block";
document.getElementById("phone276").style.display = "block";
document.getElementById("phone277").style.display = "block";
document.getElementById("phone278").style.display = "block";
document.getElementById("phone279").style.display = "block";
document.getElementById("phone280").style.display = "block";
document.getElementById("phone281").style.display = "block";
document.getElementById("phone282").style.display = "block";
document.getElementById("phone283").style.display = "block";
document.getElementById("phone284").style.display = "block";
document.getElementById("phone285").style.display = "block";
document.getElementById("phone286").style.display = "block";
document.getElementById("phone287").style.display = "block";
document.getElementById("phone288").style.display = "block";
document.getElementById("phone289").style.display = "block";
document.getElementById("phone290").style.display = "block";
document.getElementById("phone291").style.display = "block";
document.getElementById("phone292").style.display = "block";
document.getElementById("phone293").style.display = "block";
document.getElementById("phone294").style.display = "block";
document.getElementById("phone295").style.display = "block";
document.getElementById("phone296").style.display = "block";
document.getElementById("phone297").style.display = "block";
document.getElementById("phone298").style.display = "block";
document.getElementById("phone299").style.display = "block";
document.getElementById("phone300").style.display = "block";
document.getElementById("phone301").style.display = "block";
document.getElementById("phone302").style.display = "block";
document.getElementById("phone303").style.display = "block";
document.getElementById("phone304").style.display = "block";
document.getElementById("phone305").style.display = "block";
document.getElementById("phone306").style.display = "block";
document.getElementById("phone307").style.display = "block";
document.getElementById("phone308").style.display = "block";
document.getElementById("phone309").style.display = "block";
document.getElementById("phone310").style.display = "block";
document.getElementById("phone311").style.display = "block";
document.getElementById("phone312").style.display = "block";
document.getElementById("phone313").style.display = "block";
document.getElementById("phone314").style.display = "block";
document.getElementById("phone315").style.display = "block";
document.getElementById("phone316").style.display = "block";
document.getElementById("phone317").style.display = "block";
document.getElementById("phone318").style.display = "block";
document.getElementById("phone319").style.display = "block";
document.getElementById("phone320").style.display = "block";
document.getElementById("phone321").style.display = "block";
document.getElementById("phone322").style.display = "block";
document.getElementById("phone323").style.display = "block";
document.getElementById("phone324").style.display = "block";
document.getElementById("phone325").style.display = "block";
document.getElementById("phone326").style.display = "block";
document.getElementById("phone327").style.display = "block";
document.getElementById("phone328").style.display = "block";
document.getElementById("phone329").style.display = "block";
document.getElementById("phone330").style.display = "block";
document.getElementById("phone331").style.display = "block";
document.getElementById("phone332").style.display = "block";
document.getElementById("phone333").style.display = "block";
document.getElementById("phone334").style.display = "block";
document.getElementById("phone335").style.display = "block";
document.getElementById("phone336").style.display = "block";
document.getElementById("phone337").style.display = "block";
document.getElementById("phone338").style.display = "block";
document.getElementById("phone339").style.display = "block";
document.getElementById("phone340").style.display = "block";
document.getElementById("phone341").style.display = "block";
document.getElementById("phone342").style.display = "block";
document.getElementById("phone343").style.display = "block";
document.getElementById("phone344").style.display = "block";
document.getElementById("phone345").style.display = "block";
document.getElementById("phone346").style.display = "block";
document.getElementById("phone347").style.display = "block";
document.getElementById("phone348").style.display = "block";
document.getElementById("phone349").style.display = "block";
document.getElementById("phone350").style.display = "block";
document.getElementById("phone351").style.display = "block";
document.getElementById("phone352").style.display = "block";
document.getElementById("phone353").style.display = "block";
document.getElementById("phone354").style.display = "block";
document.getElementById("phone355").style.display = "block";
document.getElementById("phone356").style.display = "block";
document.getElementById("phone357").style.display = "block";
document.getElementById("phone358").style.display = "block";
document.getElementById("phone359").style.display = "block";
document.getElementById("phone360").style.display = "block";
document.getElementById("phone361").style.display = "block";
document.getElementById("phone362").style.display = "block";
document.getElementById("phone363").style.display = "block";
document.getElementById("phone364").style.display = "block";
document.getElementById("phone365").style.display = "block";
document.getElementById("phone366").style.display = "block";
document.getElementById("phone367").style.display = "block";
document.getElementById("phone368").style.display = "block";
document.getElementById("phone369").style.display = "block";
document.getElementById("phone370").style.display = "block";
document.getElementById("phone371").style.display = "block";
document.getElementById("phone372").style.display = "block";
document.getElementById("phone373").style.display = "block";
document.getElementById("phone374").style.display = "block";
document.getElementById("phone375").style.display = "block";
document.getElementById("phone376").style.display = "block";
document.getElementById("phone377").style.display = "block";
document.getElementById("phone378").style.display = "block";
document.getElementById("phone379").style.display = "block";
document.getElementById("phone380").style.display = "block";
document.getElementById("phone381").style.display = "block";
document.getElementById("phone382").style.display = "block";
document.getElementById("phone383").style.display = "block";
document.getElementById("phone384").style.display = "block";
document.getElementById("phone385").style.display = "block";
document.getElementById("phone386").style.display = "block";
document.getElementById("phone387").style.display = "block";
document.getElementById("phone388").style.display = "block";
document.getElementById("phone389").style.display = "block";
document.getElementById("phone390").style.display = "block";
document.getElementById("phone391").style.display = "block";
document.getElementById("phone392").style.display = "block";
document.getElementById("phone393").style.display = "block";
document.getElementById("phone394").style.display = "block";
document.getElementById("phone395").style.display = "block";
document.getElementById("phone396").style.display = "block";
document.getElementById("phone397").style.display = "block";
document.getElementById("phone398").style.display = "block";
document.getElementById("phone399").style.display = "block";
document.getElementById("phone400").style.display = "block";
document.getElementById("phone401").style.display = "block";
document.getElementById("phone402").style.display = "block";
document.getElementById("phone403").style.display = "block";
document.getElementById("phone404").style.display = "block";
document.getElementById("phone405").style.display = "block";
document.getElementById("phone406").style.display = "block";
document.getElementById("phone407").style.display = "block";
document.getElementById("phone408").style.display = "block";
document.getElementById("phone409").style.display = "block";
document.getElementById("phone410").style.display = "block";
document.getElementById("phone411").style.display = "block";
document.getElementById("phone412").style.display = "block";
document.getElementById("phone413").style.display = "block";
document.getElementById("phone414").style.display = "block";
document.getElementById("phone415").style.display = "block";
document.getElementById("phone416").style.display = "block";
document.getElementById("phone417").style.display = "block";
document.getElementById("phone418").style.display = "block";
document.getElementById("phone419").style.display = "block";
document.getElementById("phone420").style.display = "block";
document.getElementById("phone421").style.display = "block";
document.getElementById("phone422").style.display = "block";
document.getElementById("phone423").style.display = "block";
document.getElementById("phone424").style.display = "block";
document.getElementById("phone425").style.display = "block";
document.getElementById("phone426").style.display = "block";
document.getElementById("phone427").style.display = "block";
document.getElementById("phone428").style.display = "block";
document.getElementById("phone429").style.display = "block";
document.getElementById("phone430").style.display = "block";
document.getElementById("phone431").style.display = "block";
document.getElementById("phone432").style.display = "block";
document.getElementById("phone433").style.display = "block";
document.getElementById("phone434").style.display = "block";
document.getElementById("phone435").style.display = "block";
document.getElementById("phone436").style.display = "block";
document.getElementById("phone437").style.display = "block";
document.getElementById("phone438").style.display = "block";
document.getElementById("phone439").style.display = "block";
document.getElementById("phone440").style.display = "block";
document.getElementById("phone441").style.display = "block";
document.getElementById("phone442").style.display = "block";
document.getElementById("phone443").style.display = "block";
document.getElementById("phone444").style.display = "block";
document.getElementById("phone445").style.display = "block";
document.getElementById("phone446").style.display = "block";
document.getElementById("phone447").style.display = "block";
document.getElementById("phone448").style.display = "block";
document.getElementById("phone449").style.display = "block";
document.getElementById("phone450").style.display = "block";
document.getElementById("phone451").style.display = "block";
document.getElementById("phone452").style.display = "block";
document.getElementById("phone453").style.display = "block";
document.getElementById("phone454").style.display = "block";
document.getElementById("phone455").style.display = "block";
document.getElementById("phone456").style.display = "block";
document.getElementById("phone457").style.display = "block";
document.getElementById("phone458").style.display = "block";
document.getElementById("phone459").style.display = "block";
document.getElementById("phone460").style.display = "block";
document.getElementById("phone461").style.display = "block";
document.getElementById("phone462").style.display = "block";
document.getElementById("phone463").style.display = "block";
document.getElementById("phone464").style.display = "block";
document.getElementById("phone465").style.display = "block";
document.getElementById("phone466").style.display = "block";
document.getElementById("phone467").style.display = "block";
document.getElementById("phone468").style.display = "block";
document.getElementById("phone469").style.display = "block";
document.getElementById("phone470").style.display = "block";
document.getElementById("phone471").style.display = "block";
document.getElementById("phone472").style.display = "block";
document.getElementById("phone473").style.display = "block";
document.getElementById("phone474").style.display = "block";
document.getElementById("phone475").style.display = "block";
document.getElementById("phone476").style.display = "block";
document.getElementById("phone477").style.display = "block";
document.getElementById("phone478").style.display = "block";
document.getElementById("phone479").style.display = "block";
document.getElementById("phone480").style.display = "block";
document.getElementById("phone481").style.display = "block";
document.getElementById("phone482").style.display = "block";
document.getElementById("phone483").style.display = "block";
document.getElementById("phone484").style.display = "block";
document.getElementById("phone485").style.display = "block";
document.getElementById("phone486").style.display = "block";
document.getElementById("phone487").style.display = "block";
document.getElementById("phone488").style.display = "block";
document.getElementById("phone489").style.display = "block";
document.getElementById("phone490").style.display = "block";
document.getElementById("phone491").style.display = "block";
document.getElementById("phone492").style.display = "block";
document.getElementById("phone493").style.display = "block";
document.getElementById("phone494").style.display = "block";
document.getElementById("phone495").style.display = "block";
document.getElementById("phone496").style.display = "block";
document.getElementById("phone497").style.display = "block";
document.getElementById("phone498").style.display = "block";
document.getElementById("phone499").style.display = "block";
  } else {
    document.getElementById("mode").style.display = "none";
    document.getElementById("1001").style.display = "none";
    document.getElementById("1002").style.display = "none";
    document.getElementById("1003").style.display = "none";
    document.getElementById("1004").style.display = "none";
    document.getElementById("1005").style.display = "none";
    document.getElementById("1006").style.display = "none";
    document.getElementById("phone0").style.display = "none";
document.getElementById("phone1").style.display = "none";
document.getElementById("phone2").style.display = "none";
document.getElementById("phone3").style.display = "none";
document.getElementById("phone4").style.display = "none";
document.getElementById("phone5").style.display = "none";
document.getElementById("phone6").style.display = "none";
document.getElementById("phone7").style.display = "none";
document.getElementById("phone8").style.display = "none";
document.getElementById("phone9").style.display = "none";
document.getElementById("phone10").style.display = "none";
document.getElementById("phone11").style.display = "none";
document.getElementById("phone12").style.display = "none";
document.getElementById("phone13").style.display = "none";
document.getElementById("phone14").style.display = "none";
document.getElementById("phone15").style.display = "none";
document.getElementById("phone16").style.display = "none";
document.getElementById("phone17").style.display = "none";
document.getElementById("phone18").style.display = "none";
document.getElementById("phone19").style.display = "none";
document.getElementById("phone20").style.display = "none";
document.getElementById("phone21").style.display = "none";
document.getElementById("phone22").style.display = "none";
document.getElementById("phone23").style.display = "none";
document.getElementById("phone24").style.display = "none";
document.getElementById("phone25").style.display = "none";
document.getElementById("phone26").style.display = "none";
document.getElementById("phone27").style.display = "none";
document.getElementById("phone28").style.display = "none";
document.getElementById("phone29").style.display = "none";
document.getElementById("phone30").style.display = "none";
document.getElementById("phone31").style.display = "none";
document.getElementById("phone32").style.display = "none";
document.getElementById("phone33").style.display = "none";
document.getElementById("phone34").style.display = "none";
document.getElementById("phone35").style.display = "none";
document.getElementById("phone36").style.display = "none";
document.getElementById("phone37").style.display = "none";
document.getElementById("phone38").style.display = "none";
document.getElementById("phone39").style.display = "none";
document.getElementById("phone40").style.display = "none";
document.getElementById("phone41").style.display = "none";
document.getElementById("phone42").style.display = "none";
document.getElementById("phone43").style.display = "none";
document.getElementById("phone44").style.display = "none";
document.getElementById("phone45").style.display = "none";
document.getElementById("phone46").style.display = "none";
document.getElementById("phone47").style.display = "none";
document.getElementById("phone48").style.display = "none";
document.getElementById("phone49").style.display = "none";
document.getElementById("phone50").style.display = "none";
document.getElementById("phone51").style.display = "none";
document.getElementById("phone52").style.display = "none";
document.getElementById("phone53").style.display = "none";
document.getElementById("phone54").style.display = "none";
document.getElementById("phone55").style.display = "none";
document.getElementById("phone56").style.display = "none";
document.getElementById("phone57").style.display = "none";
document.getElementById("phone58").style.display = "none";
document.getElementById("phone59").style.display = "none";
document.getElementById("phone60").style.display = "none";
document.getElementById("phone61").style.display = "none";
document.getElementById("phone62").style.display = "none";
document.getElementById("phone63").style.display = "none";
document.getElementById("phone64").style.display = "none";
document.getElementById("phone65").style.display = "none";
document.getElementById("phone66").style.display = "none";
document.getElementById("phone67").style.display = "none";
document.getElementById("phone68").style.display = "none";
document.getElementById("phone69").style.display = "none";
document.getElementById("phone70").style.display = "none";
document.getElementById("phone71").style.display = "none";
document.getElementById("phone72").style.display = "none";
document.getElementById("phone73").style.display = "none";
document.getElementById("phone74").style.display = "none";
document.getElementById("phone75").style.display = "none";
document.getElementById("phone76").style.display = "none";
document.getElementById("phone77").style.display = "none";
document.getElementById("phone78").style.display = "none";
document.getElementById("phone79").style.display = "none";
document.getElementById("phone80").style.display = "none";
document.getElementById("phone81").style.display = "none";
document.getElementById("phone82").style.display = "none";
document.getElementById("phone83").style.display = "none";
document.getElementById("phone84").style.display = "none";
document.getElementById("phone85").style.display = "none";
document.getElementById("phone86").style.display = "none";
document.getElementById("phone87").style.display = "none";
document.getElementById("phone88").style.display = "none";
document.getElementById("phone89").style.display = "none";
document.getElementById("phone90").style.display = "none";
document.getElementById("phone91").style.display = "none";
document.getElementById("phone92").style.display = "none";
document.getElementById("phone93").style.display = "none";
document.getElementById("phone94").style.display = "none";
document.getElementById("phone95").style.display = "none";
document.getElementById("phone96").style.display = "none";
document.getElementById("phone97").style.display = "none";
document.getElementById("phone98").style.display = "none";
document.getElementById("phone99").style.display = "none";
document.getElementById("phone100").style.display = "none";
document.getElementById("phone101").style.display = "none";
document.getElementById("phone102").style.display = "none";
document.getElementById("phone103").style.display = "none";
document.getElementById("phone104").style.display = "none";
document.getElementById("phone105").style.display = "none";
document.getElementById("phone106").style.display = "none";
document.getElementById("phone107").style.display = "none";
document.getElementById("phone108").style.display = "none";
document.getElementById("phone109").style.display = "none";
document.getElementById("phone110").style.display = "none";
document.getElementById("phone111").style.display = "none";
document.getElementById("phone112").style.display = "none";
document.getElementById("phone113").style.display = "none";
document.getElementById("phone114").style.display = "none";
document.getElementById("phone115").style.display = "none";
document.getElementById("phone116").style.display = "none";
document.getElementById("phone117").style.display = "none";
document.getElementById("phone118").style.display = "none";
document.getElementById("phone119").style.display = "none";
document.getElementById("phone120").style.display = "none";
document.getElementById("phone121").style.display = "none";
document.getElementById("phone122").style.display = "none";
document.getElementById("phone123").style.display = "none";
document.getElementById("phone124").style.display = "none";
document.getElementById("phone125").style.display = "none";
document.getElementById("phone126").style.display = "none";
document.getElementById("phone127").style.display = "none";
document.getElementById("phone128").style.display = "none";
document.getElementById("phone129").style.display = "none";
document.getElementById("phone130").style.display = "none";
document.getElementById("phone131").style.display = "none";
document.getElementById("phone132").style.display = "none";
document.getElementById("phone133").style.display = "none";
document.getElementById("phone134").style.display = "none";
document.getElementById("phone135").style.display = "none";
document.getElementById("phone136").style.display = "none";
document.getElementById("phone137").style.display = "none";
document.getElementById("phone138").style.display = "none";
document.getElementById("phone139").style.display = "none";
document.getElementById("phone140").style.display = "none";
document.getElementById("phone141").style.display = "none";
document.getElementById("phone142").style.display = "none";
document.getElementById("phone143").style.display = "none";
document.getElementById("phone144").style.display = "none";
document.getElementById("phone145").style.display = "none";
document.getElementById("phone146").style.display = "none";
document.getElementById("phone147").style.display = "none";
document.getElementById("phone148").style.display = "none";
document.getElementById("phone149").style.display = "none";
document.getElementById("phone150").style.display = "none";
document.getElementById("phone151").style.display = "none";
document.getElementById("phone152").style.display = "none";
document.getElementById("phone153").style.display = "none";
document.getElementById("phone154").style.display = "none";
document.getElementById("phone155").style.display = "none";
document.getElementById("phone156").style.display = "none";
document.getElementById("phone157").style.display = "none";
document.getElementById("phone158").style.display = "none";
document.getElementById("phone159").style.display = "none";
document.getElementById("phone160").style.display = "none";
document.getElementById("phone161").style.display = "none";
document.getElementById("phone162").style.display = "none";
document.getElementById("phone163").style.display = "none";
document.getElementById("phone164").style.display = "none";
document.getElementById("phone165").style.display = "none";
document.getElementById("phone166").style.display = "none";
document.getElementById("phone167").style.display = "none";
document.getElementById("phone168").style.display = "none";
document.getElementById("phone169").style.display = "none";
document.getElementById("phone170").style.display = "none";
document.getElementById("phone171").style.display = "none";
document.getElementById("phone172").style.display = "none";
document.getElementById("phone173").style.display = "none";
document.getElementById("phone174").style.display = "none";
document.getElementById("phone175").style.display = "none";
document.getElementById("phone176").style.display = "none";
document.getElementById("phone177").style.display = "none";
document.getElementById("phone178").style.display = "none";
document.getElementById("phone179").style.display = "none";
document.getElementById("phone180").style.display = "none";
document.getElementById("phone181").style.display = "none";
document.getElementById("phone182").style.display = "none";
document.getElementById("phone183").style.display = "none";
document.getElementById("phone184").style.display = "none";
document.getElementById("phone185").style.display = "none";
document.getElementById("phone186").style.display = "none";
document.getElementById("phone187").style.display = "none";
document.getElementById("phone188").style.display = "none";
document.getElementById("phone189").style.display = "none";
document.getElementById("phone190").style.display = "none";
document.getElementById("phone191").style.display = "none";
document.getElementById("phone192").style.display = "none";
document.getElementById("phone193").style.display = "none";
document.getElementById("phone194").style.display = "none";
document.getElementById("phone195").style.display = "none";
document.getElementById("phone196").style.display = "none";
document.getElementById("phone197").style.display = "none";
document.getElementById("phone198").style.display = "none";
document.getElementById("phone199").style.display = "none";
document.getElementById("phone200").style.display = "none";
document.getElementById("phone201").style.display = "none";
document.getElementById("phone202").style.display = "none";
document.getElementById("phone203").style.display = "none";
document.getElementById("phone204").style.display = "none";
document.getElementById("phone205").style.display = "none";
document.getElementById("phone206").style.display = "none";
document.getElementById("phone207").style.display = "none";
document.getElementById("phone208").style.display = "none";
document.getElementById("phone209").style.display = "none";
document.getElementById("phone210").style.display = "none";
document.getElementById("phone211").style.display = "none";
document.getElementById("phone212").style.display = "none";
document.getElementById("phone213").style.display = "none";
document.getElementById("phone214").style.display = "none";
document.getElementById("phone215").style.display = "none";
document.getElementById("phone216").style.display = "none";
document.getElementById("phone217").style.display = "none";
document.getElementById("phone218").style.display = "none";
document.getElementById("phone219").style.display = "none";
document.getElementById("phone220").style.display = "none";
document.getElementById("phone221").style.display = "none";
document.getElementById("phone222").style.display = "none";
document.getElementById("phone223").style.display = "none";
document.getElementById("phone224").style.display = "none";
document.getElementById("phone225").style.display = "none";
document.getElementById("phone226").style.display = "none";
document.getElementById("phone227").style.display = "none";
document.getElementById("phone228").style.display = "none";
document.getElementById("phone229").style.display = "none";
document.getElementById("phone230").style.display = "none";
document.getElementById("phone231").style.display = "none";
document.getElementById("phone232").style.display = "none";
document.getElementById("phone233").style.display = "none";
document.getElementById("phone234").style.display = "none";
document.getElementById("phone235").style.display = "none";
document.getElementById("phone236").style.display = "none";
document.getElementById("phone237").style.display = "none";
document.getElementById("phone238").style.display = "none";
document.getElementById("phone239").style.display = "none";
document.getElementById("phone240").style.display = "none";
document.getElementById("phone241").style.display = "none";
document.getElementById("phone242").style.display = "none";
document.getElementById("phone243").style.display = "none";
document.getElementById("phone244").style.display = "none";
document.getElementById("phone245").style.display = "none";
document.getElementById("phone246").style.display = "none";
document.getElementById("phone247").style.display = "none";
document.getElementById("phone248").style.display = "none";
document.getElementById("phone249").style.display = "none";
document.getElementById("phone250").style.display = "none";
document.getElementById("phone251").style.display = "none";
document.getElementById("phone252").style.display = "none";
document.getElementById("phone253").style.display = "none";
document.getElementById("phone254").style.display = "none";
document.getElementById("phone255").style.display = "none";
document.getElementById("phone256").style.display = "none";
document.getElementById("phone257").style.display = "none";
document.getElementById("phone258").style.display = "none";
document.getElementById("phone259").style.display = "none";
document.getElementById("phone260").style.display = "none";
document.getElementById("phone261").style.display = "none";
document.getElementById("phone262").style.display = "none";
document.getElementById("phone263").style.display = "none";
document.getElementById("phone264").style.display = "none";
document.getElementById("phone265").style.display = "none";
document.getElementById("phone266").style.display = "none";
document.getElementById("phone267").style.display = "none";
document.getElementById("phone268").style.display = "none";
document.getElementById("phone269").style.display = "none";
document.getElementById("phone270").style.display = "none";
document.getElementById("phone271").style.display = "none";
document.getElementById("phone272").style.display = "none";
document.getElementById("phone273").style.display = "none";
document.getElementById("phone274").style.display = "none";
document.getElementById("phone275").style.display = "none";
document.getElementById("phone276").style.display = "none";
document.getElementById("phone277").style.display = "none";
document.getElementById("phone278").style.display = "none";
document.getElementById("phone279").style.display = "none";
document.getElementById("phone280").style.display = "none";
document.getElementById("phone281").style.display = "none";
document.getElementById("phone282").style.display = "none";
document.getElementById("phone283").style.display = "none";
document.getElementById("phone284").style.display = "none";
document.getElementById("phone285").style.display = "none";
document.getElementById("phone286").style.display = "none";
document.getElementById("phone287").style.display = "none";
document.getElementById("phone288").style.display = "none";
document.getElementById("phone289").style.display = "none";
document.getElementById("phone290").style.display = "none";
document.getElementById("phone291").style.display = "none";
document.getElementById("phone292").style.display = "none";
document.getElementById("phone293").style.display = "none";
document.getElementById("phone294").style.display = "none";
document.getElementById("phone295").style.display = "none";
document.getElementById("phone296").style.display = "none";
document.getElementById("phone297").style.display = "none";
document.getElementById("phone298").style.display = "none";
document.getElementById("phone299").style.display = "none";
document.getElementById("phone300").style.display = "none";
document.getElementById("phone301").style.display = "none";
document.getElementById("phone302").style.display = "none";
document.getElementById("phone303").style.display = "none";
document.getElementById("phone304").style.display = "none";
document.getElementById("phone305").style.display = "none";
document.getElementById("phone306").style.display = "none";
document.getElementById("phone307").style.display = "none";
document.getElementById("phone308").style.display = "none";
document.getElementById("phone309").style.display = "none";
document.getElementById("phone310").style.display = "none";
document.getElementById("phone311").style.display = "none";
document.getElementById("phone312").style.display = "none";
document.getElementById("phone313").style.display = "none";
document.getElementById("phone314").style.display = "none";
document.getElementById("phone315").style.display = "none";
document.getElementById("phone316").style.display = "none";
document.getElementById("phone317").style.display = "none";
document.getElementById("phone318").style.display = "none";
document.getElementById("phone319").style.display = "none";
document.getElementById("phone320").style.display = "none";
document.getElementById("phone321").style.display = "none";
document.getElementById("phone322").style.display = "none";
document.getElementById("phone323").style.display = "none";
document.getElementById("phone324").style.display = "none";
document.getElementById("phone325").style.display = "none";
document.getElementById("phone326").style.display = "none";
document.getElementById("phone327").style.display = "none";
document.getElementById("phone328").style.display = "none";
document.getElementById("phone329").style.display = "none";
document.getElementById("phone330").style.display = "none";
document.getElementById("phone331").style.display = "none";
document.getElementById("phone332").style.display = "none";
document.getElementById("phone333").style.display = "none";
document.getElementById("phone334").style.display = "none";
document.getElementById("phone335").style.display = "none";
document.getElementById("phone336").style.display = "none";
document.getElementById("phone337").style.display = "none";
document.getElementById("phone338").style.display = "none";
document.getElementById("phone339").style.display = "none";
document.getElementById("phone340").style.display = "none";
document.getElementById("phone341").style.display = "none";
document.getElementById("phone342").style.display = "none";
document.getElementById("phone343").style.display = "none";
document.getElementById("phone344").style.display = "none";
document.getElementById("phone345").style.display = "none";
document.getElementById("phone346").style.display = "none";
document.getElementById("phone347").style.display = "none";
document.getElementById("phone348").style.display = "none";
document.getElementById("phone349").style.display = "none";
document.getElementById("phone350").style.display = "none";
document.getElementById("phone351").style.display = "none";
document.getElementById("phone352").style.display = "none";
document.getElementById("phone353").style.display = "none";
document.getElementById("phone354").style.display = "none";
document.getElementById("phone355").style.display = "none";
document.getElementById("phone356").style.display = "none";
document.getElementById("phone357").style.display = "none";
document.getElementById("phone358").style.display = "none";
document.getElementById("phone359").style.display = "none";
document.getElementById("phone360").style.display = "none";
document.getElementById("phone361").style.display = "none";
document.getElementById("phone362").style.display = "none";
document.getElementById("phone363").style.display = "none";
document.getElementById("phone364").style.display = "none";
document.getElementById("phone365").style.display = "none";
document.getElementById("phone366").style.display = "none";
document.getElementById("phone367").style.display = "none";
document.getElementById("phone368").style.display = "none";
document.getElementById("phone369").style.display = "none";
document.getElementById("phone370").style.display = "none";
document.getElementById("phone371").style.display = "none";
document.getElementById("phone372").style.display = "none";
document.getElementById("phone373").style.display = "none";
document.getElementById("phone374").style.display = "none";
document.getElementById("phone375").style.display = "none";
document.getElementById("phone376").style.display = "none";
document.getElementById("phone377").style.display = "none";
document.getElementById("phone378").style.display = "none";
document.getElementById("phone379").style.display = "none";
document.getElementById("phone380").style.display = "none";
document.getElementById("phone381").style.display = "none";
document.getElementById("phone382").style.display = "none";
document.getElementById("phone383").style.display = "none";
document.getElementById("phone384").style.display = "none";
document.getElementById("phone385").style.display = "none";
document.getElementById("phone386").style.display = "none";
document.getElementById("phone387").style.display = "none";
document.getElementById("phone388").style.display = "none";
document.getElementById("phone389").style.display = "none";
document.getElementById("phone390").style.display = "none";
document.getElementById("phone391").style.display = "none";
document.getElementById("phone392").style.display = "none";
document.getElementById("phone393").style.display = "none";
document.getElementById("phone394").style.display = "none";
document.getElementById("phone395").style.display = "none";
document.getElementById("phone396").style.display = "none";
document.getElementById("phone397").style.display = "none";
document.getElementById("phone398").style.display = "none";
document.getElementById("phone399").style.display = "none";
document.getElementById("phone400").style.display = "none";
document.getElementById("phone401").style.display = "none";
document.getElementById("phone402").style.display = "none";
document.getElementById("phone403").style.display = "none";
document.getElementById("phone404").style.display = "none";
document.getElementById("phone405").style.display = "none";
document.getElementById("phone406").style.display = "none";
document.getElementById("phone407").style.display = "none";
document.getElementById("phone408").style.display = "none";
document.getElementById("phone409").style.display = "none";
document.getElementById("phone410").style.display = "none";
document.getElementById("phone411").style.display = "none";
document.getElementById("phone412").style.display = "none";
document.getElementById("phone413").style.display = "none";
document.getElementById("phone414").style.display = "none";
document.getElementById("phone415").style.display = "none";
document.getElementById("phone416").style.display = "none";
document.getElementById("phone417").style.display = "none";
document.getElementById("phone418").style.display = "none";
document.getElementById("phone419").style.display = "none";
document.getElementById("phone420").style.display = "none";
document.getElementById("phone421").style.display = "none";
document.getElementById("phone422").style.display = "none";
document.getElementById("phone423").style.display = "none";
document.getElementById("phone424").style.display = "none";
document.getElementById("phone425").style.display = "none";
document.getElementById("phone426").style.display = "none";
document.getElementById("phone427").style.display = "none";
document.getElementById("phone428").style.display = "none";
document.getElementById("phone429").style.display = "none";
document.getElementById("phone430").style.display = "none";
document.getElementById("phone431").style.display = "none";
document.getElementById("phone432").style.display = "none";
document.getElementById("phone433").style.display = "none";
document.getElementById("phone434").style.display = "none";
document.getElementById("phone435").style.display = "none";
document.getElementById("phone436").style.display = "none";
document.getElementById("phone437").style.display = "none";
document.getElementById("phone438").style.display = "none";
document.getElementById("phone439").style.display = "none";
document.getElementById("phone440").style.display = "none";
document.getElementById("phone441").style.display = "none";
document.getElementById("phone442").style.display = "none";
document.getElementById("phone443").style.display = "none";
document.getElementById("phone444").style.display = "none";
document.getElementById("phone445").style.display = "none";
document.getElementById("phone446").style.display = "none";
document.getElementById("phone447").style.display = "none";
document.getElementById("phone448").style.display = "none";
document.getElementById("phone449").style.display = "none";
document.getElementById("phone450").style.display = "none";
document.getElementById("phone451").style.display = "none";
document.getElementById("phone452").style.display = "none";
document.getElementById("phone453").style.display = "none";
document.getElementById("phone454").style.display = "none";
document.getElementById("phone455").style.display = "none";
document.getElementById("phone456").style.display = "none";
document.getElementById("phone457").style.display = "none";
document.getElementById("phone458").style.display = "none";
document.getElementById("phone459").style.display = "none";
document.getElementById("phone460").style.display = "none";
document.getElementById("phone461").style.display = "none";
document.getElementById("phone462").style.display = "none";
document.getElementById("phone463").style.display = "none";
document.getElementById("phone464").style.display = "none";
document.getElementById("phone465").style.display = "none";
document.getElementById("phone466").style.display = "none";
document.getElementById("phone467").style.display = "none";
document.getElementById("phone468").style.display = "none";
document.getElementById("phone469").style.display = "none";
document.getElementById("phone470").style.display = "none";
document.getElementById("phone471").style.display = "none";
document.getElementById("phone472").style.display = "none";
document.getElementById("phone473").style.display = "none";
document.getElementById("phone474").style.display = "none";
document.getElementById("phone475").style.display = "none";
document.getElementById("phone476").style.display = "none";
document.getElementById("phone477").style.display = "none";
document.getElementById("phone478").style.display = "none";
document.getElementById("phone479").style.display = "none";
document.getElementById("phone480").style.display = "none";
document.getElementById("phone481").style.display = "none";
document.getElementById("phone482").style.display = "none";
document.getElementById("phone483").style.display = "none";
document.getElementById("phone484").style.display = "none";
document.getElementById("phone485").style.display = "none";
document.getElementById("phone486").style.display = "none";
document.getElementById("phone487").style.display = "none";
document.getElementById("phone488").style.display = "none";
document.getElementById("phone489").style.display = "none";
document.getElementById("phone490").style.display = "none";
document.getElementById("phone491").style.display = "none";
document.getElementById("phone492").style.display = "none";
document.getElementById("phone493").style.display = "none";
document.getElementById("phone494").style.display = "none";
document.getElementById("phone495").style.display = "none";
document.getElementById("phone496").style.display = "none";
document.getElementById("phone497").style.display = "none";
document.getElementById("phone498").style.display = "none";
document.getElementById("phone499").style.display = "none";
  }
	// console.log(debugMode);
}

function genName(tag){
  var name = String(tag);
  let r = Math.random().toString(36).substring(7);
  name = name + " " + String(r);
  return name;
}

function update(samp){
  console.log("update!");
  var d = new Date();
  payload = samp + " update " + String(d.getTime()-startTime);
  sendTriggers(payload);
  updateTimer = setTimeout(update, 1000, 0);
}

/*
Multi-sending function that can send triggers to multiple ban IDs at once.
	allMode = send triggers simultaneously to all clients to play sample_no N
	meowMode = send triggers simultaneously to clients on streams 1001 and 1002
	fluteMode = send triggers simultaneously to clients on streams 1003 - 1006
*/
function sendTriggers(samp){
    sendTrigger(banID, samp)
    sendTrigger(banID2, samp)
    sendTrigger(banID3, samp)
    sendTrigger(banID4, samp)
    sendTrigger(banID5, samp)
    sendTrigger(banID6, samp)
}

/*
Sends data to WWS to play sample based on ban ID & sample_no.
*/
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



