from django.urls import path

from .views import (
    CartView,
    CartItemDetailView,
    CheckoutView,
    MyOrderListView,
    MyOrderDetailView,
)


urlpatterns = [
    path("cart/", CartView.as_view(), name="cart"),
    path(
        "cart/items/<uuid:item_id>/",
        CartItemDetailView.as_view(),
        name="cart-item-detail",
    ),
    path("checkout/", CheckoutView.as_view(), name="checkout"),
    path("mine/", MyOrderListView.as_view(), name="my-orders"),
    path(
        "mine/<uuid:id>/",
        MyOrderDetailView.as_view(),
        name="my-order-detail",
    ),
]