# Generated by Django 5.0 on 2023-12-14 15:08

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("inscription", "0002_custompersonne"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="custompersonne",
            options={"managed": True},
        ),
        migrations.AlterModelOptions(
            name="customuser",
            options={"managed": True},
        ),
        migrations.AlterModelOptions(
            name="datacalendar",
            options={"managed": True},
        ),
    ]
