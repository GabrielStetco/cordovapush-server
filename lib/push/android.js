/*jslint sloppy: true*/
/*global require, module*/
var gcm = require('node-gcm');
var under = require('underscore');

var sender;
var retries = 0;
/*
config.sender = Google Server API Key
config.retries = No. of retries
*/
module.exports.configure = function (config) {
    sender = new gcm.Sender(config.sender);
};

/*
notif = Message to send
ids = Array of ids
callback = Callback function
*/
module.exports.send = function (notif, ids, callback) {
    var message = new gcm.Message();
    message.addData('title', 'message1');
    message.addData('message', 'message2');
    message.collapseKey = 'demo';
    message.delayWhileIdle = true;
    message.timeToLive = 3;
    sender.send(message, ids, 0, function (result) {});
    callback();
};