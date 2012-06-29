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

exports.format = formatData;
exports.cut = cutPostData;
exports.create = createMessage;
exports.testFor = testPropertiesOfData;
