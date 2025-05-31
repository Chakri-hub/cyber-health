from django.core.management.base import BaseCommand
from contact.models import ContactMessage
from django.utils import timezone
import datetime
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Deletes contact messages and replies older than 7 days'

    def handle(self, *args, **options):
        # Calculate the date 7 days ago
        seven_days_ago = timezone.now() - datetime.timedelta(days=7)
        
        # Find messages older than 7 days
        old_messages = ContactMessage.objects.filter(created_at__lt=seven_days_ago)
        count = old_messages.count()
        
        if count > 0:
            # Delete the old messages
            old_messages.delete()
            self.stdout.write(
                self.style.SUCCESS(f'Successfully deleted {count} messages older than 7 days')
            )
            logger.info(f'Deleted {count} messages older than 7 days')
        else:
            self.stdout.write(
                self.style.SUCCESS('No messages older than 7 days found')
            )
            logger.info('No messages older than 7 days found')