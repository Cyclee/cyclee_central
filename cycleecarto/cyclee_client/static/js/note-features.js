/***********
 * =note-feature.js
 *
 * features on each note in the feed
 *
**/


/***********
 * =note authorlink
 *
 * find notes by user
 *
**/




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

