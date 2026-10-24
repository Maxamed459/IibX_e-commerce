from rest_framework import serializers

from .models import Categories, Products


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Categories
        fields = ["id", "name", "slug", "created_at"]
        read_only_fields = ["id", "slug", "created_at"]

    def validate_name(self, value):
        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "Category name must contain at least 2 characters."
            )

        return value


class ProductReadSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Products
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "image",
            "price",
            "stock",
            "is_active",
            "category",
            "created_at",
            "updated_at",
        ]


class ProductWriteSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=Categories.objects.all()
    )

    class Meta:
        model = Products
        fields = [
            "name",
            "slug",
            "description",
            "image",
            "price",
            "stock",
            "is_active",
            "category",
        ]
        extra_kwargs = {
            "slug": {"required": False, "allow_blank": True},
        }

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Price must be greater than zero."
            )

        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Stock cannot be negative."
            )

        return value