import json
import logging 
from django.contrib.auth import logout
from django import http
 
try:
    import settings 
    XS_SHARING_ALLOWED_ORIGINS = settings.XS_SHARING_ALLOWED_ORIGINS
    XS_SHARING_ALLOWED_METHODS = settings.XS_SHARING_ALLOWED_METHODS
except:
    XS_SHARING_ALLOWED_ORIGINS = '*'
    XS_SHARING_ALLOWED_METHODS = ['POST','GET','OPTIONS', 'PUT']
 
logger = logging.getLogger(__name__)
 
class XssSharingMiddleware(object):
    """
        This middleware allows cross-domain XHR using the html5 postMessage API.
         
 
        Access-Control-Allow-Origin: http://foo.example
        Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE
    """
    def process_request(self, request):
 
        if 'HTTP_ACCESS_CONTROL_REQUEST_METHOD' in request.META:
            response = http.HttpResponse()
            response['Access-Control-Allow-Origin']  = XS_SHARING_ALLOWED_ORIGINS 
            response['Access-Control-Allow-Methods'] = ",".join( XS_SHARING_ALLOWED_METHODS ) 
            
            return response
 
        return None
 
    def process_response(self, request, response):
        # Avoid unnecessary work
        if response.has_header('Access-Control-Allow-Origin'):
            return response
 
        response['Access-Control-Allow-Origin']  = XS_SHARING_ALLOWED_ORIGINS 
        response['Access-Control-Allow-Methods'] = ",".join( XS_SHARING_ALLOWED_METHODS )
 
        return response

class InactiveUserMiddleware(object):
    def process_request(self, request):
        try:
            if not request.user.is_active:
                logout(request)
                logging.warning('Inactive user access: {}'.format(request.user.username))
                ret = dict(authenticated=False, message='User not active')
                return http.HttpResponse(json.dumps(ret), content_type='application/json')
        except:
            logging.exception('Inactive user middleware error')
            pass
        return None
