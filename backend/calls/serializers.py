from typing import ClassVar

from rest_framework import serializers

from .models import Call, CallTask


class CallSerializer(serializers.ModelSerializer):
    class Meta:
        model = Call
        fields = "__all__"
        extra_kwargs: ClassVar[dict] = {
            "created_by": {"required": False},
            "modified_by": {"required": False},
        }

    def current_user(self):
        request = self.context.get("request")
        has_user = request and hasattr(request, "user")
        username = request.user.username if has_user else None
        return username if username else "demo"

    def create(self, validated_data):
        username = self.current_user()
        validated_data["created_by"] = username
        validated_data["modified_by"] = username
        return super().create(validated_data)

    def update(self, instance, validated_data):
        username = self.current_user()
        validated_data["modified_by"] = username
        return super().update(instance, validated_data)


class CallTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = CallTask
        fields = "__all__"
