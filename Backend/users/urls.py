from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('verify-otp/', views.verify_otp, name='verify-otp'),
    path('login-request-otp/', views.login_request_otp, name='login-request-otp'),
    path('login-verify-otp/', views.login_verify_otp, name='login-verify-otp'),
    path('logout/', views.user_logout, name='user-logout'),
    path('validate-token/', views.validate_token, name='validate-token'),
    path('all/', views.get_all_users, name='get-all-users'),
    path('delete/<int:user_id>/', views.delete_user, name='delete-user'),
    path('change-role/<int:user_id>/', views.change_user_role, name='change-user-role'),
    path('update/<int:user_id>/', views.update_user_info, name='update-user-info'),
    path('details/<int:user_id>/', views.get_user_details, name='get-user-details'),
    path('upload-profile-picture/<int:user_id>/', views.upload_profile_picture, name='upload-profile-picture'),
    path('remove-profile-picture/<int:user_id>/', views.remove_profile_picture, name='remove-profile-picture'),
    # Device-related endpoints
    path('save-device-info/', views.save_device_info, name='save-device-info'),
    path('devices/<int:user_id>/', views.get_user_devices, name='get-user-devices'),
    path('devices/all/', views.get_all_devices, name='get-all-devices'),
    path('devices/delete/<str:device_id>/', views.delete_device, name='delete-device'),
    path('test-email/', views.test_email_endpoint, name='test-email'),
    path('test-security-alert/', views.test_security_alert_email, name='test-security-alert'),
    path('resend-registration-otp/', views.resend_registration_otp, name='resend-registration-otp'),
    path('resend-login-otp/', views.resend_login_otp, name='resend-login-otp'),
    path('reset-rate-limit/', views.reset_rate_limit, name='reset-rate-limit'),
]