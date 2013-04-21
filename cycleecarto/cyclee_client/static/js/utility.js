
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
