/******************************* 
 * https://github.com/h5bp/ant-build-script
 *
 *
 *
**/




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


// hide mobile address bar
// window.scrollTo(-1, 0);


/***********
 * =load
 *  
**/

load_user();


/***********
 * =splash
 *  
 *  on app load
 *
**/
var splash = $('#splash');
splash.css('height',height).delay(1800).fadeOut('slow');



/***********
 * =nav switchpage
 *
 * switch pages. hide/show navigation & filters
 *
 *
**/

function switchpage(id){
    console.log('switch: ' + id);
    
    if( id != 'notes'){
        $('nav#header').find('.nav-back').fadeIn();
    }
    $('section.page').hide();
    $('section#' +id).fadeIn();
    
    // hide/show notes nav
    if( id=='notes' || id=='people' || id=='notesmap' || id=='addnote' || id=='settings' || id=='help' ){
        $('nav#primary').show();
    }
    else {
        $('nav#primary').hide();
    }
        
    // hide misc
    $('.notesfilter').hide();
    $('#modal').hide();
};


/***********
 * =nav switchpage enable
 *
 * enable nav to switchpage
 *
 *
**/
    // any a.nav-page marked a#nav-pagename will open section#pagename (styled w/ .page)
$('body').on('click','a.nav-page', function(){
    
    // un-highlight other nav items
    $('.active').removeClass('active');
    
    var page = $(this).attr('id'); // a#nav-id
    page = page.slice(4); // id
    switchpage(page);
});   


/***********
 * =nav active
 *
 * toggle active class across nav
 *
 *
**/
$('body').on('click','a.toggle',function(){
   var elem = $(this);
   elem.addClass('active');
});


/***********
 * =nav addnote
 *
 * prepare note. check for flags.
 *
 *
**/
$('#nav-addnote').click( function(){
    finish_note(); // just to be sure for replies not sent
    userFlags();
});


/***********
 * =nav active
 *
 * toggle active class across nav
 *
 *
**/
$('a#nav-addnote').on('click', hashtags_load); // trigger load. event later removed.


/***********
 * =nav logo
 *
 * logo click loads notes page
 *
 *
**/
$('#nav-logo').click( function(){
    $('#nav-notes').click();
});


/***********
 * =nav notes
 *
 * hide back arrow on notes page view
 *
 *
**/
$('#nav-notes').on('click',function(){
    $('nav#header').find('.nav-back').hide();    
});




/******************************* 
 * =addnote cartoDB
 *
 * addnote: prepare query for cartoDB 
 *
 * @depracated -- used for debugging. send data directly to cartoDB
 *
**/

function addnote(username,category,description,location,table,msg,callback){

    // if table not specific, use default
    var table = table;
    if ( !table ) { table = notes_table; }
    
    var description_esc = escape(description);
    var sqlInsert ="&q=INSERT INTO "+table+" (username,category,description,the_geom) VALUES('"+ username +"','"+ category +"','"+ description_esc +"',ST_SetSrid(st_makepoint("+ location +"),4326))";

    // send data
    console.log('Post to CartoDB');
    update_carto(sqlInsert,msg,callback);

    // check if note was made from pending flag 
    // is this bullet proof? confirm insert success?
    if(location == flag_location){
        console.log('flag updated');        
        flag_remove(flag_id);
    }
        
} // END addnote



/******************************* 
 * =cyclee-central update
 *
 * post notes to django api
 * 
**/

function update_central(category,description,location,msg,callback){

    var url = '/cartoapp/note/add/';
    var post_data = {category: category,
                            description: description,
                            accuracy: 0,
                            altitude: 0,
                            the_geom: 'POINT(' + location.replace(',', ' ') + ')' };

    console.log('Post to central: ');
    console.log(post_data);
    $.post(url, post_data, function(data) {
            console.log('Post return: ');
            console.log(data);
    }).success(function(){

        // return to notes view
        $('a#nav-notes').click();
        finish_note('clear');

        if (msg){
            console.log('msg: ' +msg);
            feedback_msg(msg);
            }
        if (callback){
            console.log('update_central callback');
            var t=setTimeout(function(){ callback() },2000);
            }   
            
        // check if note was made from pending flag 
        // is this bullet proof? confirm insert success?
        if(location == flag_location){
            console.log('flag updated');        
            flag_remove(flag_id);
        }
     
    });
};


/******************************* 
 * =cartoDB update
 *
 * post notes directly to CartoDB
 *
 * @deprecated -- used for debugging
 *
**/

function update_carto(sql,msg,callback){
    
    var theUrl = url_cartoData + cartodb_key + sql;
    console.log('update carto();');
    // console.log(theUrl);

    $.getJSON(theUrl, function(data){
        // console.log(data);
    })
    .success(function(e) { 
        console.log('update_carto success');
        console.log(e);
        finish_note('clear');
        
        // return to notes view
        $('a#nav-notes').click();
        
        if (msg){
            console.log('msg: ' +msg)
            feedback_msg(msg);
            }
        if (callback){
            console.log('update_carto callback')
            var t=setTimeout(function(){ callback() },2000);
            }     
    })
    .error(function() { 
        console.log('update_carto error'); 
        msg = 'Sorry. There was an error.';
        feedback_msg(msg);
    })
    .complete(function() {  });  
    
}



/******************************* 
 * =notes Query
 *
 * query CartoDB for notes
 * on load and notes page load
 *
**/
getNotes(commute_1a,commute_1b); // on app load


/******************************* 
 * =notes refresh
 *
 * on notes page load or filter select
 *
**/
$('#nav-notes').click( function(){
    // getNotes(commute_1a,commute_1b);
    $('#notes .notesfilter li:first').click(); // click notes filter. add active class.
});

/******************************* 
 * =notes refresh
 *
 * on pull down (not yet implemented)
 *
**/
// $('#notes a.refresh').click( function(){
//     getNotes(commute_1a,commute_1b);
// });


/******************************* 
 * =get notes by commute
 *
 * query cartoDB
 *
**/
function getNotes(start,finish){     
    var sql_statement = "q=WITH foo AS (SELECT ST_Collect(the_geom) g FROM "+routes_table+" WHERE ST_Intersects(the_geom::geography, ST_Buffer(ST_GeographyFromText('POINT("+start+")'), "+dist_route+")) AND ST_Intersects(the_geom::geography, ST_Buffer(ST_GeographyFromText('POINT("+finish+")'), "+dist_route+")) ) SELECT * FROM "+notes_table+", foo WHERE ST_Intersects(ST_Buffer(the_geom::geography,"+dist_note+"), g::geography) ORDER BY created_at DESC LIMIT " + notes_limit;
    queryCarto(sql_statement);
}


/******************************* 
 * =get nearby notes
 *
 * query cartoDB by lat long
 *
**/
function nearNotes(lat,long){ 
    var location = lat + ' ' + long;
    var sql_statement = "q=SELECT * FROM "+notes_table+" WHERE ST_DWithin(ST_GeographyFromText('POINT("+ location +")'), the_geom, "+dist_note+") ORDER BY created_at DESC LIMIT " + notes_limit;
    queryCarto(sql_statement);
}


/******************************* 
 * =get notes by user
 *
 * query cartoDB w/ username
 *
**/
function userNotes(){ 
    var sql_statement = "q=SELECT * FROM "+notes_table+" WHERE username='"+username+"' ORDER BY created_at DESC LIMIT 50";
    queryCarto(sql_statement);
}


/******************************* 
 * =get mentions by user
 *
 * query cartoDB w/ @username
 *
**/
function userMentions(){ 
    var sql_statement = "q=SELECT * FROM "+notes_table+" WHERE description LIKE '%25%40"+username+"%25' ORDER BY created_at DESC LIMIT 17";
    queryCarto(sql_statement);
}


/******************************* 
 * =get notes by search
 *
 * query cartoDB w/ user search
 *
**/
function searchNotes(search){ 
    var sql_statement = "q=SELECT * FROM "+notes_table+" WHERE lower(description) LIKE '%25"+search+"%25' ORDER BY created_at DESC LIMIT 17";
    queryCarto(sql_statement);
}


/******************************* 
 * =get all notes
 *
 * query cartoDB w/o rider commute
 *
**/
function allNotes(){ 
    var sql_statement = "q=SELECT * FROM "+notes_table+" ORDER BY created_at DESC LIMIT " + notes_limit;
    queryCarto(sql_statement);
}


/******************************* 
 * =clear notes
 *
 * called on queryCarto() success before loading new notes
 *
**/
function clearNotes(){
    $('#notes').find('article').not('.template').remove();
}


/******************************* 
 * =query CartoDB
 *
 * used by various calls to get notes
 *
**/
function queryCarto(sql_statement){ 

    var url_query = url_cartoData + notes_format + sql_statement;

    console.log('url_query: ');
    console.log(url_query);

    var output = [];
    var templateNote = $("#notes article.template");
    var query_count;

    // console.log(url_query);
    $.getJSON(url_query, function(data){
        console.log(data);

        query_count = data.features.length;

        // write notes
        $.each(data.features, function(key, val) { // geojson
            // $.each(data.rows, function(key, val) { // json

            var note = val.properties;
            var notegeo = val.geometry.coordinates;

            var templateN = templateNote.clone();
            templateN.removeClass('template');

            // switch to note_begin 
            // must use moment() on addnote
            var dateTime = note.created_at;
            var dateTime = moment(dateTime).fromNow();

            templateN.find('p').html(note.description);
            if ( note.category != 'user note') { 
                templateN.find('p').prepend('<em>' + note.category + '</em>');
                }
            else {
                templateN.find('p').prepend('<em class="username">' + note.username + '</em>');                
            }
            templateN.find('time').text(dateTime);
            templateN.find('.meta').prepend('<a href="#" class="replylink entypo" >&#59154;</a>');
            templateN.find('.meta').append('<a class="maplink entypo" href="#" title="'+notegeo+'" >&#59172;</a>');
            templateN.find('img').attr('alt', note.username);

            // gravatar
            if ( note.uhash ) { 
                templateN.find('img').attr('src', 'https://en.gravatar.com/avatar/'+note.uhash+'?s=50&d=mm');
                }
            else if ( note.username == 'test') {
                templateN.find('img').attr('src', 'http://cyclee.org/mobile/img/test.png');
                }

            output.push(templateN); // gather for append below
            
        }); // END .each()

        
    }).success(function() { 
        console.log('getJSON success'); 

        // hide hello template
        // is this working?
        
        // write to page        
        var delay = 0;
        
        if ( query_count > 0 ){
            templateNote.delay('500').fadeOut('slow');
            clearNotes();
            $('section#notes').append(output);
            $('section#notes').find('article[class!=template]').hide().each( function(i){
              $(this).delay(delay).fadeIn('slow');
              delay += 250;
            }); 
        } 
        else {
            noNotes();
        }
    }) // END sucess
    .error(function() { 
        console.log('getJSON error'); 
        noNotes();
        })
    .complete(function() {  }); // not necessarily successful
    

}; // END queryCarto()


/******************************* 
 * =notes not found
 *
 * show template note when none found
 *
**/
function noNotes(){
    console.log('no notes found');
    clearNotes();
    var noteDefault = $("#notes article.template").clone();
    noteDefault.removeClass('template');
    $('section#notes').append(noteDefault);
}


/***********
 * =flags count
 *
 * count flags by user
 * flags are pending notes without description
 *
 * enable hidden button on addnote (not yet implemented)
 *
**/
function userFlags(){ 
    var sql_statement = "q=SELECT COUNT(username) FROM "+pending_table+" WHERE username='"+username+"'";
    var url_query = url_cartoData + sql_statement;
    
    $.getJSON(url_query, function(data){
        user_flags = data.rows[0].count;
        console.log('user_flags: '+ user_flags);
        flags_enable();
    });      
}



/***********
 * =note maplink
 *
 * each note shows location icon link
 * click loads map of location
 *
**/
$('#notes').on( 'click', 'a.maplink', function(){
    
    // could also get info on user + map
    var theHTML = '<p class="notify">Note Location</p><div class="map-buttons" ><a class="close" href="#" >Close</a></div><div id="findmap" class="mapcontainer"></div>';
    $('#modal').html(theHTML).removeClass().addClass('modalmap').fadeIn('slow');

    var thisgeo = $(this).attr('title').split(",");
    createmap('findmap',thisgeo[1],thisgeo[0]);
    add_marker(thisgeo[1],thisgeo[0]);

});


/***********
 * =replylink
 *
 * each note offers reply link
 * loads new note w/ original's location and @mention
 *
**/

$('#notes').on( 'click', 'a.replylink', function(){
    
    // reply @username
    var replyName = '@' + $(this).parents('article').find('img').attr('alt') + ' ';

    $('#noteContent').val(replyName);
    $('#addnote p.notify').text('Reply ' + replyName);

    console.log('reply: '+ replyName);

    // reply location
    location_reply = $(this).parents('article').find('.maplink').attr('title');
    
    // ui
    $('.addnote-location').hide();
    $('.addnote-reply').show();
    switchpage('addnote');
    
});
$('#notes').on('click', 'a.replylink', hashtags_load); // trigger load. event later removed.




/***********
 * =filter notes set active
 *
 * set active class on filter
 *
**/
$('#nav-notesfilter').click(function(){
    $(this).toggleClass('active');
    $('.notesfilter').fadeToggle();
});


/***********
 * =filter notes UI select
 *
 * user selects option: mentions, location, etc
 *
**/
$('.notesfilter').on('click', 'li', function(){
    $(this).siblings('li').removeClass('active-filter');
    $(this).addClass('active-filter');
    $('#nav-notesfilter').toggleClass('active');
    var filter = $(this).text();
    console.log('notes: ' + filter);
    showNotes(filter);
    $('.notesfilter').delay(200).fadeOut('slow');
});


/***********
 * =filter notes function
 *
 * load notes by filter 
 *
**/
function showNotes(what){    
    console.log('show notes: ' +what)
    var mentions = '@'+username+' mentions';
    
    if ( what == 'Route Notes' ) {
        // query routes
        getNotes(commute_1a,commute_1b);
    }
    else if ( what == 'Near Here' ) {
        // query near here
        
        // extract this. D.R.Y.!!
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(updatePosition,error);        
        } 
        else { console.log("Geolocation is not supported by this browser."); }

        function updatePosition(position) {
            var geolong = position.coords.longitude;
            var geolat = position.coords.latitude;
            nearNotes(geolong,geolat);
        }
    }
    else if ( what == username ) {
        // query note by user
        userNotes();
    }
    else if ( what == mentions ) {
        userMentions();
    }
    else {
        // query all notes
        allNotes();
    }

} // END showNotes()



/***********
 * =search notes
 *
 * search notes form
 *
**/

$('#search').submit( function(){

    var s = $('#search input[type=search]').val();
    s = s.toLowerCase();
    console.log('search: ' + s);
    searchNotes(s);
    return false;
});



/***********
 * =people
 *
 * query and display people who intersect users set commute
 *
 *
**/

$('#nav-people').on('click',queryPeople); 

function queryPeople(){ 
    console.log('query people');

    // run once only
    $('#nav-people').off('click',queryPeople);     

    var sql_statement = "q=WITH foo AS (SELECT ST_Collect(the_geom) g FROM "+routes_table+" WHERE ST_Intersects(the_geom::geography, ST_Buffer(ST_GeographyFromText('POINT("+commute_1a+")'), "+dist_route+")) AND ST_Intersects(the_geom::geography, ST_Buffer(ST_GeographyFromText('POINT("+commute_1b+")'), "+dist_route+")) ), foobar AS (SELECT * FROM "+notes_table+", foo WHERE ST_Intersects(ST_Buffer(the_geom::geography,"+dist_note+"), g::geography)) SELECT username FROM foobar GROUP BY username LIMIT " + people_limit;
    var url_query = url_cartoData + sql_statement;

    var people = [];
    var templatePeople = $("#people article.template");
    var query_count;

    console.log(url_query);
    $.getJSON(url_query, function(data){
        console.log(data.rows);

        query_count = data.rows.length;

        $.each(data.rows, function(key, val) { // geojson

            var note = val;

            var templateP = templatePeople.clone();
            templateP.removeClass('template');

            templateP.find('p').html('<em class="username">' + note.username + '</em>');                

            templateP.find('img').attr('alt', note.username);
            templateP.find('a').attr('title', note.username);

            if ( note.username == 'cyclee') { // cyclee avatar
                templateP.find('img').attr('src', 'https://en.gravatar.com/avatar/bb499013eebc3869dc8b7b4679fdae10?s=50');
                }
            else if ( note.username == 'matthew') {
                templateP.find('img').attr('src', 'https://en.gravatar.com/avatar/8c1e05ef3a00d4d888c0e8b02fe92743?s=50');
                }
            else if ( note.username == 'Juanp') {
                templateP.find('img').attr('src', 'https://en.gravatar.com/avatar/fd33de4f49ba50244e3058c23b14aea3?s=50');
                }
            else if ( note.username == 'test') {
                templateP.find('img').attr('src', 'http://cyclee.org/mobile/img/test.png');
                }

            // people.push(templateP); // gather for append below            
            people.unshift(templateP); // gather for append below            
        }); // END .each()

        
    }).success(function() { 
        console.log('getJSON success'); 

        // write to page        
        var delay = 0;
        
        if ( query_count > 0 ){
            $('section#people section').append(people);
            $('section#people').find('article.template').hide()
            $('section#people').find('article[class!=template]').hide().each( function(i){
              $(this).delay(delay).fadeIn('slow');
              delay += 250;
            }); 

        } 
        else {
            console.log('no people found');
        }
        
    }) // END sucess
    .error(function(e) { console.log('getJSON error'); console.log(e); })
    .complete(function() {  }); // not necessarily successful
    

}; // END queryPeople()




/***********
 * =notesmap
 *
 * display notes on map
 * used by map page
 *
**/
var map;
var layers = [];


/***********
 * =notesmap data
 *
 * query notes based on users filter selection
 *
**/
var LayerActions = {
  allnotes: function(){
    layers[0].setQuery("SELECT * FROM {{table_name}}");
    return true;
  },
  bikeshops: function(){
    layers[0].setQuery("SELECT * FROM {{table_name}} WHERE category='bike shop'");
    return true;
  },
  stolen: function(){
    layers[0].setQuery("SELECT * FROM {{table_name}} WHERE description LIKE '%stolen%'");
    return true;
  },
  corides: function(){
    layers[0].setQuery("SELECT * FROM {{table_name}} WHERE category='co-ride'");
    return true;
  },
  usernotes: function(){
    layers[0].setQuery("SELECT * FROM {{table_name}} WHERE username = '"+username+"'");
    return true;
  },
  
  // commute notes -- queries a different table not yet set up

}



/***********
 * =notesmap layers
 *
 * change data on form select
 *
**/
$('#notesmap form').change( function(){
    
    // grab val from form
    var filter = $('#notesmap form').find('option:selected').val();
    console.log('map layer:' + filter);

    // send it to layer action // weird
    LayerActions[filter]();
    
    // clear form focus
    $('#notesmap form select').blur();
});



/***********
 * =notesmap init
 *
 * set up map on first view
 *
**/
$('body').one('click','#nav-notesmap', function(){ // delegated to body to preserve order
    mapInit();
});



/***********
 * =notesmap init setup
 *
 * create map. load default data.
 *
**/

function mapInit() {
    console.log('new map');

      // initiate leaflet map
      map = new L.Map('map', { 
        center: [40.72,-73.97],
        cartodb_logo: false,
        zoom: 12,
        maxZoom: 15
      })

      var basemap = 'https://dnv9my2eseobd.cloudfront.net/v3/cartodb.map-pp0tkn8d/{z}/{x}/{y}.png'; // mapbox light

      L.tileLayer(basemap, {
        attribution: 'MapBox'
      }).addTo(map);

      //var layerUrl = 'http://'+cartodb_accountname+'.cartodb.com/api/v1/viz/12114/viz.json';
      var layerUrl = 'http://'+cartodb_accountname+'.cartodb.com/api/v1/viz/notes/viz.json';

      var layerOptions = {
        // query: "SELECT * FROM {{table_name}}",
        // tile_style: "#{{table_name}}{marker-fill: #F84F40; marker-width: 8; marker-line-color: white; marker-line-width: 2; marker-clip: false; marker-allow-overlap: true;} "
        query: "SELECT * FROM {{table_name}} WHERE category='bike shop'",
        interactivity: "username,description,category"
      }

      cartodb.createLayer(map, layerUrl, layerOptions)
        .on('done', function(layer) {
          map.addLayer(layer);
          layers.push(layer);
        }).on('error', function() {
        //log the error
        });

}




/******************************* 
 * =locate
 *
 * grab current location
 * run a function
 *
 * pass the function and a variable (ex: input field)
**/

// DRY -- merge with geo_location
// one requires callback. other requires inputfield. 
// updatePosition() could be merged with 
function geo_locate2(callback,vars){

    console.log('nav geo locate 2'); 
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(updatePosition,error);        
    } 
    else { alert("Geolocation is not supported by this browser."); }

    function updatePosition(position) {
        var geolong = position.coords.longitude;
        var geolat = position.coords.latitude;
        var location = geolong +','+ geolat;  
        // inputfield.val(geolong +','+ geolat);  
        console.log('geo accuracy: '+position.coords.accuracy);

         return callback(location);
    }
    
}





/***********
 * =location by map
 *
 * used by addnote
 * allow user to drag marker on map to set note location
 * 
 *
**/
$('.page').on("click", 'a.link_location_choose', function(){
    
    inputfield = $(this).parent().children('input');
    
    var theHTML = '<p class="notify">Drag marker to location.</p><div class="map-buttons" ><a class="close" href="#">Cancel</a> <a id="location-choose-done" class="hidden" href="#" >Post</a></div><div id="findmap" class="mapcontainer"></div>';
    $('#modal').html(theHTML).removeClass().addClass('modalmap').fadeIn();
    $('#modal').find('#location-choose-done').click( function(){
        $(this).parents('#modal').fadeOut(); // function updated on when marker moved
    });
    
    location_choose_init();

});



/***********
 * =flag location UI
 *
 * mark a spot to create a pending note for adding details later
 *
 * @see geo_locate2()
 * @see flag_carto()
**/
$('#flag-link').click( function(){
    inputfield = $('#newflag_location');
    geo_locate2(flag_carto)
});


/***********
 * =flag location
 *
 * add flag to carto
 * @see geo_locate2()
 *
**/
function flag_carto(location){
    console.log('flag: ' + location);
    var msg = 'Location Flagged. Add a Note Later.';
    addnote(username,'pending','',location,pending_table,msg); // no callback
}


/***********
 * =flag map UI
 *
 * show map of flags
 * allow user to select flag to set note location
 *
**/
$('a.link_flaglist').click( function(){
    
    inputfield = $(this).parent().children('input');
    
    var prompt = 'No Flags Yet. <a href="#" class="close" onclick="switchpage(\'help\');">Help</a>';
    if (user_flags > 0) { prompt = 'Select Your Flag'; }
    
    var theHTML = '<p class="notify">'+prompt+'</p><div class="map-buttons" ><a class="close" href="#" >Cancel</a><a id="deleteflags" class="hidden" href="#" >Delete All</a></div><div id="mapflags" class="mapcontainer"></div>';
    $('#modal').html(theHTML).removeClass().addClass('modalmap').fadeIn();
    
    $('a#deleteflags').on('click',flags_delete);
    
    flag_map(inputfield);

});


/***********
 * =flag map
 *
 * create map with flags
 * allow user to select flag to set note location
 * remember flag to delete on addnote success
 *
 * could be integrated with createmap()
 *
**/
var flag_id; // delete flag when note added
var flag_location; // confirm match before deleting on +note
function flag_map(inputfield) {
    
      console.log('flags map');

        // initiate leaflet map
        map = new L.Map('mapflags', { 
          center: [40.72,-73.97],
          cartodb_logo: false,
          zoom: 11,
          maxZoom: 15
        })

        var basemap = 'https://dnv9my2eseobd.cloudfront.net/v3/cartodb.map-pp0tkn8d/{z}/{x}/{y}.png'; // mapbox light

        L.tileLayer(basemap, {
          attribution: 'MapBox'
        }).addTo(map);

        // var layerUrl = 'http://'+cartodb_accountname+'.cartodb.com/api/v1/viz/18299/viz.json'; // pending_table
        var layerUrl = 'http://'+cartodb_accountname+'.cartodb.com/api/v1/viz/notes_pending/viz.json'; // pending_table

        var layerOptions = {
          query: "SELECT * FROM {{table_name}} WHERE username='"+username+"'",
        }

        cartodb.createLayer(map, layerUrl, layerOptions)
          .on('done', function(layer) {
            map.addLayer(layer);
            
            console.log(layer);
            console.log(layer._map._layers);

            layers.push(layer);            
            layer.on('featureClick', function(e, latlng, pos, data){
                console.log('flag clicked: ' + data.cartodb_id);

                // remember flag
                flag_id = data.cartodb_id;
                flag_location = latlng[1] +','+ latlng[0];

                // prep note
                inputfield.val(flag_location); // 
                var msg = 'Flag selected. Add your Note.';
                enable_addnote(msg);

                })
            
          }).on('error', function() {
              console.log('snap. carto error');
          });
    
}




/***********
 * =flag remove 
 *  
 * delete flag from CartoDB on addnote success
 * @deprecated -- MUST to update this to remove from django
 *
**/
function flag_remove(flag_id){    
    var sqlDelete = "&q=DELETE FROM " +pending_table+ " WHERE cartodb_id="+flag_id;
    update_carto(sqlDelete);
}


/***********
 * =flags delete all 
 *  
 * @deprecated -- MUST update this to remove from django
 *
**/
function flags_delete(){
    console.log('delete flags');
    var sqlDelete = "&q=DELETE FROM " +pending_table+ " WHERE username='"+username+"'";
    console.log(sqlDelete);
    var msg = 'Flags Deleted';
    update_carto(sqlDelete,msg);
}



/***********
 * =addphoto
 *
 * not currently in use
 *
**/
$('a#link-addphoto').click( function(){
    // change feedback_msg(msg,sticky);
    var theHTML = '<a class="close" href="#" >&#10006;</a><p class="notify">Photos coming soon. Help us develop the feature: <a href="http://github.com/cyclee" >github.com/cyclee</a>.</p>';
    $('#modal').html(theHTML).removeClass().addClass('addphoto').addClass('msg').fadeIn();
});




/***********
 * =create map
 *
 * @see: a.maplink on articles
 * @see: location_choose_init()
 *
 *
 *
**/

function createmap(mapname,map_lat,map_lng){
    
    // initiate leaflet map
    find_map = new L.Map(mapname, { 
      center: [map_lat, map_lng],
      cartodb_logo: false,
      zoom: 13,
      maxZoom: 15
    })

    var basemap = 'https://dnv9my2eseobd.cloudfront.net/v3/cartodb.map-pp0tkn8d/{z}/{x}/{y}.png'; // mapbox light

    L.tileLayer(basemap, {
      attribution: 'MapBox'
    }).addTo(find_map);

}


/***********
 * add marker
 *
**/

function add_marker(m_lat,m_lng) {

    var myIcon = L.icon({
          iconUrl: 'http://cartodb-gallery.appspot.com/static/icon.png',
          iconSize: [28, 28],
    });

    var marker = new L.Marker( [m_lat,m_lng],{
      icon: myIcon,
    }).addTo(find_map);

}




/***********
 * =location_choose by map: init map
 *
 * allows users to drag marker on map to set location
**/

function location_choose_init() {

    find_lat = nyc_lat;
    find_lng = nyc_lng;        

    // should find an idle moment to grab current location for various use
    // also check if( location_choose ) { /* use this instead; */ }    

    createmap('findmap',find_lat,find_lng);
    add_marker_draggable(find_lat,find_lng);

};




/***********
 * location_choose by map: draggable marker
 *
**/

function add_marker_draggable(m_lat,m_lng) {

    var myIcon = L.icon({
          iconUrl: 'http://cartodb-gallery.appspot.com/static/icon.png',
          iconSize: [28, 28],
    });

    var marker = new L.Marker( [m_lat,m_lng],{
      icon: myIcon,
      draggable: true
    }).addTo(find_map);

    marker.on('dragend',location_choose_updateValue);
}


/***********
 * location_choose by map: coords from map marker
 *
**/

function location_choose_updateValue(e){
    // console.log(e.target._latlng.lat);
    var lat = e.target._latlng.lat;
    var lng = e.target._latlng.lng;
    location_choose = lng+','+lat;
    console.log('drag: ' + location_choose);
    
    if (e) { 
        $('a#location-choose-done').removeClass('hidden');
    }
    
    // enable Done button only after user drag
    var doneButton = $('#modal').find('#location-choose-done');
    doneButton.off(); // prevent multiple triggers
    doneButton.one('click', function(){
        console.log('user chose location');
        $(this).parents('#modal').fadeOut();
        addnote_submit(location_choose);        
    });
}




/***********
 * =cookie: grab cookie
 *
**/

// function getCookie(name) {
//     var cookieValue = null;
//     if (document.cookie && document.cookie != '') {
//         var cookies = document.cookie.split(';');
//         console.log('cookies...');
//         console.log(cookies);
//         for (var i = 0; i < cookies.length; i++) {
//             var cookie = jQuery.trim(cookies[i]);
//             // Does this cookie string begin with the name we want?
//             if (cookie.substring(0, name.length + 1) == (name + '=')) {
//                 cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//                 break;
//             }
//         }
//     }
//     return cookieValue;
// }
// var csrftoken = getCookie('csrftoken');


/***********
 * =cookie: add to outgoing headers
 *
**/

// function csrfSafeMethod(method) {
//     // these HTTP methods do not require CSRF protection
//     return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
// }
// 
// function djangosetup() {
//         console.log('send to dotcloud');
//         var csrftoken = getCookie('sessionid');
//         
//     $.ajaxSetup({
//         // crossDomain: false, // obviates need for sameOrigin test
//         beforeSend: function(xhr, settings) {
//             if (!csrfSafeMethod(settings.type)) {
//                 xhr.setRequestHeader("X-CSRFToken", csrftoken);
//             }
//         }
//     });
// }



/******************************* 
 * =feedback email
 * 
 * obfuscate email address
 * 
 * 
**/

$('#nav-settings').on('click',doaddress);

function doaddress(){    
    var e2 = 'k@c';
    var e1 = 'feedbac';
    var e3 = 'yclee.org';
    var e4 = e1 + e2 + e3;
    $('.feedback-addy').html(e4).attr('href','mailto:'+e4);   
    $('#nav-settings').off('click',doaddress);
}




/***********
 * =utilitiy
 *
**/

$('.firsttime').click( function(){ 
    $(this).removeClass('firsttime');
    })

$('#modal').on("click", 'a.close', function(){ // binds to future elements
    console.log('closed');
    $(this).parents('#modal').fadeOut();
});

$('a.clearinput').on("click", function(){
    $(this).parent().children('input').val('');
    $('#search-hashtags').keyup();
    
});


