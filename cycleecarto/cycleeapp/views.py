import urllib2
import json
from datetime import datetime
from django.template import Context, loader, RequestContext, Template
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.views.decorators.debug import sensitive_post_parameters
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect, csrf_exempt
from django.contrib.auth import login as auth_login
from django.template.response import TemplateResponse
from django.contrib.sites.models import get_current_site
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth.forms import AuthenticationForm
from registration.backends import get_backend

    
def init(request):
    """ This will send a session cookie and csrf_token if not found
    and will indicate a new session login/registration is needed

    otherwise the user id will be returned
    """

    if request.user.is_authenticated():
        ret = dict(authenticated=True, user=request.user.username)
    else:
        ret = dict(authenticate=False, message='User needs to register or login')
    request.session['init'] = True
    # This bit of code adds the CSRF bits to your request.
    c = RequestContext(request)
    t = Template(json.dumps(ret)) # A dummy template: just the json string
    response = HttpResponse(t.render(c), content_type = u'application/json')
    return response

@csrf_exempt
def register(request, backend, success_url=None, form_class=None,
             disallowed_url='registration_disallowed',
             template_name='registration/m_registration_form.html',
             extra_context=None):
    """

    This function is derived from django-registration for use with ajax and json response (no redirects)

    Allow a new user to register an account.

    The actual registration of the account will be delegated to the
    backend specified by the ``backend`` keyword argument (see below);
    it will be used as follows:

    1. The backend's ``registration_allowed()`` method will be called,
       passing the ``HttpRequest``, to determine whether registration
       of an account is to be allowed; if not, a redirect is issued to
       the view corresponding to the named URL pattern
       ``registration_disallowed``. To override this, see the list of
       optional arguments for this view (below).

    2. The form to use for account registration will be obtained by
       calling the backend's ``get_form_class()`` method, passing the
       ``HttpRequest``. To override this, see the list of optional
       arguments for this view (below).

    3. If valid, the form's ``cleaned_data`` will be passed (as
       keyword arguments, and along with the ``HttpRequest``) to the
       backend's ``register()`` method, which should return the new
       ``User`` object.

    4. Upon successful registration, the backend's
       ``post_registration_redirect()`` method will be called, passing
       the ``HttpRequest`` and the new ``User``, to determine the URL
       to redirect the user to. To override this, see the list of
       optional arguments for this view (below).
    
    **Required arguments**
    
    None.
    
    **Optional arguments**

    ``backend``
        The dotted Python import path to the backend class to use.

    ``disallowed_url``
        URL to redirect to if registration is not permitted for the
        current ``HttpRequest``. Must be a value which can legally be
        passed to ``django.shortcuts.redirect``. If not supplied, this
        will be whatever URL corresponds to the named URL pattern
        ``registration_disallowed``.
    
    ``form_class``
        The form class to use for registration. If not supplied, this
        will be retrieved from the registration backend.
    
    ``extra_context``
        A dictionary of variables to add to the template context. Any
        callable object in this dictionary will be called to produce
        the end result which appears in the context.

    ``success_url``
        URL to redirect to after successful registration. Must be a
        value which can legally be passed to
        ``django.shortcuts.redirect``. If not supplied, this will be
        retrieved from the registration backend.
    
    ``template_name``
        A custom template to use. If not supplied, this will default
        to ``registration/registration_form.html``.
    
    **Context:**
    
    ``form``
        The registration form.
    
    Any extra variables supplied in the ``extra_context`` argument
    (see above).
    
    **Template:**
    
    registration/registration_form.html or ``template_name`` keyword
    argument.
    
    """
    backend = get_backend(backend)
    if not backend.registration_allowed(request):
        ret = dict(status=False, message='Registration not allowed')
    if form_class is None:
        form_class = backend.get_form_class(request)

    if request.method == 'POST':
        form = form_class(data=request.POST, files=request.FILES)
        if form.is_valid():
            new_user = backend.register(request, **form.cleaned_data)
            ret = dict(status=True, user=new_user.username)
        else:
            ret = dict(status=False, errors=form.errors)
        return HttpResponse(json.dumps(ret), content_type="application/json")        
    else:
        form = form_class()
    
    if extra_context is None:
        extra_context = {}
    context = RequestContext(request)
    for key, value in extra_context.items():
        context[key] = callable(value) and value() or value

    return render_to_response(template_name,
                              {'form': form},
                              context_instance=context)


@csrf_exempt
@sensitive_post_parameters()
@never_cache
def login(request, template_name='registration/m_login.html',
          authentication_form=AuthenticationForm,
          current_app=None, extra_context=None):
    """
    Displays the login form and handles the login action.
    """
    if request.method == "POST":
        form = authentication_form(data=request.POST)
        if form.is_valid():

            auth_login(request, form.get_user())
            ret = dict(authenticated=True, user=form.get_user().username)
        else:
            ret = dict(authenticated=False, errors=form.errors)
        return HttpResponse(json.dumps(ret), content_type="application/json")

    else:
        form = authentication_form(request)

    current_site = get_current_site(request)

    context = {
        'form': form,
        'site': current_site,
        'site_name': current_site.name,
    }
    if extra_context is not None:
        context.update(extra_context)
    return TemplateResponse(request, template_name, context,
                            current_app=current_app)



def hello_view(request):
    """ Simple Hello World View """
    t = loader.get_template('helloworld.html')
    c = RequestContext(request, {
        'current_time': datetime.now(),
    })
    return HttpResponse(t.render(c))
