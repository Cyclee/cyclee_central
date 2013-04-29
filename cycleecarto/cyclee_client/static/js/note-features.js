/***********
 * =note-feature.js
 *
 * features on each note in the feed
 * includes: reply, map, and link to user
 *
 *
**/


/***********
 * =note authorlink
 *
 * find notes by user
 *
**/

$('#notes').on( 'click', 'img', function(){
    var theuser = $(this).attr('alt');
    userNotes(theuser);
});



/***********
 * =note maplink
 *
 * each note shows location icon link
 * click loads map of location
 *
**/


$('#notes').one( 'click', 'a.maplink', function(){
    // map container
    var theHTML = '<a class="map-close close" href="#" ><em class="entypo">&#59228;</em><em class="entypo">&#59228;</em></a><div id="locationmap-map" class="mapcontainer"></div>';
    $('#locationmap').html(theHTML).addClass('map-location').fadeIn('slow');
});


$('#notes').on( 'click', 'a.maplink', function(){
    
    
    $('#locationmap:hidden').fadeIn('slow');
    
    // scroll note up
    var s = $(this).position().top;
    s = s - 26;
    // console.log(s);
    // $('#wrap').scrollTop(s);
    $('#wrap').animate({scrollTop:s}, 'slow');
    

    // create map
    var thisgeo = $(this).attr('title').split(",");
    var mapzoom = 14;

    if(locationmap.createMap){ // run once and removed
        locationmap.createMap(nyc_lat,nyc_lng,7);        
    }
    
    if(locationmap.marker == false){
        locationmap.addMarker(thisgeo[1],thisgeo[0]);
    }
    else {
        locationmap.moveMarker(thisgeo[1],thisgeo[0]);        
    }        
    locationmap.setView(thisgeo[1],thisgeo[0],mapzoom);

});

// address click triggers map link
$('#notes').on('click','address', function(){
    // console.log('address click');
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
    console.log('reply: '+ replyName);

    // reply location
    location_reply = $(this).parents('article').find('.maplink').attr('title');
    console.log('location_reply: '+ location_reply);

    // ui
    $('a#post-note').html('Drop Reply Here').removeClass('post-here').addClass('post-reply');

    switchpage('addnote');
    // then check for location_reply ... clear on nav-addnote

});
$('#notes').on('click', 'a.replylink', hashtags_load); // trigger load. event later removed.


