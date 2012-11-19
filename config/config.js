/*jslint sloppy: true*/
/*global require, module*/
var config = {
        devices : {
            ios : require('./ios'),
            android : require('./android')
        },
        web : require('./web'),
        mongo : require('./mongo')
    };
module.exports = config;