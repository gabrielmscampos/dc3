from drf_spectacular.extensions import OpenApiAuthenticationExtension


class CERNKeycloakPublicAuthenticationScheme(OpenApiAuthenticationExtension):
    target_class = "utils.rest_framework_cern_sso.authentication.CERNKeycloakPublicAuthentication"
    name = "Public JWT Token"

    def get_security_definition(self, auto_schema):
        return {
            "type": "http",
            "scheme": "Bearer",
            "bearerFormat": "JWT",
            "in": "header",
            "name": "Authorization",
            "description": "CERN's Keycloak public client authentication",
        }


class CERNKeycloakConfidentialAuthenticationScheme(OpenApiAuthenticationExtension):
    target_class = "utils.rest_framework_cern_sso.authentication.CERNKeycloakConfidentialAuthentication"
    name = "Confidential JWT Token"

    def get_security_definition(self, auto_schema):
        return {
            "type": "http",
            "scheme": "Bearer",
            "bearerFormat": "JWT",
            "in": "header",
            "name": "Authorization",
            "description": "CERN's Keycloak confidential client authentication",
        }
