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





/******************************* 
 * =addnote cartoDB
 *
 * addnote: prepare query for cartoDB 
 *
 * @depracated -- used for debugging. send data directly to cartoDB
 *
**/

function addnote(username,category,description,location,table,msg,callback){
    console.log('addnote_carto');

    // if table not specific, use default
    var table = table;
    if ( !table ) { table = notes_table; }
    
    var description_esc = escape(description);
    var sqlInsert ="&q=INSERT INTO "+table+" (username,category,description,the_geom) VALUES('"+ username +"','"+ category +"','"+ description_esc +"',ST_SetSrid(st_makepoint("+ location +"),4326))";

    // check if note was made from pending flag 
    // is this bullet proof? confirm on insert success?
    if(location == flag_location){
        flag_used = flag_id;
    }
    else { flag_used = ''; }

    // send data
    update_carto(sqlInsert,msg,callback);

        
} // END addnote



/******************************* 
 * =cyclee-central update
 *
 * post notes to django api
 * 
**/

function update_central(category,description,location,msg,callback){

    var url = '/cartoapp/note/add/';
    var post_data = {category: category,
                            description: description,
                            accuracy: 0,
                            altitude: 0,
                            the_geom: 'POINT(' + location.replace(',', ' ') + ')' };

    console.log('Post to central: ');
    console.log(post_data);
    $.post(url, post_data, function(data) {
            console.log('Post return: ');
            console.log(data);
    }).success(function(){

        // return to notes view
        $('a#nav-notes').click();
        finish_note('clear');

        if (msg){
            console.log('msg: ' +msg);
            feedback_msg(msg);
            }
        if (callback){
            console.log('update_central callback');
            var t=setTimeout(function(){ callback() },2000);
            }
            
        // check if note was made from pending flag 
        if(location == flag_location){
            console.log('flag used');        
            flag_remove(flag_id);
        }
     
    }).error(function(e){
        error_msg(e);
    });
};


/******************************* 
 * =cartoDB update
 *
 * post notes directly to CartoDB
 *
 * @deprecated -- used for debugging
 *
**/

function update_carto(sql,msg,callback){
    
    console.log('update carto();');
    var theUrl = url_cartoData + cartodb_key + sql;
    // console.log(theUrl);

    $.getJSON(theUrl, function(data){
        // console.log(data);
    })
    .success(function(e) { 
        console.log('update_carto success');
        console.log(e);
        finish_note('clear');
        
        // return to notes view
        $('a#nav-notes').click();

        if (msg){
            console.log('msg: ' +msg)
            feedback_msg(msg);
            }
        if (callback){
            console.log('update_carto callback')
            var t=setTimeout(function(){ callback() },2000);
            }
            
        if( flag_used != '' ){
            console.log('flag_used');
            flag_used = ''; // clear it
            flag_remove(flag_id);
        }
    })
    .error(function() { 
        console.log('update_carto error'); 
        msg = 'Sorry. There was an error.';
        feedback_msg(msg);
    })
    .complete(function() {  });  
    
}





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

