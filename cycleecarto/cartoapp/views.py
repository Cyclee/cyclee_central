import json
from django.core import serializers
from django.http import HttpResponse, Http404
from django.views.generic import DetailView
from django.shortcuts import redirect, render_to_response
from django.template import RequestContext
from django import forms
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

from cartoapp.models import Note


class NoteAddForm(forms.Form):
    description = forms.CharField(required=False, initial='Note')
    the_geom = forms.CharField(required=True)
    altitude = forms.FloatField(required=False, initial=0)
    category = forms.CharField(required=False, initial='user note')
    time_start = forms.DateTimeField(required=False)
    time_end = forms.DateTimeField(required=False)
    accuracy = forms.FloatField(required=False, initial=0)

@login_required
@csrf_exempt
def note_add(request, template='cartoapp/note_form.html'):
    if request.method == 'POST':
        form = NoteAddForm(request.POST)
        if form.is_valid():
            # create note
            form.cleaned_data.update(user=request.user)
            note = Note(**form.cleaned_data)
            note.save()
            ret = dict(status=True, note=note.pk)
        else:
            ret = dict(status=False, errors=form.errors)
            
        return HttpResponse(json.dumps(ret), content_type="application/json")        

    form = NoteAddForm()
    return render_to_response(template, dict(form=form), context_instance=RequestContext(request))

class NoteDetailView(DetailView):
    model = Note
    context_object_name = 'note'
    template_name = 'note_detail.html'
    queryset = Note.objects.all()

def note_list(request):
    data = serializers.serialize("json", Note.objects.all().order_by('-created_at'))
    return HttpResponse(data, content_type=u'application/json')

    