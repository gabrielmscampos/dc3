from rest_framework import routers

from .viewsets import CallJobsViewSet, CallsViewSet


router = routers.SimpleRouter()
router.register(r"calls", CallsViewSet, basename="calls")
router.register(r"call-jobs", CallJobsViewSet, basename="call-jobs")
