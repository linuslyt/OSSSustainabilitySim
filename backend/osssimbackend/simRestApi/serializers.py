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

class FeatureChangeSerializer(serializers.Serializer):
    feature_name = serializers.CharField(required=True)
    change_type = serializers.ChoiceField(choices=['percentage', 'explicit'])
    change_value = serializers.FloatField(required=False)  # For percentage changes
    change_values = serializers.ListField(child=serializers.FloatField(), required=False)  # For explicit changes

class FeatureChangeRequestSerializer(serializers.Serializer):
    project_id = serializers.CharField(required=True)
    feature_changes = serializers.ListField(child=FeatureChangeSerializer(), required=True)

class PredictionSerializer(serializers.Serializer):
    """Serializer for individual month predictions"""
    prediction = serializers.IntegerField()
    confidence = serializers.FloatField()

class MonthPredictionSerializer(serializers.Serializer):
    """Serializer for monthly prediction entries"""
    def to_representation(self, instance):
        # Extract the month number and prediction data
        # {"month_1": {"prediction": 1, "confidence": 0.94, "p_graduate": 0.20}}
        month_key = list(instance.keys())[0]  # e.g., 'month_1'
        prediction_data = instance[month_key]
        
        return {
            month_key: {
                'prediction': prediction_data['prediction'],
                'confidence': prediction_data['confidence'],
                'p_graduate': prediction_data.get('p_graduate')
            }
        }

class ProjectPredictionHistorySerializer(serializers.Serializer):
    """Main serializer for project details and prediction history"""
    project_id = serializers.CharField()
    project_name = serializers.CharField()
    start_date = serializers.CharField()
    end_date = serializers.CharField()
    status = serializers.IntegerField()
    pj_github_url = serializers.URLField()
    intro = serializers.CharField()
    sponsor = serializers.CharField(required=False)  # Optional field
    prediction_history = MonthPredictionSerializer(many=True)

    def validate_prediction_history(self, value):
        """
        Validate prediction history data structure
        """
        if not isinstance(value, list):
            raise serializers.ValidationError("Prediction history must be a list")
        
        for entry in value:
            if not isinstance(entry, dict) or len(entry) != 1:
                raise serializers.ValidationError("Each prediction entry must be a dictionary with a single month key")
            
            month_key = list(entry.keys())[0]
            if not month_key.startswith('month_'):
                raise serializers.ValidationError("Month keys must be in format 'month_X'")
            
            prediction_data = entry[month_key]
            if not isinstance(prediction_data, dict):
                raise serializers.ValidationError("Prediction data must be a dictionary")
            
            required_fields = {'prediction', 'confidence'}
            if not all(field in prediction_data for field in required_fields):
                raise serializers.ValidationError("Prediction data must contain 'prediction' and 'confidence' fields")
            
            if not isinstance(prediction_data['prediction'], int):
                raise serializers.ValidationError("Prediction must be an integer")
            
            if not isinstance(prediction_data['confidence'], (float, int)):
                raise serializers.ValidationError("Confidence must be a number")
            
            if not (0 <= prediction_data['confidence'] <= 1):
                raise serializers.ValidationError("Confidence must be between 0 and 1")

        return value
