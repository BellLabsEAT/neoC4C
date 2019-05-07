const amqp = require('amqplib/callback_api');
var fs = require("fs");
var connected
//Used to connect to WWS, should not depend on network which machine is connected to 
//as long as it can reach the server
// Tampere WWS server
// const url = "ws://stream_bridge_user1:WWS2016@194.137.84.174:15674/ws";
var TampAddress = 'amqp://stream_bridge_user1:WWS2016@194.137.84.174:5672/%2Ftest'

// Paris WWS server
var ParisAddress = 'amqp://stream_bridge_user1:WWS2016@wws.nokia-innovation.io:5672/%2Ftest'

var MHAddress = 'amqp://stream_bridge_user1:WWS2016@10.4.82.58:5672/%2Ftest'

var EAT = 'amqp://stream_bridge_user1:WWS2016@18.208.203.236:5672/%2Ftest'

//Murray hill is accessible only from a few networks in MH, Paris and Tampere from the general web if on an unblocked IP
var ConnectionAddress = EAT

var banID = 'c4c'


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
        //console.log("connection not made")
        //check this
        serverTimeout = setTimeout(this.connect, 5000, ConnectionAddress)
        //console.log(err)
      } else {
        //console.log('connection made to url')
        this.connection = conn;
        conn.createChannel((err, ch) => {
          if(err){
            console.log(err);
          }
          //console.log('channel created')



          this.ch = ch;
          var name = Math.random()*10000 + ''
          this.listenTo('', banID, name, this.printCallback)
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
      //console.log("not, returned" + msg)
      //console.log('msg', msg)
      return;
    }
     console.log('msg', msg)
     console.log('key', key)
     //Now you must publish to 'ingress_exchange' instead of the Sleeve topic
     
    this.ch.publish('ingress_exchange', key, new Buffer(JSON.stringify(msg)));
  }

  

  //Subscribe to a data stream and then use callback
  listenTo(route, sleeve, assertQueue, callback){
    if (!this.ch) {
      return null
    }
    this.ch.assertQueue(assertQueue, {exclusive: true, durable: false}, (err, q) => {

        //console.log('Waiting for gesture commands...');
        //console.log(sleeve)
        //this.ch.bindQueue(q.queue, 'egress_exchange', `${sleeve}.${route}`);
        this.ch.bindQueue(q.queue, 'data', 'c4c');
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

  printCallback(msg, add){
    //Gesture
    var d = new Date();
    console.log(d.getTime() - msg.time)
    var data = d.getTime() - msg.time;
    data = data + "\n"

  fs.appendFile("temp.txt", data, (err) => {
    if (err) console.log(err);
    //console.log("Successfully Written to File.");
  });


  }
}

let sleeve = new Sleeve(ConnectionAddress)

