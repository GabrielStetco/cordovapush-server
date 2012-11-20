# Cordova Push Server

Cordova Push Server is a cross-plateform push server based on [node-apn](https://github.com/argon/node-apn) and [node-gcm](https://github.com/ToothlessGear/node-gcm). Cordova Push Server currently supports iOS (APN) and android (GCM) platforms.

Cordova Push Server can be called in shell:
```shell
$ cordovapush
```

Or in a JavaScript application:
```js
var cordovapush = require('cordovapush');
cordovapush.up(config);
```

## Installation

From npm:
```shell
$ npm install -g cordovapush
```

### Quick Start

Start MongoDB:
```shell
$ sudo mongod
```

Start cordovapush server:
```shell
$ cordovapush
```

Help:
```shell
$ cordovapush --help
```

### From zipball

Install dependencies:
```shell
$ npm install
```

Execution right (if needed):
```shell
$ chmod +x ./bin/cordovapush
```

Start server:
```shell
$ ./bin/cordovapush
```

## Configuration

#### Android

GCM service configuration:
```js
{
	sender : 'api_key'
}
```
  + [GCM documentation](http://developer.android.com/guide/google/gcm/gs.html)

#### iOS

APN service configuration:
```js
{
	cert: 'cordovapush.pem',
	certData: null,
	key:  'cordovapushkey.pem',
	keyData: null,
	passphrase: '****',
	ca: null,
	gateway: 'gateway.sandbox.push.apple.com',
	port: 2195,
	enhanced: true,
	errorCallback: undefined,
	cacheLength: 100
}
```
  + [node-apn documentation](https://github.com/argon/node-apn#connecting)

#### Web

Web server configuration:
```js
{
	port : 8080,
	debug : true
}
```

#### Mongo

MongoDB configuration:
```js
{
	url : 'mongodb://localhost/cordova'
}
```

##Usage

### Sending interface

```
http://domain:port/send (GET & POST)
```

### Subscribe

```
http://domain:port/subscribe (POST)
```

or


```
http://domain:port/save (POST)
```

data:
```js
{
	type : device_type (android || ios),
	token : device_token
}
```

### Unsubscribe

```
http://domain:port/unsubscribe (POST)
```

or


```
http://domain:port/clean (POST)
```

data:
```js
{
	type : device_type (android || ios),
	token : device_token
}
```

### Alias

```
http://domain:port/alias (POST)
```

data:
```js
{
	type : device_type (android || ios),
	token : device_token,
	alias : alias_name
}
```

## Options

### --android

Give a path to an [android configuration file](#android).

### --ios

Give a path to an [iOS configuration file](#ios).

### --web

Give a path to a [web server configuration file](#web).

### --mongo

Give a path to a [mongoDB configuration file](#mongo).

###

## Dependencies

  * [apn](https://github.com/argon/node-apn)
  * [commander](https://github.com/visionmedia/commander.js)
  * [express](https://github.com/visionmedia/express)
  * [node-gcm](https://github.com/ToothlessGear/node-gcm)
  * [mongoose](https://github.com/LearnBoost/mongoose)
  * [underscore](https://github.com/documentcloud/underscore)
