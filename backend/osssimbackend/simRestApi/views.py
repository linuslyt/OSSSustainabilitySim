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


TEMPORAL_DATA_DIR = Path(__file__).parent /"asfi_project_info/project_temporal_json_data/"


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
                    "project_id": 100,
                    "history": [
                        {
                            "active_devs": 10,
                            "num_commits": 50,
                            "num_files": 20,
                            "num_emails": 15,
                            "c_percentage": 0.7,
                            "e_percentage": 0.3,
                            "inactive_c": 5,
                            "inactive_e": 2,
                            "c_nodes": 30,
                            "c_edges": 50,
                            "c_c_coef": 0.6,
                            "c_mean_degree": 2.5,
                            "c_long_tail": 0.1,
                            "e_nodes": 25,
                            "e_edges": 40,
                            "e_c_coef": 0.55,
                            "e_mean_degree": 2.0,
                            "e_long_tail": 0.05
                        },
                        {
                            "active_devs": 3,
                            "num_commits": 20,
                            "num_files": 10,
                            "num_emails": 5,
                            "c_percentage": 0.7,
                            "e_percentage": 0.3,
                            "inactive_c": 5,
                            "inactive_e": 2,
                            "c_nodes": 30,
                            "c_edges": 50,
                            "c_c_coef": 0.6,
                            "c_mean_degree": 2.5,
                            "c_long_tail": 0.1,
                            "e_nodes": 25,
                            "e_edges": 40,
                            "e_c_coef": 0.55,
                            "e_mean_degree": 2.0,
                            "e_long_tail": 0.05
                        }
                    ]
                },
                request_only=True
            ),
            OpenApiExample(
                "Successful Response",
                description="A successful response returning the predicted project status.",
                value={
                    "project_id": "100",
                    "predictions": [
                        {
                        "month": 2,
                        "status": 1,
                        "confidence_score": 0.94
                        },
                        {
                        "month": 3,
                        "status": 1,
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
                "project_id": "string",
                "predictions": [
                    {
                        "month": "integer",
                        "status": "0 or 1",
                        "confidence_score": "float"
                    }
                ]
            },
                description="Successful prediction response."
            ),
            400: OpenApiResponse(
                response={"error": "No model available for X months"},
                description="Returned when no model exists for the requested number of months."
            ),
            404: OpenApiResponse(
                response={"error": "Invalid project ID"},
                description="Returned when the project ID is not found."
            ),
            422: OpenApiResponse(
                response={"error": "Invalid input format"},
                description="Returned when the input data is incorrect."
            ),
        }
    )
    
    def post(self, request, *args, **kwargs):
        serializer = StatusPredictionInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Invalid input format", "details": serializer.errors}, status=422)

        validated_data = serializer.validated_data
        project_id = validated_data["project_id"]
        history = validated_data["history"]

        num_months = len(history)  # The number of months in the provided data
        future_data = get_future_data(project_id, num_months)  # Get future months data

        if project_id not in PROJECT_LIST:
            return Response({"error": "Invalid project ID"}, status=404)
        
        if future_data:
            history.extend(future_data)  # Append future data to history for predictions

        predictions = []
        model_input = []  # Initial input for the model
        month_count = 0
        for i, current_month in enumerate(history):
            model_input.append(current_month)
            month_count += 1
            model_path = os.path.join(MODEL_DIR, f"model_{month_count}.h5")
            if not os.path.exists(model_path):
                return Response({"error": f"No model available for {month_count} months"}, status=400)
            
            predicted_class, confidence = predict(model_input, model_path, month_count)

            predictions.append({
                "month": month_count + 1,  # The next month
                "status": predicted_class,
                "confidence_score": round(confidence, 2)
            })

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
    @extend_schema(
        summary="Retrieve Historical Project Data",
        description="""
            Fetches historical data for a given project ID over a specified number of months.
            Data is retrieved from the appropriate folder based on the months requested.
        """,
        parameters=[
            OpenApiParameter(name="project_id", description="Unique project identifier", required=True, type=str),
            OpenApiParameter(name="num_months", description="Number of months of historical data", required=True, type=int),
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

        # Validate input
        if not project_id or not num_months:
            return Response({"error": "Both project_id and num_months are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            num_months = int(num_months)
        except ValueError:
            return Response({"error": "num_months must be an integer"}, status=status.HTTP_400_BAD_REQUEST)

        # Construct path to the historical data folder
        months_folder = f"N_{num_months}"
        project_data_path = os.path.join(TEMPORAL_DATA_DIR, months_folder, f"{project_id}.json")

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

        # Prepare response data
        response_data = {
            "project_id": project_id,
            "project_name": project_info["listname"],
            "start_date": project_info.get("start_date", "N/A"),
            "end_date": project_info.get("end_date", "N/A"),
            "history": project_history["history"]  # List of monthly data
        }

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
            return Response({
                "project_id": project_id,
                "project_name": project_info["listname"],
                "start_date": project_info["start_date"],
                "end_date": project_info.get("end_date", "N/A"),
                "status": project_info["status"],
                "pj_github_url": project_info["pj_github_url"],
                "intro": project_info["intro"],
                "sponsor": project_info["sponsor"],
                "prediction_history": prediction_history
            }, status=200)

        except FileNotFoundError:
            return Response({"error": "Project data not found"}, status=404)
        except Exception as e:
            return Response({"error": "Failed to load project data or prediction history", "details": str(e)}, status=500)

    
    
    
    
    