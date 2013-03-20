/******************************* 
 * Setup Variables & Local DB
 *
 *

**/

var send_to_central = true; // send to django rather than carto

var height = $(window).height();

var username;

// setup CartoDB
var account_name = 'ideapublic';
var cartoKey = "api_key=7302db3d477047e379af83c1987573e043022fe4"; 

var note_single_table = 'route_flags';
// var routes_table = 'pimp_my_ride';
var routes_table = 'route_paths';
var pending_table = 'pending_notes';

var dist_route = 1000; // distance of routes to relevant commutes
var dist_note = 1000; // distance of notes to relevant commutes

var url_cartoData = 'http://'+account_name+'.cartodb.com/api/v2/sql/?';
var url_cartoMap = 'https://'+account_name+'.cartodb.com/tables/' // + ?_table+'/embed_map?';
    // note!!
    // sql= for embed_map
    // q= for json & geojson

var nyc1 = '-73.99086 40.735031';
var nyc2 = '-73.989573 40.702244';
var nyc_lat = 40.7; // nyc default
var nyc_lng = -73.96; // nyc default

var mycommutes = [];
var commute_1a;
var commute_1b;


var user_location;
var inputfield;
var find_map = null;
var find_lat, find_lng;
var user_flags;

var notes_limit = 17;
var notes_format = 'format=GeoJSON&';
var people_limit = 25;


// hide mobile address bar
// window.scrollTo(-1, 0);


/***********
 * =load
 *  
**/

load_commutes();
load_user();

/***********
 * =splash
 *  
**/

var splash = $('#splash');
splash.css('height',height).delay(1500).fadeOut('slow');
// $(window).resize(function() {
//     height = $(window).height();
// });


/***********
 * =feedback msg 
 *  
 * alert notice
**/

function feedback_msg(msg){
    var theHTML = msg;
    var modal = $('#modal');
    modal.hide().removeClass().addClass('msg').html(theHTML).fadeIn().delay('2500').fadeOut('slow');
}


/***********
 * =nav
 *
**/

function switchpage(id){
    console.log(id);
    if( id != 'notes'){
        $('nav#primary').find('.nav-back').fadeIn();            
    }
    $('section.page').hide();
    $('nav#secondary').hide();    
    $('section#' +id).fadeIn();
};

    // any a.nav-page marked a#nav-pagename will open section#pagename (styled w/ .page)
$('body').on('click','a.nav-page', function(){
    var page = $(this).attr('id'); // a#nav-id
    page = page.slice(4); // id
    switchpage(page);
});   

$('a.toggle').on('click',function(){
   console.log('a.toggle'); 
   var elem = $(this);
   elem.addClass('active');
   elem.siblings().removeClass('active');
});


$('#nav-addnote').click( function(){
    finish_note(); // just to be sure for replies not sent
    userFlags();
});
$('a#nav-addnote').on('click', hashtags_load); // trigger load. event later removed.


$('#nav-logo').click( function(){
    $('#nav-notes').click();
});

$('#nav-notes').on('click',function(){
    $('nav#primary').find('.nav-back').hide();    
});


$('nav#secondary a').click( function() {
    $('nav#secondary').fadeOut();
    $('nav#primary').find('span').toggle();
}); 

// + note nav
$('#addnote nav a').click( function(){
    $(this).parent().children('a').removeClass('active');
    $(this).toggleClass('active');
});

// + note location nav
$('.addnote-location nav a').click( function(){
    $('#location-end').fadeToggle();
});



/******************************* 
 * =addnote to carto
**/

var addnoteform = $('form#addnote_carto');

function enable_addnote(msg){
    // var msg = msg; 
    console.log('note location added');
    addnoteform.find('.location-prompt').hide().removeClass('first-visit').text('Location Ok!').fadeIn('slow').addClass('disabled');
    addnoteform.find('button').removeClass('disabled');
    addnoteform.find('button').removeAttr('disabled');
    $('section.addnote-info').css('opacity','1');

    if (msg) { feedback_msg(msg); }
};


var dateTime = $.now();
console.log(dateTime);

// addnote: prepare data
addnoteform.submit(function() {

    var description = $('#noteContent').val();
    description = description.replace(/[']+/gi,''); // apostrophes suck
    // description = escape(description);
    console.log(description);

    var category = "user note";    
    var location = $('[name=inputStart]').val();
    var msg = 'Note Added';

    addnote(username,category,description,location,note_single_table,msg,finish_note);
    return false;

});

// addnote: prepare sql query
function addnote(username,category,description,location,table,msg,callback){

    // if table not specific, use default
    var table = table;
    if ( !table ) { table = note_single_table; }
    
    var description_esc = escape(description);
    var sqlInsert ="&q=INSERT INTO "+table+" (username,category,description,the_geom) VALUES('"+ username +"','"+ category +"','"+ description_esc +"',ST_SetSrid(st_makepoint("+ location +"),4326))";

    // send data
    if ( send_to_central ){ update_central(category,description,location); }
    else { update_carto(sqlInsert,msg,callback); }

    // check if note was made from pending flag 
    // is this bullet proof? confirm insert success?
    if(location == flag_location){
        console.log('flag updated');        
        flag_remove(flag_id);
    }
        
} // END addnote

// addnote: cleanup for for next note
function finish_note(){
    console.log('finish_note');
    
    $('a#nav-notes').click();
    $('.location-prompt').text('Set Location').removeClass('disabled');
    $('.addnote-location').show(); // hidden for replies
    $('section.addnote-info').css('opacity','0.3');
    $('#addnote .notify').text('Add a Note');
}


/******************************* 
 * =cyclee-central update
**/

function update_central(category,description,location){

    var url = '/cartoapp/note/add/';
    var post_data = {category: category,
                            description: description,
                            accuracy: 0,
                            altitude: 0,
                            the_geom: 'POINT(' + location.replace(',', ' ') + ')' };

    console.log('Post to central: ');
    console.log(post_data);
    $.post(url, post_data, function(data) {
            console.log('Post return: ' + data);
    });
};


/******************************* 
 * =cartoDB update
**/

function update_carto(sql,msg,callback){
    
    var theUrl = url_cartoData + cartoKey + sql;
    console.log('update carto: ' + theUrl);

    console.log(theUrl);
    $.getJSON(theUrl, function(data){
        // console.log(data);
    })
    .success(function(e) { 
        console.log('update_carto success');
        console.log(e);
        addnoteform.find("input, textarea").val("");
        
        if (msg){
            console.log('msg: ' +msg)
            feedback_msg(msg);
            }     
        if (callback){
            console.log('update_carto callback')
            var t=setTimeout(function(){ callback() },2000);
            }     
    })
    .error(function() { console.log('update_carto error'); })
    .complete(function() {  });  
    
}



/******************************* 
 * =cartoDB Notes Query
**/


// notes onload and refresh
getNotes(commute_1a,commute_1b); // on app load
    // and page reload
$('#nav-notes').click( function(){
    getNotes(commute_1a,commute_1b);
});
// refresh on pull down
// $('#notes a.refresh').click( function(){
//     getNotes(commute_1a,commute_1b);
// });

// get notes by commute
function getNotes(start,finish){     
    var sql_statement = "q=WITH foo AS (SELECT ST_Collect(the_geom) g FROM "+routes_table+" WHERE ST_Intersects(the_geom::geography, ST_Buffer(ST_GeographyFromText('POINT("+start+")'), "+dist_route+")) AND ST_Intersects(the_geom::geography, ST_Buffer(ST_GeographyFromText('POINT("+finish+")'), "+dist_route+")) ) SELECT * FROM "+note_single_table+", foo WHERE ST_Intersects(ST_Buffer(the_geom::geography,"+dist_note+"), g::geography) ORDER BY created_at DESC LIMIT " + notes_limit;
    queryCarto(sql_statement);
}


// get nearby notes by lat long
function nearNotes(lat,long){ 
    var location = lat + ' ' + long;
    var sql_statement = "q=SELECT * FROM "+note_single_table+" WHERE ST_DWithin(ST_GeographyFromText('POINT("+ location +")'), the_geom, "+dist_note+") ORDER BY created_at DESC LIMIT " + notes_limit;
    queryCarto(sql_statement);
}

// get notes by user
function userNotes(){ 
    // show welcome in case no notes yet    
    $('#notes article.template').show();
    var sql_statement = "q=SELECT * FROM "+note_single_table+" WHERE username='"+username+"' ORDER BY created_at DESC LIMIT 50";
    queryCarto(sql_statement);
}

// get mentions of user
function userMentions(){ 
    // show welcome in case no notes yet    
    $('#notes article.template').show();
    var sql_statement = "q=SELECT * FROM "+note_single_table+" WHERE description LIKE '%25%40"+username+"%25' ORDER BY created_at DESC LIMIT 17";
    queryCarto(sql_statement);
}


// get all notes
function allNotes(){ 
    var sql_statement = "q=SELECT * FROM "+note_single_table+" ORDER BY created_at DESC LIMIT " + notes_limit;
    queryCarto(sql_statement);
}

// clear notes from view
// called on queryCarto() success
function clearNotes(){
    $('#notes').find('article').not('.template').remove();
}

// query cartoDB
function queryCarto(sql_statement){ 

    var url_query = url_cartoData + notes_format + sql_statement;

    // console.log(url_query);

    var output = [];
    var templateNote = $("#notes article.template");
    var query_count;

    console.log(url_query);
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

            if ( note.username == 'cyclee') { // cyclee avatar
                templateN.find('img').attr('src', 'https://en.gravatar.com/avatar/bb499013eebc3869dc8b7b4679fdae10?s=50');
                }
            else if ( note.username == 'matthew') {
                templateN.find('img').attr('src', 'https://en.gravatar.com/avatar/8c1e05ef3a00d4d888c0e8b02fe92743?s=50');
                }
            else if ( note.username == 'kim') {
                templateN.find('img').attr('src', 'https://en.gravatar.com/avatar/1a0587602a97a1d004655ba9fe542c8a?s=50');
                }
            else if ( note.username == 'Juanp') {
                templateN.find('img').attr('src', 'https://en.gravatar.com/avatar/fd33de4f49ba50244e3058c23b14aea3?s=50');
                }
            else if ( note.username == 'RowdyRoadRacer') {
                templateN.find('img').attr('src', 'https://en.gravatar.com/avatar/7a9aa695b0c0f00676a0919ba9648b7b?s=50');
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
            console.log('no notes found');
            // should add a prompt
            // especailly for new users looking at notes by them 
        }

        
    }) // END sucess
    .error(function() { console.log('getJSON error'); })
    .complete(function() {  }); // not necessarily successful
    

}; // END queryCarto()


// get flags by user
function userFlags(){ 
    var sql_statement = "q=SELECT COUNT(username) FROM "+pending_table+" WHERE username='"+username+"'";
    var url_query = url_cartoData + sql_statement;
    
    $.getJSON(url_query, function(data){
        user_flags = data.rows[0].count;
        console.log('user_flags: '+ user_flags);
    });    
    
    
}



/***********
 * =note maplink
 *
 *
**/

// pop Note detail modal
$('#notes').on( 'click', 'a.maplink', function(){
    
    // could info on user + map
    var theHTML = '<p class="notify">Note Location</p><div class="map-buttons" ><a class="close" href="#" >Close</a></div><div id="findmap" class="modalmapcontainer"></div>';
    $('#modal').html(theHTML).removeClass().addClass('modalmap').fadeIn('slow');

    var thisgeo = $(this).attr('title').split(",");
    createmap('findmap',thisgeo[1],thisgeo[0]);
    add_marker(thisgeo[1],thisgeo[0]);

});


/***********
 * =replylink
 *
 *
**/

$('#notes').on( 'click', 'a.replylink', function(){
    
    // reply @username
    var theContent = '@' + $(this).parents('article').find('img').attr('alt') + ' ';
    $('#noteContent').val(theContent);

    // reply location
    var thisgeo = $(this).parents('article').find('.maplink').attr('title').split(",");
    inputfield = $('#addnote').find('input[name=inputStart]');
    inputfield.val(thisgeo[1] +','+ thisgeo[0]);  
    
    // ui
    enable_addnote();
    $('#addnote .notify').text('Reply to Note');
    $('.addnote-location').hide();
    switchpage('addnote');
    
});
$('#notes').on('click', 'a.replylink', hashtags_load); // trigger load. event later removed.




/***********
 * =filter notes
 *
**/

// // form select
// $('#notes form').change( function(){
//     // mapNotes('allroutes');
//     var filter = $('#notes form').find('option:selected').val();
//     console.log('notes: ' + filter);
//     showNotes(filter);
//     $('#notes form select').blur();
// });

$('#nav-notesfilter').click(function(){
    $(this).toggleClass('active');
    $('.notesfilter').fadeToggle();
});

// list select
$('.notesfilter').on('click', 'li', function(){
    $(this).siblings('li').removeClass('active');
    $(this).addClass('active');
    $('#nav-notesfilter').toggleClass('active');
    var filter = $(this).text();
    console.log('notes: ' + filter);
    showNotes(filter);
    $('.notesfilter').delay(200).fadeOut('slow');
});


function showNotes(what){    
    console.log('show notes: ' +what)
    
    if ( what == 'Commute Notes' ) {
        // query routes
        getNotes(nyc1,nyc2);
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
    else if ( what == '@mentions' ) {
        userMentions();
    }
    else {
        // query all notes
        allNotes();
    }

} // END showNotes()



/***********
 * =people
 *
**/

$('#nav-people').on('click',queryPeople); 

function queryPeople(){ 
    console.log('query people');

    // run once only
    $('#nav-people').off('click',queryPeople);     

    var sql_statement = "q=WITH foo AS (SELECT ST_Collect(the_geom) g FROM "+routes_table+" WHERE ST_Intersects(the_geom::geography, ST_Buffer(ST_GeographyFromText('POINT("+commute_1a+")'), "+dist_route+")) AND ST_Intersects(the_geom::geography, ST_Buffer(ST_GeographyFromText('POINT("+commute_1b+")'), "+dist_route+")) ), foobar AS (SELECT * FROM "+note_single_table+", foo WHERE ST_Intersects(ST_Buffer(the_geom::geography,"+dist_note+"), g::geography)) SELECT username FROM foobar GROUP BY username LIMIT " + people_limit;
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
**/
var map;
var layers = [];


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



$('#nav-notesmap').one('click', function(){
    mapInit(); // this should be made to only run once
});




/***********
 * =notesmap layers
 *
**/

// change map on select
$('#notesmap form').change( function(){
    
    // grab val from form
    var filter = $('#notesmap form').find('option:selected').val();
    console.log('map layer:' + filter);

    // send it to layer action // weird
    LayerActions[filter]();
    
    // clear form focus
    $('#notesmap form select').blur();
});


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

      var layerUrl = 'http://ideapublic.cartodb.com/api/v1/viz/12114/viz.json';

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

// DRY -- should replace use of this with geo_locate2
function geo_locate(inputfield){
    console.log('nav geo locate'); 
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(updatePosition,error);        
    } 
    else { console.log("Geolocation is not supported by this browser."); }

    function updatePosition(position) {
        var geolong = position.coords.longitude;
        var geolat = position.coords.latitude;
        inputfield.val(geolong +','+ geolat);  
        
        var msg = "Location Set";
        enable_addnote(msg);
    }
    
}

// DRY -- merge with geo_location
// one requires callback. other requires inputfield. 
// updatePosition() could be merged with 
function geo_locate2(callback,vars){

    console.log('nav geo locate 2'); 
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(updatePosition,error);        
    } 
    else { console.log("Geolocation is not supported by this browser."); }

    function updatePosition(position) {
        var geolong = position.coords.longitude;
        var geolat = position.coords.latitude;
        var location = geolong +','+ geolat;  
        // inputfield.val(geolong +','+ geolat);  
        console.log('geo accuracy: '+position.coords.accuracy);

         return callback(location);
    }
    
}


/******************************* 
 * =location from browser
**/

$('.page').on("click", 'a.link_getlocation', function(){
    inputfield = $(this).parent().children('input');
    geo_locate(inputfield);
});


/***********
 * =location by map
 *
**/

// show modal
$('.page').on("click", 'a.link_findlocation', function(){
    
    inputfield = $(this).parent().children('input');
    
    var theHTML = '<p class="notify">Drag marker to location.</p><div class="map-buttons" ><a id="locateDone" href="#" >Done</a></div><div id="findmap" class="modalmapcontainer"></div>';
    $('#modal').html(theHTML).removeClass().addClass('modalmap').fadeIn();
    $('#modal').find('#locateDone').click( function(){
        $(this).parents('#modal').fadeOut(); // function updated on when marker moved
    });
    
    findlocation_init();

});



/***********
 * =flag location
 *
 * mark a spot to create a pending note for adding details later
**/

$('#flag-link').click( function(){
    inputfield = $('#newflag_location');
    geo_locate2(flag_carto)
});

// callback on geo_locate2
function flag_carto(location){
    console.log('flag: ' + location);
    var msg = 'Location Flagged. Add a Note Later.';
    addnote(username,'pending','',location,pending_table,msg); // no callback
}


// list flags - show modal
$('a.link_flaglist').click( function(){
    
    inputfield = $(this).parent().children('input');
    
    var prompt = 'No Flags Yet. <a href="#" class="close" onclick="switchpage(\'help\');">Help</a>';
    if (user_flags > 0) { prompt = 'Select Your Flag'; }
    
    var theHTML = '<p class="notify">'+prompt+'</p><div class="map-buttons" ><a class="close" href="#" >Cancel</a><a id="deleteflags" class="hidden" href="#" >Delete All</a></div><div id="mapflags" class="modalmapcontainer"></div>';
    $('#modal').html(theHTML).removeClass().addClass('modalmap').fadeIn();
    
    $('a#deleteflags').on('click',flags_delete);
    
    flag_map(inputfield);

});

// load map with flags
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

        var layerUrl = 'http://ideapublic.cartodb.com/api/v1/viz/18299/viz.json'; // pending_table

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
 * =flag delete 
 *  
 * on remove or on +note
**/

function flag_remove(flag_id){    
    var sqlDelete = "&q=DELETE FROM " +pending_table+ " WHERE cartodb_id="+flag_id;
    update_carto(sqlDelete);
}

function flags_delete(){
    console.log('delete flags');
    var sqlDelete = "&q=DELETE FROM " +pending_table+ " WHERE username='"+username+"'";
    console.log(sqlDelete);
    var msg = 'Flags Deleted';
    update_carto(sqlDelete,msg);
}




/***********
 * =hashtags
 *  
**/

// eventually, grab top tags from database
var hash_tags = ['bikelane','co-ride','parkedinlane','rack','thanks','stolen','pothole','biketrain','air','repair','water','danger','pedestrian','crosswalk','police','unsafemerge','unsafeleft','unsaferight','laneends','lanestarts','protectedlane','paintedlane','nolane','shelter','ambassador','bridge','shower','coffee','bikeshare','bikeshop','north','south','east','west','bikenyc'];
hash_tags = hash_tags.sort();
    // console.log(hash_tags);


// load hashtags
function hashtags_load(){
    console.log('hashtags load');
    // add top #hashtags
    var tags_container = $('#tags-container');
    $.each( hash_tags, function(i,tag){
        tags_container.append('<a href="#" >#'+ tag +'</a>');
    });
    
    // no need to load again
    $('a#nav-addnote').off('click', hashtags_load); 
    $('#notes').off('click', 'a.replylink', hashtags_load);
}



// add selected #tags to Note textarea

$("#tags-container").on("click", "a", function(event){    
    var thetag = $(this).text();
    $(this).toggleClass('selected'); // should toggle remove #tag
    var currentcontent = $('#noteContent').val();
    currentcontent +=  ' ' + thetag + ' ';
    currentcontent = currentcontent.replace('  ',' ');
    $('#noteContent').val(currentcontent);
});

// dynamic search
$('#search-hashtags').on("keyup", function(e){

    if(e.keyCode === 27){  // escape
        $('#tags-container').find('a').show(); 
        $('#search-hashtags').val('');
        return false;
        }

    // hide them all
    $('#tags-container').find('a').hide();

    
    // reveal matches
    var search = $('#search-hashtags').val();
    // console.log('searching: ' + search);
    $('#tags-container').find('a').each( function(){

        var thetag = $(this).text();
        var found = thetag.match(search);
        
        if (found) { 
            $(this).show();
            console.log( 'match: ' + thetag );
            }
    });
    
});

// end search
$('#search-hashtags').blur( function(){
    var search = $('#search-hashtags').val();
    if ( search == '' ) {
        $('.hashtags').find('a').show();
    }
    
});


/***********
 * =addphoto
 *
**/

$('a#link-addphoto').click( function(){
    // change feedback_msg(msg,sticky);
    var theHTML = '<a class="close" href="#" >&#10006;</a><p class="notify">Photos coming soon. Help us develop the feature: <a href="http://github.com/cyclee" >github.com/cyclee</a>.</p>';
    $('#modal').html(theHTML).removeClass().addClass('addphoto').addClass('msg').fadeIn();
});



/***********
 * =settings
 *
**/
function load_user() {
    if ( !localStorage.getItem('username') ) { 
         console.log('New User?');
         loadintro();
    }
    else {
         username = localStorage.getItem('username');
         init_user();
         console.log("username: " + username); 
    }
};

// username pre-save 
$('button.username-save').click( function(){

    username = $(this).siblings('.username').val(); // need username in memory
    console.log('username val: ' + username);
    sanitized = username.search(/[^a-z0-9]/gi); // -1 = clean
    if ( sanitized != -1 ) { 
        console.log('uri has illegal characters');
        msg = 'Oops! Only numbers & letters allowed.';
        $(this).parents('.page').find('p.settings-notice').fadeTo(200, 0.1, function(){
          $(this).text(msg).fadeTo(200, 1.0);  
        });
        return false;
    }
    //    new_uri = new_uri.replace(/\s/g,"-").replace(/[^a-z 0-9 \-]+/gi,'').toLowerCase();

    save_username(username); 
    return false;
});



function save_username(username) {
    localStorage.username = username;
    $('p.settings-notice').fadeTo(200, 0.1, function(){
      $(this).text('Username Saved').fadeTo(200, 1.0);  
    })
    $('input.username').val(username); // populate both input fields
    username_filter(); // add to note filters
    console.log("saved username: " + localStorage.username);
}

// load user options
function init_user(){  
    username_filter();
    $('input.username').val(username);
}

// add username option to filters
function username_filter(){
    var user_opt = '<option value="usernotes">'+username+'</option>';
    var user_filtername = '<li>'+username+'</li>';
    var user_mentions = '<li>@mentions</li>';
    $('form#notesmap-filter').find('select').append(user_opt);
    $('.notesfilter').find('ul').append(user_filtername).append(user_mentions);
}



/***********
 * =commutes: load
 *
**/

function load_commutes(){

    // load commutes or prep if none
    if (localStorage.mycommutes) {
        mycommutes = $.parseJSON(localStorage.mycommutes);
        console.log('mycommutes: ' + mycommutes);
        commute_setpoints();
        commutes_form();
    } else {
        console.log('no commutes. setting union sq & dumbo');
        commute_1a = nyc1;
        commute_1b = nyc2;
        $('#thecommutes .template').removeClass('template');
    }

}

function commute_setpoints(){
    commute_1a = mycommutes[0][0].replace(',',' ');
    commute_1b = mycommutes[0][1].replace(',',' ');
    };



/***********
 * =commutes: form
 *
**/

function commutes_form(){
    // prepare form template
    var commuteTemplate = $('#thecommutes .template');
    
    // populate form
    for ( var i=0; i<mycommutes.length; i++) {
        // duplicates template for each commute pair in memory
        var thisCommute = commuteTemplate.clone();
        
        // set hidden inputs
        thisCommute.find('input[name="commute_geoA"]').val(mycommutes[i][0])
        thisCommute.find('input[name="commute_geoB"]').val(mycommutes[i][1])

        // set select options
        thisCommute.find('select.commute_geo1').val(mycommutes[i][0])
        thisCommute.find('select.commute_geo2').val(mycommutes[i][1])

        // clean up and append
        thisCommute.removeClass('template');
        $('#thecommutes').append(thisCommute);
        
    }; 
}


/***********
 * =commutes: form append
 *
**/

$('#nav-settings').on('click', function(){
    commutes_form_move('#settings div.commute-form');
});

$('#nav-intro2').on('click', function(){
    commutes_form_move('#intro2 div.commute-form');
});

function commutes_form_move(id){ 
    // console.log(id);
    var form = $('form#commute-locations');
    form.detach();
    form.appendTo(id);
}



/***********
 * =commutes: add multiple
 *
**/

// add fields for another commute
// currently disabled
$('button#commute-more').click( function(){
    console.log('add another commute');
    var copyclone = $('.commute-path').last().clone();
    copyclone.removeClass('template');
    
    $('#thecommutes').append(copyclone);
    return false;
});






/***********
 * =commutes: query address
 *
**/

// lat/lon from address via open street map
function address_geocode(addy){

    var url = 'http://nominatim.openstreetmap.org/search?q='+addy+'&format=json&addressdetails=1&limit=1'

    $.getJSON(url, function(data){
        console.log(data);
        console.log(data[0].lat);
        console.log(data[0].lon);
        // 
    }).success(function() { 
        console.log('address geocode success'); 
    }) // END sucess
    .error(function(e) { console.log('address geocode error'); console.log(e); })
    .complete(function() {  }); // not necessarily successful

}; // END address_geocode()

// user address lookup
$('a#address-lookup').click( function(){
    console.log('lookup address');
    var addy =  $('section.commute-path').not('.template').find('input[name=addressquery]').val();    
    console.log(addy );
    address_geocode(addy);
});



/***********
 * =commutes: select neighborhood
 *
**/

$('.commute-location select').on('blur', function(){
    xy = $(this).val();
    $(this).siblings('input').val(xy);    
});



/***********
 * =commutes: save
 *
**/
 
$('button#commute-save').click( function(){

    // clear old commutes
    mycommutes = [];
    
    // loop thru each commute 
    $('section.commute-path').not('.template').each( function(i){
        
        var a = $(this).find('input[name="commute_geoA"]').val();
        var b = $(this).find('input[name="commute_geoB"]').val();
        
        thispath = [a,b];
        mycommutes.push(thispath);
        
    });

    // store commutes locally and upadate for query 
    var mycommutes_s = JSON.stringify(mycommutes);
    localStorage.mycommutes = mycommutes_s;
    commute_setpoints();
    console.log('saved commute locations');
    
    // notify user
    $('#settings').find('p#commutes-notice').fadeTo(200, 0.1, function(){
        $(this).text('Commutes Saved').fadeTo(200, 1.0);  
    });

    return false;
});



/***********
 * =intro
 *
 * first time users
**/

function loadintro(){
    switchpage('intro');
    // $('#nav-intro').click();
    console.log('loadintro');
    var html = '<p class="intro-progress border-top"><a href="#" id="nav-intro" class="btn nav-page prog1 active" >&nbsp;1&nbsp;</a> <a href="#" id="nav-intro2" class="btn nav-page prog2">&nbsp;2&nbsp;</a> <a href="#" id="nav-intro3" class="btn nav-page prog3">&nbsp;3&nbsp;</a> <a href="#" id="nav-intro4" class="btn nav-page prog4">&nbsp;4&nbsp;</a></p>';
    $('.intro').append(html);
    var footer = '<a href="#" class="notify-footer" onclick="$(\'#nav-settings\').click(); $(this).hide();" >Customize notes to your usual route &#187;</a>';
    $('#notes').append(footer);
}

$('#intro button').on('click', function(){ 
    $('#nav-intro2').click(); 
});

$('.page').on('click', '#nav-intro', function(){
    // show progress    
    $('.intro-progress').find('a').removeClass('active');
    $('.intro-progress').find('a.prog1').addClass('active');
});

$('.page').on('click', '#nav-intro2', function(){
    $('#intro2 button#commute-save').on('click',function(){ 
        $('#nav-intro3').click(); 
        $('.notify-footer').hide();
    });
    // show progress    
    var e = $('.intro-progress');
    $('.intro-progress').find('a').removeClass('active');
    $('.intro-progress').find('a.prog2').addClass('active');
});

$('.page').on('click', '#nav-intro3', function(){
    var html = $('.help-addnote').clone();
    html.removeClass('help-addnote');
    $('#intro3 #intro3-content').html(html);
    // show progress    
    var e = $('.intro-progress');
    $('.intro-progress').find('a').removeClass('active');
    $('.intro-progress').find('a.prog3').addClass('active');
});

$('.page').on('click', '#nav-intro4', function(){
    var html = $('.help-explore').clone();
    html.removeClass('help-explore');
    $('#intro4 #intro4-content').html(html);
    // show progress    
    var e = $('.intro-progress');
    $('.intro-progress').find('a').removeClass('active');
    $('.intro-progress').find('a.prog4').addClass('active');
});



/***********
 * =create map
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
 * =findlocation by map: init map
 *
 * allows users to drag marker on map to set location
**/

function findlocation_init() {

    // use existing location if available
    user_location = inputfield.val().split(",");
    if(user_location[1]) {
        find_lat = user_location[1];
        find_lng = user_location[0];
    } else {
        find_lat = nyc_lat;
        find_lng = nyc_lng;        
    }

    createmap('findmap',find_lat,find_lng);
    add_marker_draggable(find_lat,find_lng);
    
};




/***********
 * findlocation by map: draggable marker
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

    marker.on('dragend',findlocation_updateValue);
}


/***********
 * findlocation by map: coords from map maker
 *
**/

function findlocation_updateValue(e){
    // console.log(e.target._latlng.lat);
    var lat = e.target._latlng.lat;
    var lng = e.target._latlng.lng;
    inputfield.val(lng+','+lat);
    
    // enable Done button only after user drag
    var doneButton = $('#modal').find('#locateDone');
    doneButton.off(); // prevent multiple prompts
    doneButton.on('click', function(){
        $(this).parents('#modal').fadeOut();
        var msg = 'Location Updated';
        enable_addnote(msg);        
    });
}




/***********
 * =cookie: grab cookie
 *
**/

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        console.log('cookies...');
        console.log(cookies);
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
// var csrftoken = getCookie('csrftoken');


/***********
 * =cookie: add to outgoing headers
 *
**/

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function djangosetup() {
        console.log('send to dotcloud');
        var csrftoken = getCookie('sessionid');
        
    $.ajaxSetup({
        // crossDomain: false, // obviates need for sameOrigin test
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type)) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
}


/***********
 * =session testing
 *
**/

$("#session-check").on('click',session_check);

function session_check(){
    console.log('session check');
    var url = 'http://cycleecarto-cyclee.dotcloud.com/init/';
    
    var csrftoken = getCookie('sessionid');
    console.log('csrftoken: '+csrftoken);
    djangosetup();
    
    var get = $.get(url, function(data) {
      console.log(data);      
    });

    csrftoken = getCookie('sessionid');
    console.log('csrftoken: '+csrftoken);


};

/***********
 * =login
 *
**/

$("form.login").submit(function(event) {

    event.preventDefault(); /* stop form from submitting normally */

    var form = $(this);
    var theData = form.serializeArray();
    var url = 'http://cycleecarto-cyclee.dotcloud.com/m/accounts/login/'

    /* Send the data using post */
    // var posting = $.post( url, { username: username } );
    var posting = $.post( url, theData );

    /* Put the results in a div */
    posting.done( function(data) {
        console.log('login response: ');
        console.log(data);
    });
});


/***********
 * =signup
 *
**/

$("#signup form").submit(function(event) {

    event.preventDefault(); /* stop form from submitting normally */

    var form = $(this);
    var user_name = form.find( 'input[name="username"]' ).val();
    var theData = form.serializeArray();
    var url = 'http://cycleecarto-cyclee.dotcloud.com/m/accounts/register/'

    console.log(user_name);
    console.log(theData);

    /* Send the data using post */
    // var posting = $.post( url, { username: username } );
    var posting = $.post( url, theData );

    /* Put the results in a div */
    posting.done( function(data) {
        console.log('response: ');
        console.log(data);
    });
});


/******************************* 
 * =feedback
**/

$('#nav-ride').on('click',doaddress);
$('#nav-settings').on('click',doaddress);

function doaddress(){    
    var e2 = 'k@c';
    var e1 = 'feedbac';
    var e3 = 'yclee.org';
    var e4 = e1 + e2 + e3;
    $('.feedback-addy').html(e4).attr('href','mailto:'+e4);   
    $('#nav-ride').off('click',doaddress);
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


/******************************* 
 * error msg
**/

function error(msg) {

  errormsg = typeof msg == 'string' ? msg : "dang. failed.";
  console.log(errormsg);
  
}

/******************************* 
 * debugging keys
**/

$('body').on('keyup',function(e){
    if( e.which == 192 ){ 
        console.log('tilda'); 
        switchpage('signup');
        
        
    }
//   console.log(e.type + ': ' +  e.which );
});


/******************************* 
 * debugging
**/

// $('a#nav-ride').click(); // goto +note onload


