# import the logging library
import logging
import hashlib

from django.db import models
from django.contrib.auth.models import User

from registration.signals import user_registered
from cycleeapp.forms import SignupForm


# Get an instance of a logger
logger = logging.getLogger(__name__)


class UserProfile(models.Model):
    user = models.OneToOneField(User)
    city = models.CharField(max_length=250, null=True, blank=True)
    zip = models.CharField(max_length=10, null=True, blank=True)
    avatar = models.URLField(blank=True, null=True) # md5 hash of email used by http://gravatar.com
    bike = models.CharField(max_length=128, blank=True, null=True)
    

def save_user_names(sender, **kwargs):
    ''' when the user is created these values are not saved in the
    default register class
    '''
    try:
        request = kwargs.get('request')
        first_name = ''
        last_name = ''
        if request is not None:            
            first_name = request.POST.get('first_name','')
            last_name = request.POST.get('last_name','')
            city = request.POST.get('city','')
            zip = request.POST.get('zip','')
            bike = request.POST.get('bike','')
            email = request.POST['email']
            avatar_hash = hashlib.md5(email.lower()).hexdigest()
                        
            user = kwargs.get('user')
            if user is not None:
                logger.debug('User is good')
                user.first_name = first_name
                user.last_name = last_name
                user.save()
                profile, created = UserProfile.objects.get_or_create(user=user)
                profile.city = city
                profile.zip = zip
                profile.bike = bike
                profile.avatar = avatar_hash
                profile.save()
    except:
        logger.error('Failed to save user profile data: %s' % request.POST)

user_registered.connect(save_user_names) 
