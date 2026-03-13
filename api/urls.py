from django.urls import path
from .views import BurnoutPredictionView, ProfileView

urlpatterns = [
    path('predict/', BurnoutPredictionView.as_view(), name='predict'),
    path('profile/', ProfileView.as_view(), name='profile'),
]
