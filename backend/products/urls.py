from django.urls import path
from . import views


urlpatterns = [
    path("", views.CreateProduct.as_view(), name="products"),
    path("<id>", views.ProductDetail.as_view(), name="products"),
]