from rest_framework import serializers
from .models import User, Toilet, Toilet_room


class RegisterUser(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True)

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user


class LoginUser(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True)


class ResponseUser(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class ToiletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Toilet
        fields = '__all__'


class ToiletRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Toilet_room
        fields = '__all__'