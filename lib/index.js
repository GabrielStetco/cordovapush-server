/*jslint sloppy: true*/
/*global require, module*/
var express = require('express');
var app = express();
var path = require('path');
var under = require('underscore');
var Device = require('./db/mongo');

var up = function (config) {
    var device = {
        ios : new Device(),
        android : new Device()
    },
        push = require('./push/push'),
        web = require('./web/web');
    
    device.ios.configure(config.mongo, 'ios');
    device.android.configure(config.mongo, 'android');
    push.configure(config.devices);
    web.configure(config.web, device, push);
};

module.exports.up = up;