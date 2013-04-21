
/***********
 * =feedback msg 
 *  
 * notice to user
**/

function feedback_msg(msg){
    var theHTML = msg;
    var modal = $('#modal');
    modal.hide().removeClass().addClass('msg').html(theHTML).fadeIn().delay('2500').fadeOut('slow');
}

/******************************* 
 * =error msg
**/

function error(msg) {
  errormsg = typeof msg == 'string' ? msg : "dang. failed.";
  console.log(errormsg);
}


/******************************* 
 * =mobile hide browser bar
 *
 * not sure this is working
 *
**/

window.scrollTo(0,1);


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




/******************************* 
 * debugging keys
**/

$('body').on('keyup',function(e){
    // console.log(e.which); 
    if( e.which == 192 ){ // backtick
        submitLogout();
        switchpage('signup');
    }
//   console.log(e.type + ': ' +  e.which );
});


/******************************* 
 * debugging
**/

// $('a#nav-ride').click(); // goto onload
// $('.debug').show(); //
// prompt_setcommute();
