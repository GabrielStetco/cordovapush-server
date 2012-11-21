/*jslint sloppy: true*/
/*global require, module*/
var apn = require('apn'),
    connection;
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
    var message = notif.payload, i, l = ids.length, id, device, note;
    note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.badge = notif.badge;
    note.sound = notif.sound;
    note.alert = notif.alert;
    note.payload = message;
    note.device = null;
    for (i = 0; i < l; i = i + 1) {
        id = ids[i];
        device = new apn.Device(id);
        connection.sendNotification(note.clone(device));
    }
    callback();
};