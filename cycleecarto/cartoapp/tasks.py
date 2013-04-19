from urllib2 import urlopen
from django.contrib.gis.db import models

import celery

@celery.task
def add(x, y):
    return x + y

@celery.task(ignore_result=True)
def note_save(note):
    models.Model.save(note)


@celery.task(ignore_result=True)
def cartodb_add_note_task(url_carto_data):
    # send it
    print 'CartoDB request: %s' % url_carto_data
    fp = urlopen(url_carto_data)
    ret = fp.read()
    print 'CartoDB response: %s' % ret


