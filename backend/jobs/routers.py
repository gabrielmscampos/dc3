from rest_framework import routers

from .viewsets import JobsViewSet


router = routers.SimpleRouter()
router.register(r"jobs", JobsViewSet, basename="jobs")
