from rest_framework import routers

from .viewsets import CallsTasksViewSet, CallsViewSet


router = routers.SimpleRouter()
router.register(r"calls", CallsViewSet, basename="calls")
router.register(r"calls-tasks", CallsTasksViewSet, basename="calls-tasks")
