from django.urls import path

from auth.views import RegisterView, LoginView, LogoutView, RequestPasswordResetView, ConfirmPasswordResetView, \
    ActivateAccountView, ChangePasswordView, DeleteAccountView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('activate/<int:uid>/<str:token>/', ActivateAccountView.as_view(), name='activate'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('password-reset/', RequestPasswordResetView.as_view(), name='password_reset'),
    path('password-reset-confirm/', ConfirmPasswordResetView.as_view(), name='password_reset_confirm'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path("delete-account/", DeleteAccountView.as_view(), name="delete_account"),
]
