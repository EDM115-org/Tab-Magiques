from django import forms
from django.utils.translation import gettext_lazy as _
from .models import CustomUser


class CustomUserCreationForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ["birth_date", "email", "password", "confirm_password"]
        widgets = {
            "birth_date": forms.DateInput(attrs={"type": "date"}),
            "email": forms.EmailInput(),
            "password": forms.PasswordInput(),
            "confirm_password": forms.PasswordInput(),
        }
        labels = {
            "birth_date": _("Date de naissance"),
            "email": _("Email"),
            "password": _("Mot de passe"),
            "confirm_password": _("Confirmez le mot de passe"),
        }


class CustomUserLoginForm(forms.Form):
    email = forms.EmailField()
    password = forms.CharField(widget=forms.PasswordInput)
