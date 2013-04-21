/******************************* 
 * https://github.com/h5bp/ant-build-script
 *
 *
 *
**/


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
    console.log('addnote_carto');

    // if table not specific, use default
    var table = table;
    if ( !table ) { table = notes_table; }
    
    var description_esc = escape(description);
    var sqlInsert ="&q=INSERT INTO "+table+" (username,category,description,the_geom) VALUES('"+ username +"','"+ category +"','"+ description_esc +"',ST_SetSrid(st_makepoint("+ location +"),4326))";

    // check if note was made from pending flag 
    // is this bullet proof? confirm on insert success?
    if(location == flag_location){
        flag_used = flag_id;
    }
    else { flag_used = ''; }

    // send data
    update_carto(sqlInsert,msg,callback);

        
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
        if(location == flag_location){
            console.log('flag used');        
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
    
    console.log('update carto();');
    var theUrl = url_cartoData + cartodb_key + sql;
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
            
        if( flag_used != '' ){
            console.log('flag_used');
            flag_used = ''; // clear it
            flag_remove(flag_id);
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

    console.log('url_query');
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

            var note = val.properties;
            var notegeo = val.geometry.coordinates;

            var templateN = templateNote.clone();
            templateN.removeClass('template');

            // switch to note_begin 
            // must use moment() on addnote
            var dateTime = note.created_at;
            var dateTime = moment(dateTime).fromNow();

            templateN.find('p').html(note.description);
            templateN.find('p').append(' <time>'+dateTime+'</time>');

            if ( note.address ) { 
                templateN.find('p').append('<address>' + note.address + '</address>');
                }

            if ( note.category != 'user note') { 
                templateN.find('p').prepend('<em class="'+note.category+'">' + note.category + '</em>');
                }
            else {
                templateN.find('p').prepend('<em class="username">' + note.username + '</em>');                
            }
            templateN.find('.meta')
                .append('<a class="maplink entypo" href="#" title="'+notegeo+'" >&#59172;</a>')
                .append('<a href="#" class="replylink entypo" >&#59154;</a>');
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

// address click triggers map link
$('#notes').on('click','address', function(){
    console.log('address click');
    $(this).parents('article').find('a.maplink').click();
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
 * =filter notes by user select
 *
 * user selects option: mentions, location, etc
 * mark active on list
 * load notes
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





/******************************* 
 * =locate
 *
 * grab current location
 * run a function
 *
**/

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

