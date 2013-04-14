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
**/

function enable_addnote(msg){
    // var msg = msg; 
    console.log('note location added');
    addnoteform.find('.location-prompt').hide().removeClass('first-visit').text('Location Ok!').fadeIn('slow').addClass('disabled');
    addnoteform.find('button').removeClass('disabled');
    addnoteform.find('button').removeAttr('disabled');
    $('section.addnote-info').css('opacity','1');

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
 * =addnote form data
 *
 * grab data on form submit. prepare for post.  
 *
 *
**/
addnoteform.submit(function() {

    var description = $('#noteContent').val();
    description = description.replace(/[']+/gi,''); // apostrophes suck
    // description = escape(description);
    console.log(description);

    var category = "user note";    
    var location = $('[name=inputStart]').val();
    var msg = 'Note Added';

    if ( send_to_central ){ 
        update_central(category,description,location,msg,finish_note); 
    }
    else {
        addnote(username,category,description,location,note_single_table,msg,finish_note);
    }
    
    // check if note was made from pending flag 
    // is this bullet proof? confirm insert success?
    if(location == flag_location){
        console.log('flag updated');        
        flag_remove(flag_id);
    }
    
    return false;
});


/******************************* 
 * =cleanup
 *
 * cleanup addnote UI for next note
 *
**/

function finish_note(){
    console.log('finish_note');
    
    $('.location-prompt').text('Set Location').removeClass('disabled');
    $('.addnote-location').show(); // hidden for replies
    $('section.addnote-info').css('opacity','0.3');
    $('#addnote .notify').text('Add a Note');
}

