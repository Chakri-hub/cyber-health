from django.urls import path
from . import views

urlpatterns = [
    path('heart-rate/<int:user_id>/', views.heart_rate, name='heart-rate'),
    path('blood-pressure/<int:user_id>/', views.blood_pressure, name='blood-pressure'),
    path('spo2/<int:user_id>/', views.spo2, name='spo2'),
    path('respiratory-rate/<int:user_id>/', views.respiratory_rate, name='respiratory-rate'),
    path('temperature/<int:user_id>/', views.temperature, name='temperature'),
    path('weight/<int:user_id>/', views.weight, name='weight'),
    path('mood/<int:user_id>/', views.mood, name='mood'),
    path('anxiety/<int:user_id>/', views.anxiety, name='anxiety'),
    path('depression/<int:user_id>/', views.depression, name='depression'),
    path('sleep/<int:user_id>/', views.sleep, name='sleep'),
    path('mental-fatigue/<int:user_id>/', views.mental_fatigue, name='mental-fatigue'),
    
    # Women's Health Tools - Category 5
    path('menstrual-cycle/<int:user_id>/', views.menstrual_cycle, name='menstrual-cycle'),
    path('fertility-tracker/<int:user_id>/', views.fertility_tracker, name='fertility-tracker'),
    path('pms-symptom/<int:user_id>/', views.pms_symptom, name='pms-symptom'),
    path('pregnancy-guide/<int:user_id>/', views.pregnancy_guide, name='pregnancy-guide'),
    path('pcos-checker/<int:user_id>/', views.pcos_checker, name='pcos-checker'),
] 