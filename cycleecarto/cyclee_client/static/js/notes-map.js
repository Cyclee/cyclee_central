

/***********
 * =notesmap
 *
 * display notes on map
 * used by map page
 *
**/
var notesmap;
var notesmap_layers = [];


/***********
 * =notesmap data
 *
 * query notes based on users filter selection
 *
**/
var LayerActions = {
  allnotes: function(){
    notesmap_layers[0].setQuery("SELECT * FROM {{table_name}}");
    console.log(notesmap_layers[0]);
    
    return true;
  },
  bikeshops: function(){
    notesmap_layers[0].setQuery("SELECT * FROM {{table_name}} WHERE category='bike shop'");
    return true;
  },
  stolen: function(){
   notesmap_layers[0].setQuery("SELECT * FROM {{table_name}} WHERE lower(description) LIKE '%25stolen%25'");
    console.log(notesmap_layers[0]);
    return true;
  },
  corides: function(){
    notesmap_layers[0].setQuery("SELECT * FROM {{table_name}} WHERE category='co-ride'");
    return true;
  },
  usernotes: function(){
    notesmap_layers[0].setQuery("SELECT * FROM {{table_name}} WHERE username = '"+username+"'");
    return true;
  },
  usermention: function(){
    notesmap_layers[0].setQuery("SELECT * FROM {{table_name}} WHERE description LIKE '%25%40"+username+"'%25");
    return true;
  },
  
  // commute notes -- queries a different table not yet set up

}



/***********
 * =notesmap layers
 *
 * change data on form select
 *
**/
$('#notesmap').on('change','#notesmap-filter', function(){
    
    // grab val from form
    var filter = $(this).find('option:selected').val();
    console.log('map layer:' + filter);

    // send it to layer action // weird
    LayerActions[filter]();
    
    // clear form focus
    $('#notesmap form select').blur();
});



/***********
 * =notesmap init
 *
 * set up map on first view
 *
**/
// is map broken?
// this must come _after_ other things tied to #nav-notesmap


$('body').one('click','#nav-notesmap', mapInit);
$('body').on('click','#nav-notesmap', function(){
    
    $('#notesmap').fadeIn('slow');
    
// mapInit(); 
});



/***********
 * =notesmap init setup
 *
 * create map. load default data.
 *
**/

function mapInit() {
    console.log('init notesmap');

    // LIKE query not working: <option value="stolen" >Stolen</option> <option value="racks" >Racks</option> <option value="usermention" >@'+username+'</option> 
    var theFilter = '<form id="notesmap-filter"><select> <option value="bikeshops" >Bike Shops</option> <option value="corides" >Co-Rides</option> <option value="allnotes" >All Notes</option> <option value="usernotes" class="filter-username">'+username+'</option> </select> </form>'; 
    var theHTML = '<a class="map-close close" href="#" ><em class="entypo">&#59228;</em><em class="entypo">&#59228;</em></a><div id="map" class="mapcontainer"></div>'+theFilter;
    $('#notesmap').html(theHTML).addClass('map-location').fadeIn('slow');


      // initiate leaflet map
      notesmap = new L.Map('map', { 
        center: [40.72,-73.97],
        cartodb_logo: false,
        zoom: 12,
        maxZoom: 16
      })

      var basemap = 'https://dnv9my2eseobd.cloudfront.net/v3/cartodb.map-pp0tkn8d/{z}/{x}/{y}.png'; // mapbox light

      L.tileLayer(basemap, {
        attribution: 'MapBox'
      }).addTo(notesmap);

      //var layerUrl = 'http://'+cartodb_accountname+'.cartodb.com/api/v1/viz/12114/viz.json';
      var layerUrl = 'http://'+cartodb_accountname+'.cartodb.com/api/v1/viz/'+notes_table+'/viz.json';

      var layerOptions = {
        // tile_style: "#{{table_name}}{marker-fill: #F84F40; marker-width: 8; marker-line-color: white; marker-line-width: 2; marker-clip: false; marker-allow-overlap: true;} "
        query: "SELECT * FROM {{table_name}} WHERE category='bike shop'",
        interactivity: "username,description,category"
      }

      cartodb.createLayer(notesmap, layerUrl, layerOptions)
        .on('done', function(layer) {
          notesmap.addLayer(layer);
          notesmap_layers.push(layer);
        }).on('error', function() {
        //log the error
        });

}

