from django.shortcuts import get_object_or_404
from django.utils.text import slugify
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, IsAdminUser, DjangoModelPermissionsOrAnonReadOnly
from .models import Categories, Products
from .serializers import CategorySerializer, ProductSerializer, CreateProductSerializer


class CategoryViewSet(ModelViewSet):
    queryset = Categories.objects.all()
    serializer_class = CategorySerializer
    
    # Secure it: Everyone can view categories, but only logged-in Admins can create/edit them
    permission_classes = [DjangoModelPermissionsOrAnonReadOnly]

    # Automatically generate the slug from the name during creation
    def perform_create(self, serializer):
        name = serializer.validated_data.get('name')
        slug = serializer.validated_data.get('slug') or slugify(name)
        serializer.save(slug=slug)


class CreateProduct(APIView):
    permission_classes= [IsAuthenticated]
    def post(self, request):
        serializer = CreateProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductDetail(APIView):
    def get(self, request, id):
        product = get_object_or_404(Products, pk=id)
        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, id):
        product = get_object_or_404(Products, pk=id)
        print(f"This is the product {product}")
        serializor = ProductSerializer(product, data=request.data, partial=True)
        serializor.is_valid(raise_exception=True)
        serializor.save()
        print(f"Price {product.price}")
        return Response(serializor.data, status=status.HTTP_200_OK)

    def delete(self, request, id):
        product = get_object_or_404(Products, pk=id)
        # print(f"This is the product want to delete {product}")
        # if product.orderitems.count() > 0:
        #     return Response({'error': 'Product can`t be deleted it has an order'}, status=status.HTTP_400_BAD_REQUEST)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    
