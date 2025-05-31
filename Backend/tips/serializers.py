from rest_framework import serializers
from .models import Tip, TipCategory
from django.conf import settings

class TipCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TipCategory
        fields = ['id', 'name', 'slug']

class TipSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Tip
        fields = ['id', 'title', 'content', 'image', 'image_url', 'category', 'category_name', 
                  'created_at', 'updated_at', 'is_published']
    
    def get_category_name(self, obj):
        return obj.category.name if obj.category else None
        
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                # Return full URL including domain
                return request.build_absolute_uri(obj.image.url)
            else:
                # If request is not available, construct the URL with the base URL
                return f"http://127.0.0.1:8000{obj.image.url}"
        return None 