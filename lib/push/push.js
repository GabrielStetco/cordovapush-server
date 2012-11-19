/*jslint sloppy: true*/
/*global require, module*/
var service = {
    ios: require('./ios'),
    android: require('./android')
};

module.exports.configure = function (config) {
    var type;
    for (type in config) {
        if (config.hasOwnProperty(type)) {
            service[type].configure(config[type]);
        }
    }
};

/*
notif = Message to send
ids = Array of ids
callback = Callback function
*/
module.exports.send = function (payload, callback) {
    var device;
    for (device in service) {
        if (service.hasOwnProperty(device) && payload.hasOwnProperty(device)) {
            service[device].send(payload.message, payload[device], callback);
        }
    }
};