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
from .utils import password_reset_token, email_activation_token, username_bloom, email_bloom
from logs.logger import logger


# Create your views here.
class RegisterView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            username = request.data.get("username")
            email = request.data.get("email")

            # Username Bloom Filter + DB check
            if username in username_bloom:
                if User.objects.filter(username=username).exists():
                    logger.warning(f"Username {username} already exists in DB")
                    return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

            # Email Bloom Filter + DB check
            if email in email_bloom:
                if User.objects.filter(email=email).exists():
                    logger.warning(f"Email {email} already exists in DB")
                    return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                user = serializer.save()
                user.is_active = False
                user.save()

                # Add username & email to Bloom Filters after successful creation
                username_bloom.add(user.username)
                email_bloom.add(user.email)

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
            logger.warning(f"Activation attempt failed: User with uid={uid} not found.")
            return Response({"error": "Invalid user"}, status=status.HTTP_400_BAD_REQUEST)

        if email_activation_token.check_token(user, token):
            user.is_active = True
            user.save()
            logger.info(f"Account activated for user: {user.username} (id={uid})")

            login_url = config("NEXT_PUBLIC_FRONTEND_BASE_URL", default="http://192.168.68.137:3000") + "/auth/login/"
            return redirect(login_url)

        else:
            logger.warning(f"Invalid or expired activation token for uid={uid}, user={user.username}")
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = (AllowAny,)

    @rate_limit_login(ip_limit=5, user_limit=5)
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        # Bloom Filter Pre-check
        if username not in username_bloom:
            logger.warning(f"Bloom Filter early reject: username {username} likely does not exist")
            return Response({"error": "Invalid credentials from bloom"}, status=status.HTTP_401_UNAUTHORIZED)

        # Authenticate normally
        user = authenticate(username=username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            logger.info(f"Login successful for user: {username}")
            return Response({"token": token.key, "msg": "Login successful"})

        logger.warning(f"Failed login attempt for username: {username}")
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        Token.objects.filter(user=user).delete()
        logger.info(f"User logged out: {user.username}")
        return Response({"msg": "Logged out successfully"}, status=status.HTTP_200_OK)


class RequestPasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        redirect_url = request.data.get("redirect_url")

        if not email:
            logger.warning("Password reset requested without providing email.")
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Bloom Filter pre-check
        if email not in username_bloom:
            logger.warning(f"Password reset requested: Bloom Filter early reject for {email}")
            return Response({"error": "No user with this email"}, status=status.HTTP_404_NOT_FOUND)

        # DB final verification
        try:
            user = User.objects.get(email=email)
        except ObjectDoesNotExist:
            logger.warning(f"Password reset requested for non-existent email: {email}")
            return Response({"error": "No user with this email"}, status=status.HTTP_404_NOT_FOUND)

        token = password_reset_token.make_token(user)
        uid = user.pk
        domain = get_current_site(request).domain
        reset_link = f"{redirect_url}/auth/password-reset-confirm/{uid}/{token}/"

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

        logger.info(f"Password reset link sent to {email}")

        return Response({"message": "Password reset link sent to your email."}, status=status.HTTP_200_OK)


class ConfirmPasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uid = request.data.get("uid")
        token = request.data.get("token")
        password = request.data.get("password")
        confirm_password = request.data.get("confirm_password")

        if not all([uid, token, password, confirm_password]):
            logger.warning("Password reset confirmation failed: Missing fields.")
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        if password != confirm_password:
            logger.warning(f"Password reset confirmation failed: Password mismatch for uid={uid}")
            return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(pk=uid)
        except User.DoesNotExist:
            logger.warning(f"Password reset confirmation failed: Invalid user ID {uid}")
            return Response({"error": "Invalid user ID"}, status=status.HTTP_404_NOT_FOUND)

        if not password_reset_token.check_token(user, token):
            logger.warning(f"Password reset confirmation failed: Invalid or expired token for user {user.username}")
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.save()

        logger.info(f"Password reset successfully completed for user: {user.username}")
        return Response({"msg": "Password has been reset successfully"}, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        confirm_new_password = request.data.get("confirm_new_password")

        if not user.check_password(old_password):
            logger.warning(f"Password change failed: Incorrect old password for user {user.username}")
            return Response({"error": "Old password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_new_password:
            logger.warning(f"Password change failed: New passwords do not match for user {user.username}")
            return Response({"error": "New passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        logger.info(f"Password changed successfully for user {user.username}")

        return Response({"msg": "Password changed successfully"}, status=status.HTTP_200_OK)


class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        password = request.data.get("password")

        if not password:
            logger.warning(f"Account deletion failed: No password provided by user {request.user.username}")
            return Response({"detail": "Password is required."}, status=400)

        user = request.user

        if not user.check_password(password):
            logger.warning(f"Account deletion failed: Incorrect password for user {user.username}")
            return Response({"detail": "Incorrect password."}, status=400)

        username = user.username
        user.delete()
        logger.info(f"Account deleted successfully for user: {username}")

        return Response({"detail": "Account deleted successfully."}, status=204)
