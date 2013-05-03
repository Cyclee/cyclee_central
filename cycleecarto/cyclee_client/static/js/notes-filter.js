/******************************* 
 * =query on load
 *
 * query CartoDB for notes
 *
 * should be integrated with stuff below
 * ideally it searches from current location to first location saved by user
 *
 *
**/
getNotes(commute_1a,commute_1b);



/******************************* 
 * =position
 *
 * query CartoDB for notes
 *
**/


var app = (function(){
	var position, public, 
		newPosition = function(p){ position = p; $(public).trigger("position",position) },
		positionError = function(error){ console.log(error); };

	public = {
		getPosition : function(){ return position; },
		locations : []
	};

//	navigator.geolocation.getCurrentPosition(newPosition,positionError, {enableHighAccuracy: true, maximumAge: 300000}); // mk - use gps / max age 5 min.
    navigator.geolocation.getCurrentPosition(newPosition,positionError, {enableHighAccuracy: false, maximumAge: 300000}); // mk - use gps / max age 5 min.

	return public;

}());


$(app).on("position",function(position){ console.log("newPosition"); console.log(position); });


app.locations.push({ name : "The Met", location: "-73.96219254 40.77911158"});
app.locations.push({ name : "Union Square", location: "-73.99112284 40.73502707"});
app.locations.push({ name : "Grand Army Plaza", location: "-73.96970272 40.67484475"});
    // { name : "Brooklyn (Mnhtn/Brklyn Bridge)", location: "-73.9877700805664 40.70042247927176"},
    // { name : "Brooklyn (Willsbrg Bridge)", location: "-73.96305084228516 40.71083299030839"},
    // { name : "Upper Manhattan (West Side)", location: "-73.98931503295898 40.769491796481404"},
    // { name : "Upper Manhattan (East Side)", location: "-73.963565826416 40.761560925502806"},
    // { name : "Union Square", location: "-73.99068832397461 40.73555143165807"},
    // { name : "Soho", location: "-73.9990997314453 40.72293316385307"},
    // { name : "Loisaida", location: "-73.97953033447266 40.724949645619056"},
    // { name : "Lower East Side", location: "-73.98940086364746 40.71720862468233"},
    // { name : "Wall Street", location: "-74.01128768920898 40.70852329864894"},
    // { name : "Battery Park", location: "-74.01643753051758 40.71122335281536"},
    // { name : "West Village", location: "-74.00545120239258 40.73321007823572"},
    // { name : "Times Sq", location: "-73.98605346679688 40.75616479199092"},
    // { name : "Queens", location: "-73.94433975219727 40.75219867966512"},
    // { name : "Bronx", location: "-73.92562866210938 40.81796653313175"}




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
				$footer = $el.find('footer'),
				value = $headerText.text();
		
			$header.on('click',function(){ public.toggle(); });
			$options.on('click','li',function(){ 
				var itemData, self = this;
				$.each(items,function(i,item){
					if(item.$el[0] === self){ itemData = item; }
				});
			
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
					$footer.fadeIn();
				},
				close : function(){
					open = false;
					$el.removeClass('open');
					$options.fadeOut();
					$footer.fadeOut();
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
					items.push({name:name,data:query,$el:$el}); //todo - this could be cleaner
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
a.addItem("All",{query:allNotes});

$(app).one("position", function(){
	loadDestinations();
	app.locations.forEach(function(item,i){
		a.addItem("To " + item.name,{type:"location",location:item.location,query:function(){ getNotes(app.getPosition().coords.longitude + " " + app.getPosition().coords.latitude,item.location) }});
	});
	
});

//a.addItem("Between Work & Union Square",{type:"route"});
//a.addItem("Between Home & Grand Army Plaza",{type:"route"});
//a.addItem("Favorites",{});
//a.addItem("By @mwillse",{type:"author"});
//a.addItem("About #bikemonth",{type:"tag"});
//var b = DropDown.create($("#filter-location1"));
//var c = DropDown.create($("#filter-location2"));
$(a).on("change",function(e,params){ 
	console.log("change:" + params);
	params.data.query();
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



