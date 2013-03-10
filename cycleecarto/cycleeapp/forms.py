from django import forms
from django.contrib.auth.models import User
from registration.forms import RegistrationForm

class SignupForm(RegistrationForm):
    first_name = forms.CharField(required=False,
        widget=forms.TextInput())
    last_name = forms.CharField(required=False,
        widget=forms.TextInput())
    city = forms.CharField(max_length=250, required=False)
    zip = forms.CharField(max_length=10, required=False)
    bike = forms.CharField(required=False)
