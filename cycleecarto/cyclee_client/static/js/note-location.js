
/***********
 * =location by map
 *
 * used by addnote
 * allow user to drag marker on map to set note location
 * 
 *
**/
$('.page').on("click", 'a.link_location_choose', function(){
    
    inputfield = $(this).parent().children('input');
    
    var theHTML = '<p class="notify">Drag marker to location.</p><div class="map-buttons" ><a class="close" href="#">Cancel</a> <a id="location-choose-done" class="hidden" href="#" >Post</a></div><div id="findmap" class="mapcontainer"></div>';
    $('#modal').html(theHTML).removeClass().addClass('modalmap').fadeIn();
    $('#modal').find('#location-choose-done').click( function(){
        $(this).parents('#modal').fadeOut(); // function updated on when marker moved
    });
    
    location_choose_init();

});



/***********
 * =flag location UI
 *
 * mark a spot to create a pending note for adding details later
 *
 * @see geo_locate2()
 * @see flag_carto()
**/
$('#flag-link').click( function(){
    inputfield = $('#newflag_location');
    geo_locate2(flag_carto)
});


/***********
 * =flag location
 *
 * add flag to carto
 * @see geo_locate2()
 *
**/
function flag_carto(location){
    console.log('flag: ' + location);
    var msg = 'Location Flagged. Add a Note Later.';
    

    // this should not trigger return to home screen
    // also should be sending to cyclee_central
    addnote(username,'pending','',location,pending_table,msg); // no callback
}


/***********
 * =location choose by flag
 *
 * create map with flags
 * allow user to select flag to set note location
 * remember flag to delete on addnote success
 *
 *
**/
var flag_id; // delete flag when note added
var flag_location; // confirm match before deleting on +note
var flag_used; // queue for remove


function location_choose_flags() {
    console.log('addflags');

    var layer2Url = 'http://'+cartodb_accountname+'.cartodb.com/api/v1/viz/'+pending_table+'/viz.json'; // pending_table
    var layer2Options = {
      query: "SELECT * FROM {{table_name}} WHERE username='"+username+"'",
      tile_style: "#{{table_name}}{marker-fill: #ff00ff; marker-width: 24; marker-line-color: white; marker-line-width: 2; marker-clip: false; marker-allow-overlap: true;} "
      
    }

    // create layer of flags
    cartodb.createLayer(find_map, layer2Url, layer2Options)
        .on('done', function(layer) {
            find_map.addLayer(layer);
            //console.log(layer);

            // set info window
            var msg = 'Note Added at Flag';
            var button = '<button onclick="location_selected(flag_location,\''+msg+'\'); return false;">Drop Note Here</button>';
            layer.infowindow.set('template', button);

            // add layer
            layers.push(layer);
            
            // on flag click
            layer.on('featureClick', function(e, latlng, pos, data){
                // remember flag & location
                flag_id = data.cartodb_id;
                console.log('flag clicked: ' + flag_id);
                flag_location = latlng[1] +','+ latlng[0];
            })

        }).on('error', function(e) {
            console.log('snap. carto error.');
            console.log(e);
        });

}


/***********
 * =location_selected 
 *
 * post note at user selected location
 * @see location_choose_flags()
 * @see location_choose_updatevalue
 *
**/
function location_selected(location,msg){
    // console.log(msg);
    // console.log(location);
    $('#modal').fadeOut();
    addnote_submit(location,msg);
};



/***********
 * =flag remove 
 *  
 * delete flag from CartoDB on addnote success
 * @deprecated -- MUST to update this to remove from django
 *
**/
function flag_remove(flag_id){    
    var sqlDelete = "&q=DELETE FROM " +pending_table+ " WHERE cartodb_id="+flag_id;
    var msg = 'Note Added at Flag';
    update_carto(sqlDelete,msg);
}


/***********
 * =flags delete all 
 *  
 * @deprecated -- MUST update this to remove from django
 *
**/
function flags_delete(){
    console.log('delete flags');
    var sqlDelete = "&q=DELETE FROM " +pending_table+ " WHERE username='"+username+"'";
    console.log(sqlDelete);
    var msg = 'Flags Deleted';
    update_carto(sqlDelete,msg);
}



/***********
 * =create map
 *
 * @see: a.maplink on articles
 * @see: location_choose_init()
 *
 *
 *
**/

function createmap(mapname,map_lat,map_lng){
    
    // initiate leaflet map
    find_map = new L.Map(mapname, { 
      center: [map_lat, map_lng],
      cartodb_logo: false,
      zoom: 13,
      maxZoom: 15
    })

    var basemap = 'https://dnv9my2eseobd.cloudfront.net/v3/cartodb.map-pp0tkn8d/{z}/{x}/{y}.png'; // mapbox light

    L.tileLayer(basemap, {
      attribution: 'MapBox'
    }).addTo(find_map);

}


/***********
 * add marker
 *
**/

function add_marker(m_lat,m_lng) {

    var myIcon = L.icon({
          iconUrl: 'http://cartodb-gallery.appspot.com/static/icon.png',
          iconSize: [28, 28],
    });

    var marker = new L.Marker( [m_lat,m_lng],{
      icon: myIcon,
    }).addTo(find_map);

}



/***********
 * =location_choose by map: init map
 *
 * allows users to drag marker on map to set location
**/

function location_choose_init() {

    find_lat = nyc_lat;
    find_lng = nyc_lng;        

    // should find an idle moment to grab current location for various use
    // also check if( location_choose ) { /* use this instead; */ }    

    createmap('findmap',find_lat,find_lng);
    add_marker_draggable(find_lat,find_lng);
    location_choose_flags();


};



/******************************* 
 * =flags enable
 *
 * allow posts by flag location 
 *
**/
var findloc_dragprompt = 'Drag to Location';

function flags_enable() {
    if (user_flags > 0) {
        //console.log('user has flags');
        findloc_dragprompt = 'Drag to Location or click a Flag';
    }
    else {
        findloc_dragprompt = 'Drag to Location';
    }
};


/***********
 * location_choose by map: draggable marker
 *
**/

function add_marker_draggable(m_lat,m_lng) {

    var myIcon = L.icon({
          iconUrl: 'http://cartodb-gallery.appspot.com/static/icon.png',
          iconSize: [28, 28],
    });

    var marker = new L.Marker( [m_lat,m_lng],{
      icon: myIcon,
      draggable: true
    }).addTo(find_map);

    var latlng = new L.LatLng(m_lat,m_lng);
    var pop_options = { closeButton:false, offset:new L.Point(0,-20), };
    var popup = L.popup(pop_options)
        .setLatLng(latlng)
        .setContent('<p class="drag-prompt">'+findloc_dragprompt+'</p>')
        .openOn(find_map);
    
    marker.on('dragstart',function(e){
        console.log('dragtart');
        //marker.closePopup();
        popup._close();
        // $('.leaflet-popup').hide();
        
        });
    marker.on('dragend',location_choose_updateValue);
        
}


/***********
 * location_choose by map: coords from map marker
 *
**/

var location_choose; 
function location_choose_updateValue(e){
    //console.log(e.target);

    var latlng = e.target._latlng;
    var lat = e.target._latlng.lat;
    var lng = e.target._latlng.lng;
    location_choose = lng+','+lat;
    // console.log('drag: ' + latlng);
    // console.log('drag: ' + location_choose);
    
    var msg = 'Note Added at Location';
    var html = '<button onclick="location_selected(location_choose,\''+msg+'\'); return false;">Drop Note Here</button>';
    
    var pop_options = { closeButton:false, offset:new L.Point(0,0), };
    var popup = L.popup()
        .setLatLng(latlng)
        .setContent(html)
        .openOn(find_map);
    
        // $('a#location-choose-done').removeClass('hidden');
        $('.leaflet-popup').fadeIn();        
        $('.leaflet-popup-content-wrapper').addClass('nobubble');
        $('.leaflet-popup-tip').addClass('nobubble');

}


