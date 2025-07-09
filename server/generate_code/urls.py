from django.urls import path
from .views import GenerateCodeView

urlpatterns = [
    path('index/', GenerateCodeView.as_view(), name='index'),
]
