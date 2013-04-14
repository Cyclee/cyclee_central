
/***********
 * =user load
 *
 * called on load
 * check for usernae in localstorage
 * could also connect with django
 *
**/
function load_user() {
    
    //check to see if we have an active session.
    session_check(undefined,function(){
    	var username = localStorage.getItem('username');
    
    	switchpage('signup');
    
    	if (!username) { 
    		console.log('New User?');
    		//loadintro(); // show reg screen
    		joinLoginView.setRegMode();
    	}else{
    		$("#id_username").val(username);
    		joinLoginView.setLoginMode();
    	}
    
    });
    

/*    else {
         username = localStorage.getItem('username');
         init_user();
         console.log("username: " + username); 
    } */
};

var joinLoginView = (function(){
	var regMode = true, //false will mean login mode
		updateForm = function(){ 
			if(regMode){
				$("#joinTitle").show(); 
				$("#loginTitle").hide();
				$("#emailField").show();
				$("#password2Field").show();
			}else{
				$("#joinTitle").hide(); 
				$("#loginTitle").show();
				$("#emailField").hide();
				$("#password2Field").hide();
			}
		};
	
	return {
		setRegMode : function(){ regMode = true; updateForm();  },
		setLoginMode : function(){ regMode = false; updateForm(); },
		getMode : function(){ if(regMode){ return "registration"; }else{ return "login"; } }
	};
}());

$("#joinTitle a").on("click",function(){ joinLoginView.setLoginMode(); return false; });
$("#loginTitle a").on("click",function(){ joinLoginView.setRegMode(); return false; });

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
    $('.filter-logout').remove();

    // set html
    var user_opt = '<option value="usernotes" class="filter-username">'+username+'</option>';
    var user_filtername = '<li class="filter-username">'+username+'</li>';
    var user_mentions = '<li class="filter-mentions">@'+username+' mentions</li>';
    var logout = '<li class="filter-logout">logout</li>';

    // append
    $('form#notesmap-filter').find('select').append(user_opt);
    $('.notesfilter').find('ul').append(user_filtername).append(user_mentions).append(logout);
}



/***********
 * =login
 *
 * login to django backend
 *
**/

var submitLogin = function(){
    var form = $("#signup .register"),
        theData = form.serializeArray(),
        url = 'http://cycleecarto-cyclee.dotcloud.com/m/accounts/login/',
        $error = $("p.error",form);

        $error.hide();

    /* Send the data using post */
    console.log(theData);
    var posting = $.post( url, [{name:"username",value:$("#id_username").val()},{name:"password",value:$("#id_password1").val()}] );

    /* Put the results in a div */
    posting.done( function(data) {
        console.log('login response: ');

        $error.show();

        if(data.authenticated){
        	username = $("#id_username").val();
        	localStorage.username = username;
        	init_user();
            switchpage("notes");
        }else{
            $error.text(data.errors.__all__.join(" "));
        }

        console.log(data);
    });
};



/***********
 * =signup
 * =register
 *
 * send username, email, & password to django
 * need to do something meaningful with response
 *
**/

$("form.register").submit(function(e){
	e.preventDefault();
	
	if(joinLoginView.getMode() === "registration"){
		submitRegistration();
	}else{
		submitLogin();
	}
});

var submitRegistration = function(){
    var form = $("#signup .register"),
        user_name = form.find( 'input[name="username"]' ).val(),
        theData = form.serializeArray(),
        url = 'http://cycleecarto-cyclee.dotcloud.com/m/accounts/register/',
        $error = $("p.error",form);

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
        	username = $("#id_username").val();
        	init_user();
            switchpage("notes");
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
}

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

function session_check(onAuth,onUnauth){
	onAuth = onAuth || $.noop;
	onAuth = onUnauth || $.noop;

    console.log('session check');
    var url = 'http://cycleecarto-cyclee.dotcloud.com/init/';
    var get = $.get(url, function(data) {
      console.log(data);      
      console.log("authenticated: " + data.authenticate);
      console.log("authenticated: " + data.authenticated);
      
      
      console.log("username: " + data.user);
      if(!data.authenticate){ 
      		onUnauth();
      }else{
      		onAuth();
      }
    });
};




