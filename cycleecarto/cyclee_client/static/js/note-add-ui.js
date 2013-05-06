
var location_reply;
var location_choose;


/******************************* 
 * =addnote UI
**/

var addnoteform = $('form#addnote_carto');



/******************************* 
 * =dateTime
 * 
 * not in use
 * notes should rely on user's time, not server
 *
**/
function get_dateTime(){
    var dateTime = $.now();
    console.log(dateTime);    
}


/******************************* 
 * =addnote submit
 *
 *
**/

$('#addnote').on("click", 'a.post-here', function(){

    // should display animated wait signal
    
    var lat = addnotemap.map.getCenter().lat;
    var lng = addnotemap.map.getCenter().lng;
    var location = lng +','+ lat;  
    console.log(location);

    var msg = '<em class="entypo loading">&#9733;</em>One Moment'
    feedback_msg(msg,'sticky');

    msg = 'Note Added';
    addnote_submit(location,msg);
    
});


/******************************* 
 * =reply show button
 *
 *
**/

$('#post-note').hide();

$('#addnote').on('focus','#noteContent', function(){
    
    console.log('adding note content');
    $('#post-note').fadeIn('slow');
    
    
});

$('#nav-addnote').on('click',function(){ 
    console.log('addFirstNote()');   
    if (!localStorage.addfirstnote){
        console.log('first note');   
        var msg = 'Drag Map to Change Location';
        var t = setTimeout( function(){feedback_msg(msg)},1000);  
        }
    else {
        // should set on first pan
        // localStorage.addfirstnote = 'x';
    }
    
});


/******************************* 
 * =reply submit
 *
 *
**/


$('#addnote').on('click', 'a.post-reply', function(){
    console.log(location_reply);
    
    var msg = 'One Moment...';
    feedback_msg(msg,'sticky');

    msg = 'Reply Added';
    addnote_submit(location_reply,msg);
    // should display animated wait signal
});



/******************************* 
 * =finish_note
 *
 * cleanup addnote UI for next note
 *
**/

function finish_note(clear){
    console.log('finish_note');
    
    $('a#post-note').addClass('post-here').hide();     
    $('a#post-note').html('Drop Note Here'); 
    $('a#post-note').removeClass('post-reply');
    location_reply = ''; // clear reply location

    if( clear ){
        $('#noteContent').val('');
    }
}




