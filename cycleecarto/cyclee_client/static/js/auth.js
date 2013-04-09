
/***********
 * =user load
 *
 * called on load
 * check for usernae in localstorage
 * could also connect with django
 *
**/
function load_user() {
    
    // session_check();
    
    if ( !localStorage.getItem('username') ) { 
         console.log('New User?');
         loadintro();
    }
    else {
         username = localStorage.getItem('username');
         init_user();
         console.log("username: " + username); 
    }
};


/***********
 * =username pre-save
 *
 * @deprecated
 * used for dev testing. 
 * validated username in settings for localstorage
 *
**/
$('button.username-save').click( function(){

    username = $(this).siblings('.username').val(); // need username in memory
    console.log('username val: ' + username);
    sanitized = username.search(/[^a-z0-9]/gi); // -1 = clean
    if ( sanitized != -1 ) { 
        console.log('uri has illegal characters');
        msg = 'Oops! Only numbers & letters allowed.';
        $(this).parents('.page').find('p.settings-notice').fadeTo(200, 0.1, function(){
          $(this).text(msg).fadeTo(200, 1.0);  
        });
        return false;
    }
    //    new_uri = new_uri.replace(/\s/g,"-").replace(/[^a-z 0-9 \-]+/gi,'').toLowerCase();

    save_username(username); 
    return false;
});


/***********
 * =username save
 *
 * @deprecated
 * used for dev testing. 
 * saved username from settings for localstorage
 *
**/
function save_username(username) {
    localStorage.username = username;
    $('p.settings-notice').fadeTo(200, 0.1, function(){
      $(this).text('Username Saved').fadeTo(200, 1.0);  
    });
    $('input.username').val(username); // populate both input fields
    username_filter(); // add to note filters
    console.log("saved username: " + localStorage.username);
}



/***********
 * =username load
 *
 * pre-populates settings field
 * call username_filter for setup
 *
**/
function init_user(){  
    username_filter();
    $('input.username').val(username); // deprecated??
}


/***********
 * =username filter
 *
 * sets up notes filters with username
 * for notes by user and @mentions
 *
**/
function username_filter(){
    // remove previous
    $('.filter-username').remove();
    $('.filter-mentions').remove();

    // set html
    var user_opt = '<option value="usernotes" class="filter-username">'+username+'</option>';
    var user_filtername = '<li class="filter-username">'+username+'</li>';
    var user_mentions = '<li class="filter-mentions">@'+username+' mentions</li>';

    // append
    $('form#notesmap-filter').find('select').append(user_opt);
    $('.notesfilter').find('ul').append(user_filtername).append(user_mentions);
}



/***********
 * =login
 *
 * login to django backend
 *
**/

$("form.login").submit(function(event) {

    event.preventDefault(); /* stop form submit action */

    var form = $(this),
        theData = form.serializeArray(),
        url = 'http://cycleecarto-cyclee.dotcloud.com/m/accounts/login/',
        $error = $("#signup form.login p.error");

        $error.hide();

    /* Send the data using post */
    console.log(theData);
    var posting = $.post( url, theData );

    /* Put the results in a div */
    posting.done( function(data) {
        console.log('login response: ');

        $error.show();

        if(data.authenticated){
            $error.text("you're in!");
        }else{
            $error.text(data.errors.__all__.join(" "));
        }

        console.log(data);
    });
});



/***********
 * =signup
 * =register
 *
 * send username, email, & password to django
 * need to do something meaningful with response
 *
**/

$("form.register").submit(function(event) {
    event.preventDefault(); /* stop form from submitting normally */

    var form = $(this),
        user_name = form.find( 'input[name="username"]' ).val(),
        theData = form.serializeArray(),
        url = 'http://cycleecarto-cyclee.dotcloud.com/m/accounts/register/',
        $error = $("#signup form.register p.error");

    console.log(user_name);
    console.log(theData);

    $error.hide();
    /* Send the data using post */
    // var posting = $.post( url, { username: username } );
    var posting = $.post( url, theData );

    posting.done( function(data) {
        var errors = "";

        $error.show();
        console.log('registration response: ');

        if(data.status){
            $error.text("you're registered!");
        }else{
            $.each(data.errors,function(i,val){
                errors += val.join(" ");
            });
            $error.text(errors);
        }


        console.log(data);
        
        // if ( registration successful ) { 
        //  save_username(user_name); 
        // }
    });
});


/***********
 * =session testing
 *
 * check if user is logged in on launch
 *
 * note: this has not been tested. might not be set up correctly.
 *
 *
 *
**/

$("#session-check").on('click',session_check);

function session_check(){
    console.log('session check');
    var url = 'http://cycleecarto-cyclee.dotcloud.com/init/';
    var get = $.get(url, function(data) {
      console.log(data);      
      console.log("authenticated: " + data.authenticate);
      console.log("authenticated: " + data.authenticated);
      console.log("username: " + data.user);
    });
};




