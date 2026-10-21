from django.shortcuts import render
from django.utils.text import slugify
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
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

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticatedOrReadOnly])
def create_product(request):
    products = Products.objects.all()
    if request.method == "GET":
        serializer = ProductSerializer(products, many=True,context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == "POST":
        serializer = CreateProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(["GET", "DELETE"])
@permission_classes([IsAuthenticatedOrReadOnly])
def get_or_delete_product(request, pk):
    if request.method == 'DELETE':
        product = Products.objects.delete(pk=pk)
    product = Products.objects.get(pk=pk)
    serializer = ProductSerializer(product)
    return Response(serializer.data, status=status.HTTP_200_OK)
    
