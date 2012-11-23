[Table of contents](https://github.com/smile-mobile/cordovapush/tree/master/server/docs#table-of-contents)

## Configuration

Configuration files are located in server_folder/config.

#### Web (web.json)

Web server configuration:
```js
{
	port : 8080,                                       /* Listening port */
	debug : true                                       /* Active logging request mode */
}
```

#### Mongo (mongo.json)

MongoDB configuration:
```js
{
	url : 'mongodb://localhost/cordova'                /* MongoDB URL */
}
```

#### Android (platforms/android.json)

GCM service configuration:
```js
{
	sender : 'api_key'                                 /* Your API Key */
}
```
  + [GCM documentation](http://developer.android.com/guide/google/gcm/gs.html)

#### iOS (platforms/ios.json)

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
