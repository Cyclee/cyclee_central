
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

var DropDown = (function(){
	var publicDropDown,
		dropDownArray = [],
		closeOthers = function(current){
			$.each(dropDownArray,function(i,item){
				if(item !== current){ item.close(); }
			});
		};
		/*,
		fire = function(type,params){
			$(publicDropDown).trigger(type,params);
		};*/
	
	publicDropDown = {
		create : function($el){
			var public,
				open = false,
				$options = $el.find('ul'),
				$header = $el.find('header'),
				$headerText = $el.find('h2'),
				value = $headerText.text();
		
			$header.on('click',function(){ public.toggle(); });
			$options.on('click','li',function(){ 
				var newValue = $(this).text();
				if(newValue !== $headerText.text()){ 
					value = newValue;
					$headerText.text(newValue);
					$(public).trigger("change",{value:newValue});
				}
				public.close(); 
			});

			public = {
				open : function(){
					open = true;
					closeOthers();
					$el.addClass('open');
					$options.fadeIn();
				},
				close : function(){
					open = false;
					$el.removeClass('open');
					$options.fadeOut();
				},
				toggle : function(){
					if(open){ this.close(); }else{ this.open(); }
				},
				value : function(){ return value; }
			};
	
			dropDownArray.push(public);
	
			return public;
		}
		
	};
	
	return publicDropDown;
}());
/*
var a = DropDown.create($("#filter-type"));
var b = DropDown.create($("#filter-location1"));
var c = DropDown.create($("#filter-location2"));
$(a).on("change",function(e,params){ 
	console.log("change:" + params.value);
});
$(b).on("change",function(e,params){ 
	console.log("change:" + params.value);
});
$(c).on("change",function(e,params){ 
	console.log("change:" + params.value);
});
*/

$('#notesfilter').on('click','header',function(){
	console.log('#notesfilter click header');
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



