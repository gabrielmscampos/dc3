#!/bin/sh

export "DJANGO_DEBUG=1"
export "DJANGO_ALLOWED_HOSTS=dummy"
export "DJANGO_CSRF_TRUSTED_ORIGINS=dummy"
export "DJANGO_CORS_ALLOWED_ORIGINS=dummy"
export "DJANGO_SECRET_KEY=dummy"
export "DJANGO_DATABASE_URI=postgres://dummy:dummy@localhost:5432"
export "DJANGO_CELERY_BROKER_URL=dummy"
export "DJANGO_CELERY_RESULT_BACKEND=dummy"
export "DJANGO_KEYCLOAK_SERVER_URL=dummy"
export "DJANGO_KEYCLOAK_REALM=dummy"
export "DJANGO_KEYCLOAK_PUBLIC_CLIENT_ID=dummy"
export "DJANGO_KEYCLOAK_CONFIDENTIAL_CLIENT_ID=dummy"
export "DJANGO_KEYCLOAK_CONFIDENTIAL_SECRET_KEY=dummy"
export "DJANGO_KEYTAB_USR=dummy"
export "DJANGO_KEYTAB_PWD=dummy"
export "DJANGO_RR_SSO_CLIENT_SECRET=dummy"
export "DJANGO_RR_SSO_CLIENT_ID=dummy"
export "DJANGO_CERT_FPATH=dummy"
export "DJANGO_KEY_FPATH=dummy"
export "DJANGO_BASE_LOCAL_RESULTS_DIR=dummy"
export "DJANGO_CONDOR_CERT_FPATH=dummy"
export "DJANGO_CONDOR_KEY_FPATH=dummy"
export "DJANGO_BASE_CONDOR_WORK_DIR=dummy"
export "DJANGO_BASE_CONDOR_RESULTS_DIR=dummy"

python manage.py collectstatic --noinput
