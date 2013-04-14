/***********
 * ride route tracing
 *
 * requires phonegap 
 * code below demos as web app
 * but does not work with screen off
 * a few lines from here will do the trick:
 * https://github.com/Cyclee/cyclee-trace/blob/master/www/js/bike.js
 *
**/


/***********
 * =ride
 *
**/

$('#nav-ride').on('click',ride_init);

$('#nav-ride-back').on('click',function(){ 
    $(this).addClass('hidden'); 
    $('#nav-ride').removeClass('hidden'); 
    $('#nav-notes').click(); 
});

function ride_init(){
  
  $('#nav-ride').addClass('hidden');
  $('#nav-ride-back').removeClass('hidden');
  
  $('#ride-count').text( rideID + ' rides');
  $('#ride-msg').delay('5000').fadeOut('slow');  
  
  // get total rides from CartoDB
  ride_count = 5;
  ride_id = ride_count + 1;

  // get total time and distnace from CartoDB
  
};


/***********
 * =ride clock
 *
**/

var clock_on=0;
var clock_int;
var watch_int;

var clock_start,
clock_now,
clock_elapsed,
clock_hrs;

var clock_tick = function () {
     clock_now = moment(new Date());
     clock_elapsed = clock_now.diff(clock_start);
     clock_hrs = moment.duration(clock_elapsed).hours();
     clock_elapsed = moment(clock_elapsed).format("mm:ss");
     clock_elapsed = clock_hrs + ':' + clock_elapsed
     clock.text(clock_elapsed);
};

/***********
 * =ride start stop
 *
**/
var rideID
if ( localStorage.rideid ) {
    rideID = Number(localStorage.rideid);
    console.log('rideID: ' + rideID);
}
else {
    rideID = 0;
    console.log('rideID: ' + rideID);
}

var trace_count = 0;


$('#ride-toggle').click(function(){
    if ( clock_on == 0 ) {
        $('#ride-toggle .entypo').html('&#9632;').addClass('active');
        $('#ride-toggle small').text('Stop');
        clock_on = 1;
        ride_start();
    }
    else {
        $('#ride-toggle .entypo').html('&#9654;').removeClass('active');
        $('#ride-toggle small').text('Start Ride');
        clock_on = 0;
        ride_stop();
    }
});

function ride_start(){
    clock_start = moment(new Date());
    clock = $('#clock');
    clock_tick();
    clock_int = self.setInterval(clock_tick, 1000);
    
    rideID += 1;
    watch_int = navigator.geolocation.watchPosition(watchTrace,error,{enableHighAccuracy:true}); 
}

function ride_stop(){
     clock_int=window.clearInterval(clock_int);
     watch_int=navigator.geolocation.clearWatch(watch_int);
     var msg = 'Ride Complete';
     feedback_msg(msg);
     
     trace_line();
     
     trace_count = 0;
     localStorage.rideid = rideID;
     $('#ride-count').text( rideID + ' rides');
     
};




/***********
 * =ride trace location
 *
**/


function watchTrace(position){
    console.log(position.coords.latitude, position.coords.longitude);
    $('#trace-location').text(position.coords.latitude + ',' + position.coords.longitude );
    trace_carto(position.coords.latitude, position.coords.longitude);
    
    trace_count += 1;
}

// add point to CartoDB
function trace_carto(lati,longi) {
    //INSERT A GPS TRACE

    if (!send_to_central) { // send to cartoDB?

        var gpsTimestamp ="now()";

        var sqlInsert ="&q=INSERT INTO gps_traces(gps_timestamp,ride_id,trace_id,username,the_geom) VALUES("+ gpsTimestamp +","+ rideID +","+ trace_count +",'"+ username +"',ST_SetSrid(st_makepoint("+ longi +","+ lati +"),4326))";
        var theUrl = url_cartoData + cartoKey + sqlInsert;
        console.log('trace to carto: ');
        console.log(theUrl);

        $.getJSON(theUrl, function(data){
            console.log(data);
        });
    }
}


/******************************* 
 * Ride Geometry
 */

// ride complete. make line in CartoDB from points.
function trace_line() {
    //CREATE THE RIDE LINE (WHEN DONE)
    console.log('trace_line');
    if (!send_to_central) { 

        var sqlInsert = "&q=INSERT INTO rides(the_geom,username,ride_id) SELECT ST_Multi(ST_MakeLine(traces.the_geom)) as the_geom,'"+ username +"' as username,"+ rideID +" as ride_id FROM (SELECT the_geom, username FROM gps_traces WHERE username='"+ username +"' AND ride_id="+ rideID +") as traces";
        var theUrl = url_cartoData + cartoKey + sqlInsert;

        $.getJSON(theUrl, function(data){
            console.log("Line written to Carto for RideID: " + rideID ); 
            console.log(data);
        });

    }
}