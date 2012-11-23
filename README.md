# Cordova Push Server

Cordova Push Server is a cross-plateform push server based on [node-apn](https://github.com/argon/node-apn) and [node-gcm](https://github.com/ToothlessGear/node-gcm). Cordova Push Server currently supports iOS (APN) and android (GCM) platforms.

Cordova Push Server can be called in shell:
```shell
$ cordovapush
```

Or in a JavaScript application:
```js
var cordovapush = require('cordovapush');
```


## Documentation

The documentation is [here](docs).

## Quick start

### Pre-requisite

+ MongoDB ([MongoDB Download page](http://www.mongodb.org/downloads)).

Start MongoDB:
```shell
$ sudo mongod
```

### Install & Start

```shell
$ npm install -g cordovapush
```

Start server:

```shell
$ cordovapush new [server_name]
$ cd [server_name]
$ cordovapush start
```


### Configuration

#### Android

GCM service configuration:
```js
{
	sender : 'api_key'                                 /* Your API Key */
}
```
  + [GCM documentation](http://developer.android.com/guide/google/gcm/gs.html)

#### iOS

APN service configuration:
```js
{
	cert: 'absolute/path/to/the/cordovapush.pem',      /* Certificate file path */
	key:  'absolute/path/to/the/cordovapushkey.pem',   /* Key file path */
	passphrase: '****',                                /* Passphrase for the Key file */
	gateway: 'gateway.sandbox.push.apple.com',         /* Gateway address */
	port: 2195,                                        /* Gateway port */
	enhanced: true,                                    /* Enable enhanced format */
	cacheLength: 100                                   /* Number of notifications to cache */
}
```
  + [node-apn documentation](https://github.com/argon/node-apn#connecting)

#### Web

Web server configuration:
```js
{
	port : 8080,                                       /* Listening port */
	debug : true                                       /* Active logging request mode */
}
```

#### Mongo

MongoDB configuration:
```js
{
	url : 'mongodb://localhost/cordova'                /* MongoDB URL */
}
```

### Usage

#### Sending interface

```
http://domain:port/send (GET & POST)
```

#### Subscribe

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

#### Unsubscribe

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

#### Alias

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

### Options

#### new

Create a new server directory.

#### start

Start server from current directory.

## Dependencies

  * [commander](https://github.com/visionmedia/commander.js)
  * [express](https://github.com/visionmedia/express)
  * [node-apn](https://github.com/argon/node-apn)
  * [node-gcm](https://github.com/ToothlessGear/node-gcm)
  * [mongoose](https://github.com/LearnBoost/mongoose)
  * [underscore](https://github.com/documentcloud/underscore)
  * [wrench](https://github.com/ryanmcgrath/wrench-js)

## History/Changelog

Take a look at the [history](https://github.com/smile-mobile/cordovapush/blob/master/server/HISTORY.md).
