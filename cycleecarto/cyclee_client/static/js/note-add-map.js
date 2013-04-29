
var addnotemap_once = true;

function addnotemap_init(){ // gets screwed up onclick before switchpage
    // console.log( 'addnotemap_init()');
    
    addnotemap_once = false;
    
    var theHTML = '<div id="addnotemap-map" class="mapcontainer"></div>';
    $('#addnotemap').html(theHTML).addClass('map-location');
    $('#addnotemap').fadeIn();

    $('#addnotemap').css('height',wrap_h).css('top',header_h);

    var mapzoom = 14;

    if(addnotemap.createMap){ // run once and removed
        addnotemap.createMap(nyc_lat,nyc_lng,mapzoom);        
    }
    addnotemap_locate();
}

function addnotemap_locate(){
    $('#addnotemap').fadeIn();
    var mapzoom = 14;
    
    if ( location_reply ){
        var mapzoom = 15;
        var thisgeo = location_reply.split(',');
        addnotemap.setView(thisgeo[1],thisgeo[0],mapzoom);
    }
    else { navigator.geolocation.getCurrentPosition(updatePosition,error, {enableHighAccuracy: false, maximumAge: 300000}); }  // mk - use gps / max age 5 min.

    function updatePosition(p){
	    console.log(p);
	    addnotemap.setView(p.coords.latitude,p.coords.longitude,mapzoom);        
	}
	function error(){}
}


$('#addnote').one('click','.drag-me',dragPrompt);
$('#addnotemap').one('click',dragPrompt);
function dragPrompt(){ $('#addnote .drag-me').fadeOut(); }