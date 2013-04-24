
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
	var publicDropDown;
		/*dropDownArray = [],
		closeOthers = function(current){
			$.each(dropDownArray,function(i,item){
				if(item !== current){ item.close(); }
			});
		};
		,
		fire = function(type,params){
			$(publicDropDown).trigger(type,params);
		};*/
	
	publicDropDown = {
		create : function($el){
			var public,
				items = [],
				open = false,
				$options = $el.find('ul'),
				$header = $el.find('header'),
				$headerText = $el.find('h2'),
				value = $headerText.text();
		
			$header.on('click',function(){ public.toggle(); });
			$options.on('click','li',function(){ 
				console.log(this);
				var itemData, self = this;
				$.each(items,function(i,item){
					//console.log()
					if(item.$el[0] === self){ itemData = item; }
				});
			
				console.log("THIS IS THE DATA");
				console.log(itemData);
			
				var newValue = $(this).text();
				if(newValue !== $headerText.text()){ 
					value = newValue;
					$headerText.text(newValue);
					$(public).trigger("change",itemData);
				}
				public.close(); 
			});

			public = {
				open : function(){
					open = true;
					//closeOthers(this);
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
				/*
				value : function(){ 
					return value; 
				},
				*/
				addItem : function(name,query){
					var $el = $("<li/>").text(name);
					items.push({name:name,query:query,$el:$el});
					$("#filter-type ul").append($el);
				},
				removeAllItems : function(){
					items = [];
					$("#filter-type ul").empty();
				}
			};
	
			//dropDownArray.push(public);
	
			return public;
		}
		
	};
	
	return publicDropDown;
}());

var a = DropDown.create($("#filter-type"));
a.addItem("All",{type:"all"});
a.addItem("Between Work & Union Square",{type:"route"});
a.addItem("Between Home & Grand Army Plaza",{type:"route"});
a.addItem("Favorites",{});
a.addItem("By @mwillse",{type:"author"});
a.addItem("About #bikemonth",{type:"tag"});
//var b = DropDown.create($("#filter-location1"));
//var c = DropDown.create($("#filter-location2"));
$(a).on("change",function(e,params){ 
	console.log("change:" + params);
});
/*
$(b).on("change",function(e,params){ 
	console.log("change:" + params.value);
});
$(c).on("change",function(e,params){ 
	console.log("change:" + params.value);
});
*/

/*
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
*/




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



