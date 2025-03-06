from django.shortcuts import render

# Create your views here.

# My imports
from rest_framework import generics,permissions, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Item
from django.contrib.auth.models import Group, User
from .serializers import *
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample, OpenApiParameter
from django.core.cache import cache


from .utils import predict, get_future_data
import os

from pathlib import Path
################################
import json

PROJECT_LIST = ['49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '100', '101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114', '115', '116', '117', '118', '119', '120', '121', '122', '123', '124', '125', '126', '127', '128', '129', '130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '140', '141', '142', '143', '144', '145', '146', '147', '148', '149', '150', '151', '152', '153', '154', '155', '156', '157', '158', '159', '160', '161', '162', '163', '164', '165', '166', '167', '168', '169', '170', '222', '171', '172', '173', '174', '175', '176', '177', '178', '179', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189', '190', '191', '192', '193', '194', '195', '196', '250', '197', '198', '199', '200', '201', '202', '203', '204', '205', '206', '207', '208', '209', '210', '211', '212', '213', '214', '215', '216', '217', '218', '219', '220', '221', '223', '224', '225', '226', '227', '228', '229', '230', '231', '232', '233', '234', '235', '236', '237', '238', '239', '240', '241', '242', '243', '244', '245', '246', '247', '248', '249', '251', '252', '253', '254', '255', '256', '257', '258', '259', '260', '261', '262', '263', '264', '265', '266', '267', '268', '269', '270', '271', '272', '273', '274', '275', '276', '277', '278', '279', '280', '281', '282', '283', '284', '285', '286', '287', '288', '289', '290', '291', '292', '293', '294', '295', '296', '297', '298', '299', '300', '301', '302', '303', '304', '305', '306', '307', '308', '309', '310', '311', '312']

# Path to the JSON file
ASFI_JSON_FILE_PATH = Path(__file__).parent / 'asfi_project_info/projects_list.json'

PROJECT_PREDICTIONS_FILE = Path(__file__).parent / 'asfi_project_info/project_predictions.json'

MODEL_DIR =  Path(__file__).parent / 'lstm_models/' # Directory where models are stored


TEMPORAL_DATA_DIR = Path(__file__).parent /"asfi_project_info/project_data/"


# List all items or create a new one
class ItemListCreateView(generics.ListCreateAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    
    @extend_schema(
        summary="List and Create Items",
        description="Retrieve a list of items or create a new item",
        responses={200: ItemSerializer(many=True)},
    )
    
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    @extend_schema(
        summary="Create a New Item",
        description="Add a new item to the database.",
        request=ItemSerializer,
        responses={201: ItemSerializer},
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

# Retrieve, update, or delete a specific item
class ItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    
    @extend_schema(
    summary="Retrieve Item Details",
    description="Fetch details of a specific item.",
    responses={200: ItemSerializer},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    
class UserViewSet(viewsets.ModelViewSet): 
    
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    
class GroupViewSet(viewsets.ModelViewSet):
    
    queryset = Group.objects.all().order_by('name')
    serializer_class = GroupSerializer
    permission_classes =[permissions.IsAuthenticated]
    
    


class PredictOSSSustainabilityView(APIView):
    @extend_schema(
        summary="Forecasts OSS Project Sustainability using LSTM models",
        description="""
            Accepts historical OSS project data (ranging from 1 to 29 months), passes it to a pre-trained LSTM model 
            for sustainability forecasting. The appropriate model is selected based on the length of the input data.
            Returns the project id and sustainability forecasts for future months using the projects future data available. 
            Each month's prediction has a status field that can assume the values  0 (Likely to Retire) and 1 
            (Likely to graduate) along with a confidence score (a value from 0 to 1) for that prediction.
        """,
        request=StatusPredictionInputSerializer,
        examples=[
            OpenApiExample(
                "Valid Request Example",
                description="A valid request with project_id and history of monthly data.",
                value={
                    "project_id": 270,
                    "history": [
                            {
                            "active_devs": 0.0,
                            "num_commits": 0.0,
                            "num_files": 0.0,
                            "num_emails": 0.0,
                            "c_percentage": 0.0,
                            "e_percentage": 0.0,
                            "inactive_c": 1.0,
                            "inactive_e": 1.0,
                            "c_nodes": 0.0,
                            "c_edges": 0.0,
                            "c_c_coef": 0.0,
                            "c_mean_degree": 0.0,
                            "c_long_tail": 0.0,
                            "e_nodes": 0.0,
                            "e_edges": 0.0,
                            "e_c_coef": 0.0,
                            "e_mean_degree": 0.0,
                            "e_long_tail": 0.0
                        },
                        {
                            "active_devs": 0.0,
                            "num_commits": 0.0,
                            "num_files": 0.0,
                            "num_emails": 0.0,
                            "c_percentage": 0.0,
                            "e_percentage": 0.0,
                            "inactive_c": 1.0,
                            "inactive_e": 1.0,
                            "c_nodes": 0.0,
                            "c_edges": 0.0,
                            "c_c_coef": 0.0,
                            "c_mean_degree": 0.0,
                            "c_long_tail": 0.0,
                            "e_nodes": 0.0,
                            "e_edges": 0.0,
                            "e_c_coef": 0.0,
                            "e_mean_degree": 0.0,
                            "e_long_tail": 0.0
                        },
                        {
                            "active_devs": 0.0,
                            "num_commits": 0.0,
                            "num_files": 0.0,
                            "num_emails": 0.0,
                            "c_percentage": 0.0,
                            "e_percentage": 0.0,
                            "inactive_c": 1.0,
                            "inactive_e": 1.0,
                            "c_nodes": 0.0,
                            "c_edges": 0.0,
                            "c_c_coef": 0.0,
                            "c_mean_degree": 0.0,
                            "c_long_tail": 0.0,
                            "e_nodes": 0.0,
                            "e_edges": 0.0,
                            "e_c_coef": 0.0,
                            "e_mean_degree": 0.0,
                            "e_long_tail": 0.0
                        },
                        {
                            "active_devs": 3.0,
                            "num_commits": 44.0,
                            "num_files": 36.0,
                            "num_emails": 1.0,
                            "c_percentage": 0.6818181818181818,
                            "e_percentage": 1.0,
                            "inactive_c": 0.7,
                            "inactive_e": 0.0,
                            "c_nodes": 2.0,
                            "c_edges": 1.0,
                            "c_c_coef": 0.0,
                            "c_mean_degree": 1.0,
                            "c_long_tail": 0.0,
                            "e_nodes": 2.0,
                            "e_edges": 1.0,
                            "e_c_coef": 0.0,
                            "e_mean_degree": 1.0,
                            "e_long_tail": 0.0
                        },
                        {
                            "active_devs": 10.0,
                            "num_commits": 158.0,
                            "num_files": 84.0,
                            "num_emails": 48.0,
                            "c_percentage": 0.8860759493670886,
                            "e_percentage": 0.3333333333333333,
                            "inactive_c": 0.75,
                            "inactive_e": 0.5833333333333334,
                            "c_nodes": 2.0,
                            "c_edges": 1.0,
                            "c_c_coef": 0.0,
                            "c_mean_degree": 1.0,
                            "c_long_tail": 0.0,
                            "e_nodes": 10.0,
                            "e_edges": 13.0,
                            "e_c_coef": 0.0,
                            "e_mean_degree": 2.6,
                            "e_long_tail": 3.0
                        },
                        {
                            "active_devs": 11.0,
                            "num_commits": 3.0,
                            "num_files": 2.0,
                            "num_emails": 31.0,
                            "c_percentage": 1.0,
                            "e_percentage": 0.1612903225806451,
                            "inactive_c": 0.0,
                            "inactive_e": 0.7727272727272727,
                            "c_nodes": 0.0,
                            "c_edges": 0.0,
                            "c_c_coef": 0.0,
                            "c_mean_degree": 0.0,
                            "c_long_tail": 0.0,
                            "e_nodes": 10.0,
                            "e_edges": 14.0,
                            "e_c_coef": 0.3833333333333333,
                            "e_mean_degree": 2.8,
                            "e_long_tail": 1.0
                        },
                        {
                            "active_devs": 15.0,
                            "num_commits": 27.0,
                            "num_files": 9.0,
                            "num_emails": 88.0,
                            "c_percentage": 0.7037037037037037,
                            "e_percentage": 0.5568181818181818,
                            "inactive_c": 0.4736842105263157,
                            "inactive_e": 0.2142857142857142,
                            "c_nodes": 2.0,
                            "c_edges": 1.0,
                            "c_c_coef": 0.0,
                            "c_mean_degree": 1.0,
                            "c_long_tail": 0.0,
                            "e_nodes": 14.0,
                            "e_edges": 23.0,
                            "e_c_coef": 0.1467532467532467,
                            "e_mean_degree": 3.2857142857142856,
                            "e_long_tail": 3.0
                        },
                        {
                            "active_devs": 10.0,
                            "num_commits": 2.0,
                            "num_files": 1.0,
                            "num_emails": 28.0,
                            "c_percentage": 1.0,
                            "e_percentage": 0.3928571428571428,
                            "inactive_c": 0.0,
                            "inactive_e": 0.36,
                            "c_nodes": 0.0,
                            "c_edges": 0.0,
                            "c_c_coef": 0.0,
                            "c_mean_degree": 0.0,
                            "c_long_tail": 0.0,
                            "e_nodes": 10.0,
                            "e_edges": 11.0,
                            "e_c_coef": 0.2047619047619047,
                            "e_mean_degree": 2.2,
                            "e_long_tail": 3.0
                        },
                        {
                            "active_devs": 16.0,
                            "num_commits": 147.0,
                            "num_files": 64.0,
                            "num_emails": 88.0,
                            "c_percentage": 0.8503401360544217,
                            "e_percentage": 0.5,
                            "inactive_c": 0.782608695652174,
                            "inactive_e": 0.1785714285714285,
                            "c_nodes": 2.0,
                            "c_edges": 1.0,
                            "c_c_coef": 0.0,
                            "c_mean_degree": 1.0,
                            "c_long_tail": 0.0,
                            "e_nodes": 16.0,
                            "e_edges": 29.0,
                            "e_c_coef": 0.3513257575757576,
                            "e_mean_degree": 3.625,
                            "e_long_tail": 4.0
                        },
                        {
                            "active_devs": 7.0,
                            "num_commits": 15.0,
                            "num_files": 15.0,
                            "num_emails": 35.0,
                            "c_percentage": 1.0,
                            "e_percentage": 0.3142857142857143,
                            "inactive_c": 0.0,
                            "inactive_e": 0.6296296296296297,
                            "c_nodes": 0.0,
                            "c_edges": 0.0,
                            "c_c_coef": 0.0,
                            "c_mean_degree": 0.0,
                            "c_long_tail": 0.0,
                            "e_nodes": 6.0,
                            "e_edges": 11.0,
                            "e_c_coef": 0.7222222222222222,
                            "e_mean_degree": 3.6666666666666665,
                            "e_long_tail": 2.0
                        },
                        {
                            "active_devs": 12.0,
                            "num_commits": 565.0,
                            "num_files": 266.0,
                            "num_emails": 64.0,
                            "c_percentage": 0.9876106194690264,
                            "e_percentage": 0.34375,
                            "inactive_c": 0.6428571428571429,
                            "inactive_e": 0.2962962962962963,
                            "c_nodes": 4.0,
                            "c_edges": 3.0,
                            "c_c_coef": 0.0,
                            "c_mean_degree": 1.5,
                            "c_long_tail": 1.0,
                            "e_nodes": 8.0,
                            "e_edges": 10.0,
                            "e_c_coef": 0.2625,
                            "e_mean_degree": 2.5,
                            "e_long_tail": 2.0
                        },
                        {
                            "active_devs": 11.0,
                            "num_commits": 74.0,
                            "num_files": 43.0,
                            "num_emails": 124.0,
                            "c_percentage": 1.0,
                            "e_percentage": 0.5241935483870968,
                            "inactive_c": 0.5,
                            "inactive_e": 0.1481481481481481,
                            "c_nodes": 0.0,
                            "c_edges": 0.0,
                            "c_c_coef": 0.0,
                            "c_mean_degree": 0.0,
                            "c_long_tail": 0.0,
                            "e_nodes": 14.0,
                            "e_edges": 19.0,
                            "e_c_coef": 0.195578231292517,
                            "e_mean_degree": 2.7142857142857144,
                            "e_long_tail": 4.0
                        },
                        {
                            "active_devs": 6.0,
                            "num_commits": 180.0,
                            "num_files": 80.0,
                            "num_emails": 64.0,
                            "c_percentage": 1.0,
                            "e_percentage": 0.609375,
                            "inactive_c": 0.2608695652173913,
                            "inactive_e": 0.3043478260869565,
                            "c_nodes": 0.0,
                            "c_edges": 0.0,
                            "c_c_coef": 0.0,
                            "c_mean_degree": 0.0,
                            "c_long_tail": 0.0,
                            "e_nodes": 5.0,
                            "e_edges": 9.0,
                            "e_c_coef": 0.4333333333333334,
                            "e_mean_degree": 3.6,
                            "e_long_tail": 4.0
                        },
                        {
                            "active_devs": 10.0,
                            "num_commits": 149.0,
                            "num_files": 89.0,
                            "num_emails": 105.0,
                            "c_percentage": 0.8523489932885906,
                            "e_percentage": 0.3428571428571428,
                            "inactive_c": 0.3928571428571428,
                            "inactive_e": 0.2142857142857142,
                            "c_nodes": 2.0,
                            "c_edges": 1.0,
                            "c_c_coef": 0.0,
                            "c_mean_degree": 1.0,
                            "c_long_tail": 0.0,
                            "e_nodes": 8.0,
                            "e_edges": 16.0,
                            "e_c_coef": 0.6666666666666666,
                            "e_mean_degree": 4.0,
                            "e_long_tail": 5.0
                        },
                        {
                            "active_devs": 17.0,
                            "num_commits": 162.0,
                            "num_files": 126.0,
                            "num_emails": 76.0,
                            "c_percentage": 0.8703703703703703,
                            "e_percentage": 0.5526315789473685,
                            "inactive_c": 0.5833333333333334,
                            "inactive_e": 0.0625,
                            "c_nodes": 2.0,
                            "c_edges": 1.0,
                            "c_c_coef": 0.0,
                            "c_mean_degree": 1.0,
                            "c_long_tail": 0.0,
                            "e_nodes": 15.0,
                            "e_edges": 19.0,
                            "e_c_coef": 0.1148148148148148,
                            "e_mean_degree": 2.533333333333333,
                            "e_long_tail": 4.0
                        },
                        {
                            "active_devs": 12.0,
                            "num_commits": 55.0,
                            "num_files": 46.0,
                            "num_emails": 113.0,
                            "c_percentage": 0.8909090909090909,
                            "e_percentage": 0.3982300884955752,
                            "inactive_c": 0.625,
                            "inactive_e": 0.4583333333333333,
                            "c_nodes": 0.0,
                            "c_edges": 0.0,
                            "c_c_coef": 0.0,
                            "c_mean_degree": 0.0,
                            "c_long_tail": 0.0,
                            "e_nodes": 12.0,
                            "e_edges": 17.0,
                            "e_c_coef": 0.2281746031746031,
                            "e_mean_degree": 2.833333333333333,
                            "e_long_tail": 5.0
                        },
                        {
                            "active_devs": 11.0,
                            "num_commits": 134.0,
                            "num_files": 79.0,
                            "num_emails": 119.0,
                            "c_percentage": 0.7835820895522388,
                            "e_percentage": 0.4369747899159664,
                            "inactive_c": 0.3,
                            "inactive_e": 0.2,
                            "c_nodes": 2.0,
                            "c_edges": 1.0,
                            "c_c_coef": 0.0,
                            "c_mean_degree": 1.0,
                            "c_long_tail": 0.0,
                            "e_nodes": 10.0,
                            "e_edges": 13.0,
                            "e_c_coef": 0.2738095238095238,
                            "e_mean_degree": 2.6,
                            "e_long_tail": 2.0
                        },
                        {
                            "active_devs": 6.0,
                            "num_commits": 758.0,
                            "num_files": 152.0,
                            "num_emails": 23.0,
                            "c_percentage": 0.974934036939314,
                            "e_percentage": 0.4782608695652174,
                            "inactive_c": 0.7727272727272727,
                            "inactive_e": 0.7586206896551724,
                            "c_nodes": 0.0,
                            "c_edges": 0.0,
                            "c_c_coef": 0.0,
                            "c_mean_degree": 0.0,
                            "c_long_tail": 0.0,
                            "e_nodes": 5.0,
                            "e_edges": 4.0,
                            "e_c_coef": 0.0,
                            "e_mean_degree": 1.6,
                            "e_long_tail": 2.0
                        },
                        {
                            "active_devs": 10.0,
                            "num_commits": 105.0,
                            "num_files": 45.0,
                            "num_emails": 26.0,
                            "c_percentage": 0.9333333333333332,
                            "e_percentage": 0.5,
                            "inactive_c": 0.4615384615384615,
                            "inactive_e": 0.6071428571428571,
                            "c_nodes": 2.0,
                            "c_edges": 1.0,
                            "c_c_coef": 0.0,
                            "c_mean_degree": 1.0,
                            "c_long_tail": 0.0,
                            "e_nodes": 8.0,
                            "e_edges": 9.0,
                            "e_c_coef": 0.0,
                            "e_mean_degree": 2.25,
                            "e_long_tail": 2.0
                        },
                        {
                            "active_devs": 4.0,
                            "num_commits": 32.0,
                            "num_files": 32.0,
                            "num_emails": 9.0,
                            "c_percentage": 1.0,
                            "e_percentage": 0.5555555555555556,
                            "inactive_c": 0.0,
                            "inactive_e": 0.8695652173913043,
                            "c_nodes": 0.0,
                            "c_edges": 0.0,
                            "c_c_coef": 0.0,
                            "c_mean_degree": 0.0,
                            "c_long_tail": 0.0,
                            "e_nodes": 3.0,
                            "e_edges": 4.0,
                            "e_c_coef": 1.0,
                            "e_mean_degree": 2.6666666666666665,
                            "e_long_tail": 1.0
                        },
                        {
                            "active_devs": 5.0,
                            "num_commits": 106.0,
                            "num_files": 52.0,
                            "num_emails": 19.0,
                            "c_percentage": 1.0,
                            "e_percentage": 0.4210526315789473,
                            "inactive_c": 0.8461538461538461,
                            "inactive_e": 0.5384615384615384,
                            "c_nodes": 0.0,
                            "c_edges": 0.0,
                            "c_c_coef": 0.0,
                            "c_mean_degree": 0.0,
                            "c_long_tail": 0.0,
                            "e_nodes": 5.0,
                            "e_edges": 5.0,
                            "e_c_coef": 0.4666666666666666,
                            "e_mean_degree": 2.0,
                            "e_long_tail": 4.0
                        },
                        {
                            "active_devs": 6.0,
                            "num_commits": 18.0,
                            "num_files": 15.0,
                            "num_emails": 26.0,
                            "c_percentage": 1.0,
                            "e_percentage": 0.5384615384615384,
                            "inactive_c": 0.0,
                            "inactive_e": 0.6190476190476191,
                            "c_nodes": 0.0,
                            "c_edges": 0.0,
                            "c_c_coef": 0.0,
                            "c_mean_degree": 0.0,
                            "c_long_tail": 0.0,
                            "e_nodes": 8.0,
                            "e_edges": 10.0,
                            "e_c_coef": 0.2333333333333333,
                            "e_mean_degree": 2.5,
                            "e_long_tail": 3.0
                        },
                        {
                            "active_devs": 12.0,
                            "num_commits": 6.0,
                            "num_files": 6.0,
                            "num_emails": 86.0,
                            "c_percentage": 0.8333333333333334,
                            "e_percentage": 0.5465116279069767,
                            "inactive_c": 0.8333333333333334,
                            "inactive_e": 0.4285714285714285,
                            "c_nodes": 0.0,
                            "c_edges": 0.0,
                            "c_c_coef": 0.0,
                            "c_mean_degree": 0.0,
                            "c_long_tail": 0.0,
                            "e_nodes": 12.0,
                            "e_edges": 16.0,
                            "e_c_coef": 0.2978174603174603,
                            "e_mean_degree": 2.6666666666666665,
                            "e_long_tail": 2.0
                        }
                    ]
                },
                request_only=True
            ),
            OpenApiExample(
                "Successful Response",
                description="A successful response returning the predicted project status.",
                value={
                    "project_id": "270",
                    "predictions": [
                        {
                        "start_month": 1,
                        "predicted_month": 9,
                        "status": 1,
                        "confidence_score": 1
                        },
                        {
                        "start_month": 2,
                        "predicted_month": 10,
                        "status": 1,
                        "confidence_score": 1
                        },
                        {
                        "start_month": 3,
                        "predicted_month": 11,
                        "status": 1,
                        "confidence_score": 0.65
                        },
                        {
                        "start_month": 4,
                        "predicted_month": 12,
                        "status": 1,
                        "confidence_score": 1
                        },
                        {
                        "start_month": 5,
                        "predicted_month": 13,
                        "status": 1,
                        "confidence_score": 1
                        },
                        {
                        "start_month": 6,
                        "predicted_month": 14,
                        "status": 0,
                        "confidence_score": 1
                        },
                        {
                        "start_month": 7,
                        "predicted_month": 15,
                        "status": 0,
                        "confidence_score": 1
                        }
                    ]
                    },
                response_only=True
            ),
            OpenApiExample(
                "No Model Found",
                description="Returned when no model is available for the given number of months.",
                value={"error": "No model available for 30 months"},
                response_only=True,
                status_codes=["400"]
            ),
            OpenApiExample(
                "Invalid Input",
                description="Returned when the input format is incorrect.",
                value={"error": "Invalid input format"},
                response_only=True,
                status_codes=["422"]
            ),
        ],
        responses={
                200: OpenApiResponse(
                    response={
                        "type": "object",
                        "properties": {
                            "project_id": {"type": "string"},
                            "predictions": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "start_month": {"type": "integer"},
                                        "predicted_month": {"type": "integer"},
                                        "status": {"type": "string", "enum": ["0", "1"]},
                                        "confidence_score": {"type": "number", "format": "float"}
                                    },
                                    "required": ["start_month", "predicted_month", "status", "confidence_score"]
                                }
                            }
                        },
                        "required": ["project_id", "predictions"]
                    },
                    description="Successful prediction response."
                ),
                400: OpenApiResponse(
                    response={
                        "type": "object",
                        "properties": {
                            "error": {"type": "string"},
                            "details": {"type": "string"}
                        }
                    },
                    description="Returned when there is insufficient historical data or model issues."
                ),
                404: OpenApiResponse(
                    response={
                        "type": "object",
                        "properties": {
                            "error": {"type": "string"}
                        }
                    },
                    description="Returned when the project ID is not found."
                ),
                422: OpenApiResponse(
                    response={
                        "type": "object",
                        "properties": {
                            "error": {"type": "string"},
                            "details": {"type": "object"}
                        }
                    },
                    description="Returned when the input data is incorrect."
                )
            }
    )
    
    def post(self, request, *args, **kwargs):
        serializer = StatusPredictionInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Invalid input format", "details": serializer.errors}, status=422)
        
        validated_data = serializer.validated_data
        project_id = validated_data["project_id"]
        history = validated_data["history"]
        
        # Check if the project has at least 8 months of historical data
        num_months = len(history)
        if num_months < 8:
            return Response({
                "error": "Insufficient historical data", 
                "details": f"At least 8 months of data required. Provided: {num_months} months"
            }, status=400)
        
        # Validate project ID
        if project_id not in PROJECT_LIST:
            return Response({"error": "Invalid project ID"}, status=404)
        
        # Single model path for 8-month prediction
        model_path = os.path.join(MODEL_DIR, "lstm_wo_padding_model.h5")
        # model_path = os.path.join(MODEL_DIR, "model_8.h5")
        if not os.path.exists(model_path):
            return Response({"error": "LSTM model not found"}, status=500)
        
        # Pass the historical data to the LSTM model for prediction
        predictions = []
        predictions= predict(history, model_path, 8)
                
        return Response({
            "project_id": project_id,
            "predictions": predictions
        }, status=200)

    
    # def post(self, request, *args, **kwargs):
    #     serializer = StatusPredictionInputSerializer(data=request.data)
    #     if not serializer.is_valid():
    #         return Response({"error": "Invalid input format", "details": serializer.errors}, status=422)

    #     validated_data = serializer.validated_data
    #     project_id = validated_data["project_id"]
    #     history = validated_data["history"]  # List of monthly data

    #     num_months = len(history)  # Get the number of months
    #     model_path = os.path.join(MODEL_DIR, f"model_{num_months}.h5")

    #     if not os.path.exists(model_path):
    #         return Response({"error": f"No model available for {num_months} months"}, status=400)
        
    #     predicted_class, confidence = predict(history, model_path, num_months)
    #     status = "Sustainable (Likely to Graduate)" if predicted_class == 1 else "Not Sustainable (Likely to Retire)"

    #     return Response({
    #         "project_id": project_id,
    #         "num_months": num_months,
    #         "status": predicted_class,
    #         "confidence_score": round(confidence, 2)
    #     }, status=200)

        # serializer = OSSDataSerializer(data=request.data)
        
        # if not serializer.is_valid():
        #     return Response({"result": "invalid_input", "message": "Invalid input data"}, status=status.HTTP_400_BAD_REQUEST)
        
        # result = process_data(serializer.validated_data)
        
        # if result == "success":
        #     return Response({"result": "success", "message": "Processing successful"}, status=status.HTTP_200_OK)
        # else: 
        #     return Response({"result": "failure", "message": "Processing failed"}, status=status.HTTP_200_OK)
       





class ListProjectsView(APIView):
    @extend_schema(
        summary="Get All Projects",
        description="Fetches all projects with project_id, project_name, and status (Graduated or Retired).",
        responses={
            200: OpenApiResponse(
                response={
                    "projects": [
                        {
                            "project_id": "1",
                            "project_name": "Amaterasu",
                            "status": "Retired"
                        },
                        {
                            "project_id": "2",
                            "project_name": "Annotator",
                            "status": "Retired"
                        }
                    ]
                },
                description="List of all projects."
            ),
            500: OpenApiResponse(
                response={"error": "Failed to read the JSON file"},
                description="Returned if there is an error reading the JSON file."
            ),
        },
        examples=[
            OpenApiExample(
                "Success Response",
                description="List of projects with their names and statuses.",
                value={
                    "projects": [
                        {
                            "project_id": "1",
                            "project_name": "Amaterasu",
                            "status": "Retired"
                        },
                        {
                            "project_id": "2",
                            "project_name": "Annotator",
                            "status": "Retired"
                        }
                    ]
                },
                response_only=True
            )
        ]
    )
    def get(self, request):
        try:
            # Read JSON file
            with open(ASFI_JSON_FILE_PATH, "r", encoding="utf-8") as file:
                data = json.load(file)

            # Extract required information
            projects = [
                {
                    "project_id": project_id,
                    "project_name": details["listname"],
                    "status": "Graduated" if details["status"] == 1 else "Retired"
                }
                for project_id, details in data.items()
            ]

            return Response({"projects": projects}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": "Failed to read the JSON file", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
        
class HistoricalDataView(APIView):
    """Get the historical data for a project."""
    @extend_schema(
        summary="Retrieve Historical Project Data",
        description="""
            Fetches historical data for a given project ID over a specified number of months.
            Data is retrieved from the appropriate folder based on the months requested.
        """,
        parameters=[
            OpenApiParameter(name="project_id", description="Unique project identifier", required=True, type=str),
            OpenApiParameter(name="num_months", description="Number of months of historical data", required=True, type=int),
            OpenApiParameter(name="fields", description="Comma-separated list of fields to return (optional)", required=False, type=str),
        ],
        responses={
            200: OpenApiResponse(
                response={
                    "project_id": "100",
                    "project_name": "Amaterasu",
                    "start_date": "9/7/2017",
                    "end_date": "N/A",
                    "history": [
                        {
                            "active_devs": 5.0,
                            "num_commits": 332.0,
                            "num_files": 239.0,
                            "num_emails": 4.0,
                            "c_percentage": 0.7620481927710844,
                            "e_percentage": 0.5,
                            "inactive_c": 0.2,
                            "inactive_e": 0.0,
                            "c_nodes": 2.0,
                            "c_edges": 1.0,
                            "c_c_coef": 0.0,
                            "c_mean_degree": 1.0,
                            "c_long_tail": 0.0,
                            "e_nodes": 3.0,
                            "e_edges": 2.0,
                            "e_c_coef": 0.0,
                            "e_mean_degree": 1.3333333333333333,
                            "e_long_tail": 1.0
                        },
                        {
                            "active_devs": 11.0,
                            "num_commits": 365.0,
                            "num_files": 200.0,
                            "num_emails": 58.0,
                            "c_percentage": 0.8246575342465754,
                            "e_percentage": 0.3448275862068966,
                            "inactive_c": 0.3928571428571428,
                            "inactive_e": 0.1785714285714285,
                            "c_nodes": 2.0,
                            "c_edges": 1.0,
                            "c_c_coef": 0.0,
                            "c_mean_degree": 1.0,
                            "c_long_tail": 0.0,
                            "e_nodes": 10.0,
                            "e_edges": 14.0,
                            "e_c_coef": 0.2866666666666666,
                            "e_mean_degree": 2.8,
                            "e_long_tail": 5.0
                        }
                    ]
                },
                description="Successfully retrieved the historical data for the project."
            ),
            404: OpenApiResponse(
                response={"error": "Project data not found for the given months"},
                description="Returned when no historical data is found for the project with the specified number of months."
            ),
            400: OpenApiResponse(
                response={"error": "Both project_id and num_months are required"},
                description="Returned when either project_id or num_months is missing."
            ),
            500: OpenApiResponse(
                response={"error": "Failed to load project metadata", "details": "error details"},
                description="Returned when there is an issue with reading the project metadata or files."
            )
        },
        
        examples=[
            OpenApiExample(
                'Valid Response Example',
                value={
                    "project_id": "100",
                    "project_name": "EasyAnt",
                    "start_date": "1/31/2011",
                    "end_date": "3/12/2013",
                    "history": [
                        {
                        "active_devs": 5,
                        "num_commits": 332,
                        "num_files": 239,
                        "num_emails": 4,
                        "c_percentage": 0.7620481927710844,
                        "e_percentage": 0.5,
                        "inactive_c": 0.2,
                        "inactive_e": 0,
                        "c_nodes": 2,
                        "c_edges": 1,
                        "c_c_coef": 0,
                        "c_mean_degree": 1,
                        "c_long_tail": 0,
                        "e_nodes": 3,
                        "e_edges": 2,
                        "e_c_coef": 0,
                        "e_mean_degree": 1.3333333333333333,
                        "e_long_tail": 1
                        },
                        {
                        "active_devs": 11,
                        "num_commits": 365,
                        "num_files": 200,
                        "num_emails": 58,
                        "c_percentage": 0.8246575342465754,
                        "e_percentage": 0.3448275862068966,
                        "inactive_c": 0.3928571428571428,
                        "inactive_e": 0.1785714285714285,
                        "c_nodes": 2,
                        "c_edges": 1,
                        "c_c_coef": 0,
                        "c_mean_degree": 1,
                        "c_long_tail": 0,
                        "e_nodes": 10,
                        "e_edges": 14,
                        "e_c_coef": 0.2866666666666666,
                        "e_mean_degree": 2.8,
                        "e_long_tail": 5
                        }
                    ]
                    }
            ),
            OpenApiExample(
                'Error Response Example (Project data not found)',
                value={
                    "error": "Project data not found for the given months"
                }
            ),
            OpenApiExample(
                'Error Response Example (Missing parameters)',
                value={
                    "error": "Both project_id and num_months are required"
                }
            )
        ]
    )
    def get(self, request):
        # Extract query parameters
        project_id = request.query_params.get("project_id")
        num_months = request.query_params.get("num_months")
        fields_param = request.query_params.get("fields")  

        # Validate input
        if not project_id or not num_months:
            return Response({"error": "Both project_id and num_months are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            num_months = int(num_months)
        except ValueError:
            return Response({"error": "num_months must be an integer"}, status=status.HTTP_400_BAD_REQUEST)

        cache_key = f"history_{project_id}_{num_months}_{fields_param or 'all'}"
        
        # Try to get cached data, with a fallback if Redis is down
        try:
            print("Checking redis cache")
            cached_data = cache.get(cache_key)
        except Exception as e:
            print(f"Error accessing cache: {e}")
            cached_data = None

        #  If cache exists, return cached response
        if cached_data:
            print(f"Cache hit for {cache_key}") 
            return Response(cached_data, status=status.HTTP_200_OK)
        
        print(f"Cache miss for {cache_key}")


        # Parse fields if provided
        requested_fields = set(fields_param.split(',')) if fields_param else None

        # Construct path to the historical data folder
        # months_folder = f"N_{num_months}"
        # project_data_path = os.path.join(TEMPORAL_DATA_DIR, months_folder, f"{project_id}.json")
        project_data_path = os.path.join(TEMPORAL_DATA_DIR, f"{project_id}.json")

        print("Project Data Path: ", project_data_path) # Debugging

        # Check if project data file exists
        if not os.path.exists(project_data_path):
            return Response({"error": "Project data not found for the given months"}, status=status.HTTP_404_NOT_FOUND)

        # Load project metadata from projects.json
        try:
            with open(ASFI_JSON_FILE_PATH, "r", encoding="utf-8") as file:
                projects_metadata = json.load(file)
        except Exception as e:
            return Response({"error": "Failed to load project metadata", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Get metadata for the requested project
        project_info = projects_metadata.get(project_id)
        if not project_info:
            return Response({"error": "Project not found in metadata"}, status=status.HTTP_404_NOT_FOUND)


        # Load historical project data
        try:
            with open(project_data_path, "r", encoding="utf-8") as file:
                project_history = json.load(file)
        except Exception as e:
            return Response({"error": "Failed to load project history", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Check if requested number of months is available
        num_of_months_available = project_history.get("num_months", 0)
        if num_of_months_available < num_months:
            return  Response({"error": f"Project data insufficient. Requested: {num_months} months, available: {num_of_months_available} months of data."}, status=status.HTTP_404_NOT_FOUND) 
        
        # Filter fields if requested
        filtered_history = []
        for month in project_history.get("history", []):
            if requested_fields:
                # Ensure only existing fields are returned
                filtered_entry = {field: month.get(field.strip(), None) for field in requested_fields}
            else:
                # Default: Include all fields
                filtered_entry = month
            filtered_history.append(filtered_entry)

        # Prepare response data
        response_data = {
            "project_id": project_id,
            "project_name": project_info["listname"],
            "num_months": num_of_months_available,
            "start_date": project_info.get("start_date", "N/A"),
            "end_date": project_info.get("end_date", "N/A"),
            "history": filtered_history  # List of monthly data
        }

        # Store response in Redis cache for future use, if Redis is available
        try:
            cache.set(cache_key, response_data, timeout=3600)
        except Exception as e:
            print(f"Error saving to cache: {e}")

        return Response(response_data, status=status.HTTP_200_OK)
    
    
   
class ProjectPredictionHistoryView(APIView):
    @extend_schema(
        summary="Retrieve project details and prediction history",
        description="Returns project details (name, start date, end date, status, GitHub URL, about information) and its LSTM prediction history.",
        parameters=[
            OpenApiParameter('project_id', str, description='The ID of the project to retrieve data for', required=True),
        ],
        responses={
            200: OpenApiResponse(
                response={
                    "project_id": "100",
                    "project_name": "Amaterasu",
                    "start_date": "9/7/2017",
                    "end_date": "N/A",
                    "status": 1,
                    "pj_github_url": "https://github.com/apache/incubator-Amaterasu",
                    "intro": "Apache Amaterasu is a framework providing continuous deployment for Big Data pipelines.",
                    "prediction_history": [
                        {
                            "month_1": {
                                "prediction": 1,
                                "confidence": 0.9411842823028564
                            }
                        },
                        {
                            "month_2": {
                                "prediction": 1,
                                "confidence": 0.9950122237205505
                            }
                        },
                        {
                            "month_3": {
                                "prediction": 0,
                                "confidence": 0.5624575614929199
                            }
                        }
                    ]
                },
                description="Successfully retrieved the project details and prediction history."
            ),
            404: OpenApiResponse(
                response={"error": "Project data not found"},
                description="Returned when no project data is found for the given project ID."
            ),
            400: OpenApiResponse(
                response={"error": "project_id is required"},
                description="Returned when the project_id is missing from the request."
            ),
            500: OpenApiResponse(
                response={"error": "Failed to load project data or prediction history", "details": "error details"},
                description="Returned when there is an issue with reading the project data or prediction history."
            )
        },
        examples=[
            OpenApiExample(
                'Valid Response Example',
                value={
                        "project_id": "100",
                        "project_name": "EasyAnt",
                        "start_date": "1/31/2011",
                        "end_date": "3/12/2013",
                        "status": 1,
                        "pj_github_url": "https://github.com/apache/EasyAnt",
                        "intro": "Easyant is a build system based on Apache Ant and Apache Ivy.\n\t\t \n\t   ",
                        "sponsor": "Ant\n\t\t\n\t\t(Antoine LÃ©vy-Lambert)\n\t\t \n\t   ",
                        "prediction_history": [
                            {
                            "month_1": {
                                "prediction": 1,
                                "confidence": 0.9411842823028564
                            }
                            },
                            {
                            "month_2": {
                                "prediction": 1,
                                "confidence": 0.9950122237205505
                            }
                            },
                            {
                            "month_3": {
                                "prediction": 0,
                                "confidence": 0.5624575614929199
                            }
                            },
                            {
                            "month_4": {
                                "prediction": 1,
                                "confidence": 0.9995812773704529
                            }
                            },
                            {
                            "month_5": {
                                "prediction": 1,
                                "confidence": 0.9994428753852844
                            }
                            },
                            {
                            "month_6": {
                                "prediction": 1,
                                "confidence": 0.9999662637710571
                            }
                            },
                            {
                            "month_7": {
                                "prediction": 0,
                                "confidence": 0.6313105225563049
                            }
                            },
                            {
                            "month_8": {
                                "prediction": 0,
                                "confidence": 0.999987006187439
                            }
                            },
                            {
                            "month_9": {
                                "prediction": 0,
                                "confidence": 0.8933027982711792
                            }
                            },
                            {
                            "month_10": {
                                "prediction": 0,
                                "confidence": 0.9999877214431763
                            }
                            },
                            {
                            "month_11": {
                                "prediction": 1,
                                "confidence": 0.9999721050262451
                            }
                            },
                            {
                            "month_12": {
                                "prediction": 1,
                                "confidence": 1
                            }
                            },
                            {
                            "month_13": {
                                "prediction": 1,
                                "confidence": 1
                            }
                            },
                            {
                            "month_14": {
                                "prediction": 1,
                                "confidence": 1
                            }
                            },
                            {
                            "month_15": {
                                "prediction": 1,
                                "confidence": 1
                            }
                            },
                            {
                            "month_16": {
                                "prediction": 1,
                                "confidence": 0.9999998807907104
                            }
                            },
                            {
                            "month_17": {
                                "prediction": 1,
                                "confidence": 0.9999997615814209
                            }
                            },
                            {
                            "month_18": {
                                "prediction": 1,
                                "confidence": 0.9997956156730652
                            }
                            },
                            {
                            "month_19": {
                                "prediction": 1,
                                "confidence": 1
                            }
                            },
                            {
                            "month_20": {
                                "prediction": 1,
                                "confidence": 0.9999998807907104
                            }
                            },
                            {
                            "month_21": {
                                "prediction": 1,
                                "confidence": 0.9999997615814209
                            }
                            },
                            {
                            "month_22": {
                                "prediction": 1,
                                "confidence": 0.9999529123306274
                            }
                            },
                            {
                            "month_23": {
                                "prediction": 1,
                                "confidence": 0.9999995231628418
                            }
                            },
                            {
                            "month_24": {
                                "prediction": 1,
                                "confidence": 0.9999923706054688
                            }
                            },
                            {
                            "month_25": {
                                "prediction": 1,
                                "confidence": 0.9999949932098389
                            }
                            },
                            {
                            "month_26": {
                                "prediction": 1,
                                "confidence": 0.9999703168869019
                            }
                            },
                            {
                            "month_27": {
                                "prediction": 1,
                                "confidence": 0.9999560117721558
                            }
                            }
                        ]
                        }
            ),
            OpenApiExample(
                'Error Response Example (Missing project_id)',
                value={
                    "error": "project_id is required"
                }
            ),
            OpenApiExample(
                'Error Response Example (Project data not found)',
                value={
                    "error": "Project data not found"
                }
            )
        ]
    )
    def get(self, request, *args, **kwargs):
        
        project_id = request.query_params.get('project_id')

        if not project_id:
            return Response({"error": "project_id is required"}, status=400)

        cache_key = f"project_details_{project_id}"
        cached_data = cache.get(cache_key)

        if cached_data:
            print(f"Cache hit for {cache_key}")
            return Response(cached_data, status=200)

        print(f"Cache miss for {cache_key}")

        try:
             # Load project metadata from projects.json
            with open(ASFI_JSON_FILE_PATH, "r", encoding="utf-8") as file:
                projects_metadata = json.load(file)

            # Get metadata for the requested project
            project_info = projects_metadata.get(project_id)
            if not project_info:
                return Response({"error": "Project not found in metadata"}, status=status.HTTP_404_NOT_FOUND)

            # Fetch the prediction history from project_predictions.json
            predictions_file_path = PROJECT_PREDICTIONS_FILE
            with open(predictions_file_path, 'r') as f:
                predictions_data = json.load(f)

            # Get prediction history for the project from predictions file
            prediction_history = predictions_data.get(project_id, [])
            if not prediction_history:
                return Response({"error": "Project does not have prediction history"}, status=status.HTTP_404_NOT_FOUND)

            response_data = {
                "project_id": project_id,
                "project_name": project_info["listname"],
                "start_date": project_info["start_date"],
                "end_date": project_info.get("end_date", "N/A"),
                "status": project_info["status"],
                "pj_github_url": project_info["pj_github_url"],
                "intro": project_info["intro"],
                "sponsor": project_info["sponsor"],
                "prediction_history": prediction_history
            }

            # Cache the result for 1 hour
            cache.set(cache_key, response_data, timeout=3600)
            return Response(response_data, status=200)

        except FileNotFoundError:
            return Response({"error": "Project data not found"}, status=404)
        except Exception as e:
            return Response({"error": "Failed to load project data or prediction history", "details": str(e)}, status=500)


class SimulateWithDeltasView(APIView):
    @extend_schema(
        summary="Simulate Sustainability with Feature Changes",
        description="""
            This endpoint modifies only the specified features by user while backfilling 
            the rest of the historical data from the project's existing history.
            It includes percentage changes and explicit value changes for specific features.
        """,
        request=FeatureChangeRequestSerializer,
        responses={
            200: OpenApiResponse(
                response={
                    "project_id": "200",
                    "predicted_status": "Sustainable",
                    "confidence_score": 0.92,
                    "modified_features": [
                        {"feature_name": "num_commits", "change_type": "percentage", "change_value": 20},
                        {"feature_name": "num_files", "change_type": "explicit", "change_values": [100, 120, 150]}
                    ]
                },
                description="Successfully simulated project sustainability with specified feature changes."
            ),
            400: OpenApiResponse(
                response={"error": "Invalid input"},
                description="Returned when the input parameters are missing, malformed, or invalid."
            ),
            404: OpenApiResponse(
                response={"error": "Project not found"},
                description="Returned when no historical data exists for the given project ID."
            ),
            500: OpenApiResponse(
                response={"error": "Failed to process the simulation"},
                description="Returned when an internal server error occurs during processing."
            )
        },
        examples=[
            OpenApiExample(
                name="Valid Request Example (Percentage Change)",
                description="An example where num_commits increases by 20% and num_files is explicitly set for 3 months.",
                value={
                    "project_id": "200",
                    "feature_changes": [
                        {
                            "feature_name": "num_commits",
                            "change_type": "percentage",
                            "change_value": 20
                        },
                        {
                            "feature_name": "num_files",
                            "change_type": "explicit",
                            "change_values": [100, 120, 150]
                        }
                    ]
                },
                request_only=True
            ),
            OpenApiExample(
                name="Successful Response Example",
                description="Example of a successful response.",
                value={
                    "project_id": "200",
                    "predicted_status": "Sustainable",
                    "confidence_score": 0.92,
                    "modified_features": [
                        {"feature_name": "num_commits", "change_type": "percentage", "change_value": 20},
                        {"feature_name": "num_files", "change_type": "explicit", "change_values": [100, 120, 150]}
                    ]
                },
                response_only=True
            ),
            OpenApiExample(
                name="Error Example - Missing Project ID",
                description="Returned when the project ID is not provided in the request.",
                value={"error": "project_id is required"},
                response_only=True
            ),
            OpenApiExample(
                name="Error Example - Invalid Feature Change",
                description="Returned when the feature change format is invalid or incomplete.",
                value={
                    "error": "Invalid feature change format",
                    "details": {
                        "feature_changes": [
                            "Each feature change must include feature_name, change_type, and either change_value or change_values."
                        ]
                    }
                },
                response_only=True
            )
        ]
    )  
    def post(self, request):
        print("🚨 RAW request body BEFORE anything:")
        print(request.body.decode("utf-8"))
        project_id = request.data.get("project_id")
        feature_changes = request.data.get("feature_changes")

        print("🚨 Parsed request.data from Django:")
        print(json.dumps(request.data, indent=4))

        if not project_id or not feature_changes:
            return Response({"error": "project_id and feature_changes are required"}, status=400)

        # Validate Feature Changes
        serializer = FeatureChangeSerializer(data=feature_changes, many=True)
        if not serializer.is_valid():
            return Response({"error": "Invalid feature change format", "details": serializer.errors}, status=400)

        # Fetch all available history for project_id
        available_months = []
        for folder in os.listdir(TEMPORAL_DATA_DIR):
            if folder.startswith("N_"):
                num_months = int(folder.split("_")[1])  # Extract number from "N_X"
                project_data_path = os.path.join(TEMPORAL_DATA_DIR, folder, f"{project_id}.json")
                if os.path.exists(project_data_path):
                    available_months.append(num_months)

        if not available_months:
            return Response({"error": f"No historical data found for project {project_id}"}, status=404)

        max_months = max(available_months)
        best_data_path = os.path.join(TEMPORAL_DATA_DIR, f"N_{max_months}", f"{project_id}.json")

        print(f"Using data from: {best_data_path}")

        cache_key = f"history_{project_id}_{max_months}"
        cache.delete(cache_key)
        cache.clear()

        try:
            with open(best_data_path, "r", encoding="utf-8") as file:
                historical_data = json.load(file)
        except Exception as e:
            return Response({"error": "Failed to load project history", "details": str(e)}, status=500)

        print(f"\n🔍 RAW Historical Data BEFORE Modification for project {project_id}:\n{json.dumps(historical_data['history'], indent=4)}\n")

        print(f"Feature Changes Request: {json.dumps(feature_changes, indent=4)}")

        modified_history = []
        for i, month_data in enumerate(historical_data["history"]):
            modified_data = month_data.copy()

            # Apply Feature Changes
            for change in feature_changes:
                feature = change['feature_name']
                change_type = change['change_type']

                if feature in modified_data:
                    print(f"📌 Modifying {feature} from {modified_data[feature]} with {change['change_type']} {change.get('change_value', change.get('change_values'))}")


                if change_type == "percentage":
                    if feature in modified_data:
                        modified_data[feature] *= (1 + change['change_value'] / 100.0)
                elif change_type == "explicit":
                    if 'change_values' in change and i < len(change['change_values']):
                        modified_data[feature] = change['change_values'][i]

            modified_history.append(modified_data)

        # Prints Exact Data Passed to Model
        print(f"\nFinal Model Input Data for project {project_id}:\n{json.dumps(modified_history, indent=4)}\n")

        # Pass Modified Data to Model
        model_path = os.path.join(MODEL_DIR, f"model_{max_months}.h5")
        if not os.path.exists(model_path):
            return Response({"error": f"No model available for {max_months} months"}, status=400)

        predicted_class, confidence = predict(modified_history, model_path, max_months)
        status = "Sustainable (Likely to Graduate)" if predicted_class == 1 else "Not Sustainable (Likely to Retire)"

        # Prepare Response
        response_data = {
            "project_id": project_id,
            "predicted_status": status,
            "confidence_score": round(confidence, 2),
            "modified_features": feature_changes
        }

        return Response(response_data, status=200)

    
    
    
    