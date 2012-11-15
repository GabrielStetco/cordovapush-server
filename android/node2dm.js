// #!/usr/bin/env node

var dgram = require('dgram'),
	net = require('net'),
	config = require(getConfig()),
	node2dm = require('node2dm-lib');

/**
* Get config
*/
function getConfig() {
	return process.argv[2] ? process.argv[2].replace(/.js$/, '') : './config.js';
}

/**
* Initialize the UDP server
*/
function startDgramServer(config, connection) {
	this.server = dgram.createSocket('udp4', function (msg, rinfo) {
		var msgParts = msg.toString().match(/^([^:]+):([^:]+):(.*)$/);
		if (!msgParts) {
			log("Invalid message");
			return;
		};
		var token = msgParts[1];
		var collapseKey = msgParts[2];
		var notification = msgParts[3];
		connection.notifyDevice(token, collapseKey, notification);
	});
	this.server.bind(config.port || 8120);
}

/**
* Initialize the debug server (stats)
*/
function startDebugServer(config,connection){
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
					var stats = connection.stats();
					for(key in stats){
						stream.write(key + " : " + stats[key] + "\n");
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
	debugServer.listen(config.debugServerPort || config.port + 100);
}

/**
* Startup instructions
*/
var node2dmServer = new node2dm(config);
startDebugServer(config,node2dmServer);
startDgramServer(config,node2dmServer);
