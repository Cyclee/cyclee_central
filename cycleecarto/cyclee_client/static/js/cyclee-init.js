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
splash.delay(1800).fadeOut('slow');


/***********
 * =height
 *  
 *  fit to browser
 *
**/

function setheight(){
    // get heights
    var header_height = $('header#main').outerHeight();
    var wrap_height = $('#wrap').innerHeight();

    // set heights
    $('body').css('padding-top',header_height);
    $('.mapcontainer').height(wrap_height);    
}

$(window).load(setheight);
$(window).bind('resize', function() { setheight(); });


/***********
 * =bugfix
 *  
 *  browser viewport shitfs when keyboard is revealed.
 *
 *  not working
 *
**/
$(document).on('focus', 'input, textarea', function() {
         setTimeout(function() {
             // window.scrollTo(document.body.scrollLeft, document.body.scrollTop);
             // var header_height = $('header#main').outerHeight();
             // $('body').css('margin',-1).css('padding-top',header_height).css('padding-left',0);
             // $('#header').css('margin',-2);
             // $('#wrap').css('margin',-2);
         }, 0);
     });

