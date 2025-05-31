from django.db import models
from django.utils.translation import gettext_lazy as _

class NewsVideo(models.Model):
    """
    Model for storing YouTube videos as news content
    """
    title = models.CharField(_('Title'), max_length=255)
    description = models.TextField(_('Description'), blank=True)
    video_url = models.URLField(_('Video URL'))
    thumbnail_url = models.URLField(_('Thumbnail URL'), blank=True)
    expert_tips = models.TextField(_('Expert Tips'), blank=True)
    display_order = models.IntegerField(_('Display Order'), default=0)
    
    # Tracking fields
    created_at = models.DateTimeField(_('Created At'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Updated At'), auto_now=True)
    is_active = models.BooleanField(_('Active'), default=True)
    
    class Meta:
        verbose_name = _('News Video')
        verbose_name_plural = _('News Videos')
        ordering = ['display_order', '-created_at']
    
    def __str__(self):
        return self.title
