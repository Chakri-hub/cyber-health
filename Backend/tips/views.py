from django.shortcuts import render, get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from .models import Tip, TipCategory
from .serializers import TipSerializer, TipCategorySerializer
import logging
from django.db import transaction

logger = logging.getLogger(__name__)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])  # Temporary for development
def tips_list(request):
    """
    List all tips or create a new tip
    """
    if request.method == 'GET':
        try:
            tips = Tip.objects.filter(is_published=True).order_by('order', '-created_at')
            serializer = TipSerializer(tips, many=True, context={'request': request})
            return Response({'tips': serializer.data})
        except Exception as e:
            logger.error(f"Error fetching tips: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    elif request.method == 'POST':
        try:
            # Get or create default category if not provided
            category_id = request.data.get('category', None)
            if not category_id:
                default_category, created = TipCategory.objects.get_or_create(
                    slug='general',
                    defaults={'name': 'General', 'description': 'General cybersecurity tips'}
                )
                category_id = default_category.id
            
            # Create serializer with data
            serializer = TipSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error creating tip: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([AllowAny])  # Temporary for development
def tip_detail(request, pk):
    """
    Retrieve, update or delete a tip
    """
    try:
        tip = get_object_or_404(Tip, pk=pk)
        
        if request.method == 'GET':
            serializer = TipSerializer(tip, context={'request': request})
            return Response(serializer.data)
        
        if request.method == 'PUT':
            serializer = TipSerializer(tip, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'PATCH':
            # Handle partial updates, specifically for order
            serializer = TipSerializer(tip, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            tip.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
    
    except Exception as e:
        logger.error(f"Error in tip_detail view: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def tips_by_category(request):
    """
    List tips by category
    """
    try:
        slug = request.query_params.get('slug', None)
        if not slug:
            return Response({'error': 'Category slug is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        category = get_object_or_404(TipCategory, slug=slug)
        tips = Tip.objects.filter(category=category, is_published=True).order_by('order', '-created_at')
        serializer = TipSerializer(tips, many=True, context={'request': request})
        
        return Response({
            'category': TipCategorySerializer(category).data,
            'tips': serializer.data
        })
    except Exception as e:
        logger.error(f"Error fetching tips by category: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])  # Temporary for development
def reorder_tips(request):
    """
    Reorder tips
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
                
                tip = Tip.objects.filter(id=item['id']).first()
                if not tip:
                    return Response({"error": f"Tip with id {item['id']} not found."}, 
                                   status=status.HTTP_404_NOT_FOUND)
                
                tip.order = item['order']
                tip.save(update_fields=['order'])
        
        return Response({"message": "Tips reordered successfully."}, status=status.HTTP_200_OK)
    
    except Exception as e:
        logging.error(f"Error reordering tips: {str(e)}")
        return Response({"error": "An error occurred while reordering tips."}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)
