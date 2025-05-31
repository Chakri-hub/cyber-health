from django.urls import path
from . import views

urlpatterns = [
    path('', views.tips_list, name='tips-list'),
    path('<int:pk>/', views.tip_detail, name='tip-detail'),
    path('by_category/', views.tips_by_category, name='tips-by-category'),
    path('reorder/', views.reorder_tips, name='reorder-tips'),
] 