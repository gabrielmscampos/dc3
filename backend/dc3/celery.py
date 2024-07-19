import os

from celery import Celery


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dc3.settings")
app = Celery("dc3", broker_connection_reatry_on_startup=True)
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
