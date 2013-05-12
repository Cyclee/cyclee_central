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
    url(r'^mobile/$',TemplateView.as_view(template_name='index.html'), name='preview'),    
    url(r'^init/$', view=views.init, name='init'),

    url(r'^m/accounts/register/$', views.register, {'backend':'registration.backends.simple.SimpleBackend',
                                           'form_class': SignupForm,
                                           'success_url': '/' }),
    url(r'^m/accounts/login/$', views.login, name='cyclee.m_login'),
    url(r'^m/accounts/logout/$', views.logout, name='cyclee.m_logout'),

    url(r'^m/accounts/password/reset/$', 'django.contrib.auth.views.password_reset', 
        {'from_email': 'noreply@cyclee.org'}, name='cyclee.m_reset'),
    url(r'^m/accounts/password/reset/done/$', 'django.contrib.auth.views.password_reset_done', name='cyclee.m_reset_done'),
    url(r'^m/accounts/password/reset/(?P<uidb36>[0-9A-Za-z]+)-(?P<token>.+)/$', 
        'django.contrib.auth.views.password_reset_confirm', 
        {'post_reset_redirect' : '/m/accounts/password/done/'}, name='cyclee.m_reset_confirm'),
    url(r'^m/accounts/password/done/$', 'django.contrib.auth.views.password_reset_complete', name='cyclee.m_reset_complete'),

    url(r'^m/accounts/password/reset/done/$', 'password_reset_done', name='cyclee.m_reset_done'),

    url(r'^accounts/login/$', 'django.contrib.auth.views.login', name='cyclee.login'),
    url(r'^accounts/register/$', register, {'backend':'registration.backends.simple.SimpleBackend',
                                           'form_class': SignupForm,
                                           'success_url': '/' }),
    (r'^accounts/logout/$', 'django.contrib.auth.views.logout', {'next_page': '/'}),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^cartoapp/', include('cartoapp.urls')),
)
