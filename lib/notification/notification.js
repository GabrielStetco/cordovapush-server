/*jslint sloppy: true*/
/*global require, module*/
var path = require('path'),
    under = require('underscore'),
    service = {};

module.exports.format = function (message) {
    var result = message;
    result.payload = JSON.parse(message.payload);
    return result;
};

module.exports.compatible = function (message, platforms, pwd) {
    var result = {},
        items = under.keys(message),
        platform;
    result.message = message;
    for (platform in platforms) {
        if (platforms.hasOwnProperty(platform)) {
            service[platform] = require(path.join(pwd + '/platforms/', platform + '/notification.js'));
            if (service[platform].compatible(message)) {
                result[platform] = [];
            }
        }
    }
    return result;
};