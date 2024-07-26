from rest_framework import serializers


class ExchangedTokenSerializer(serializers.Serializer):
    access_token = serializers.CharField()
    expires_in = serializers.IntegerField()
    refresh_expires_in = serializers.IntegerField()
    refresh_token = serializers.CharField()
    token_type = serializers.CharField()
    id_token = serializers.CharField()
    session_state = serializers.CharField()
    scope = serializers.CharField()
