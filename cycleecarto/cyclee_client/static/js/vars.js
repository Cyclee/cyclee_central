/******************************* 
 * Dev & Debugging
 *
 * send_to_central = true = app > django > cartoDB
 *              = false = app > cartoDB
 *
**/
var send_to_central = true; // true = send to django rather than directly to cartoDB
if( send_to_central ) { console.log('Post to Central'); }
else { console.log('Post to CartoDB'); }



/******************************* 
 * Setup Variables
 *
 *
**/

var height = $(window).height();
var width = $(window).width();


// setup CartoDB
var cartodb_accountname = 'cyclee';
var cartodb_key = "api_key=d336362b5599c0e0fbcad0f6610b06d88e537e45"; 
var notes_table = 'notes';
var routes_table = 'routes';
var pending_table = 'notes_pending';

// old CartoDB
    // cartodb_accountname = 'ideapublic';
    // cartodb_key = "api_key=7302db3d477047e379af83c1987573e043022fe4"; 
    // notes_table = 'route_flags';
    // routes_table = 'route_paths';
    // pending_table = 'pending_notes';

var dist_route = 1000; // distance of routes to relevant commutes
var dist_note = 1000; // distance of notes to relevant commutes

var url_cartoData = 'http://'+cartodb_accountname+'.cartodb.com/api/v2/sql/?';
var url_cartoMap = 'https://'+cartodb_accountname+'.cartodb.com/tables/' // + ?_table+'/embed_map?';
    // note!!
    // sql= for embed_map
    // q= for json & geojson


var user_location;
var inputfield;
var find_map = null;
var find_lat, find_lng;
var user_flags;

var notes_limit = 35;
var notes_format = 'format=GeoJSON&';
var people_limit = 25;