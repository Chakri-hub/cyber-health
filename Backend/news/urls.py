from django.urls import path
from . import views

urlpatterns = [
    path('', views.news_list, name='news-list'),
    path('<int:news_id>/', views.news_detail, name='news-detail'),
    path('youtube-data/', views.youtube_data, name='youtube-data'),
    path('reorder/', views.reorder_news, name='reorder_news'),
] 