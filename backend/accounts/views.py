from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError as DjangoValidationError
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Address, Profile
from .serializers import (
    AddressSerializer,
    ProfileSerializer,
    UserLoginSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)
from .services import AccountService


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data

    try:
        user = AccountService.create_user(
            email=data["email"],
            password=data["password"],
            phone=data.get("phone"),
        )
    except DjangoValidationError as exc:
        return Response(
            {"detail": exc.messages},
            status=status.HTTP_400_BAD_REQUEST,
        )

    refresh = RefreshToken.for_user(user)

    return Response(
        {
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([IsAdminUser])
def register_superuser(request):
    serializer = UserRegistrationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data

    try:
        user = AccountService.create_superuser(
            email=data["email"],
            password=data["password"],
            phone=data.get("phone"),
        )
    except DjangoValidationError as exc:
        return Response(
            {"detail": exc.messages},
            status=status.HTTP_400_BAD_REQUEST,
        )

    refresh = RefreshToken.for_user(user)

    return Response(
        {
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    serializer = UserLoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data["email"].strip().lower()
    password = serializer.validated_data["password"]

    user = authenticate(
        request=request,
        email=email,
        password=password,
    )

    if user is None:
        return Response(
            {"detail": "Invalid email or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    refresh = RefreshToken.for_user(user)

    return Response({
        "user": UserSerializer(user).data,
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    refresh_token = request.data.get("refresh")

    if not refresh_token:
        return Response(
            {"detail": "Refresh token is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        token = RefreshToken(refresh_token)

        # Do not allow one user to blacklist another user's token.
        if str(token["user_id"]) != str(request.user.pk):
            return Response(
                {"detail": "Invalid refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token.blacklist()

    except Exception:
        return Response(
            {"detail": "Invalid or expired refresh token."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def profile(request):
    profile_obj, _ = Profile.objects.get_or_create(
        user=request.user
    )

    if request.method == "GET":
        serializer = ProfileSerializer(
            profile_obj,
            context={"request": request},
        )
        return Response(serializer.data)

    serializer = ProfileSerializer(
        profile_obj,
        data=request.data,
        partial=True,
        context={"request": request},
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_fcm_token(request):
    token = request.data.get("fcm_token")

    if not isinstance(token, str) or not token.strip():
        return Response(
            {"fcm_token": ["A non-empty token is required."]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    profile_obj, _ = Profile.objects.get_or_create(
        user=request.user
    )
    profile_obj.fcm_token = token.strip()
    profile_obj.save(update_fields=["fcm_token", "updated_at"])

    return Response({"detail": "FCM token updated."})


class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AccountService.get_user_addresses(
            self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AddressDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"
    lookup_url_kwarg = "address_id"

    def get_queryset(self):
        return Address.objects.filter(
            user=self.request.user
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def set_default_address(request, address_id):
    address = get_object_or_404(
        Address,
        id=address_id,
        user=request.user,
    )

    address = AccountService.set_default_address(
        request.user,
        address.id,
    )

    return Response(AddressSerializer(address).data)