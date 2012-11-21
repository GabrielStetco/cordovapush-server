/*jslint sloppy: true*/
/*global require, module*/
var path = require('path'),
    service = {};

module.exports.configure = function (config, pwd) {
    var platform;
    for (platform in config) {
        if (config.hasOwnProperty(platform)) {
            service[platform] = require(path.join(pwd + '/platforms/', platform + '/push.js'));
            service[platform].configure(config[platform]);
        }
    }
};

/*
notif = Message to send
ids = Array of ids
callback = Callback function
*/
module.exports.send = function (payload, callback) {
    var platform;
    for (platform in service) {
        if (service.hasOwnProperty(platform) && payload.hasOwnProperty(platform)) {
            service[platform].send(payload.message, payload[platform], callback);
        }
    }
};