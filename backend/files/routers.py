from rest_framework import routers

from .viewsets import FileViewSet


router = routers.SimpleRouter()
router.register(r"files", FileViewSet, basename="files")
