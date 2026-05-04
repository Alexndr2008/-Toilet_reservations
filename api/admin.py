from django.contrib import admin
from .models import User, Toilet_room, Toilet


admin.site.register([User, Toilet, Toilet_room])