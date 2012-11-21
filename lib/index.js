/*jslint sloppy: true*/
/*global require, module*/
var express = require('express'),
    app = express(),
    path = require('path'),
    under = require('underscore'),
    Device = require('./mongo/mongo'),
    push = require('./push/push'),
    web = require('./web/web');

var start = function (config, path) {
    var platform, device = {};
    for (platform in config.platforms) {
        if (config.platforms.hasOwnProperty(platform)) {
            device[platform] = new Device();
            device[platform].configure(config.mongo, platform);
        }
    }
    push.configure(config.platforms, path);
    web.configure(config.web, device, push, path);
};
module.exports.start = start;