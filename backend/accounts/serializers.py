from django.contrib.auth import password_validation
from rest_framework import serializers

from .models import User, Profile, Address


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", 
            "email", 
            "phone", 
            "date_joined",
            "is_staff",
            "is_superuser"
        ]
        read_only_fields = [
            "id",
            "date_joined",
            "is_staff",
            "is_superuser",
        ]


class UserRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )
    phone = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=20,
    )

    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )

        return value

    def validate_password(self, value):
        password_validation.validate_password(value)
        return value


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = [
            "user",
            "avater",
            "name",
            "gender",
            "preferred_size",
            "size_system",
            "style_preferences",
            "height_cm",
            "weight_kg",
            "currency",
            "language",
            "country",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "user",
            "created_at",
            "updated_at",
        ]


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            "id",
            "address_type",
            "full_name",
            "phone",
            "street_address",
            "city",
            "district",
            "postal_code",
            "country",
            "is_default",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]