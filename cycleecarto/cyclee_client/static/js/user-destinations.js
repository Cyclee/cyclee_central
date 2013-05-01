

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
