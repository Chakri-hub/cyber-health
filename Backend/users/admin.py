from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import UserProfile, OTP

# Register the UserProfile as an inline to the User admin
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'User Profile'

# Customize the User admin
class CustomUserAdmin(UserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active')
    
    def save_model(self, request, obj, form, change):
        # Make sure our admin email is always set as staff and superuser
        if obj.email == 'pchakradhar91@gmail.com':
            obj.is_staff = True
            obj.is_superuser = True
        super().save_model(request, obj, form, change)

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

# Register OTP model
@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ('email', 'otp', 'created_at', 'is_verified')
    search_fields = ('email',)
    readonly_fields = ('created_at',)
