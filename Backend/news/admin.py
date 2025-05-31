from django.contrib import admin
from .models import NewsVideo

@admin.register(NewsVideo)
class NewsVideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at', 'is_active')
    list_filter = ('is_active', 'created_at')
    search_fields = ('title', 'description', 'expert_tips')
    ordering = ('-created_at',)
