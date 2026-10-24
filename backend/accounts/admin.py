from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, Profile, Address


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ["email"]
    list_display = [
        "email",
        "phone",
        "is_active",
        "is_staff",
        "is_superuser",
    ]
    search_fields = ["email", "phone"]
    list_filter = ["is_active", "is_staff", "is_superuser"]

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal information", {"fields": ("phone",)}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Dates", {"fields": ("last_login", "date_joined")}),
    )

    readonly_fields = ["last_login", "date_joined"]
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "password1",
                    "password2",
                    "is_staff",
                    "is_superuser",
                ),
            },
        ),
    )


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "name", "country", "currency"]
    search_fields = ["user__email", "name"]
    list_filter = ["country", "currency", "language"]


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ["full_name", "user", "city", "is_default"]
    search_fields = ["full_name", "user__email", "city"]
    list_filter = ["country", "is_default", "address_type"]