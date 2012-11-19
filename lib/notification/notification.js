/*jslint sloppy: true*/
/*global require, module*/
var under = require('underscore');

module.exports.format = function (message) {
    var result = {},
        items = under.keys(message);
    result.message = message;
    if (items.indexOf('collapsekey') > -1 && items.indexOf('badge') > -1 && items.indexOf('sound') > -1 && items.indexOf('alert') > -1 && items.indexOf('payload') > -1) {
        result.android = [];
        result.ios = [];
    } else if (items.indexOf('collapsekey') > -1 && items.indexOf('payload') > -1) {
        result.android = [];
    } else if (items.indexOf('badge') > -1 && items.indexOf('sound') > -1 && items.indexOf('alert') > -1 && items.indexOf('payload') > -1) {
        result.ios = [];
    }
    return result;
};