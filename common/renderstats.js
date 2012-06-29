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
};

/**
* Parse response from debug servers
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
};

exports.render = renderStats;
