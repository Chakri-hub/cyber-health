from django.db import models
from django.utils import timezone

class TipCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, default="")
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Tip Categories"

class Tip(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    image = models.ImageField(upload_to='tips/', null=True, blank=True)
    category = models.ForeignKey(TipCategory, on_delete=models.CASCADE, related_name='tips')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    
    def __str__(self):
        return self.title
