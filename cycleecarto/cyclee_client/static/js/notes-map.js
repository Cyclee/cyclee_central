

/***********
 * =notesmap
 *
 * display notes on map
 * used by map page
 *
**/
var map;
var layers = [];


/***********
 * =notesmap data
 *
 * query notes based on users filter selection
 *
**/
var LayerActions = {
  allnotes: function(){
    layers[0].setQuery("SELECT * FROM {{table_name}}");
    return true;
  },
  bikeshops: function(){
    layers[0].setQuery("SELECT * FROM {{table_name}} WHERE category='bike shop'");
    return true;
  },
  stolen: function(){
    layers[0].setQuery("SELECT * FROM {{table_name}} WHERE description LIKE '%stolen%'");
    return true;
  },
  corides: function(){
    layers[0].setQuery("SELECT * FROM {{table_name}} WHERE category='co-ride'");
    return true;
  },
  usernotes: function(){
    layers[0].setQuery("SELECT * FROM {{table_name}} WHERE username = '"+username+"'");
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
$('#notesmap form').change( function(){
    
    // grab val from form
    var filter = $('#notesmap form').find('option:selected').val();
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
$('body').one('click','#nav-notesmap', function(){
    // is map broken?
    // this must come after other things tied to #nav-notesmap
    mapInit(); 
});



/***********
 * =notesmap init setup
 *
 * create map. load default data.
 *
**/

function mapInit() {
    console.log('new map');

      // initiate leaflet map
      map = new L.Map('map', { 
        center: [40.72,-73.97],
        cartodb_logo: false,
        zoom: 12,
        maxZoom: 15
      })

      var basemap = 'https://dnv9my2eseobd.cloudfront.net/v3/cartodb.map-pp0tkn8d/{z}/{x}/{y}.png'; // mapbox light

      L.tileLayer(basemap, {
        attribution: 'MapBox'
      }).addTo(map);

      //var layerUrl = 'http://'+cartodb_accountname+'.cartodb.com/api/v1/viz/12114/viz.json';
      var layerUrl = 'http://'+cartodb_accountname+'.cartodb.com/api/v1/viz/'+notes_table+'/viz.json';

      var layerOptions = {
        // tile_style: "#{{table_name}}{marker-fill: #F84F40; marker-width: 8; marker-line-color: white; marker-line-width: 2; marker-clip: false; marker-allow-overlap: true;} "
        query: "SELECT * FROM {{table_name}} WHERE category='bike shop'",
        interactivity: "username,description,category"
      }

      cartodb.createLayer(map, layerUrl, layerOptions)
        .on('done', function(layer) {
          map.addLayer(layer);
          layers.push(layer);
        }).on('error', function() {
        //log the error
        });

}

