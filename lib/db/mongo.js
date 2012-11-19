/*jslint sloppy: true*/
/*global require, module*/
var mongoose = require('mongoose');

module.exports = function () {
    var schema, Device;
    /*config = configuration object*/
    this.configure = function (config, type) {
        var db = mongoose.createConnection(config.url);
        schema = mongoose.Schema({ token : 'string', aliases : [] });
        Device = db.model(type, schema);
    };
    /*id = token*/
    this.save = function (id) {
        var device = new Device({token : id});
        device.save();
    };
    /*id = token*/
    this.clean = function (id) {
        Device.remove({token: id}, function (err) {});
    };
    /*
    id = token
    alias = alias to add
    */
    this.alias = function (id, alias) {
        Device.find({token: id}, function (err, device) {
            device.aliases.push(alias);
            device.save();
        });
    };
    /*callback = callback to call at the end of the query*/
    this.list = function (callback, alias) {
        var query;
        if (alias) {
            query = Device.find(); //TODO find the good devices
        } else {
            query = Device.find();
        }
        query.exec(callback);
    };
};