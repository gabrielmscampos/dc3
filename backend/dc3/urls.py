from calls.routers import router as calls_router
from django.urls import include, path
from files.routers import router as files_router
from rest_framework import routers


router = routers.DefaultRouter()
router.registry.extend(calls_router.registry)
router.registry.extend(files_router.registry)

urlpatterns = [
    path(r"api/v1/", include(router.urls), name="api-v1"),
]
