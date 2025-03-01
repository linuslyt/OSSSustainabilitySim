from django.urls import path,include
from .views import *


from rest_framework import routers
from . import views

router = routers.DefaultRouter()

router.register('users', views.UserViewSet)
router.register('groups', views.GroupViewSet)


urlpatterns = [
    # path('list_items/', ItemListCreateView.as_view(), name='item-list'),
    # path('update_items/<int:pk>/', ItemDetailView.as_view(), name='item-detail'),
    # path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')), # authentication views added here (login,logout)

    path('simulate/', PredictOSSSustainabilityView.as_view(), name='simulate' ),
    path("listprojects/", ListProjectsView.as_view(), name="list-projects"),
    path("gethistoricaldata/", HistoricalDataView.as_view(), name="gethistoricaldata"),
    path('getprojectdetails/', ProjectPredictionHistoryView.as_view(), name='getprojectdetails'),
    path('simulate-with-deltas/', SimulateWithDeltasView.as_view(), name='simulate-with-deltas'),
]
