/*jslint sloppy: true*/
/*global require, module*/
var config = {
        cert: 'cordovapush.pem',
        certData: null,
        key:  'cordovapushkey.pem',
        keyData: null,
        passphrase: '***',
        ca: null,
        gateway: 'gateway.sandbox.push.apple.com',
        port: 2195,
        enhanced: true,
        errorCallback: undefined,
        cacheLength: 100
    };
module.exports = config;
