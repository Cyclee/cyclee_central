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
        navigator.geolocation.getCurrentPosition(updatePosition,error_msg);        
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

