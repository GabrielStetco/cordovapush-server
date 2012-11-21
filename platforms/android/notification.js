/*jslint sloppy: true*/
/*global require, module*/
var under = require('underscore');

module.exports.compatible = function (message) {
    var items = under.keys(message),
        compatible = false;
    if (items.indexOf('collapsekey') > -1 && items.indexOf('payload') > -1) {
        compatible = true;
    }
    return compatible;
};