from rest_framework import serializers
from .models import Categories, Products

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Categories
        fields = ['id', 'name', 'slug']
        extra_kwargs = {'slug': {'required': False}}

    def validate_name(self, value):
        if len(value) < 2:
            raise serializers.ValidationError("Category name must be at least 2 characters long.")
        return value

class ProductSerializer(serializers.ModelField):
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
            "category"
        ]

class CreateProductSerializer(serializers.ModelSerializer):
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
            "category"
        ]

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value
    
    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock must be positive number or Zero.")
        return value