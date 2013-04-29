/***********
 * =nav.js
 *
 * app navigation
 *
 *
**/



/***********
 * =nav switchpage
 *
 * switch pages. hide/show navigation & filters
 *
 *
**/

function switchpage(id){
    console.log('switch: ' + id);
    
    if( id != 'notes'){
        $('header#main').find('.nav-backhome').fadeIn();
        $('#nav-logo').css('border-color','rgba(255,0,255,0)');        
    }
    else {
        $('#nav-logo').css('border-color','rgba(255,0,255,1)');
    }
    
    $('section.page').hide();
    $('section#' +id).fadeIn();
    
    // hide/show notes nav
    if( id=='notes'){
        $('nav#mapnav').show();
    }
    else {
        $('nav#mapnav').hide();
    }
        
    // hide misc
    $('.notesfilter').hide();
    $('#modal').hide(); // should deprecate
    $('.modal').hide();

    if( id=='addnote' && addnotemap_once){
        addnotemap_init();
    }
    else if(id=='addnote'){ 
        addnotemap_locate();
    }; 


};


/***********
 * =nav switchpage enable
 *
 * enable nav to switchpage
 *
 *
**/
    // any a.nav-page marked a#nav-pagename will open section#pagename (styled w/ .page)
$('body').on('click','a.nav-page', function(){
    
    // un-highlight other nav items
    $('.active').removeClass('active');
    
    var page = $(this).attr('id'); // a#nav-id
    page = page.slice(4); // id
    switchpage(page);
});   


/***********
 * =nav active
 *
 * toggle active class across nav
 *
 *
**/
$('body').on('click','a.toggle',function(){
   var elem = $(this);
   elem.addClass('active');
   $(this).siblings().removeClass('active');
});


/***********
 * =nav addnote
 *
 * prepare note. check for flags.
 *
 *
**/
$('#nav-addnote').click( function(){
    finish_note('clear'); // just to be sure for replies not sent
    userFlags();
});


/***********
 * =nav active
 *
 * toggle active class across nav
 *
 *
**/
$('a#nav-addnote').on('click', hashtags_load); // trigger load. event later removed.


/***********
 * =nav logo
 *
 * logo click loads notes page
 *
 *
**/
$('#nav-logo').click( function(){
    $('#nav-notes').click();
});


/***********
 * =nav notes
 *
 * hide back arrow on notes page view
 *
 *
**/
$('#nav-notes').on('click',function(){
    $('header#main').find('.nav-backhome').hide();    
});

