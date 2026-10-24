from django.contrib import admin

from .models import Cart, CartItem, Order, OrderItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "created_at", "updated_at"]
    search_fields = ["user__email"]
    inlines = [CartItemInline]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = [
        "product",
        "product_name",
        "unit_price",
        "quantity",
        "line_total",
    ]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "customer",
        "status",
        "payment_status",
        "total",
        "placed_at",
    ]
    list_filter = ["status", "payment_status", "payment_method"]
    search_fields = ["id", "customer__email"]
    readonly_fields = [
        "subtotal",
        "shipping_cost",
        "total",
        "placed_at",
        "updated_at",
    ]
    inlines = [OrderItemInline]


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ["cart", "product", "quantity"]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ["order", "product_name", "quantity", "unit_price"]
    readonly_fields = [
        "order",
        "product",
        "product_name",
        "unit_price",
        "quantity",
        "line_total",
    ]