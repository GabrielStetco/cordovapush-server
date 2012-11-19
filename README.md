# Cordova Push

```js
    var express = require('cordovapush');
    cordovapush.up(config);
```

## Installation

From npm:
```shell
    $ npm install -g cordovapush
```

## Quick Start

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

## From zipball

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

### Config

#### iOS

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

#### Android

```js
{
	sender : 'api'
}
```

#### Web

```js
{
	port : 8080,
	debug : true
}
```

#### Mongo

```js
{
	url : 'mongodb://localhost/cordova'
}
```

## Dependencies

  * apn
  * commander
  * express
  * node-gcm
  * mongoose
  * underscore
