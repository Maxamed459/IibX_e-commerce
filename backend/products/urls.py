from django.urls import path
from . import views

urlpatterns = [
    path("", views.create_product, name="products"),
    path("<pk>", views.get_or_delete_product, name="products"),
]