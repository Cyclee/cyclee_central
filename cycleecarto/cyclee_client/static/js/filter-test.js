
/******************************* 
 * notes-filter.js
 *
 * user options and filtering of notes stream
 *
**/



/******************************* 
 * =filter nav
 *
 *
**/
var filtertype;
var notesfilters = [];
var filtertoggle =  '<em class="entypo open">&#9662;</em><em class="entypo close">&#9652;</em> ';

$('#notesfilter').find('header').each(function(){
    $(this).prepend(filtertoggle);
});

$('#notesfilter').on('click','header',function(){

    $(this).toggleClass('open');
    $(this).parent().siblings().find('header').removeClass('open');
    $(this).parent().siblings().find('ul').fadeOut();
    $(this).siblings('ul').fadeToggle();
});

$('#notesfilter').on('click','li',function(){
    console.log('filter item clicked');
    var filter = $(this).text(); // switch to data
    
    $(this).parent().hide().siblings('header').toggleClass('open').find('h2').text(filter);
    console.log(filter);
    
    if (filter == 'Set Locations'){
       switchpage('commute'); 
    }
    else if (filter == 'Set Search'){
       switchpage('filters'); 
    }
    else {
        filtertype = filter;
        filterAction[filter]();
    }
});





/***********
 * =filterActions
 *
 *
**/
var filterAction = {
  Between: function(){
      $('#filter-tags').hide();
      $('#filter-location1').fadeIn().find('header h2').text('Here');
      $('#filter-location2').fadeIn().find('header').click().find('h2').text('and...');
  },
  Near: function(){
      $('#filter-tags').hide();
      $('#filter-location1').fadeIn().find('header').click().find('h2').text('select');
      $('#filter-location2').hide();
  },
  About: function(){
      $('#filter-tags').fadeIn().find('header').click().find('h2').text('select');
      $('#filter-location1').hide();
      $('#filter-location2').hide();
  },
  By: function(){
      // coming soon...
  },
  Here: function(){
      if( filtertype == 'Between' ){
          console.log('between here and...');
      }
      else {
          console.log('near here');
          notes_nearlocation();
      }
  },
  Home: function(){
  },
  
}



