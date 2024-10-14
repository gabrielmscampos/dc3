import logging
import os
import uuid
from typing import ClassVar

from django.conf import settings
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import mixins, viewsets
from rest_framework.authentication import BaseAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response
from utils.rest_framework_cern_sso.authentication import (
    CERNKeycloakConfidentialAuthentication,
)

from .filters import JobFilter
from .models import Job
from .serializers import JobSerializer
from .tasks import (
    run_acc_lumi_task,
    run_full_certification_task,
    run_full_lumi_analysis_task,
    run_json_production_task,
    run_lumiloss_task,
)


logger = logging.getLogger(__name__)


class JobsViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Job.objects.all().order_by("-created_at")
    filterset_class = JobFilter
    serializer_class = JobSerializer
    filter_backends: ClassVar[list[DjangoFilterBackend]] = [DjangoFilterBackend]
    authentication_classes: ClassVar[list[BaseAuthentication]] = [
        CERNKeycloakConfidentialAuthentication,
    ]

    def current_user(self):
        has_user = self.request and hasattr(self.request, "user")
        username = self.request.user.username if has_user else None
        return username if username else settings.UNAUTHENTICATED_USER

    def __schedule_generic_task(self, task_function, task_input):
        job_id = str(uuid.uuid4())
        job_name = task_input.pop("job_name")
        results_dir = os.path.join(settings.BASE_RESULTS_DIR, "jobs", job_id)
        os.makedirs(results_dir, exist_ok=True)

        # Store job
        job = Job.objects.create(
            id=job_id,
            name=job_name,
            action=task_function.__name__,
            params=task_input,
            created_by=self.current_user(),
            results_dir=results_dir,
        )

        # Schedule task
        _ = task_function.delay(job_id)

        return job

    @action(detail=False, methods=["POST"], url_path=r"run-json-production")
    def run_json_production(self, request, pk=None):
        task = self.__schedule_generic_task(task_function=run_json_production_task, task_input=request.data)
        return Response({"task_id": task.id, "status": task.status})

    @action(detail=False, methods=["POST"], url_path=r"run-lumiloss")
    def run_lumiloss(self, request, pk=None):
        task = self.__schedule_generic_task(task_function=run_lumiloss_task, task_input=request.data)
        return Response({"task_id": task.id, "status": task.status})

    @action(detail=False, methods=["POST"], url_path=r"run-full-lumi-analysis")
    def run_full_lumi_analysis(self, request, pk=None):
        task = self.__schedule_generic_task(task_function=run_full_lumi_analysis_task, task_input=request.data)
        return Response({"task_id": task.id, "status": task.status})

    @action(detail=False, methods=["POST"], url_path=r"run-acc-lumi")
    def run_acc_lumi(self, request, pk=None):
        task = self.__schedule_generic_task(task_function=run_acc_lumi_task, task_input=request.data)
        return Response({"task_id": task.id, "status": task.status})

    @action(detail=False, methods=["POST"], url_path=r"run-full-certification")
    def run_full_certification(self, request, pk=None):
        task = self.__schedule_generic_task(task_function=run_full_certification_task, task_input=request.data)
        return Response({"task_id": task.id, "status": task.status})
