
#Used for connecting to WWS
import pika
import json
import urllib.request

#Set banID here
banID = 'c4c'

#These are the credentials for getting into WWS and receiving/sending data to BAN devices, you should not need to change this
credentials = pika.PlainCredentials('stream_bridge_user1', 'WWS2016')

##Typically all our stuff has been on port 5672 at test. 10.4.82 is the Murray Hill server which is currently accessible through
#internal MH networks (i.e. Blinin in BR Lab or DID at the front of building 6). Other servers which should be acessible via the
#general internet are: Tampere: 194.137.84.174 Paris: 34.241.186.209
connection = pika.BlockingConnection(pika.ConnectionParameters('10.4.82.58', port=_DEFAULT, '/test', credentials))
#connection = pika.BlockingConnection(pika.ConnectionParameters('wws.nokia-innovation.io', 5672, '/test', credentials))
channel = connection.channel()




#Just a placeholder callback to print the received JSON from the BAN devices
def callback(ch, method, properties, body):
    print("called back")
    print(" [x] Received %r" % body)


#This is the exchange where we get BAN data from. To send BAN data we use 'ingress_exchange' with the same topic.
#Declaring this is not necessary since the exchange was created by someone else, but I have left it in as an example
channel.exchange_declare(exchange='egress_exchange', exchange_type='topic', durable=True)


#queue names can be anything, but they should be unique. If you havea bunch of queues that all have the same name listening to different
#data the system will mess up and you will get a lot of garbage data
queueName = "yagoeyebudtest"

#Ensuring that queue names are not doubly occupied.
channel.queue_delete(queueName)
channel.queue_declare(queueName)





##Binds to the egress_exchange, where all BAN data is sent out. The routing key here assumes a BanID of 'test-103' which I have
#set up in my adroid app, and will always be set individually. The 'motion.eyebud' comes from the BAN API I sent you
#To get IMU data from this same phone-eyebud combo, you would set routing key to be test-103.imu.eyebud
#At time of writing, eyebud is not sending imu data
#For phrase recognition, use BanID.phrase
channel.queue_bind(exchange='egress_exchange', queue=queueName, routing_key='%s.button.sleeve' % banID)


##Begins consumption to receive data
channel.basic_consume(callback, queue=queueName)
#channel.basic_consume(getphoto, queue="stephphoto")


channel.start_consuming()
