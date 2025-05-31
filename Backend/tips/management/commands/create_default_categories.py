from django.core.management.base import BaseCommand
from tips.models import TipCategory

class Command(BaseCommand):
    help = 'Creates default tip categories'

    def handle(self, *args, **options):
        # Create general category if it doesn't exist
        if not TipCategory.objects.filter(slug='general').exists():
            TipCategory.objects.create(
                name='General',
                slug='general',
                description='General cybersecurity tips'
            )
            self.stdout.write(self.style.SUCCESS('Successfully created General category'))
        else:
            self.stdout.write(self.style.WARNING('General category already exists'))

        # Create more categories as needed
        categories = [
            {
                'name': 'Password Security',
                'slug': 'password-security',
                'description': 'Tips for creating and managing secure passwords'
            },
            {
                'name': 'Safe Browsing',
                'slug': 'safe-browsing',
                'description': 'Tips for safely browsing the internet'
            },
            {
                'name': 'Device Security',
                'slug': 'device-security',
                'description': 'Tips for securing your devices'
            },
            {
                'name': 'Social Media Privacy',
                'slug': 'social-media-privacy',
                'description': 'Tips for maintaining privacy on social media platforms'
            }
        ]

        for category_data in categories:
            if not TipCategory.objects.filter(slug=category_data['slug']).exists():
                TipCategory.objects.create(**category_data)
                self.stdout.write(self.style.SUCCESS(f"Successfully created {category_data['name']} category"))
            else:
                self.stdout.write(self.style.WARNING(f"{category_data['name']} category already exists")) 