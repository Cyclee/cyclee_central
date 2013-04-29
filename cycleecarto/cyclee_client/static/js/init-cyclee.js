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
var window_h;
var header_h;
var wrap_h;

function setheight(){
    // get heights
    header_h = $('header#main').outerHeight();
    window_h = $(window).height();
    wrap_h = window_h - header_h;

    // set heights
    $('body').css('padding-top',header_h);
    $('#wrap').height(wrap_h).css('top',header_h);
}

$(window).load(setheight);
$(window).bind('resize', function() { setheight(); });



/***********
 * =maps init
 *  
 *  
 *
**/

$(window).load( function(){


    locationmap = new Maps('locationmap-map');
    mapchoose = new Maps('mapchoose-map');
    addnotemap = new Maps('addnotemap-map');

//    addnotemap_init();
    
});




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
             // var header_h = $('header#main').outerHeight();
             // $('body').css('margin',-1).css('padding-top',header_h).css('padding-left',0);
             // $('#header').css('margin',-2);
             // $('#wrap').css('margin',-2);
         }, 0);
     });

