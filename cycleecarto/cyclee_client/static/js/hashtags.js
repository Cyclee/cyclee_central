/******************************* 
 * =hashtags toggle
 *
 * hide show hashtags
 *
**/

$('a#tags-toggle').on('click', function(){
    $(this + 'i').toggle();
    $('#tags-container').toggle();
    $('#search-hashtags').parent().toggle();
    
});



/***********
 * =hashtags setup
 *  
**/
    // eventually, grab top tags from database
var hash_tags = ['bikelane','co-ride','parkedinlane','rack','thanks','stolen','pothole','biketrain','air','repair','water','danger','pedestrian','crosswalk','police','unsafemerge','unsafeleft','unsaferight','laneends','lanestarts','protectedlane','paintedlane','nolane','shelter','ambassador','bridge','shower','coffee','bikeshare','bikeshop','north','south','east','west','bikenyc'];
hash_tags = hash_tags.sort();
    // console.log(hash_tags);


/***********
 * =hashtags ui
 *  
 * load hashtags for use with addnote   form
 *  
**/
function hashtags_load(){
    console.log('hashtags load');
    // add top #hashtags
    var tags_container = $('#tags-container');
    $.each( hash_tags, function(i,tag){
        tags_container.append('<a href="#" >#'+ tag +'</a>');
    });
    
    // no need to load again
    $('a#nav-addnote').off('click', hashtags_load); 
    $('#notes').off('click', 'a.replylink', hashtags_load);
}



/***********
 * =hashtags selected
 *  
 * add user selected hashtags to addnote textarea
 * mark as selected
 *  
**/
$("#tags-container").on("click", "a", function(event){    
    var thetag = $(this).text();
    $(this).toggleClass('selected'); // should toggle remove #tag
    var currentcontent = $('#noteContent').val();
    currentcontent +=  ' ' + thetag + ' ';
    currentcontent = currentcontent.replace('  ',' ');
    $('#noteContent').val(currentcontent);
});


/***********
 * =hashtags search
 *  
 * hide all tags
 * show suggested matches (only includes currently loaded)
 *  
**/
$('#search-hashtags').on("keyup", function(e){

    if(e.keyCode === 27){  // escape
        $('#tags-container').find('a').show(); 
        $('#search-hashtags').val('');
        return false;
        }

    // hide them all
    $('#tags-container').find('a').hide();

    
    // reveal matches
    var search = $('#search-hashtags').val();
    // console.log('searching: ' + search);
    $('#tags-container').find('a').each( function(){

        var thetag = $(this).text();
        var found = thetag.match(search);
        
        if (found) { 
            $(this).show();
            console.log( 'match: ' + thetag );
            }
    });
    
});


/***********
 * =hashtags search end
 * clear input, show all hashtags 
 *  
**/
$('#search-hashtags').blur( function(){
    var search = $('#search-hashtags').val();
    if ( search == '' ) {
        $('.hashtags').find('a').show();
    }
    
});
