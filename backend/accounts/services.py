from django.db import transaction
from django.core.exceptions import ValidationError
from .models import User, Profile, Address


class AccountService:
    @staticmethod
    @transaction.atomic
    def craete_user(email, password, phone=None):
        if User.objects.filter(email=email).exists():
            raise ValidationError("User with this email already exists")

        user = User.objects.create_user(email=email, password=password, phone=phone)

        Profile.objects.get_or_create(user=user)

        return user
    
    @staticmethod
    @transaction.atomic
    def create_superuser(email, password, phone=None):
        if User.objects.filter(email=email).exists():
            raise ValidationError("User with this email already exists")
        
        superuser = User.objects.create_superuser(email=email, password=password, phone=phone)

        Profile.objects.get_or_create(user=superuser)

        return superuser

    @staticmethod
    def update_fcm_token(user, fcm_token):
        profile = user.profile
        profile.fcm_token = fcm_token
        profile.save(update_fields=["fcm_token"])
        return profile

    @staticmethod
    def get_user_addresses(user):
        return Address.objects.filter(user=user).order_by("-is_default", "-created_at")

    @staticmethod
    def create_address(user, **kwargs):
        address = Address.objects.create(user=user, **kwargs)
        return address

    @staticmethod
    def get_address(user, address_id):
        return Address.objects.get(id=address_id, user=user)

    @staticmethod
    @transaction.atomic
    def update_address(user, address_id, **kwargs):
        address = Address.objects.get(id=address_id, user=user)
        for field, value in kwargs.items():
            if hasattr(address, field):
                setattr(address, field, value)
        address.save()
        return address

    @staticmethod
    def delete_address(user, address_id):
        address = Address.objects.get(id=address_id, user=user)
        address.delete()

    @staticmethod
    @transaction.atomic
    def set_default_address(user, address_id):
        address = Address.objects.get(id=address_id, user=user)
        Address.objects.filter(user=user, is_default=True).update(is_default=False)

        address.is_default = True
        address.save()

        return address
