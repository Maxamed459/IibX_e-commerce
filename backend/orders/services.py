from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import transaction

from accounts.models import Address
from products.models import Products

from .models import Cart, CartItem, Order, OrderItem


@transaction.atomic
def add_item_to_cart(*, user, product_id, quantity):
    if quantity < 1 or quantity > 100:
        raise ValidationError("Quantity must be between 1 and 100.")

    try:
        product = Products.objects.get(
            id=product_id,
            is_active=True,
        )
    except Products.DoesNotExist:
        raise ValidationError("Product is unavailable.")

    cart, _ = Cart.objects.get_or_create(user=user)

    item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={"quantity": quantity},
    )

    if not created:
        item.quantity += quantity

    if item.quantity > product.stock:
        raise ValidationError("Requested quantity exceeds available stock.")

    item.save()
    return item


@transaction.atomic
def update_cart_item(*, user, item_id, quantity):
    if quantity < 1 or quantity > 100:
        raise ValidationError("Quantity must be between 1 and 100.")

    try:
        item = CartItem.objects.select_for_update().get(
            id=item_id,
            cart__user=user,
        )
    except CartItem.DoesNotExist:
        raise ValidationError("Cart item not found.")

    if not item.product.is_active:
        raise ValidationError("Product is unavailable.")

    if quantity > item.product.stock:
        raise ValidationError("Requested quantity exceeds available stock.")

    item.quantity = quantity
    item.save(update_fields=["quantity"])
    return item


@transaction.atomic
def checkout(*, user, address_id, payment_method):
    try:
        address = Address.objects.get(
            id=address_id,
            user=user,
        )
    except Address.DoesNotExist:
        raise ValidationError("Shipping address not found.")

    cart = Cart.objects.filter(user=user).first()

    if cart is None:
        raise ValidationError("Your cart is empty.")

    cart_items = list(
        CartItem.objects.filter(cart=cart)
        .select_related("product")
        .order_by("product_id")
    )

    if not cart_items:
        raise ValidationError("Your cart is empty.")

    # Lock inventory rows in a consistent order to reduce deadlocks.
    product_ids = sorted(
        str(item.product_id) for item in cart_items
    )

    locked_products = {
        str(product.id): product
        for product in Products.objects.select_for_update()
        .filter(id__in=product_ids, is_active=True)
        .order_by("id")
    }

    if len(locked_products) != len(cart_items):
        raise ValidationError(
            "One or more products are no longer available."
        )

    subtotal = Decimal("0.00")

    for item in cart_items:
        product = locked_products[str(item.product_id)]

        if product.stock < item.quantity:
            raise ValidationError(
                f"Insufficient stock for {product.name}."
            )

        subtotal += product.price * item.quantity

    # Configure your real delivery pricing here.
    shipping_cost = Decimal("0.00")
    total = subtotal + shipping_cost

    order = Order.objects.create(
        customer=user,
        payment_method=payment_method,
        status=Order.STATUS_PENDING,
        payment_status=Order.PAYMENT_PENDING,
        shipping_full_name=address.full_name,
        shipping_phone=address.phone,
        shipping_address=address.street_address,
        shipping_city=address.city,
        shipping_country=address.country,
        subtotal=subtotal,
        shipping_cost=shipping_cost,
        total=total,
    )

    for item in cart_items:
        product = locked_products[str(item.product_id)]

        OrderItem.objects.create(
            order=order,
            product=product,
            product_name=product.name,
            unit_price=product.price,
            quantity=item.quantity,
            line_total=product.price * item.quantity,
        )

        product.stock -= item.quantity
        product.save(update_fields=["stock"])

    # The order and stock changes roll back if any operation fails.
    CartItem.objects.filter(cart=cart).delete()

    return order