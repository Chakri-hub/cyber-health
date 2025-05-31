from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for viewset
router = DefaultRouter()
router.register(r'messages', views.ContactMessageViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('send/', views.send_message, name='send_message'),
] 