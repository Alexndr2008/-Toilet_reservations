from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'auth', views.AuthViewSet, 'auth')
router.register(r'toilet', views.ToiletViewSet, 'toilet')
router.register(r'toilet_room', views.ToiletRoomViewSet, 'toilet_room')


urlpatterns = [
    path('', include(router.urls))
]