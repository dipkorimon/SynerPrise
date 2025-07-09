from django.urls import path

from users.views import UserInfoView

urlpatterns = [
    path('user-info/', UserInfoView.as_view(), name='user-info'),
]
