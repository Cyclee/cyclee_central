
var location_reply;
var location_choose;


// /***********
//  * =nav addnote subnav
//  *
//  * @deprecated -- subnav within addnotes
//  *
//  *
// **/
// $('#addnote nav a').click( function(){
//     $(this).parent().children('a').removeClass('active');
//     $(this).toggleClass('active');
// });
// $('.addnote-location nav a').click( function(){
//     $('#location-end').fadeToggle();
// });



/******************************* 
 * =addnote UI
**/

var addnoteform = $('form#addnote_carto');


// /******************************* 
//  * =addnote enable
//  * 
//  * enable UI & user to addnote
//  * called when location is set
//  *
//  * @deprecated
//  *
// **/
// 
// function enable_addnote(msg){
//     // var msg = msg; 
//     console.log('note location added');
//     // addnoteform.find('.location-prompt').hide().removeClass('first-visit').text('Location Ok!').fadeIn('slow').addClass('disabled');
//     // addnoteform.find('button').removeClass('disabled');
//     // addnoteform.find('button').removeAttr('disabled');
//     // $('section.addnote-info').css('opacity','1');
// 
//     if (msg) { feedback_msg(msg); }
// };



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
    geo_locate2(addnote_submit,'Note Added Here');
    // should display animated wait signal
});


/******************************* 
 * =reply submit
 *
 *
**/


$('.page').on("click", 'a#post-reply', function(){
    addnote_submit(location_reply,'Reply Added');
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
    
    $('.addnote-location').show(); // hidden for replies
    $('.addnote-reply').hide(); // shown for replies

    $('#addnote .notify').text('Add a Note');

    if( clear ){
        $('#noteContent').val('');
    }
}





