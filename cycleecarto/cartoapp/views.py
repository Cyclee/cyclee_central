from django.core import serializers
from django.http import HttpResponse, Http404
from django.views.generic import DetailView
from django.shortcuts import redirect, render_to_response
from django.template import RequestContext

from cartoapp.models import Note

class NoteDetailView(DetailView):
    model = Note
    context_object_name = 'note'
    template_name = 'note_detail.html'
    queryset = Note.objects.all()

def note_list(request):
    data = serializers.serialize("json", Note.objects.all().order_by('-created_at'))
    return HttpResponse(data, content_type=u'application/json')

    