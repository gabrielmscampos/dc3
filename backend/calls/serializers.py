from rest_framework import serializers

from .models import Call, CallJob


class CallSerializer(serializers.ModelSerializer):
    class Meta:
        model = Call
        fields = "__all__"


class CallJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = CallJob
        fields = "__all__"
