from django.contrib.gis import admin
from cartoapp.models import Note

class NoteAdmin(admin.OSMGeoAdmin):
    ordering = ('-created_at',)
    list_display = ('user', 'description', 'category', 'created_at', 'accuracy')


admin.site.register(Note, NoteAdmin)

