from rest_framework import serializers
from .models import ContactMessage
from django.contrib.auth.models import User

class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class ContactMessageSerializer(serializers.ModelSerializer):
    user_details = UserBasicSerializer(source='user', read_only=True)
    replied_by_details = UserBasicSerializer(source='replied_by', read_only=True)
    
    class Meta:
        model = ContactMessage
        fields = [
            'id', 'name', 'email', 'phone', 'message', 
            'is_read', 'user', 'user_details', 'is_from_registered_user',
            'created_at', 'updated_at', 'has_reply', 'reply_text', 
            'replied_at', 'replied_by', 'replied_by_details'
        ]
        read_only_fields = ['id', 'is_read', 'user_details', 'created_at', 'updated_at', 
                           'has_reply', 'reply_text', 'replied_at', 'replied_by', 'replied_by_details']
        extra_kwargs = {
            'phone': {'required': False, 'allow_blank': True},
        }
        
    def validate(self, data):
        """
        Validate the data before saving
        """
        # Ensure phone is present but can be empty
        if 'phone' not in data:
            data['phone'] = ''
        return data
        
    def create(self, validated_data):
        user = self.context.get('request').user if self.context.get('request') else None
        is_authenticated = user and user.is_authenticated
        
        # Handle registered user
        if is_authenticated:
            validated_data['user'] = user
            validated_data['is_from_registered_user'] = True
            validated_data['name'] = f"{user.first_name} {user.last_name}".strip() or user.username
            validated_data['email'] = user.email
            
            # Get phone from user profile if available
            try:
                if hasattr(user, 'userprofile') and user.userprofile.phone_number:
                    validated_data['phone'] = user.userprofile.phone_number
            except:
                pass
        else:
            # For unauthenticated users
            validated_data['is_from_registered_user'] = False
            validated_data['user'] = None
            
            # Ensure phone field is not empty
            if 'phone' not in validated_data or validated_data['phone'] is None:
                validated_data['phone'] = ''
        
        return super().create(validated_data)