from django.core.exceptions import ValidationError as DjangoValidationError
from django.shortcuts import get_object_or_404

from rest_framework import generics, status, mixins
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cart, CartItem, Order
from .serializers import (
    AddCartItemSerializer,
    CartSerializer,
    CheckoutSerializer,
    OrderSerializer,
    UpdateCartItemSerializer,
)
from .services import (
    add_item_to_cart,
    checkout,
    update_cart_item,
)


def service_error_response(exc):
    return Response(
        {"detail": exc.messages},
        status=status.HTTP_400_BAD_REQUEST,
    )


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)

        return Response(
            CartSerializer(cart).data,
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        serializer = AddCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            add_item_to_cart(
                user=request.user,
                product_id=serializer.validated_data["product_id"],
                quantity=serializer.validated_data["quantity"],
            )
        except DjangoValidationError as exc:
            return service_error_response(exc)

        cart = Cart.objects.get(user=request.user)

        return Response(
            CartSerializer(cart).data,
            status=status.HTTP_200_OK,
        )


class CartItemDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            update_cart_item(
                user=request.user,
                item_id=item_id,
                quantity=serializer.validated_data["quantity"],
            )
        except DjangoValidationError as exc:
            return service_error_response(exc)

        cart = Cart.objects.get(user=request.user)

        return Response(CartSerializer(cart).data)

    def delete(self, request, item_id):
        item = get_object_or_404(
            CartItem,
            id=item_id,
            cart__user=request.user,
        )
        item.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            order = checkout(
                user=request.user,
                address_id=serializer.validated_data["address_id"],
                payment_method=serializer.validated_data["payment_method"],
            )
        except DjangoValidationError as exc:
            return service_error_response(exc)

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )


class MyOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects.filter(customer=self.request.user)
            .prefetch_related("items")
        )

class ListCreateOrders(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
            return (
                Order.objects
                .prefetch_related("items").all()
            )
class RetreiveUpdateDestroyOrders(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
            return (
                Order.objects
                .prefetch_related("items").all()
            )





class MyOrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        return (
            Order.objects.filter(customer=self.request.user)
            .prefetch_related("items")
        )