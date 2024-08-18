# Generated by Django 5.0.6 on 2024-08-18 11:09

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('tours', '0001_initial'),
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='tour',
            name='supplier',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.supplier'),
        ),
        migrations.AddField(
            model_name='itinerarystep',
            name='tour',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='itinerary_steps', to='tours.tour'),
        ),
        migrations.AddField(
            model_name='included',
            name='tour',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tours.tour'),
        ),
        migrations.AddField(
            model_name='faq',
            name='tour',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tours.tour'),
        ),
        migrations.AddField(
            model_name='excluded',
            name='tour',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tours.tour'),
        ),
        migrations.AddField(
            model_name='catalog',
            name='tour',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tours.tour'),
        ),
        migrations.AddField(
            model_name='touroffer',
            name='tour',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tour_offer', to='tours.tour'),
        ),
        migrations.AddField(
            model_name='tourday',
            name='tour_offer',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tours.touroffer'),
        ),
    ]
