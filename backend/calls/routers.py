from rest_framework import routers

from .viewsets import CallsViewSet


router = routers.SimpleRouter()
router.register(r"calls", CallsViewSet, basename="calls")
