# Generated by Django 5.0 on 2023-12-08 14:16

from django.db import migrations, models


class Migration(migrations.Migration):
    """
    A class used in Django to manage database migrations.

    Attributes:
        dependencies (list): A list of dependencies for the migration.
        operations (list): A list of operations to be performed in the migration.
    """

    dependencies = [
        ("inscription", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="CustomPersonne",
            fields=[
                ("idPersonne", models.IntegerField(primary_key=True, serialize=False)),
                ("action", models.CharField(max_length=1)),
                ("nom", models.CharField(max_length=100)),
                ("prenom", models.CharField(max_length=100)),
                ("sexe", models.CharField(max_length=1)),
                ("nationalite", models.CharField(max_length=2)),
                ("adresse", models.CharField(max_length=255)),
                ("complementAdresse", models.CharField(max_length=255)),
                ("codePostal", models.CharField(max_length=5)),
                ("ville", models.CharField(max_length=100)),
                ("pays", models.CharField(max_length=2)),
                ("telephone", models.CharField(max_length=10)),
                ("mobile", models.CharField(max_length=10)),
                ("courriel2", models.CharField(max_length=100)),
                ("personneNom", models.CharField(max_length=100)),
                ("personnePrenom", models.CharField(max_length=100)),
                ("personneTelephone", models.CharField(max_length=15)),
                ("personneCourriel", models.CharField(max_length=100)),
                ("numLicence", models.CharField(max_length=6)),
                ("typeLicence", models.CharField(max_length=1)),
                ("assurance", models.CharField(max_length=2)),
                ("optionSki", models.BooleanField()),
                ("optionSlackline", models.BooleanField()),
                ("optionTrail", models.BooleanField()),
                ("optionVTT", models.BooleanField()),
                ("optionAssurance", models.BooleanField()),
                ("seance", models.IntegerField()),
                ("lInscription", models.IntegerField()),
            ],
            options={
                "db_table": "Personne",
                "managed": False,
            },
        ),
    ]
