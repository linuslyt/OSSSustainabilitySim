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
    

class MonthlyDataSerializer(serializers.Serializer):
    active_devs = serializers.FloatField()
    num_commits = serializers.FloatField()
    num_files = serializers.FloatField()
    num_emails = serializers.FloatField()
    c_percentage = serializers.FloatField()
    e_percentage = serializers.FloatField()
    inactive_c = serializers.FloatField()
    inactive_e = serializers.FloatField()
    c_nodes = serializers.FloatField()
    c_edges = serializers.FloatField()
    c_c_coef = serializers.FloatField()
    c_mean_degree = serializers.FloatField()
    c_long_tail = serializers.FloatField()
    e_nodes = serializers.FloatField()
    e_edges = serializers.FloatField()
    e_c_coef = serializers.FloatField()
    e_mean_degree = serializers.FloatField()
    e_long_tail = serializers.FloatField()

class StatusPredictionInputSerializer(serializers.Serializer):
    project_id = serializers.CharField()  # Unique project identifier
    history = serializers.ListSerializer(
        child=MonthlyDataSerializer(), min_length=1, max_length=29
    )  # Allow data points from 1 to 29 months
