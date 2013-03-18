from django.conf.urls.defaults import patterns, include, url
from django.contrib.auth.decorators import login_required
from django.views.generic import ListView, CreateView
from django.views.generic.create_update import create_object
from cartoapp.models import Note
from cartoapp.views import NoteDetailView, note_list, note_add

urlpatterns = patterns('',

    url(r'^note/(?P<pk>[0-9]+)/$', NoteDetailView.as_view(), name='note-detail'),

    #url(r'^note/add/$', create_object, {'model': Note, 'login_required': True}, name='cartoapp:note:add'),
    #url(r'^note/add/$', login_required(CreateView.as_view(model=Note)), name='cartoapp:note:add'),
    url(r'^note/add/$', note_add, name='cartoapp:note:add'),
    url(r'^note/$', note_list, name='cartoapp:notes'),
)
