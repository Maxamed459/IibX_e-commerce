from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Profile
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserLoginSerializer,
    ProfileSerializer,
    AddressSerializer,
)
from .services import AccountService
from django.conf import settings


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = AccountService.craete_user(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
            phone=serializer.validated_data["phone"],
        )

        refresh_token = RefreshToken.for_user(user)
        response = Response(
            {
                "user": UserSerializer(user).data,
                "access_token": str(refresh_token.access_token),
            },
            status=status.HTTP_201_CREATED,
        )

        response.set_cookie(
            key="refresh_token",
            value=str(refresh_token),
            httponly=True,
            secure=not settings.DEBUG,
            samesite="None",
            max_age=7 * 24 * 60 * 60,
        )

        return response
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = authenticate(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )

        if user:
            refresh_token = RefreshToken.for_user(user)
            response = Response(
                {
                    "user": UserSerializer(user).data,
                    "access": str(refresh_token.access_token),
                },
                status=status.HTTP_200_OK,
            )
            response.set_cookie(
                key="refresh_token",
                value=str(refresh_token),
                httponly=True,
                secure=not settings.DEBUG,
                samesite="None",
            )

            return response
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_401_BAD_REQUEST
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def profile(request):
    profile_obj = Profile.objects.get(user=request.user)

    if request.method == "GET":
        serializer = ProfileSerializer(profile_obj, context={"request": request})
        return Response(serializer.data)
    elif request.method == "PATCH":
        serializer = ProfileSerializer(
            profile_obj, data=request.data, partial=True, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_fcm_token(request):
    fcm_token = request.data.get("fcm_token")

    if not fcm_token:
        return Response(
            {"error": "fcm_token is required"}, status=status.HTTP_400_BAD_REQUEST
        )
    AccountService.update_fcm_token(request.user, fcm_token)
    return Response({"message": "FCM token updated successfully"})


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def addresses(request):
    if request.method == "GET":
        addresses = AccountService.get_user_addresses(request.user)
        return Response(AddressSerializer(addresses, many=True).data)
    elif request.method == "POST":
        serializer = AddressSerializer(request.data)
        if serializer.is_valid():
            address = AccountService.create_address(
                request.user, **serializer.validated_data
            )

            return Response(
                AddressSerializer(address).data, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def address_details(request, address_id):
    try:
        if request.method == "GET":
            address = AccountService.get_address(request.user, address_id)
            return Response(AddressSerializer(address).data)
        elif request.method in ["PUT", "PATCH"]:
            serializer = AddressSerializer(
                data=request.data, partial=(request.method == "PATCH")
            )

            if serializer.is_valid():
                address = AccountService.update_address(
                    request.user, address_id, **serializer.validated_data
                )
                return Response(AddressSerializer(address).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        elif request.method == "DELETE":
            AccountService.delete_address(request.user, address_id)
            return Response(status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def set_default_address(request, address_id):
    try:
        address = AccountService.set_default_address(request.user, address_id)
        return Response(AddressSerializer(address).data)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
