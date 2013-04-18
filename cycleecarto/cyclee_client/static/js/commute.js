/***********
 * user commute settings
 *
 * a commute defines default note view
 * currently users select options (best for small userbase)
 * should modified to allow addresses
 *
 * currently, commutes are saved locally. should be synced with server.
 *
 * code below is ready to allow multiple commutes per user.
 * query of notes would need to be extended.
 *
**/

var nyc1 = '-73.99086 40.735031';
var nyc2 = '-73.989573 40.702244';
var nyc_lat = 40.7; // nyc default
var nyc_lng = -73.96; // nyc default

var mycommutes = [];
var commute_1a;
var commute_1b;

/***********
 * =commutes: load
 *
**/

load_commutes();

function load_commutes(){

    // load commutes or prep if none
    if (localStorage.mycommutes) {
        mycommutes = $.parseJSON(localStorage.mycommutes);
        console.log('mycommutes: ');
        console.log(mycommutes);
        commute_setpoints();
        commutes_form();
    } else {
        console.log('no commutes. setting union sq & dumbo');
        commute_1a = nyc1;
        commute_1b = nyc2;
        $('#thecommutes .template').removeClass('template');
    }

}

function commute_setpoints(){
    commute_1a = mycommutes[0][0].replace(',',' ');
    commute_1b = mycommutes[0][1].replace(',',' ');
    };




/***********
 * =commutes: prompt
 *
 * prompt users to set their commute
 *
 * @see: submitRegistration()
 *
 * this should be abstracted as a uttility for app
 *
**/

function prompt_setcommute(){
    
    var footer = '<a href="#" class="notify-footer" onclick="switchpage(\'commute\'); $(this).hide();" >Customize notes to your usual route &#187;</a>';
    $('#notes').append(footer);
    
}


/***********
 * =commutes: form
 *
**/

function commutes_form(){
    // prepare form template
    var commuteTemplate = $('#thecommutes .template');
    
    console.log('commutes_form');
    
    // populate form
    for ( var i=0; i< mycommutes.length; i++) {
        // duplicates template for each commute pair in memory
        var thisCommute = commuteTemplate.clone();
        
        // set hidden inputs
        thisCommute.find('input[name="commute_geoA"]').val(mycommutes[i][0])
        thisCommute.find('input[name="commute_geoB"]').val(mycommutes[i][1])

        // set select options
        thisCommute.find('select.commute_geo1').val(mycommutes[i][0])
        thisCommute.find('select.commute_geo2').val(mycommutes[i][1])

        // clean up and append
        thisCommute.removeClass('template');
        $('#thecommutes').append(thisCommute);

    }; 
}


/***********
 * =commutes: form append
 *
**/

$('#nav-settings').on('click', function(){
    commutes_form_move('#settings div.commute-form');
});

$('.page').on('click','#nav-intro2', function(){
    console.log('move commutes form to intro2');
    commutes_form_move('#intro2 div.commute-form');
});

function commutes_form_move(id){ 
    // console.log(id);
    var form = $('form#commute-locations');
    form.detach();
    form.appendTo(id);
}



/***********
 * =commutes: add multiple
 *
**/

// add fields for another commute
// currently disabled
$('button#commute-more').click( function(){
    console.log('add another commute');
    var copyclone = $('.commute-path').last().clone();
    copyclone.removeClass('template');
    
    $('#thecommutes').append(copyclone);
    return false;
});






/***********
 * =commutes: query address
 *
**/

// lat/lon from address via open street map
function address_geocode(addy){

    var url = 'http://nominatim.openstreetmap.org/search?q='+addy+'&format=json&addressdetails=1&limit=1'

    $.getJSON(url, function(data){
        console.log(data);
        console.log(data[0].lat);
        console.log(data[0].lon);
        // 
    }).success(function() { 
        console.log('address geocode success'); 
    }) // END sucess
    .error(function(e) { console.log('address geocode error'); console.log(e); })
    .complete(function() {  }); // not necessarily successful

}; // END address_geocode()

// user address lookup
$('a#address-lookup').click( function(){
    console.log('lookup address');
    var addy =  $('section.commute-path').not('.template').find('input[name=addressquery]').val();    
    console.log(addy );
    address_geocode(addy);
});



/***********
 * =commutes: select neighborhood
 *
**/

$('.commute-location select').on('blur', function(){
    xy = $(this).val();
    $(this).siblings('input').val(xy);    
});



/***********
 * =commutes: save
 *
**/
 
$('button#commute-save').on('click', function(){

    // clear old commutes
    mycommutes = [];
    
    // loop thru each commute 
    $('section.commute-path').not('.template').each( function(i){
        
        var a = $(this).find('input[name="commute_geoA"]').val();
        var b = $(this).find('input[name="commute_geoB"]').val();
        
        thispath = [a,b];
        mycommutes.push(thispath);
        
    });

    // store commutes locally and upadate for query 
    var mycommutes_s = JSON.stringify(mycommutes);
    localStorage.mycommutes = mycommutes_s;
    commute_setpoints();
    console.log('saved commute locations');
    
    // notify user
    // $('#settings').find('p#commutes-notice').fadeTo(200, 0.1, function(){
    //     $(this).text('Commutes Saved').fadeTo(200, 1.0);  
    // });

    var msg = 'Commute Saved';
    feedback_msg(msg);
    switchpage('notes'); // this needs a delay

    return false;
});

