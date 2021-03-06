
/***********
 * =utility.js
 *
 * misc functions
 *
**/


/***********
 * =flags count
 *
 * count flags by user
 * flags are pending notes without description
 *
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




/******************************* 
 * =locate
 *
 * grab current location
 * run a function
 *
**/

function geo_locate2(callback,vars){
    console.log('geo_location2()'); 
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(updatePosition,error_geo);        
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


/***********
 * =feedback msg 
 *  
 * notice to user
**/

function feedback_msg(msg,sticky){
    console.log('feedback: ' + msg);
    var theHTML = msg;
    var modal = $('#modal');
    modal.hide().removeClass().addClass('msg').html(theHTML).fadeIn();
    if  ( !sticky ) { modal.delay('2500').fadeOut('slow'); }
    else { modal.append('<a class="close">&times;</a>'); }
}

/******************************* 
 * =error msg
**/

function error_msg(msg) {
  errormsg = typeof msg == 'string' ? msg : "dang. failed.";
  console.log(errormsg);
  feedback_msg(errormsg);
}


/******************************* 
 * =error geo location
 *
 * @see navigator.geolocation
**/

function error_geo(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
    	msg="Change your device's location permissions.";
    	feedback_msg(msg);
          break;
        case error.POSITION_UNAVAILABLE:
    	msg="Location information is unavailable.";
    	feedback_msg(msg);
          break;
        case error.TIMEOUT:
    	msg="The request to get location timed out.";
    	feedback_msg(msg);
          break;
        case error.UNKNOWN_ERROR:
    	msg="An unknown error occurred.";
    	feedback_msg(msg);
          break;
    }        
}




/******************************* 
 * =mobile hide browser bar
 *
 * not sure this is working
 *
**/

window.scrollTo(0,1);


/***********
 * =prevent link focus
 *
**/

$('body').on('click','a',function(){
    this.blur();
})

/***********
 * =utilities
 *
**/

$('.firsttime').click( function(){ 
    $(this).removeClass('firsttime');
    })

$('.modal').on("click", 'a.close', function(){ // binds to future elements
    console.log('closed');
    $('.modal').fadeOut();
});
    // should deprecate #modal
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

