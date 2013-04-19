from django.conf.urls.defaults import patterns, include, url
from django.contrib import admin
from django.views.generic.base import TemplateView

from registration.views import register
# import the view from cycleeapp
from cycleeapp import views
from cycleeapp.forms import SignupForm

admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', view=views.hello_view, name='hello_page'),
    url(r'^mobile/preview/$',TemplateView.as_view(template_name='index.html'), name='preview'),    
    url(r'^init/$', view=views.init, name='init'),
    url(r'^accounts/register/$', register, {'backend':'registration.backends.simple.SimpleBackend',
                                           'form_class': SignupForm,
                                           'success_url': '/' }),
    url(r'^m/accounts/register/$', views.register, {'backend':'registration.backends.simple.SimpleBackend',
                                           'form_class': SignupForm,
                                           'success_url': '/' }),

    url(r'^accounts/login/$', 'django.contrib.auth.views.login', name='cyclee.login'),
    url(r'^m/accounts/login/$', views.login, name='cyclee.m_login'),
    url(r'^m/accounts/logout/$', views.logout, name='cyclee.m_logout'),
    (r'^accounts/logout/$', 'django.contrib.auth.views.logout', {'next_page': '/'}),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^cartoapp/', include('cartoapp.urls')),
)
