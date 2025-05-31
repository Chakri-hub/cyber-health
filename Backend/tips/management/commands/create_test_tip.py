from django.core.management.base import BaseCommand
from tips.models import Tip, TipCategory

class Command(BaseCommand):
    help = 'Creates test tips for development'

    def handle(self, *args, **options):
        # Make sure we have categories
        if TipCategory.objects.count() == 0:
            self.stdout.write(self.style.WARNING('No categories found. Creating default categories first.'))
            # Import and run create_default_categories
            from tips.management.commands.create_default_categories import Command as DefaultCategoriesCommand
            DefaultCategoriesCommand().handle()
        
        # Get the general category
        general_category = TipCategory.objects.filter(slug='general').first()
        if not general_category:
            self.stdout.write(self.style.ERROR('General category not found. Cannot create test tip.'))
            return
        
        # Create a test tip
        test_tip = Tip.objects.create(
            title='Keep Your Software Updated',
            content='Regularly update your operating system, browsers, and apps to protect against security vulnerabilities. Enable automatic updates whenever possible.',
            category=general_category,
            is_published=True
        )
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created test tip: {test_tip.title}')) 