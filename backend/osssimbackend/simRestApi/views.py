from django.shortcuts import render

# Create your views here.

# My imports
from rest_framework import generics,permissions, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Item
from django.contrib.auth.models import Group, User
from .serializers import *
from drf_spectacular.utils import extend_schema, OpenApiResponse
from .utils import predict
import os

from pathlib import Path
################################

MODEL_DIR =  Path(__file__).parent / 'lstm_models/' # Directory where models are stored


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
    
    


class ProcessOSSDataView(APIView):
    @extend_schema(
        summary="Predict OSS Project Status using LSTM",
        description="""
            Accepts historical OSS project data (ranging from 1 to 29 months) and 
            processes it using a pre-trained LSTM model. The appropriate model is selected 
            based on the length of the input data. Returns the predicted project status 
            ('Graduated' or 'Retired') along with the number of months used for the prediction.
        """,
        request=StatusPredictionInputSerializer,
        responses={
            200: OpenApiResponse(
                response={
                    "project_id": "string",
                    "num_months": "integer",
                    "status": "Graduated or Retired",
                    "confidence": "list of probabilities"
                },
                description="Successful prediction response."
            ),
            400: OpenApiResponse(
                response={"error": "No model available for X months"},
                description="Returned when no model exists for the requested number of months."
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
        history = validated_data["history"]  # List of monthly data

        num_months = len(history)  # Get the number of months
        model_path = os.path.join(MODEL_DIR, f"model_{num_months}.h5")
        print("Model Path: ", model_path)

        if not os.path.exists(model_path):
            return Response({"error": f"No model available for {num_months} months"}, status=400)
        
        predicted_class = predict(history, model_path, num_months)
        
        print("Predicted Class: ", predicted_class) #{139 gives a retired correctly)}
        
        status = "Graduated" if predicted_class == 1 else "Retired"

        return Response({
            "project_id": project_id,
            "num_months": num_months,
            "status": status,
            # "confidence": y_pred.tolist()
        }, status=200)

        # serializer = OSSDataSerializer(data=request.data)
        
        # if not serializer.is_valid():
        #     return Response({"result": "invalid_input", "message": "Invalid input data"}, status=status.HTTP_400_BAD_REQUEST)
        
        # result = process_data(serializer.validated_data)
        
        # if result == "success":
        #     return Response({"result": "success", "message": "Processing successful"}, status=status.HTTP_200_OK)
        # else: 
        #     return Response({"result": "failure", "message": "Processing failed"}, status=status.HTTP_200_OK)
       



