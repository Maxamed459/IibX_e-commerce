from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.permissions import AllowAny, IsAdminUser

from .models import Categories, Products
from .serializers import (
    CategorySerializer,
    ProductReadSerializer,
    ProductWriteSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Categories.objects.all()
    serializer_class = CategorySerializer

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    search_fields = ["name"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]

        return [IsAdminUser()]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Products.objects.select_related("category").all()

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = ["category"]
    search_fields = ["name", "description", "category__name"]
    ordering_fields = ["name", "price", "created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = super().get_queryset()

        if self.request.user.is_staff:
            return queryset

        return queryset.filter(is_active=True)

    def get_serializer_class(self):
        if self.action in ("list", "retrieve"):
            return ProductReadSerializer

        return ProductWriteSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]

        return [IsAdminUser()]