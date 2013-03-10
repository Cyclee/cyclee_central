from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from django.contrib import admin
from django import forms

from cycleeapp.models import UserProfile

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'profile'

# Define a new User admin
class UserAdmin(UserAdmin):
    inlines = (UserProfileInline, )
    save_on_top = True

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)


class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('avatar', 'user', 'city', )
    search_fields = ('user__username',)
    readonly_fields = ('user', )


admin.site.register(UserProfile, UserProfileAdmin)
