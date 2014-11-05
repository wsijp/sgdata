from django.contrib import admin

# Register your models here.

from django.contrib import admin
from mezzanine.pages.admin import PageAdmin
from .models import figPage, DataProject

admin.site.register(figPage, PageAdmin)
admin.site.register(DataProject)
