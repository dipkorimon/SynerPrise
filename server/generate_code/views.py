from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


# Create your views here.
class GenerateCodeView(APIView):
    permission_classes = (AllowAny,)

    # Only for testing purpose, model will add soon
    def get(self, request):
        return Response({"msg": "Okay"}, status=status.HTTP_200_OK)
