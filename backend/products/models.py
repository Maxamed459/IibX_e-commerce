from django.db import models
import uuid
from django.utils import timezone
from accounts.models import User

class Categories(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField()
    slug = models.CharField()
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "categories"

    def __str__(self):
        return f"{self.name}"
    
class Products(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="product-images/", null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    category = models.ForeignKey(Categories, on_delete=models.CASCADE, related_name="products")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table =  "products"
        indexes = [models.Index(fields=["slug"])]

    def __str__(self):
        return f"{self.name} and price is ${self.price}"
