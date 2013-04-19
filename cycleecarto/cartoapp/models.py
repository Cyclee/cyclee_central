from urllib2 import urlopen
from urllib import urlencode

import logging
from reversegeo.openstreetmap import OpenStreetMap
from django.db.models import permalink
from django.contrib.gis.db import models
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.core.cache import cache
from django.db.models.signals import post_save

import settings
from cartoapp.tasks import cartodb_add_note_task, note_save

# Get an instance of a logger
logger = logging.getLogger(__name__)


'''
carto: notes // currently called route_flags
------------------------
#. cartodb_id: primary key
#. the_geom: Point(x, y)
#. altitude: Float
#. user_id -> user.id
#. category: String
#. description: String
#. time_start: Datetime
#. time_end: Datetime
#. created_at: Datetime
'''

class Note(models.Model):
    description = models.TextField(blank=True, null=True, default='Note')
    the_geom = models.PointField()
    altitude = models.FloatField(default=0)
    user = models.ForeignKey(User)
    category = models.CharField(max_length=128)
    time_start = models.DateTimeField(blank=True, null=True)
    time_end = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    accuracy = models.FloatField(default=0)

    objects = models.GeoManager()

    def save(self, *args, **kwargs):
        if len(args) == 0 and kwargs == {}:
            note_save.delay(self)
        else:
            super(models.Model, self).save(*args, **kwargs)            

    def address(self):
        ''' use openstreetmap reverse geocoder 
        if the point is not found in the cache
        '''
        ret = cache.get(str(self.the_geom))
        if ret is None:
            g = OpenStreetMap()
            ret = g.reverse(self.the_geom)
            cache.set(str(self.the_geom), ret)
        return ret
    address.short_description = 'Address'

    @permalink
    def get_absolute_url(self):
        return ('note-detail',(), {'pk': self.pk})
        
    def __unicode__(self):
        return '{0}: {1}'.format(self.pk, self.description)

"""
    var sqlInsert ="&q=INSERT INTO "+table+" (username,category,description,the_geom) VALUES('"+ username +"','"+ category +"','"+ description +"',ST_SetSrid(st_makepoint("+ location +"),4326))";

var account_name = 'ideapublic';
var cartoKey = "api_key=7302db3d477047e379af83c1987573e043022fe4"; 
var url_cartoData = 'http://'+account_name+'.cartodb.com/api/v2/sql/?';
var theUrl = url_cartoData + cartoKey + sql;
var note_single_table = 'route_flags';
"""

carto_table = settings.CARTODB_TABLE

def cartodb_add_note(sender, instance=None, **kwargs):
    # get the values from the new Note instance
    note = instance
    try:
        avatar = note.user.get_profile().avatar
    except:
        logger.error('User profile not found: %s' % note.user)
        avatar = ''

    sql_insert = "INSERT INTO %(table)s (username,category,description,the_geom,uhash) VALUES('%(username)s', '%(category)s', '%(description)s', ST_SetSrid(st_makepoint(%(the_geom)s),4326), '%(uhash)s' )" % \
    dict(table=carto_table,
         username=note.user.username,
         category=note.category,
         description=note.description,
         the_geom="%s, %s" % (note.the_geom.x, note.the_geom.y),
         uhash=avatar)

    sql_insert_urlencoded = urlencode(dict(q=sql_insert))
    
    # build url
    url_carto_data = 'http://%(account_name)s.cartodb.com/api/v2/sql/?api_key=%(carto_key)s&%(query)s' % \
    dict(account_name=settings.CARTODB_ACCOUNT_NAME,
         carto_key=settings.CARTODB_API_KEY,
         query=sql_insert_urlencoded)
    
    # send it with celery
    cartodb_add_note_task.delay(url_carto_data)

post_save.connect(cartodb_add_note, sender=Note)
