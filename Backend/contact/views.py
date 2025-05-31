from django.shortcuts import get_object_or_404
from rest_framework import status, permissions, viewsets, mixins
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from django.conf import settings
from .models import ContactMessage
from .serializers import ContactMessageSerializer
import logging

logger = logging.getLogger(__name__)

class IsAdminOrSuperUser(permissions.BasePermission):
    """
    Custom permission to only allow admins or superusers.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser)

class ContactMessageViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows contact messages to be viewed or edited.
    """
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    
    def get_permissions(self):
        """
        Custom permissions based on action:
        - create: any user can create a message (POST)
        - list, retrieve, update, partial_update, destroy: only admins
        - user_messages, user_stats, mark_as_read, mark_as_unread: authenticated users can access their own data
        """
        if self.action == 'create':
            permission_classes = [AllowAny]
        elif self.action in ['user_messages', 'user_stats', 'mark_as_read', 'mark_as_unread']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAdminOrSuperUser]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Filter messages based on query parameters and user permissions
        """
        queryset = ContactMessage.objects.all()
        
        # Only admins can see all messages
        if not (self.request.user.is_staff or self.request.user.is_superuser):
            queryset = queryset.filter(user=self.request.user)
        
        # Filter by read status if specified
        read_status = self.request.query_params.get('read')
        if read_status == 'true':
            queryset = queryset.filter(is_read=True)
        elif read_status == 'false':
            queryset = queryset.filter(is_read=False)
            
        # Filter by user type
        user_type = self.request.query_params.get('user_type')
        if user_type == 'registered':
            queryset = queryset.filter(is_from_registered_user=True)
        elif user_type == 'non_registered':
            queryset = queryset.filter(is_from_registered_user=False)
            
        # Search by name, email, or phone
        search_query = self.request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(
                name__icontains=search_query
            ) | queryset.filter(
                email__icontains=search_query
            ) | queryset.filter(
                phone__icontains=search_query
            )
            
        return queryset
    
    @action(detail=False, methods=['get'])
    def user_messages(self, request):
        """
        Returns all messages from the currently authenticated user, including those with admin replies
        """
        messages = ContactMessage.objects.filter(user=request.user)
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """
        Mark a message as read - only allowed if admin has replied to the message
        """
        message = self.get_object()
        
        # Check if the message has a reply from admin
        if not message.has_reply:
            return Response(
                {"detail": "You cannot mark this message as read until an admin has replied to it."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        message.mark_as_read()
        serializer = self.get_serializer(message)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_as_unread(self, request, pk=None):
        """
        Mark a message as unread
        """
        message = self.get_object()
        message.mark_as_unread()
        serializer = self.get_serializer(message)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        """
        Send a reply to a contact message
        """
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {"detail": "You do not have permission to reply to messages."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        message = self.get_object()
        
        # Validate reply text
        if 'reply_text' not in request.data or not request.data['reply_text']:
            return Response(
                {"error": "Reply text is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        reply_text = request.data['reply_text']
        
        # Update message with reply information
        from django.utils import timezone
        message.has_reply = True
        message.reply_text = reply_text
        message.replied_at = timezone.now()
        message.replied_by = request.user
        message.is_read = True  # Mark as read when replied to
        message.save()
        
        # Send email with reply
        try:
            subject = f"Response to your message to Cyber Health"
            email_body = f"Dear {message.name},\n\nThank you for contacting Cyber Health. Here is our response to your inquiry:\n\n{reply_text}\n\nYour original message:\n{message.message}\n\nBest regards,\nThe Cyber Health Team"
            
            send_mail(
                subject,
                email_body,
                settings.DEFAULT_FROM_EMAIL,
                [message.email],
                fail_silently=False,
            )
            logger.info(f"Reply email sent to {message.email}")
        except Exception as e:
            logger.error(f"Failed to send reply email: {str(e)}")
            return Response({
                "success": False,
                "message": "Reply saved but email could not be sent.",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            "success": True,
            "message": "Reply sent successfully",
            "reply_text": reply_text,
            "recipient": message.email
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Return message statistics for admins
        """
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {"detail": "You do not have permission to access message statistics."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        total_messages = ContactMessage.objects.count()
        read_messages = ContactMessage.objects.filter(is_read=True).count()
        unread_messages = ContactMessage.objects.filter(is_read=False).count()
        registered_messages = ContactMessage.objects.filter(is_from_registered_user=True).count()
        non_registered_messages = ContactMessage.objects.filter(is_from_registered_user=False).count()
        
        return Response({
            "total_messages": total_messages,
            "read_messages": read_messages,
            "unread_messages": unread_messages,
            "registered_user_messages": registered_messages,
            "non_registered_user_messages": non_registered_messages
        })
        
    @action(detail=False, methods=['get'])
    def user_stats(self, request):
        """
        Return message statistics for the currently authenticated user
        """
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication required."},
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        # Get message statistics for the current user only
        user_messages = ContactMessage.objects.filter(user=request.user)
        total_messages = user_messages.count()
        read_messages = user_messages.filter(is_read=True).count()
        unread_messages = user_messages.filter(is_read=False).count()
        
        return Response({
            "total_messages": total_messages,
            "read_messages": read_messages,
            "unread_messages": unread_messages
        })

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def send_message(request):
    """
    API endpoint to send a contact message without using the viewset
    """
    try:
        # Check if user is authenticated
        is_authenticated = request.user and request.user.is_authenticated
        
        # Different validation rules based on authentication status
        if is_authenticated:
            # For authenticated users, only message is required
            if 'message' not in request.data or not request.data['message']:
                return Response(
                    {"error": "The message field is required."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # For non-authenticated users, validate all required fields
            required_fields = ['name', 'email', 'message']
            for field in required_fields:
                if field not in request.data or not request.data[field]:
                    return Response(
                        {"error": f"The {field} field is required."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
        
        # Ensure phone is present but can be empty
        if 'phone' not in request.data:
            request.data['phone'] = ''
            
        # Log the incoming data for debugging
        logger.info(f"Received contact form data: {request.data} from authenticated user: {is_authenticated}")
        
        serializer = ContactMessageSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            message_response = {
                "message": "Your message has been sent successfully.",
                "data": serializer.data
            }
            
            # For non-registered users, add a reminder about email
            if not is_authenticated:
                message_response["message"] += " You will receive a response via email soon."
                
            return Response(message_response, status=status.HTTP_201_CREATED)
        
        # Log the validation errors for debugging
        logger.error(f"Contact form validation error: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.exception(f"Unexpected error in send_message: {str(e)}")
        return Response(
            {"error": "An unexpected error occurred. Please try again later."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )