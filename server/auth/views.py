from email.policy import default

from decouple import config
from django.contrib.sites.shortcuts import get_current_site
from django.core.exceptions import ObjectDoesNotExist
from django.core.mail import send_mail
from django.shortcuts import render, redirect
from rest_framework.authtoken.admin import User
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, update_session_auth_hash

from system.rate_limiter.login.limiter import rate_limit_login
from .serializers import RegisterSerializer
from .utils import password_reset_token, email_activation_token
from logs.logger import logger


# Create your views here.
class RegisterView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                user.is_active = False
                user.save()

                token = email_activation_token.make_token(user)
                uid = user.pk
                domain = get_current_site(request).domain
                activation_link = f"http://{domain}/api/auth/activate/{uid}/{token}/"

                send_mail(
                    subject="Activate your account",
                    message=f"Hi {user.username}, click the link to activate your account: {activation_link}",
                    from_email="noreply@example.com",
                    recipient_list=[user.email],
                )

                logger.info(f"New user registered: {user.username}, activation email sent to {user.email}")

                return Response(
                    {"msg": "User registered. Check your email to activate account."},
                    status=status.HTTP_201_CREATED,
                )
            except Exception as e:
                logger.error(f"Error during registration for data={request.data}. Exception: {str(e)}", exc_info=True)
                return Response(
                    {"error": "Something went wrong during registration."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        else:
            logger.warning(f"User registration failed. Errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ActivateAccountView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, uid, token):
        try:
            user = User.objects.get(pk=uid)
        except User.DoesNotExist:
            return Response({"error": "Invalid user"}, status=status.HTTP_400_BAD_REQUEST)

        if email_activation_token.check_token(user, token):
            user.is_active = True
            user.save()

            # Redirect to frontend login page
            login_url = config("NEXT_PUBLIC_FRONTEND_BASE_URL", default="http://192.168.68.137:3000") + "/auth/login/"
            return redirect(login_url)

            return Response({"msg": "Account activated successfully. You can now log in."})
        else:
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)



class LoginView(APIView):
    permission_classes = (AllowAny,)

    @rate_limit_login(ip_limit=5, user_limit=5)
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({"token": token.key, "msg": "Login successful"})
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        Token.objects.filter(user=user).delete()
        return Response({"msg": "Logged out successfully"}, status=status.HTTP_200_OK)


class RequestPasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        redirect_url = request.data.get("redirect_url")

        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except ObjectDoesNotExist:
            return Response({"error": "No user with this email"}, status=status.HTTP_404_NOT_FOUND)

        token = password_reset_token.make_token(user)
        uid = user.pk
        domain = get_current_site(request).domain
        reset_link = f"{redirect_url}/auth/password-reset-confirm/{uid}/{token}/"

        # Email contains link + token and uid info
        message = (
            f"Click the link to reset your password:\n{reset_link}\n\n"
            f"Use the following details:\n"
            f"UID: {uid}\n"
            f"Token: {token}\n"
        )

        send_mail(
            subject="Password Reset Request",
            message=message,
            from_email="noreply@example.com",
            recipient_list=[user.email],
        )

        return Response({"message": "Password reset link sent to your email."}, status=status.HTTP_200_OK)


class ConfirmPasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uid = request.data.get("uid")
        token = request.data.get("token")
        password = request.data.get("password")
        confirm_password = request.data.get("confirm_password")

        if not all([uid, token, password, confirm_password]):
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        if password != confirm_password:
            return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(pk=uid)
        except User.DoesNotExist:
            return Response({"error": "Invalid user ID"}, status=status.HTTP_404_NOT_FOUND)

        if not password_reset_token.check_token(user, token):
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.save()

        return Response({"msg": "Password has been reset successfully"}, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        confirm_new_password = request.data.get("confirm_new_password")

        if not user.check_password(old_password):
            return Response({"error": "Old password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_new_password:
            return Response({"error": "New passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({"msg": "Password changed successfully"}, status=status.HTTP_200_OK)


class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        password = request.data.get("password")

        if not password:
            return Response({"detail": "Password is required."}, status=400)

        user = request.user

        if not user.check_password(password):
            return Response({"detail": "Incorrect password."}, status=400)

        user.delete()
        return Response({"detail": "Account deleted successfully."}, status=204)
