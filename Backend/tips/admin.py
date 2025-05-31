from django.contrib import admin
from .models import Tip, TipCategory

class TipAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'created_at', 'is_published')
    list_filter = ('is_published', 'category')
    search_fields = ('title', 'content')
    date_hierarchy = 'created_at'

class TipCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

admin.site.register(Tip, TipAdmin)
admin.site.register(TipCategory, TipCategoryAdmin)
