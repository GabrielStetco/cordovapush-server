/*jslint sloppy: true*/
/*global require, module*/
var apn = require('apn');

var connection;
/*
config = https://github.com/argon/node-apn#connecting
*/
module.exports.configure = function (config) {
    connection = new apn.Connection(config);
};

/*
notif = Message to send
ids = Array of ids
callback = Callback function
*/
module.exports.send = function (notif, ids, callback) {
    var i, l = ids.length, id, device, note, message;
    note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.badge = 3;
    note.sound = "ping.aiff";
    note.alert = "You have a new message";
    note.payload = {'messageFrom': 'Caroline'};
    note.device = null;
    for (i = 0; i < l; i = i + 1) {
        id = ids[i];
        device = new apn.Device(id);
        connection.sendNotification(note.clone(device));
    }
    callback();
};