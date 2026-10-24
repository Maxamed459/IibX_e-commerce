from django.core.exceptions import ValidationError
from django.db import transaction

from .models import User, Profile, Address


class AccountService:

    @staticmethod
    @transaction.atomic
    def create_user(email, password, phone=None):
        email = email.strip().lower()

        if User.objects.filter(email__iexact=email).exists():
            raise ValidationError(
                "A user with this email already exists."
            )

        user = User.objects.create_user(
            email=email,
            password=password,
            phone=phone or None,
        )

        Profile.objects.get_or_create(user=user)

        return user

    @staticmethod
    @transaction.atomic
    def create_superuser(email, password, phone=None):
        email = email.strip().lower()

        if User.objects.filter(email__iexact=email).exists():
            raise ValidationError(
                "A user with this email already exists."
            )

        user = User.objects.create_superuser(
            email=email,
            password=password,
            phone=phone or None,
        )

        Profile.objects.get_or_create(user=user)

        return user

    @staticmethod
    def get_user_addresses(user):
        return Address.objects.filter(user=user).order_by(
            "-is_default",
            "-created_at",
        )

    @staticmethod
    @transaction.atomic
    def set_default_address(user, address_id):
        address = Address.objects.select_for_update().get(
            user=user,
            id=address_id,
        )

        Address.objects.filter(
            user=user,
            is_default=True,
        ).exclude(pk=address.pk).update(is_default=False)

        address.is_default = True
        address.save(update_fields=["is_default", "updated_at"])

        return address