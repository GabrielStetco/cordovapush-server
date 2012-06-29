//Call modules
var 	qs=require('querystring');

/**
* Subscribe or unsubscribe the device to the push service
*/
function performAction(request,action) {
	chunkData(request,function(data){performSubscriptionAction(data,action)});
};

/**
* Chunk post data in a resquest
*/
function chunkData(request,callback){
	var postdata = "";
	request.addListener("data", function(chunk) {
		postdata+=chunk;
	});
	request.addListener("end", function() {
		callback(qs.parse(postdata));
	});
};

/**
* Perform the given subscription action (saveToken/deleteToken) on data
*/
function performSubscriptionAction(data,action){
	var dtoken = data.token;
	var tokenType = data.type;
	if(tokenType ==="ios"){
		action("iOSTokenModel",dtoken);
	}else if (tokenType ==="android"){
		action("androidTokenModel",dtoken);
	}else{
		log("missing arg : no or wrong token type specified (ios or android)");
	}
};

exports.performAction = performAction;
