from urllib2 import urlopen
import json
from geopy.geocoders.base import Geocoder
from geopy.util import logger

class OpenStreetMap(Geocoder):
    """Geocoder using the OpenStreetMap nominatim."""
    
    def __init__(self, api_key='', format_string='%s'):
        """Initialize an Open MapQuest geocoder with location-specific
        address information, no API Key is needed by the Nominatim based
        platform.
        
        ``format_string`` is a string containing '%s' where the string to
        geocode should be interpolated before querying the geocoder.
        For example: '%s, Mountain View, CA'. The default is just '%s'.
        """
        
        self.api_key = api_key
        self.format_string = format_string
        self.url = "http://nominatim.openstreetmap.org/reverse.php?format=json&%s" #lat=40.6728&lon=-73.9789

    def reverse(self, point):
        try:
            geo = "lat=%(y)s&lon=%(x)s" % dict(x=point.x, y=point.y)
            url = self.url % geo
            fp = urlopen(url)
            results = json.loads(fp.read())
            logger.info(results)
            address = results['address']
            result = "%(road)s, %(suburb)s, %(state)s %(postcode)s" % address

            return result #results.get('display_name', point)
        except Exception as exc:
            logger.info(exc)
            return str(point)
