from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    pass


class Toilet(models.Model):
    CHOICES = (
        ("Эконом", "Эконом"),
        ("Комфорт", "Комфорт"),
        ("Бизнес", "Бизнес"),
        ("Первый класс", "Первый класс")
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_toilet')
    title = models.CharField(max_length=258, unique=True)
    level = models.CharField(choices=CHOICES)
    time_start = models.DateTimeField(default=None)
    time_end = models.DateTimeField(default=None)


class Toilet_room(models.Model):
    toilet = models.ForeignKey(Toilet, on_delete=models.CASCADE, related_name='toilet')
    capacity = models.PositiveSmallIntegerField()