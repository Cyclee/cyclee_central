import logging
from urllib2 import urlopen
from urllib import urlencode

from django.contrib.gis.db import models
import celery

import settings

# Get an instance of a logger
logger = logging.getLogger(__name__)


@celery.task
def add(x, y):
    return x + y

@celery.task(ignore_result=True)
def note_save(note, **kwargs):
    models.Model.save(note)


@celery.task(ignore_result=True)
def cartodb_add_note_task(url_carto_data):
    # send it
    logging.info( 'CartoDB request: %s' % url_carto_data)
    fp = urlopen(url_carto_data)
    ret = fp.read()
    logging.info( 'CartoDB response: %s' % ret)


@celery.task(ignore_result=True)
def cartodb_add_note(instance, **kwargs):
    # get the values from the note instance
    note = instance
    try:
        avatar = note.user.get_profile().avatar
    except:
        logger.error('User profile not found: %s' % note.user)
        avatar = ''

    sql_insert = "INSERT INTO %(table)s (username,category,description,the_geom,uhash,address) VALUES('%(username)s', '%(category)s', '%(description)s', ST_SetSrid(st_makepoint(%(the_geom)s),4326), '%(uhash)s', '%(address)s' )" % \
    dict(table=settings.CARTODB_TABLE,
         username=note.user.username,
         category=note.category,
         description=note.description,
         the_geom="%s, %s" % (note.the_geom.x, note.the_geom.y),
         uhash=avatar,
         address=note.address(format_string='%(road)s'))

    sql_insert_urlencoded = urlencode(dict(q=sql_insert))
    
    # build url
    url_carto_data = 'http://%(account_name)s.cartodb.com/api/v2/sql/?api_key=%(carto_key)s&%(query)s' % \
    dict(account_name=settings.CARTODB_ACCOUNT_NAME,
         carto_key=settings.CARTODB_API_KEY,
         query=sql_insert_urlencoded)

    # send request to cartodb
    cartodb_add_note_task(url_carto_data)
