$(document).ready(function(){
    $("a.transition").on("click",function(event){
        event.preventDefault();
        window.location = this.href;
    });
});
