from django.shortcuts import render
import re
import json
import logging
import requests  # Add this import back for oEmbed API
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from .models import NewsVideo
from .serializers import NewsVideoSerializer
from django.db.models import F
from django.db import transaction
import pytube  # For YouTube data extraction as fallback

logger = logging.getLogger(__name__)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])  # Temporary for development
def news_list(request):
    """
    List all news videos or create a new news video
    """
    if request.method == 'GET':
        try:
            # Better authentication check with logging
            is_authenticated = request.user.is_authenticated
            
            # Log authentication details
            logger.info(f"News list request - Auth: {is_authenticated}, User: {request.user}")
            logger.info(f"Request headers: {request.headers}")
            
            # Check for Authorization header if Django didn't authenticate
            auth_header = request.headers.get('Authorization')
            if not is_authenticated and auth_header and auth_header.startswith('Bearer '):
                logger.info("JWT token found in header but not authenticated by Django middleware")
                is_authenticated = True
            
            # Also check cookies
            jwt_cookie = request.COOKIES.get('jwt')
            if not is_authenticated and jwt_cookie:
                logger.info("JWT found in cookies but not authenticated by Django middleware")
                is_authenticated = True
            
            logger.info(f"Final authentication status: {is_authenticated}")
            
            # Get all active news videos
            news_videos = NewsVideo.objects.filter(is_active=True)
            
            # If user is not authenticated, limit to 4 items (2 rows)
            if not is_authenticated:
                news_videos = news_videos[:4]
                
            serializer = NewsVideoSerializer(news_videos, many=True)
            
            # Add a flag to indicate if there are more videos that require login
            total_count = NewsVideo.objects.filter(is_active=True).count()
            requires_login = not is_authenticated and total_count > 4
            
            # Log the response summary
            logger.info(f"Returning {len(serializer.data)} out of {total_count} videos, requires_login={requires_login}")
            
            return Response({
                'news': serializer.data,
                'total_count': total_count,
                'requires_login': requires_login,
                'auth_detected': is_authenticated
            })
        except Exception as e:
            logger.error(f"Error fetching news videos: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    elif request.method == 'POST':
        try:
            # Only allow admin users to create news videos
            # Temporarily disabled for development
            # if not request.user.is_staff and not request.user.is_superuser:
            #     return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
            serializer = NewsVideoSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error creating news video: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'DELETE'])
@permission_classes([AllowAny])  # Temporary for development
def news_detail(request, news_id):
    """
    Retrieve or delete a news video
    """
    try:
        news_video = get_object_or_404(NewsVideo, id=news_id)
        
        if request.method == 'GET':
            serializer = NewsVideoSerializer(news_video)
            return Response(serializer.data)
        
        elif request.method == 'DELETE':
            # Only allow admin users to delete news videos
            # Temporarily disabled for development
            # if not request.user.is_staff and not request.user.is_superuser:
            #     return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
            news_video.delete()
            return Response({'message': 'News video deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    
    except Exception as e:
        logger.error(f"Error in news_detail view: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])  # Temporary for development
def reorder_news(request):
    """
    Reorder news videos
    """
    try:
        data = request.data
        if not isinstance(data, list):
            return Response({"error": "Invalid data format. Expected a list."}, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            for item in data:
                if 'id' not in item or 'order' not in item:
                    return Response({"error": "Each item must have 'id' and 'order' fields."}, 
                                   status=status.HTTP_400_BAD_REQUEST)
                
                news = NewsVideo.objects.filter(id=item['id']).first()
                if not news:
                    return Response({"error": f"News video with id {item['id']} not found."}, 
                                   status=status.HTTP_404_NOT_FOUND)
                
                news.display_order = item['order']
                news.save(update_fields=['display_order'])
        
        return Response({"message": "News videos reordered successfully."}, status=status.HTTP_200_OK)
    
    except Exception as e:
        logging.error(f"Error reordering news videos: {str(e)}")
        return Response({"error": "An error occurred while reordering news videos."}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])  # Temporary for development
def youtube_data(request):
    """
    Fetch YouTube video data from a URL
    """
    try:
        # Get the YouTube URL from the request
        data = json.loads(request.body)
        youtube_url = data.get('url', '')
        
        if not youtube_url:
            return Response({'error': 'YouTube URL is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Extract video ID from the URL
        video_id = extract_youtube_video_id(youtube_url)
        
        if not video_id:
            return Response({'error': 'Invalid YouTube URL'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # First try to get data via oEmbed API (more reliable)
            oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
            oembed_response = requests.get(oembed_url)
            
            if oembed_response.status_code == 200:
                oembed_data = oembed_response.json()
                title = oembed_data.get('title', '')
                
                # Get description separately with pytube as oEmbed doesn't include it
                try:
                    youtube = pytube.YouTube(youtube_url)
                    description = youtube.description
                except:
                    description = "No description available"
                
                video_data = {
                    'title': title,
                    'description': description,
                    'thumbnail_url': f'https://img.youtube.com/vi/{video_id}/maxresdefault.jpg'
                }
                
                return Response(video_data)
            else:
                # Fallback to pytube if oEmbed fails
                youtube = pytube.YouTube(youtube_url)
                video_data = {
                    'title': youtube.title,
                    'description': youtube.description,
                    'thumbnail_url': f'https://img.youtube.com/vi/{video_id}/maxresdefault.jpg'
                }
                return Response(video_data)
        except Exception as e:
            logger.error(f"Error extracting YouTube data: {str(e)}")
            
            # If all methods fail, provide a default response with the video ID
            return Response({
                'title': f"YouTube Video ({video_id})",
                'description': "Description not available. Please add your own description for this video.",
                'thumbnail_url': f'https://img.youtube.com/vi/{video_id}/maxresdefault.jpg'
            })
    
    except Exception as e:
        logger.error(f"Error fetching YouTube data: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def extract_youtube_video_id(url):
    """
    Extract the YouTube video ID from a URL
    """
    pattern = r'(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})'
    match = re.search(pattern, url)
    
    if match:
        return match.group(1)
    
    return None
