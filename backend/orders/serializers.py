from rest_framework import serializers

from .models import Cart, CartItem, Order, OrderItem


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )
    unit_price = serializers.DecimalField(
        source="product.price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            "id",
            "product",
            "product_name",
            "unit_price",
            "quantity",
            "line_total",
        ]
        read_only_fields = [
            "id",
            "product_name",
            "unit_price",
            "line_total",
        ]

    def get_line_total(self, obj):
        return obj.product.price * obj.quantity


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "items", "subtotal", "created_at", "updated_at"]

    def get_subtotal(self, obj):
        return sum(
            (
                item.product.price * item.quantity
                for item in obj.items.select_related("product").all()
            ),
            start=0,
        )


class AddCartItemSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1, max_value=100)


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1, max_value=100)


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_name",
            "unit_price",
            "quantity",
            "line_total",
        ]
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "status",
            "payment_status",
            "payment_method",
            "shipping_full_name",
            "shipping_phone",
            "shipping_address",
            "shipping_city",
            "shipping_country",
            "subtotal",
            "shipping_cost",
            "total",
            "items",
            "placed_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "payment_method",
            "shipping_full_name",
            "shipping_phone",
            "shipping_address",
            "shipping_city",
            "shipping_country",
            "subtotal",
            "shipping_cost",
            "total",
            "items",
            "placed_at",
            "updated_at",
        ]


class CheckoutSerializer(serializers.Serializer):
    address_id = serializers.UUIDField()
    payment_method = serializers.ChoiceField(
        choices=Order.PAYMENT_METHOD_CHOICES
    )