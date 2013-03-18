from urllib2 import urlopen
import celery

@celery.task
def add(x, y):
    return x + y

@celery.task(ignore_result=True)
def cartodb_add_note(url_carto_data):
    # send it
    print 'CartoDB request: %s' % url_carto_data
    fp = urlopen(url_carto_data)
    ret = fp.read()
    print 'CartoDB response: %s' % ret


