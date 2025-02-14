from rest_framework import serializers
from django.contrib.auth.models import Group, User
from .models import Item

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__'


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model= User
        fields = ['url', 'username','email','groups']
        
        
class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta: 
        model= Group
        fields =['url','name']
        
        
class OSSDataSerializer(serializers.Serializer): 
    oss_feature_1 = serializers.CharField(max_length=200, required=True)
    oss_feature_2 = serializers.CharField(max_length=200)
    oss_feature_3 = serializers.CharField(max_length=200)