var net=require('net'), config = require(serversConfig());

//Get config
function serversConfig() {
	return process.argv[2] ? process.argv[2].replace(/.js$/, '') : './config';
}

function getstatsFromServer(type,port,ip,callback){
	var stringdata = "";
	var client = net.connect(port,ip, function() {
		client.write('stats');
	});

	client.on('data', function(data) {
		stringdata = stringdata + data.toString();
		client.end();
	});
	
	client.on('end', function() {
		callback("server: "+type+"\n"+stringdata);
	});
	
	client.on('error', function() {
		callback("server: "+type+"\nstatus: unreachable\n");
	});
}

function fork (async_calls, shared_callback) {
  var counter = async_calls.length;
  var all_results = [];
  function makeCallback (index) {
    return function () {
      counter --;
      var results = [];
      // we use the arguments object here because some callbacks 
      // in Node pass in multiple arguments as result.
      for (var i=0;i<arguments.length;i++) {
        results.push(arguments[i]);
      }
      all_results[index] = results;
      if (counter == 0) {
        shared_callback(all_results);
      }
    }
  }

  for (var i=0;i<async_calls.length;i++) {
    async_calls[i](makeCallback(i));
  }
}


function getstats(callback){
    function getstatsdm (c){getstatsFromServer("Android",config.n2dmstatport,config.n2dmip,c)};
    function getstatsapn (c){getstatsFromServer("iOS",config.n2apnstatport,config.n2apnip,c)};
    function cback (result) {
        callback(result[0]+"\n"+result[1]);
    }
    fork([getstatsdm,getstatsapn],cback);
};

exports.getstats = getstats;
