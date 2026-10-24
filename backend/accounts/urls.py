from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views


urlpatterns = [
    path("register/", views.register, name="register"),
    path(
        "register-superuser/",
        views.register_superuser,
        name="register-superuser",
    ),
    path("login/", views.login, name="login"),
    path("logout/", views.logout, name="logout"),
    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),
    path("profile/", views.profile, name="profile"),
    path(
        "fcm-token/",
        views.update_fcm_token,
        name="update_fcm_token",
    ),
    path(
        "addresses/",
        views.AddressListCreateView.as_view(),
        name="addresses",
    ),
    path(
        "addresses/<uuid:address_id>/",
        views.AddressDetailView.as_view(),
        name="address-detail",
    ),
    path(
        "addresses/<uuid:address_id>/set-default/",
        views.set_default_address,
        name="set-default-address",
    ),
]