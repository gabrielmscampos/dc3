from django.conf import settings
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from utils.rest_framework_cern_sso.authentication import (
    CERNKeycloakPublicAuthentication,
)
from utils.rest_framework_cern_sso.user import CERNKeycloakUser

from .serializers import (
    ExchangedTokenSerializer,
)


class AuthViewSet(ViewSet):
    @action(
        detail=False,
        methods=["post"],
        name="Exchange public access token to confidential access_token",
        url_path=r"exchange-token",
        authentication_classes=[CERNKeycloakPublicAuthentication],
    )
    def exchange_token(self, request: Request):
        # This user authenticated trough the CERNKeycloakPublicAuthentication
        # already carries the public access token (subject_token) in the user object
        # so we don't need to ask a subject token trough the request body
        user: CERNKeycloakUser = request.user
        subject_token = user.token.access_token
        print(subject_token)
        confidential_token = user.token.client.exchange_token(subject_token, settings.KEYCLOAK_CONFIDENTIAL_CLIENT_ID)
        print(confidential_token)
        payload = ExchangedTokenSerializer(confidential_token).data
        return Response(payload)
