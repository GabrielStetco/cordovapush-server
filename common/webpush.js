//Call modules
var dgram=require('dgram'),
	http=require('http'),
	url=require("url"),
	qs=require('querystring'),
	mongoose = require('mongoose'),
	config = require(getConfig()),
	fs=require('fs'),
	pushstats=require('./pushstats'),
	renderstats=require('./renderstats'),
	subsc=require('./subscription'),
	sendutils=require('./sendutils'),
	net=require('net');

/**
* Get the configuration
*/
function getConfig() {
	return process.argv[2] ? process.argv[2].replace(/.js$/, '') : './config.js';
};

/**
* Initialize db
*/
mongoose.connect(config.mongo, function(err) {
	if (err) { throw err; }
});

/**
* Create the schema
*/
var tokenSchema = new mongoose.Schema({
	token : String 
});

/**
* Create the models
*/
var models={
    iOSTokenModel : mongoose.model('iostoken', tokenSchema),
    androidTokenModel : mongoose.model('androidtoken', tokenSchema)
};

/**
* Create UDP client
*/
var client = dgram.createSocket("udp4");

/**
* Check if gcm and apn servers are up and running
*/
var gcmServerIsUp;
var apnServerIsUp;

var tcpClientgcm = net.connect(config.n2gcmstatport, config.n2gcmip, function() {
    gcmServerIsUp = true;
});

var tcpClientApn = net.connect(config.n2apnstatport, config.n2apnport, function() {
    apnServerIsUp = true;
});
	
tcpClientgcm.on('error', function() {
	gcmServerIsUp = false;
});

tcpClientApn.on('error', function() {
	apnServerIsUp = false;
});

/**
* Create HTTP server
*/
function onRequest(request, response) {
	request.setEncoding("utf8");
	var pathname = url.parse(request.url).pathname;
	route(pathname,request,response);
};
http.createServer(onRequest).listen(config.lport);

//urls handled
var handle= new Object();
handle["/send"] = send;
handle["/"] = handle["/send"];
handle["/subscribe"] = subscribe;
handle["/unsubscribe"] = unsubscribe;
handle["/stats"] = stats;

/**
* Routing urls based on urls handled
*/
function route(pathname,request,response) {
	if (typeof handle[pathname] === 'function') {
		handle[pathname](request,response);
	}else{
	    //if no action matched, try to get a file (css,js,etc.)
        var filename = request.url.substring(1,request.url.lentgh);
        fs.readFile(filename,function(err,data){
            try{
                response.write(data);
            }catch(e){
                response.statusCode = 404;
                response.write(fs.readFileSync("404.html"));
            }finally{
                response.end();
            }
        }); 
    }
};

/**
* Send notifications
*/
function send(request,response) {
	var postdata = "";
	request.addListener("data", function(chunk) {
		postdata+=chunk;
	});
	request.addListener("end", function() {
		var data = qs.parse(postdata);
        if(postdata===""){
            fs.readFile('sendpush.html', 'utf-8', function(err,data){
                if(err){
                    return console.log(err);
                }
                response.writeHead(200,{'Content-Type':'text/html'});
                response.write(data);
                response.end();
           });
        } else{
            routingPostData(response,sendutils.format(data));
        }
	});
};

var parallelizeCounter=1;

/**
* Routing data to send messages to the correct(s) server(s)
*/
function routingPostData(response,data){
    if(sendutils.testFor(data,["collapsekey","badge","sound","alert","payload"])){
        var datas = sendutils.cut(data,[["collapsekey","payload"],["badge","sound","alert","payload"]]);
        var parallelize = 2;
        parallelizeCounter=1;
        sendToDevice(sendutils.create(datas[1]), config.n2apnport, config.n2apnip, "iOSTokenModel",response, parallelize);
        sendToDevice(sendutils.create(datas[0]), config.n2gcmport, config.n2gcmip, "androidTokenModel",response, parallelize);
    } else if(sendutils.testFor(data,["collapsekey","payload"])){
        sendToDevice(sendutils.create(data), config.n2gcmport, config.n2gcmip, "androidTokenModel",response);
    } else if(sendutils.testFor(data,["badge","sound","alert","payload"])){
        sendToDevice(sendutils.create(data), config.n2apnport, config.n2apnip, "iOSTokenModel",response);
    }else {
        response.write(fs.readFileSync("header-send.html"));
        response.write('<h1>data sent failed : invalid arguments!</h1>');
        response.write(fs.readFileSync("footer.html"));
        response.end();
    }
}

/**
* Write the response for a sucessful sending of message
*/
function writeResponseSucessSending(response){
    response.write(fs.readFileSync("header-send.html"));
    response.write('<h1>Data has been sent!</h1>');
    if(!apnServerIsUp){
        response.write('<h2>Beware, Node2APN Server is down!</h2>');
    }
    if(!gcmServerIsUp){
        response.write('<h2>Beware, Node2DM Server is down!</h2>');
    }
    response.write(fs.readFileSync("footer.html"));
    response.end();
}



/**
* Send notifications to the speficied device plateform
*/
function sendToDevice(message, port, ip, model,response, parallelize){

    if(model=="androidTokenModel"){
        var successConnectgcm = function(message, port, ip, model, response, parallelize){
            return function(){
              gcmServerIsUp = true;
              performSendToDevice(message, port, ip, model);
              if(!parallelize || parallelize==parallelizeCounter) {
                writeResponseSucessSending(response);
              }else{
                parallelizeCounter++;
              }
            }
        };

        var callbackgcm = successConnectgcm(message, port, ip, model,response,parallelize);
        tcpClientgcm = net.connect(config.n2gcmstatport, config.n2gcmip, callbackgcm);
        
        
        var errorConnectgcm = function(response, parallelize){
            return function(){
              gcmServerIsUp = false;
              if(!parallelize || parallelize==parallelizeCounter) {
                writeResponseSucessSending(response);
              }else{
                parallelizeCounter++;
              }
            }
        };

        var errorCallbackgcm = errorConnectgcm(response,parallelize);
        tcpClientgcm.on('error', errorCallbackgcm);
        
    }else{
        var successConnectApn = function(message, port, ip, model,response,parallelize){
            return function(){
                apnServerIsUp = true;
                performSendToDevice(message, port, ip, model);
                if(!parallelize || parallelize==parallelizeCounter) {
                    writeResponseSucessSending(response);
                }else{
                    parallelizeCounter++;
                }
            }
        };

        var callbackApn = successConnectApn(message, port, ip, model,response,parallelize);
        tcpClientApn = net.connect(config.n2apnstatport, config.n2apnport, callbackApn);
      
        var errorConnectApn = function(response, parallelize){
            return function(){
               apnServerIsUp = false;
              if(!parallelize || parallelize==parallelizeCounter) {
                writeResponseSucessSending(response);
              }else{
                parallelizeCounter++;
              }
            }
        };

        var errorCallbackApn = errorConnectApn(response,parallelize);
        tcpClientApn.on('error', errorCallbackApn);
    }
};

function performSendToDevice(message, port, ip, model){
    var query = models[model].find();
    query.limit(100);
    query.exec(function (err, tokens) {
	    if (err) {
            throw err;
        }
        var devicetoken;
        var messageToSend;
        console.log("tokens",tokens);
        if(tokens.length===0){
            console.log("no token found");
        } else {
            for (var i = 0; i < tokens.length; i++) {
                devicetoken = tokens[i];
                console.log("token found: "+devicetoken);
                //Preparing the message
                messageToSend = new Buffer(devicetoken.token+":"+message);
                //Sending message to push service
                client.send(messageToSend, 0, messageToSend.length, port, ip, function(err, bytes) {
                    //Nothing can be done here
                });
            }
        }
    });
}



/**
* Subscribe the device to the push service
*/
function subscribe(request,response) {
	subsc.performAction(request,saveToken);
	response.end();
};

/**
* Unsubscribe the device to the push service
*/
function unsubscribe(request,response) {
	subsc.performAction(request,deleteToken);
	response.end();
};

/**
* save a token to db
*/
function saveToken(model, dtoken){
    models[model].findOne({ token: dtoken}, function (err, doc){
        if(!doc){
            var newToken = new models[model]({ token : dtoken });
            newToken.save(function (err) {
                if (err) { 
                    throw err; 
                }
            });
        }
    });
};

/**
* delete token from db
*/
function deleteToken(model, dtoken){
    models[model].findOne({ token: dtoken}, function (err, doc){
        if(doc){
            doc.remove(function (err) {
                if (err) { 
                    throw err; 
                }
            });
        }
    });
};

/**
* Get and serve server stats
*/
function stats(request,response) {
	pushstats.getstats(function(stats){
	    response.write(fs.readFileSync("header-stats.html"));
		response.write(renderstats.render(stats));
		response.write(fs.readFileSync("footer.html"));
		response.end();
	});
};
