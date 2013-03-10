from django.db.models import permalink
from django.contrib.gis.db import models
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.core.cache import cache

from reversegeo.openstreetmap import OpenStreetMap

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
    time_end = models. DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    accuracy = models.FloatField(default=0)

    objects = models.GeoManager()

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
