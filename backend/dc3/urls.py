from calls.routers import router as calls_router
from cern_auth.routers import router as cern_auth_router
from django.urls import include, path
from files.routers import router as files_router
from jobs.routers import router as jobs_router
from rest_framework import routers


router = routers.DefaultRouter()
router.registry.extend(cern_auth_router.registry)
router.registry.extend(calls_router.registry)
router.registry.extend(files_router.registry)
router.registry.extend(jobs_router.registry)

urlpatterns = [
    path(r"api/v1/", include(router.urls), name="api-v1"),
]
