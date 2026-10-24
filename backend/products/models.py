import uuid

from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class Categories(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "categories"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name) or "category"
            candidate = base_slug
            number = 2

            while Categories.objects.filter(
                slug=candidate
            ).exclude(pk=self.pk).exists():
                candidate = f"{base_slug}-{number}"
                number += 1

            self.slug = candidate

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Products(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(
        upload_to="product-images/",
        null=True,
        blank=True,
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    category = models.ForeignKey(
        Categories,
        on_delete=models.PROTECT,
        related_name="products",
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "products"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["is_active", "category"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name) or "product"
            candidate = base_slug
            number = 2

            while Products.objects.filter(
                slug=candidate
            ).exclude(pk=self.pk).exists():
                candidate = f"{base_slug}-{number}"
                number += 1

            self.slug = candidate

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} — ${self.price}"