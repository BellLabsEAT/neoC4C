const amqp = require('amqplib/callback_api');
//var osc = require("osc")
var keypress = require('keypress');

var midi = require('midi');

// Set up a new input.
var input = new midi.input();



var connected
//Used to connect to WWS, should not depend on network which machine is connected to 
//as long as it can reach the server
// Tampere WWS server
// const url = "ws://stream_bridge_user1:WWS2016@194.137.84.174:15674/ws";
var TampAddress = 'amqp://stream_bridge_user1:WWS2016@194.137.84.174:5672/%2Ftest'

// Paris WWS server
var ParisAddress = 'amqp://stream_bridge_user1:WWS2016@wws.nokia-innovation.io:5672/%2Ftest'

var MHAddress = 'amqp://stream_bridge_user1:WWS2016@10.4.82.58:5672/%2Ftest'

var EAT = 'amqp://stream_bridge_user1:WWS2016@34.237.136.223:5672/%2Ftest'

//Murray hill is accessible only from a few networks in MH, Paris and Tampere from the general web if on an unblocked IP
var ConnectionAddress = EAT
console.log(ConnectionAddress);
var banID = '1001'
var banID2 = '1002'
var banID3 = '1003'
var banID4 = '1004'


//Josh's Sleeve class
class Sleeve {
  constructor(url) {
    this.connection = false;
    this.ch = false;
    this.connect(url);
  }

  connect(url){
    amqp.connect(url, (err, conn) => {
      if(err){
        this.connection = false;
        console.log("connection not made")
        //check this
        serverTimeout = setTimeout(this.connect, 5000, ConnectionAddress)
        console.log(err)
      } else {
        console.log('connection made to url')
        this.connection = conn;
        conn.createChannel((err, ch) => {
          if(err){
            console.log(err);
          }
          console.log('channel created')
          console.log("channel is " + toString(ch));



          this.ch = ch;
          //Listen to data streams (i.e. rawadata.sleeve) which are availible in the BAN API 
          //note the different queue names. You cannot overlap queue names
          
          connected = true
        })
      }
    })
  }


  //Send message via WWS
  sendMessage(msg, key){
    if (!this.ch) {
      console.log("not, returned" + msg)
      console.log('msg', msg)
      return;
    }
     console.log('msg', msg)
     console.log('key', key)
     //Now you must publish to 'ingress_exchange' instead of the Sleeve topic
     this.ch.publish('data', key, new Buffer(JSON.stringify(msg)));
    //this.ch.publish('ingress_exchange', key, new Buffer(JSON.stringify(msg)));
  }

  

  //Subscribe to a data stream and then use callback
  listenTo(route, sleeve, assertQueue, callback){
    if (!this.ch) {
      return null
    }
    this.ch.assertQueue(assertQueue, {exclusive: true, durable: false}, (err, q) => {

        console.log('Waiting for gesture commands...');
        console.log(sleeve)
        this.ch.bindQueue(q.queue, 'egress_exchange', `${sleeve}.${route}`);
        console.log('q.queue',q.queue)
        console.log('consumerTag', `${sleeve}.${route}`)
        this.ch.consume(q.queue, function(msg) {
            var raw_cmd = JSON.parse(msg.content);
            callback(raw_cmd, route)
        }, {noAck: true, consumerTag: `${sleeve}.${route}`});
  
    });
    return true;
  }
  
//General purpose callback function which prints output


  
  

//Not tested currently
  onDisconnect(key, add) {
      console.log('kill key', `${key}.${add}`);
      this.ch.cancel(`${key}.${add}`);
      // this.ch.deleteQueue(q.queue);
  }
}


function sendTrigger(sleeveid, num){
    
    var d = new Date();
    const i0 = {
      //time:d.getTime(), imagename:num
      code:num
    }

    //sleeve.sendMessage(i0, `c4c.button.sleeve`)
    if(sleeveid=='all'){
      sleeve.sendMessage(i0, '1001')
      sleeve.sendMessage(i0, '1002')
      sleeve.sendMessage(i0, '1003')
      sleeve.sendMessage(i0, '1004')
    }
    else{
      sleeve.sendMessage(i0, sleeveid)
    }
          
  }
//WWS version, Start program
let sleeve = new Sleeve(ConnectionAddress)

keypress(process.stdin);
 
// listen for the "keypress" event
var imagealt = 0
process.stdin.on('keypress', function (ch, key) {
  console.log('got "keypress"', key);
  if (key && key.ctrl && key.name == 'c') {
    process.exit()
  }
  else if (key && key.name == 'q') {
      if(connected){
        sendTrigger(banID, "1");
        sendTrigger(banID2, "2");
        sendTrigger(banID3, "3");
        sendTrigger(banID4, "4");
      }
  }
  else if (key && key.name == 'w') {
    if(connected){
      sendTrigger(banID, "5");
      sendTrigger(banID2, "6");
      sendTrigger(banID3, "7");
      sendTrigger(banID4, "8");
    } 
}
else if (key && key.name == 'e') {
  if(connected){
    sendTrigger(banID, "9");
    sendTrigger(banID2, "10");
    sendTrigger(banID3, "11");
    sendTrigger(banID4, "12");
  }
}
else if (key && key.name == 'r') {
  if(connected){
    sendTrigger(banID, "13");
    sendTrigger(banID2, "14");
    sendTrigger(banID3, "15");
    sendTrigger(banID4, "16");
  }
}
else if (key && key.name == 't') {
  if(connected){
    sendTrigger(banID, "17");
    sendTrigger(banID2, "18");
    sendTrigger(banID3, "18");
    sendTrigger(banID4, "20");
  }
}
else if (key && key.name == 'y') {
  if(connected){
    sendTrigger(banID, "21");
    sendTrigger(banID2, "22");
    sendTrigger(banID3, "23");
    sendTrigger(banID4, "24");
  }
}
else if (key && key.name == 'u') {
  if(connected){
    sendTrigger(banID, "25");
    sendTrigger(banID2, "26");
    sendTrigger(banID3, "27");
    sendTrigger(banID4, "28");
  }
}
else if (key && key.name == 'i') {
  if(connected){
    sendTrigger(banID, "29");
    sendTrigger(banID2, "30");
    sendTrigger(banID3, "31");
    sendTrigger(banID4, "32");
  }
}
else if (key && key.name == 'o') {
  if(connected){
    sendTrigger(banID, "33");
    sendTrigger(banID2, "34");
    sendTrigger(banID3, "33");
    sendTrigger(banID4, "34");
  }
}
else if (key && key.name == 'b') {
  if(connected){
    sendTrigger(banID, "neo");
  }
}
else if (key && key.name == 'n') {
  if(connected){
    sendTrigger(banID, "og");
  }
}
});

process.stdin.setRawMode(true);
process.stdin.resume();


// Count the available input ports.
console.log(input.getPortCount());


// Get the name of a specified input port.

console.log(input.getPortName(0));

// Configure a callback.
input.on('message', function(deltaTime, message) {
  console.log("received");
  // The message is an array of numbers corresponding to the MIDI bytes:
  //   [status, data1, data2]
  // https://www.cs.cf.ac.uk/Dave/Multimedia/node158.html has some helpful
  // information interpreting the messages.
  console.log('m:' + message + ' d:' + deltaTime);

  var note = message.toString().split(',')[1];
  console.log(note);

  //MIDI Handling
  // if(note==24){
  //   console.log('70!');
  //   sendTrigger(banID, "1");
  // }
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

});

// Open the first available input port.
input.openPort(1);

// Sysex, timing, and active sensing messages are ignored
// by default. To enable these message types, pass false for
// the appropriate type in the function below.
// Order: (Sysex, Timing, Active Sensing)
// For example if you want to receive only MIDI Clock beats
// you should use
// input.ignoreTypes(true, false, true)
//input.ignoreTypes(false, false, false);

// ... receive MIDI messages ...

// Close the port when done.
//input.closePort();

// Set up a new input.

/*
var input = new midi.input();

// Configure a callback.
input.on('message', function(deltaTime, message) {
    console.log('m:' + message + ' d:' + deltaTime);
});

// Create a virtual input port.
input.openVirtualPort("Test Input");
*/
// A midi device "Test Input" is now available for other
// software to send messages to.

// ... receive MIDI messages ...

// Close the port when done.

/*
//Open a UDP port for OSC purposes

var udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 51232
});


udpPort.on("bundle", function (oscBundle, timeTag, info) {
  console.log("An OSC bundle just arrived for time tag", timeTag, ":", oscBundle);
  console.log("Remote info is: ", info);
});

udpPort.open();

udpPort.on("ready", function () {
  console.log("ready!")
  //sendMessages()
});



function sendLocal(val){
  udpPort.send({
    address: "/s_new",
     args: [
         {
             type: "f",
             value: val
         }
     ]
   }, "127.0.0.1", 12345);
   console.log("sent " + val)
}

udpPort.on("error", function (err) {
  console.log(err);
});

udpPort.open();
*/