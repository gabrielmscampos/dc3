import os.path
from pathlib import Path

import dj_database_url
from corsheaders.defaults import default_headers
from decouple import config
from libdc3.config import dc3_config


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config("DJANGO_SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = bool(config("DJANGO_DEBUG", cast=int, default=0))  # 0 is False

# A list of strings representing the host/domain names that this Django site can serve
ALLOWED_HOSTS = config("DJANGO_ALLOWED_HOSTS", default="").split(" ")

# A list of trusted origins for unsafe requests (e.g. POST).
CSRF_TRUSTED_ORIGINS = config("DJANGO_CSRF_TRUSTED_ORIGINS", default="").split(" ")

# Cors
CORS_ALLOW_ALL_ORIGINS = False  # If this is True then `CORS_ALLOWED_ORIGINS` will not have any effect

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = config("DJANGO_CORS_ALLOWED_ORIGINS", default="").split(" ")

CORS_ALLOW_HEADERS = [*default_headers]

# Application definition
INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "calls.apps.CallsConfig",
    "jobs.apps.JobsConfig",
    "files.apps.FilesConfig",
    "cern_auth.apps.CERNAuthConfig",
]

# Django Rest Framework (DRF) configuration
REST_FRAMEWORK = {
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 10,
}

# A list of middleware (framework of hooks into Django's request/response processing) to use
MIDDLEWARE = [
    "debreach.middleware.RandomCommentMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django_permissions_policy.PermissionsPolicyMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "csp.middleware.CSPMiddleware",
]

# A string representing the full Python import path to your root URLconf
ROOT_URLCONF = "dc3.urls"

# A list containing the settings for all template engines to be used with Django
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
            ],
        },
    },
]

# Indicate entrypoint for starting WSGI server
WSGI_APPLICATION = "dc3.wsgi.application"

# Database
DB_SERVER_URI = config("DJANGO_DATABASE_URI")
DATABASES = {"default": dj_database_url.config(default=DB_SERVER_URI)}

# Password validation
AUTH_PASSWORD_VALIDATORS = []

# Internationalization
LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Logging
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"level": "DEBUG" if DEBUG else "WARNING", "class": "logging.StreamHandler", "formatter": "standard"}
    },
    "formatters": {
        "standard": {
            "format": "{levelname} - {asctime} - {module} - {message}",
            "style": "{",
        },
    },
    "loggers": {
        "root": {"handlers": ["console"], "level": "DEBUG" if DEBUG else "WARNING", "propagate": False},
    },
}

# Static files
STATIC_URL = "static/"

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Keycloak OIDC config
KEYCLOAK_SERVER_URL = config("DJANGO_KEYCLOAK_SERVER_URL")
KEYCLOAK_REALM = config("DJANGO_KEYCLOAK_REALM")
KEYCLOAK_CONFIDENTIAL_CLIENT_ID = config("DJANGO_KEYCLOAK_CONFIDENTIAL_CLIENT_ID")
KEYCLOAK_CONFIDENTIAL_SECRET_KEY = config("DJANGO_KEYCLOAK_CONFIDENTIAL_SECRET_KEY")
KEYCLOAK_PUBLIC_CLIENT_ID = config("DJANGO_KEYCLOAK_PUBLIC_CLIENT_ID")

# All available policies are listed at:
# https://github.com/w3c/webappsec-permissions-policy/blob/main/features.md
# Empty list means the policy is disabled
PERMISSIONS_POLICY = {
    "accelerometer": [],
    "camera": [],
    "display-capture": [],
    "encrypted-media": [],
    "geolocation": [],
    "gyroscope": [],
    "magnetometer": [],
    "microphone": [],
    "midi": [],
    "payment": [],
    "usb": [],
    "xr-spatial-tracking": [],
}

# Django-CSP
CSP_INCLUDE_NONCE_IN = ["script-src", "connect-src", "style-src", "font-src", "img-src"]
CSP_SCRIPT_SRC = [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
] + [f"*{host}" if host.startswith(".") else host for host in ALLOWED_HOSTS]
CSP_CONNECT_SRC = [
    "'self'",
] + [f"*{host}" if host.startswith(".") else host for host in ALLOWED_HOSTS]
CSP_STYLE_SRC = [
    "'self'",
    "'unsafe-inline'",
]
CSP_FONT_SRC = [
    "'self'",
    "'unsafe-inline'",
] + [f"*{host}" if host.startswith(".") else host for host in ALLOWED_HOSTS]
CSP_IMG_SRC = [
    "'self'",
    "data:",
]

# Celery
CELERY_BROKER_URL = config("DJANGO_CELERY_BROKER_URL")
CELERY_RESULT_BACKEND = config("DJANGO_CELERY_RESULT_BACKEND")
CELERY_TASK_TRACK_STARTED = True
CELERY_BROKER_TRANSPORT_OPTIONS = {"visibility_timeout": 900}

# Task
UNAUTHENTICATED_USER = "unknown-user"
BASE_LOCAL_RESULTS_DIR = config("DJANGO_BASE_LOCAL_RESULTS_DIR")
BASE_CONDOR_WORK_DIR = config("DJANGO_BASE_CONDOR_WORK_DIR")
BASE_CONDOR_RESULTS_DIR = config("DJANGO_BASE_CONDOR_RESULTS_DIR")
KEYTAB_USR = config("DJANGO_KEYTAB_USR")
KEYTAB_PWD = config("DJANGO_KEYTAB_PWD")
CERT_FPATH = config("DJANGO_CERT_FPATH")
KEY_FPATH = config("DJANGO_KEY_FPATH")
CONDOR_CERT_FPATH = config("DJANGO_CONDOR_CERT_FPATH")
CONDOR_KEY_FPATH = config("DJANGO_CONDOR_KEY_FPATH")
RR_SSO_CLIENT_ID = config("DJANGO_RR_SSO_CLIENT_ID")
RR_SSO_CLIENT_SECRET = config("DJANGO_RR_SSO_CLIENT_SECRET")

# Config RR api client
os.environ["SSO_CLIENT_ID"] = RR_SSO_CLIENT_ID
os.environ["SSO_CLIENT_SECRET"] = RR_SSO_CLIENT_SECRET

# Config libdc3
dc3_config.set_keytab_usr(KEYTAB_USR)
dc3_config.set_keytab_pwd(KEYTAB_PWD)
dc3_config.set_auth_cert_path(CERT_FPATH)
dc3_config.set_auth_key_path(KEY_FPATH)
