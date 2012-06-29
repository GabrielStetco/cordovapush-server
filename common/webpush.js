//Call modules
var dgram=require('dgram'),
	http=require('http'),
	url=require("url"),
	qs=require('querystring'),
	mongoose = require('mongoose'),
	config = require(serversConfig()),
	fs=require('fs'),
	pushstats=require('./pushstats'),
	renderstats=require('./renderstats'),
	subsc=require('./subscription'),
	sendu=require('./sendutils');

/**
* Get the configuration
*/
function serversConfig() {
	return process.argv[2] ? process.argv[2].replace(/.js$/, '') : './config';
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
           fs.readFile('sendpush.html',function(err,data){
            response.writeHead(200,{'Content-Type':'text/html'});
            response.write(data);
            response.end();
           });
        } else{
            routingPostData(response,sendu.format(data));
            response.end();
        }
	});
};

/**
* Routing data to send messages to the correct(s) server(s)
*/
function routingPostData(response,data){
    if(sendu.testFor(data,["collapsekey","badge","sound","alert","payload"])){
        var datas = sendu.cut(data,[["collapsekey","payload"],["badge","sound","alert","payload"]]);
        sendToDevice(sendu.create(datas[0]), config.n2dmport, config.n2dmip, "androidTokenModel");
        sendToDevice(sendu.create(datas[1]), config.n2apnport, config.n2apnip, "iOSTokenModel");
        writeResponseSucessSending(response);
    } else if(sendu.testFor(data,["collapsekey","payload"])){
        sendToDevice(sendu.create(data), config.n2dmport, config.n2dmip, "androidTokenModel");
        writeResponseSucessSending(response);
    } else if(sendu.testFor(data,["badge","sound","alert","payload"])){
        sendToDevice(sendu.create(data), config.n2apnport, config.n2apnip, "iOSTokenModel");
        writeResponseSucessSending(response);
    }else {
        response.write(fs.readFileSync("header-send.html"));
        response.write('<h1>data sent failed : invalid arguments!</h1>');
        response.write(fs.readFileSync("footer.html"));
    }
}

/**
* Write the response for a sucessful sending of message
*/
function writeResponseSucessSending(response){
    response.write(fs.readFileSync("header-send.html"));
    response.write('<h1>data has been sent!</h1>');
    response.write(fs.readFileSync("footer.html"));
}

/**
* Send notifications to the speficied device plateform
*/
function sendToDevice(message, port, ip, model){
    var query = models[model].find();
    query.limit(100);
    query.exec(function (err, tokens) {
	    if (err) {
            throw err;
        }
        var devicetoken;
        var messageToSend;
        if(tokens.length===0){
            log("no token found");
        } else {
            for (var i = 0; i < tokens.length; i++) {
                devicetoken = tokens[i];
                //Preparing the message
                messageToSend = new Buffer(devicetoken.token+":"+message);
                //Sending message to push service
                client.send(messageToSend, 0, messageToSend.length, port, ip, function(err, bytes) {
                });
            }
        }
    });
};

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
