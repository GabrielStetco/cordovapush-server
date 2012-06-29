#!/usr/bin/env node

//Call modules
var dgram = require('dgram'),
	config = require(userConfig()),
	util = require('util'),
	apns = require('apn'),
	mongoose = require('mongoose'),
	net = require('net');


//Initialize stats variables
var startupTime = Math.round(new Date().getTime() / 1000);
var totalMessages = 0;
var totalErrors= 0;
var totalMessagesFromOrigin = 0;

/**
* Initialize syslog
*/
if (config.syslog) {
	try {
		var syslog = require('node-syslog');
		syslog.init('nodeapn', syslog.LOG_PID | syslog.LOG_ODELAY, syslog.LOG_DAEMON);
	} catch (e) {
		config.syslog = false;
		 log('node-syslog is required for syslog support.');
	}
}

/**
* Get config
*/
function userConfig() {
	return process.argv[2] ? process.argv[2].replace(/.js$/, '') : './config';
}

/**
* Initialize log function
*/
function log(msg) {
	if (config.syslog) {
		syslog.log(syslog.LOG_INFO, msg);
	} else {
		util.log(msg);
	}
}

/**
* Callback error function
*/
function showErrors(err,notification){
    log("error: "+err+ " notification: "+notification);
    totalErrors++;
}

//Set the callback error function
config.errorCallback = showErrors;

//Create the schema & model
var messagesCountSchema = new mongoose.Schema({
	total : {type: Number,default: '0'}
});
var messagesCountModel = mongoose.model('APNmessagesCount', messagesCountSchema);

/**
* Initialize db
*/
mongoose.connect(config.mongo, function(err) {
    if (err) { throw err; }
    else{
        messagesCountModel.findOne( function (err, doc){
            if(!doc){
                totalMessagesFromOrigin=0;
            }else{
                totalMessagesFromOrigin=doc.total;
            }
        });
    }
});

/**
* Increment messages sent from origin
*/
function dbCountUpdate(){
    messagesCountModel.findOne( function (err, doc){
        if(!doc){
            var messageCount = new messagesCountModel({ total : 1 });
            totalMessagesFromOrigin++;
            messageCount.save(function (err) {
                if (err) { 
                    throw err; 
                }
            });
        }else{
            totalMessagesFromOrigin++;
            doc.total=totalMessagesFromOrigin;
            doc.save(function (err) {
                if (err) { 
                    throw err; 
                }
            });
        }
    });
};

/**
* Initialize the udp client
*/
function APNReceiver(config, connection) {
	this.server = dgram.createSocket('udp4', function (msg, rinfo) {
		var msgParts = msg.toString().match(/^([^:]+):([^:]+):([^:]+):([^:]+):(.*)$/);
		if (!msgParts) {
			log("Invalid message");
			return;
		};
		var token = msgParts[1];
		var badge = parseInt(msgParts[2]);
		var alert = msgParts[3];
		var sound = msgParts[4];
		var payload = msgParts[5];
        
        var note = new apns.Notification();
		note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
        note.badge = badge;
        note.sound = sound;
        note.alert = alert;
        note.payload = JSON.parse(payload);
        note.device =  new apns.Device(token);
        connection.sendNotification(note);
        totalMessages++;
        dbCountUpdate();
	});
	this.server.bind(config.lport || 8121);
	log("server is up");
}

/**
* Initialize the debug server (stats)
*/
function startDebugServer(){
    var debugServer = net.createServer(function(stream) {
        stream.setEncoding('ascii');
        stream.on('data', function(data) {
            var commandLine = data.trim().split(" ");
            var command = commandLine.shift();
            switch (command) {
                case "help":
                    stream.write("Commands: stats quit\n");
                    break;

                case "stats":
                    var now = Math.round(new Date().getTime() / 1000);
                    var elapsed = now - startupTime;
                    stream.write("uptime: " + elapsed + " seconds\n");
                    stream.write("messages_sent_from_origin: " + totalMessagesFromOrigin + "\n");
                    stream.write("messages_sent_since_up: " + totalMessages + "\n");
                    stream.write("messages_in_queue: " + connection.cachedNotifications.length + "\n");
                    stream.write("total_errors: " + totalErrors + "\n");
                    var memoryUsage = process.memoryUsage();
                    for (var property in memoryUsage) {
                        stream.write("memory_" + property + ": " + memoryUsage[property] + "\n");
                    }
                    stream.write("END\n\n");
                    break;
                    
                case "quit":
                    stream.end();
                    break;
                    
                default:
                    stream.write("Invalid command\n");
                    break;
            };
        });
    });
    debugServer.listen(config.lport + 100);
}

/**
* Initialize the connection to APN
*/
function APNConnection(config) {
	return new apns.Connection(config);
}

// Startup instruction
var connection = new APNConnection(config);
var receiver = new APNReceiver(config, connection);
startDebugServer();
connection.connect();
