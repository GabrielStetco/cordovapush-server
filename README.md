# Cordova Push Server

```js
    var express = require('cordovapush');
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

#### Android

GCM service configuration:
```js
{
	sender : 'key api'
}
```
  + [GCM documentation](http://developer.android.com/guide/google/gcm/gs.html)

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
http://localhost:port/send (GET & POST)
```

### Subscribe

```
http://localhost:port/subscribe (POST)
```

or


```
http://localhost:port/save (POST)
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
http://localhost:port/unsubscribe (POST)
```

or


```
http://localhost:port/clean (POST)
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
http://localhost:port/alias (POST)
```

data:
```js
{
	type : device_type (android || ios),
	token : device_token,
	alias : alias_name
}

## Dependencies

  * [apn](https://github.com/argon/node-apn)
  * [commander](https://github.com/visionmedia/commander.js)
  * [express](https://github.com/visionmedia/express)
  * [node-gcm](https://github.com/ToothlessGear/node-gcm)
  * [mongoose](https://github.com/LearnBoost/mongoose)
  * [underscore](https://github.com/documentcloud/underscore)
