from rest_framework import serializers
from .models import NewsVideo

class NewsVideoSerializer(serializers.ModelSerializer):
    """
    Serializer for the NewsVideo model
    """
    class Meta:
        model = NewsVideo
        fields = [
            'id', 
            'title', 
            'description', 
            'video_url', 
            'thumbnail_url', 
            'expert_tips',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at'] 