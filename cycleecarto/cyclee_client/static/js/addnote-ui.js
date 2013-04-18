
var location_reply;
var location_choose;


/***********
 * =nav addnote subnav
 *
 * @deprecated -- subnav within addnotes
 *
 *
**/
$('#addnote nav a').click( function(){
    $(this).parent().children('a').removeClass('active');
    $(this).toggleClass('active');
});
$('.addnote-location nav a').click( function(){
    $('#location-end').fadeToggle();
});



/******************************* 
 * =addnote UI
**/

var addnoteform = $('form#addnote_carto');


/******************************* 
 * =addnote enable
 * 
 * enable UI & user to addnote
 * called when location is set
 *
 * @deprecated
 *
**/

function enable_addnote(msg){
    // var msg = msg; 
    console.log('note location added');
    // addnoteform.find('.location-prompt').hide().removeClass('first-visit').text('Location Ok!').fadeIn('slow').addClass('disabled');
    // addnoteform.find('button').removeClass('disabled');
    // addnoteform.find('button').removeAttr('disabled');
    // $('section.addnote-info').css('opacity','1');

    if (msg) { feedback_msg(msg); }
};



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

$('.page').on("click", 'a#post-here', function(){
    geo_locate2(addnote_submit);
    // should display animated wait signal
});


/******************************* 
 * =reply submit
 *
 *
**/


$('.page').on("click", 'a#post-reply', function(){
    addnote_submit(location_reply);
    // should display animated wait signal
});



/******************************* 
 * =addnote form data
 *
 * grab data on form submit. prepare for post.  
 *
 *
**/
// addnoteform.submit(function() {
function addnote_submit(location) {
    console.log('addnote_submit()');
    console.log('location: ' + location);
    
    var description = $('#noteContent').val();
    description = description.replace(/[']+/gi,''); // apostrophes suck
    // description = escape(description);
    console.log('note desc: ' + description);

    var category = "user note";    
    var msg = 'Note Added';

    if ( send_to_central ){ 
        update_central(category,description,location,msg,finish_note); 
    }
    else {
        addnote(username,category,description,location,note_single_table,msg,finish_note);
    }
    
    return false;
};
// });


/******************************* 
 * =finish_note
 *
 * cleanup addnote UI for next note
 *
**/

function finish_note(clear){
    console.log('finish_note');
    
    $('.addnote-location').show(); // hidden for replies
    $('.addnote-reply').hide(); // shown for replies

    $('#addnote .notify').text('Add a Note');

    if( clear ){
        $('#noteContent').val('');
    }
}



/******************************* 
 * =flags enable
 *
 * allow posts by flag location 
 *
**/

function flags_enable() {
    if (user_flags > 0) {
        $('.link_flaglist').css('display','inline-block');
    }    
};



