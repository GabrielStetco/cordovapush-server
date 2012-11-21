/*jslint sloppy: true*/
/*global require, module*/
var under = require('underscore');

module.exports.compatible = function (message) {
    var items = under.keys(message),
        compatible = false;
    if (items.indexOf('badge') > -1 && items.indexOf('sound') > -1 && items.indexOf('alert') > -1 && items.indexOf('payload') > -1) {
        compatible = true;
    }
    return compatible;
};