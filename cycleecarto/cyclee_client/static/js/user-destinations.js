

/***********
 * =load user destinations
 *
**/

$('#nav-destinations').on('click',function(){ 
    
    a.close();
});
       
$('#nav-destinations').one('click',function(){    
    $('#destinations fieldset').each(function(i){
        var name = localStorage.getItem('destination'+i+'name') || null;
        var address = localStorage.getItem('destination'+i+'address') || null;
        var location = localStorage.getItem('destination'+i+'location') || null;       
        if (name) { $(this).find('.destination-name').val(name); }
        if (address) { $(this).find('.destination-address').val(address); }
        if (location) { $(this).find('.destination-location').val(location); }
    });
    
});

var loadDestinations = function(){
    app.locations = [];
    
	console.log("destinations load count:" + app.locations.length);
	var count = 3, i, location, address;
	
	for(i = 0; i < count; i++){
		//location = localStorage.getItem('destination'+i+'location'); //mk - swap location for address once geocoded
		//if(location){
        var fakegeo = '-73.96970272 40.67484475';

		address = localStorage.getItem('destination'+i+'address');
		if(address){
			app.locations.push({
				location : fakegeo,
				name : localStorage.getItem('destination'+i+'name'),
				address : localStorage.getItem('destination'+i+'address')
			});
		}
	}
	console.log("destinations loaded count:" + app.locations.length);
	
	app.locations.push({ name : "The Met", location: "-73.96158099 40.7794528"});
    app.locations.push({ name : "Grand Army Plaza", location: "-73.96970272 40.67484475"});
    
	
};

/***********
 * =save user destinations
 *
**/

$('#destinations').on('click','button.save',function(event){
    event.preventDefault();
    
    $('#destinations fieldset').each(function(i){
        var name = $(this).find('.destination-name').val();
        var address = $(this).find('.destination-address').val();
        var location = $(this).find('.destination-location').val();
        if (name) { localStorage.setItem('destination'+i+'name', name); }
        if (address) { localStorage.setItem('destination'+i+'address', address); }
        if (location) { localStorage.setItem('destination'+i+'location', location); }
    });
    
    a.removeAllItems();
    a.addItem("All",{query:allNotes});    
    console.log(app.locations);
    loadDestinations();
    app.locations.forEach(function(item,i){
        a.addItem("To " + item.name,{type:"location",location:item.location,query:function(){ getNotes(app.getPosition().coords.longitude + " " + app.getPosition().coords.latitude,item.location) }});
    });
        
    $('#nav-notes').click();
    var msg = 'Destinations Saved';
    feedback_msg(msg);
    
});


/***********
 * =clear user destinations
 *
**/

$('#destinations').on('click','button.clear',function(event){
    event.preventDefault();

    $('#destinations fieldset').each(function(i){
        $(this).find('input').val('');
        localStorage.setItem('destination'+i+'name', '');
        localStorage.setItem('destination'+i+'address', '');
        localStorage.setItem('destination'+i+'location', '');
    });
    
    a.removeAllItems();
    a.addItem("All",{query:allNotes});    
    a.addItem("Near",{query:nearNotes});

    // add back example locations
    app.locations.forEach(function(item,i){
        a.addItem("To " + item.name,{type:"location",location:item.location,query:function(){ getNotes(app.getPosition().coords.longitude + " " + app.getPosition().coords.latitude,item.location) }});
    });

    var msg = 'Destinations Cleared';
    feedback_msg(msg);
    
});

