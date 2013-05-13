
/***********
 * =location by map
 *
 * used by addnote
 * allow user to drag marker on map to set note location
 * 
 *
**/
$('.page').on("click", 'a.link_location_choose', function(){
    
    // inputfield = $(this).parent().children('input');
    var theHTML = '<a class="map-close close" href="#" ><em class="entypo">&#59228;</em><em class="entypo">&#59228;</em></a><div id="mapchoose-map" class="mapcontainer"></div>';
    $('.modal').hide(); // hide others
    
    console.log('clickity');
    
    $('#mapchoose').html(theHTML).addClass('map-location').fadeIn('slow');    
    $('#mapchoose').find('#location-choose-done').click( function(){
        // $(this).parents('.modal').fadeOut(); // function updated on when marker moved
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
    // geo_locate2(flag_carto); // temporarily disabled
    // can't locate while watching position. save those positions.
    flag_carto();
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
    feedback_msg(msg);


    // this should not trigger return to home screen
    // also should be sending to cyclee_central
    
    // temporarily disabled
    // addnote(username,'pending','',location,pending_table,msg); // no callback
    
    
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
var find_map = null;
var flag_id; // delete flag when note added
var flag_location; // confirm match before deleting on +note
var flag_used; // queue for remove
var flag_layers = [];

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
            flag_layers.push(layer);
            
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
    $('.modal').fadeOut();
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
 * use for indiv note locations
 * and to set location for addnote
 * not yet for notes map with filter 
 *
 * @see: a.maplink on articles
 * @see: location_choose_init()
 *
 *
**/
// var maps=new Object();



function Maps(id){
    this.id = id;
    this.map;
    this.marker = false;

    this.createMap = createMap;
    // run once and then removed
    function createMap(map_lat,map_lng,mapzoom){
        console.log('createMap()');

        if ( !mapzoom ) { mapzoom = 13 };
        this.map = new L.Map(this.id, { 
          center: [map_lat, map_lng],
          cartodb_logo: false,
          zoom: mapzoom,
          maxZoom: 16
        })

        var basemap = 'https://dnv9my2eseobd.cloudfront.net/v3/cartodb.map-pp0tkn8d/{z}/{x}/{y}.png'; // mapbox light

        L.tileLayer(basemap, {
          attribution: 'MapBox'
        }).addTo(this.map);

        delete this.createMap;
    }
    
    this.setView = setView;
    function setView(m_lat,m_lng,mapzoom){
        // console.log('setView');
        if ( !mapzoom ) { mapzoom = 13 };
        this.map.setView([m_lat,m_lng],mapzoom);
    }
    
    this.addMarker = addMarker;
    function addMarker(m_lat,m_lng) {
        console.log('addMarker');

        var myIcon = L.icon({
              iconUrl: 'http://cartodb-gallery.appspot.com/static/icon.png',
              iconSize: [28, 28],
        });

        this.marker = new L.Marker( [m_lat,m_lng],{
          icon: myIcon,
        }).addTo(this.map);

    }

    this.moveMarker = moveMarker;
    function moveMarker(m_lat,m_lng) {
        console.log('moveMarker()');

        this.marker.setLatLng([m_lat,m_lng]);
    }
    
    
    
}



// var themaps = {
//     maps: [],
//     add: function(mapname) {
//       var map = {
//         name: mapname
//       };
//       themaps.maps.push(map);
//     },
//     hello: function(mapname) {
//         
//         console.log(themaps.maps);
//         console.log(themaps.maps(mapname));
//         console.log(1+1);
//     },
//     createmap: 
//     
//   };




/***********
 * add marker
 *
**/

// function add_marker(mapname,m_lat,m_lng) {
// 
//     var myIcon = L.icon({
//           iconUrl: 'http://cartodb-gallery.appspot.com/static/icon.png',
//           iconSize: [28, 28],
//     });
// 
//     var marker = new L.Marker( [m_lat,m_lng],{
//       icon: myIcon,
//     }).addTo(mapname.map);
// 
// }



/***********
 * =location_choose by map: init map
 *
 * allows users to drag marker on map to set location
**/

function location_choose_init() {
    console.log('location_choose_init()');
    var choose_lat = nyc_lat;
    var choose_lng = nyc_lng;   
    // should find an idle moment to grab current location for various use
    // also check if( location_choose ) { /* use this instead; */ }    

    if(mapchoose.createMap){ // run once and removed
        mapchoose.createMap(choose_lat,choose_lng,7);        
    }

    console.log('map: ');
    console.log(locationmap);

    if(mapchoose.marker == false){
        console.log('false?')
        add_marker_draggable('mapchoose',choose_lat,choose_lng);
    }

    mapchoose.setView(thisgeo[1],thisgeo[0],mapzoom);

    // createmap('mapchoose',find_lat,find_lng);
    // add_marker_draggable('',find_lat,find_lng);
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

function add_marker_draggable(id,m_lat,m_lng) {

    var myIcon = L.icon({
          iconUrl: 'http://cartodb-gallery.appspot.com/static/icon.png',
          iconSize: [28, 28],
    });

    var marker = new L.Marker( [m_lat,m_lng],{
      icon: myIcon,
      draggable: true
    }).addTo(id.map);

    var latlng = new L.LatLng(m_lat,m_lng);
    var pop_options = { closeButton:false, offset:new L.Point(0,-20), };
    var popup = L.popup(pop_options)
        .setLatLng(latlng)
        .setContent('<p class="drag-prompt">'+findloc_dragprompt+'</p>')
        .openOn(id.map);
    
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


