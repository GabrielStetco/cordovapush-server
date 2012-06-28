//Call modules
var dgram=require('dgram'), http=require('http'), url=require("url"), qs = require('querystring'), mongoose = require('mongoose'), config = require(serversConfig()),fs=require('fs'), pushstats = require('./pushstats');

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
                console.log("nothing to do for "+request.url);
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
            var formattedData = formatData(data);
            routingPostData(response,formattedData);
            response.end();
        }
	});
};

/**
* Format data
*/
function formatData(data){
    if(data.payload){
        var tmp = JSON.parse(data.payload);
        data.payload =JSON.stringify(tmp);
    }
    return data;
}

/**
* Routing data to send messages to the correct(s) server(s)
*/
function routingPostData(response,data){
    if(testPropertiesOfData(data,["collapsekey","badge","sound","alert","payload"])){
        var datas = cutPostData(data,[["collapsekey","payload"],["badge","sound","alert","payload"]]);
        sendToDevice(createMessage(datas[0]), config.n2dmport, config.n2dmip, "androidTokenModel");
        sendToDevice(createMessage(datas[1]), config.n2apnport, config.n2apnip, "iOSTokenModel");
        writeResponseSucessSending(response);
    } else if(testPropertiesOfData(data,["collapsekey","payload"])){
        sendToDevice(createMessage(data), config.n2dmport, config.n2dmip, "androidTokenModel");
        writeResponseSucessSending(response);
    } else if(testPropertiesOfData(data,["badge","sound","alert","payload"])){
        sendToDevice(createMessage(data), config.n2apnport, config.n2apnip, "iOSTokenModel");
        writeResponseSucessSending(response);
    }else {
        response.write(fs.readFileSync("header.html"));
        response.write('<div class="sendinginfo"><p>data sent failed : invalid arguments!</p></div>');
        response.write(fs.readFileSync("footer.html"));
    }
}

/**
* Cut post data 
*/
function cutPostData(data,properties){
    var datas = new Array();
    for(i in properties){
        datas[i] = new Object();
        for(j in properties[i]){
            datas[i][properties[i][j]] = data[properties[i][j]];
        }
    }
    return datas;
}

/**
* Create the message to send to server
*/
function createMessage(data){
    var messageString ="";
    var message = new Array();
    for(var key in data){
        if(data[key] && data[key]!=""){
            message.push(data[key]);
        }
    }
    return message.join(":");
}

/**
* Test if the data is valid for properties
*/
function testPropertiesOfData(data,properties){
    var boolean = true;
    for(var property in properties) {
        if(!(data.hasOwnProperty(properties[property]) && data[properties[property]]!=="")){
            boolean = false;
            break;
        }
    }
    return boolean;
}

/**
* Write the response for a sucessful sending of message
*/
function writeResponseSucessSending(response){
    response.write(fs.readFileSync("header.html"));
    response.write('<div class="sendinginfo"><p>data has been sent!</p></div>');
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
            console.log("no token found");
        } else {
            for (var i = 0; i < tokens.length; i++) {
                devicetoken = tokens[i];
                //Preparing the message
                messageToSend = new Buffer(devicetoken.token+":"+message);
                //Sending message to node2dm service
                client.send(messageToSend, 0, messageToSend.length, port, ip, function(err, bytes) {
                    console.log("message sent");
                });
            }
        }
    });
};


/**
* Subscribe the device to the push service
*/
function subscribe(request,response) {
	var postdata = "";
	request.addListener("data", function(chunk) {
		postdata+=chunk;
	});
	
	request.addListener("end", function() {
		var data = qs.parse(postdata);
		var dtoken = data.token;
        var tokenType = data.type;
        if(tokenType ==="ios"){
            saveToken("iOSTokenModel",dtoken);
        }else if (tokenType ==="android"){
            saveToken("androidTokenModel",dtoken);
        }else{
            console.log("missing arg : no token type specified (ios or android)");
        }
    });
	response.end();
};

/**
* Unsubscribe the device to the push service
*/
function unsubscribe(request,response) {
	var postdata = "";
	request.addListener("data", function(chunk) {
		postdata+=chunk;
	});
	
	request.addListener("end", function() {
		var data = qs.parse(postdata);
		var dtoken = data.token;
        var tokenType = data.type;
        if(tokenType ==="ios"){
            deleteToken("iOSTokenModel",dtoken);
        }else if (tokenType ==="android"){
            deleteToken("androidTokenModel",dtoken);
        }else{
            console.log("missing arg : no token type specified (ios or android)");
        }
    });
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
                console.log('token added: '+dtoken);
            });
        }else{
            console.log("already subscribed");
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
                console.log('token removed: '+dtoken);
            });
        }else{
            console.log("not subscribed");
        }
    });
};

/**
* Get and serve server stats
*/
function stats(request,response) {
	pushstats.getstats(function(stats){
	    response.write(fs.readFileSync("header.html"));
		response.write(renderStats(stats));
		response.write(fs.readFileSync("footer.html"));
		response.end();
	});
};

/**
* Render stats in html
*/
function renderStats(stats){
    var parts = parseStats(stats);
    var htmlStats="";
    var patt=/\:/g;
    for(server in parts){
    htmlStats+="<table class='table-bordered table-striped'><thead><th>Property</th><th>Value</th></thead><tbody>";
        for(info in parts[server]){
        if( (parts[server][info].split(patt))[1]!=undefined && (parts[server][info].split(patt))[1]!=null )
            htmlStats+="<tr><td>"+(parts[server][info].split(patt))[0]+"</td><td>"+(parts[server][info].split(patt))[1]+"</td></tr>";
        }
    htmlStats+="</tbody></table><br />";
    }
    return htmlStats;
}

/**
* Parse the response from debug servers
*/
function parseStats(stats){
    var patt1=/END+\n+/g;
    var patt2=/\,/g;
    var parts = new Array();
    var parts = (stats.split(patt1));
    var i;
    var sousparts = new Array();
    for(i=0; i<parts.length;i++){
        parts[i]=parts[i].replace(/\n/g, " , ");
    }
    for(i=0; i<parts.length;i++){
        if(parts[i]!=''){
            sousparts[i]=parts[i].split(patt2);
        }
    }
    return sousparts;
}
