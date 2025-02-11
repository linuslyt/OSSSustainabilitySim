from django.shortcuts import render

# Create your views here.

# My imports
from rest_framework import generics,permissions, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Item
from django.contrib.auth.models import Group, User
from .serializers import ItemSerializer,GroupSerializer, UserSerializer, OSSDataSerializer
from drf_spectacular.utils import extend_schema, OpenApiResponse
from .utils import process_data

################################

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
    summary="Pass OSS project data to LSTM model",
    description="Takes JSON input, processes it, and returns either 'success', 'failure', or 'invalid_input'.",
    request=OSSDataSerializer,  # Define the expected request format
    responses={
        200: OpenApiResponse(
            response={"result": "success or failure", "message": "Processing successful"},
            description="Returned when processing is successful."
        ),
       
        422: OpenApiResponse(
            response={"result": "invalid_input", "message": "Invalid input"},
            description="Returned when the input data is incorrect."
        ),
    }
    )
    def post(self, request, *args, **kwargs):
        serializer = OSSDataSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({"result": "invalid_input", "message": "Invalid input data"}, status=status.HTTP_400_BAD_REQUEST)
        
        result = process_data(serializer.validated_data)
        
        if result == "success":
            return Response({"result": "success", "message": "Processing successful"}, status=status.HTTP_200_OK)
        else: 
            return Response({"result": "failure", "message": "Processing failed"}, status=status.HTTP_200_OK)
       
