# Generated by Django 5.1.6 on 2025-04-10 08:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tips', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='tip',
            name='order',
            field=models.IntegerField(default=0),
        ),
    ]
