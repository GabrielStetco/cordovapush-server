/*
 * Required variables
 *
 * mongodb
 * listening port
 * node2dm ip
 * node2pm port
 * node2pm stat port
 * node2apn ip
 * node2apn port
 * node2apn stat port
 */

var config = {}
config.mongo="mongodb://localhost/push";
config.lport="8888";
config.n2gcmip= "localhost";
config.n2gcmport=8120;
config.n2gcmstatport=8220;
config.n2apnip= "localhost";
config.n2apnport = 8121;
config.n2apnstatport = 8221;
module.exports = config;
