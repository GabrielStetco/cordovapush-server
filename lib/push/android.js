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
    var message = JSON.parse(notif.payload),
        note = new gcm.Message(),
        key;
    for (key in message) {
        if (message.hasOwnProperty(key)) {
            note.addData(key, message[key]);
        }
    }
    note.collapseKey = notif.collapsekey;
    note.delayWhileIdle = true;
    note.timeToLive = 3;
    sender.send(note, ids, 0, function (result) {});
    callback();
};