

/***********
 * =load user destinations
 *
**/

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
	console.log("destinations load count:" + app.locations.length);
	var count = 3, i, location, address;
	
	for(i = 0; i < count; i++){
		//location = localStorage.getItem('destination'+i+'location'); //mk - swap location for address once geocoded
		//if(location){
		address = localStorage.getItem('destination'+i+'address');
		if(address){
			app.locations.push({
				location : location,
				name : localStorage.getItem('destination'+i+'name'),
				address : localStorage.getItem('destination'+i+'address')
			});
		}
	}
	console.log("destinations loaded count:" + app.locations.length);
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
    
    var msg = 'Destinations Saved';
    feedback_msg(msg);
    
});
