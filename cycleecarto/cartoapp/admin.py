from django.contrib.gis import admin
from cartoapp.models import Note, Station, TimestampedStationData

class NoteAdmin(admin.OSMGeoAdmin):
    ordering = ('-created_at',)
    list_display = ('user', 'description', 'category', 'created_at', 'accuracy')

admin.site.register(Note, NoteAdmin)

class StationAdmin(admin.OSMGeoAdmin):
    search_fields = ['name']
    list_display = ('name', 'status', 'total_docks', 'available_docks', 'available_bikes')

admin.site.register(Station, StationAdmin)

class TimestampedDataAdmin(admin.OSMGeoAdmin):
    search_fields = ['station__name']

admin.site.register(TimestampedStationData, TimestampedDataAdmin)
