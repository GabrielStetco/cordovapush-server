[Table of contents](https://github.com/smile-mobile/cordovapush-server/tree/master/docs#table-of-contents)

## Start

### Start the server

```shell
$ cordovapush start
```

Cordovapush will not check if:
+ You are really placed in your server directory.
+ Your MongoDB is started.

The web interface is now accessible from [http://localhost:8080/send](http://localhost:8080/send).


### Start using your server


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