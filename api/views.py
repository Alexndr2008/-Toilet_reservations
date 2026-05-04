from django.shortcuts import render
from rest_framework.authtoken.models import Token
from rest_framework.authentication import authenticate
from .models import User, Toilet_room, Toilet
from .serializers import ResponseUser, RegisterUser, LoginUser, ToiletSerializer, ToiletRoomSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, permissions, status



class AuthViewSet(viewsets.ViewSet):


    @action(methods=['post'], detail=False)
    def register(self, request):
        serializer = RegisterUser(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'detail': "Вы успешно зарегистрировались"
        })

    @action(methods=['post'], detail=False)
    def login(self, request):
        serializer = LoginUser(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(**serializer.validated_data)
        if not user:
            return Response({
                "detail": "Неверные данные"
            }, status=status.HTTP_400_BAD_REQUEST)
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'detail': 'Вы успешно авторизировались',
            'accessToken': token.key,
            'user': serializer.data
        })



class ToiletViewSet(viewsets.ModelViewSet):
    queryset = Toilet.objects.all()
    serializer_class = ToiletSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ToiletRoomViewSet(viewsets.ModelViewSet):
    queryset = Toilet_room.objects.all()
    serializer_class = ToiletRoomSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]