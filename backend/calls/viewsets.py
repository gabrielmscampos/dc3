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

from .filters import CallJobsFilter
from .models import Call, CallJob
from .serializers import CallJobSerializer, CallSerializer
from .tasks import certify_call_task, discover_runs_task
from .utils import block_if_closed


logger = logging.getLogger(__name__)


class CallsViewSet(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Call.objects.all().order_by("-call_id")
    serializer_class = CallSerializer
    authentication_classes: ClassVar[list[BaseAuthentication]] = [
        CERNKeycloakConfidentialAuthentication,
    ]

    @staticmethod
    def __schedule_generic_task(
        task_function,
        task_input,
        call_id,
        call_name,
    ):
        job_id = str(uuid.uuid4())
        results_dir = os.path.join(settings.BASE_LOCAL_RESULTS_DIR, "calls", call_name, job_id)
        os.makedirs(results_dir, exist_ok=True)

        # Store job
        job = CallJob.objects.create(
            id=job_id,
            call_id=call_id,
            name=task_function.__name__,
            params=task_input,
            results_dir=results_dir,
        )

        # Schedule task
        _ = task_function.delay(job_id)

        return job

    @block_if_closed
    def perform_update(self, call: Call, serializer):
        serializer.save()

    @action(detail=True, methods=["POST"], url_path=r"discover-runs")
    @block_if_closed
    def discover_runs(self, call: Call, request, pk=None):
        task = self.__schedule_generic_task(
            task_function=discover_runs_task, task_input=request.data, call_id=call.call_id, call_name=call.call_name
        )
        return Response({"task_id": task.id, "status": task.status})

    @action(detail=True, methods=["POST"], url_path=r"certify-call")
    @block_if_closed
    def certify_call(self, call: Call, request, pk=None):
        task = self.__schedule_generic_task(
            task_function=certify_call_task,
            task_input=request.data,
            call_id=call.call_id,
            call_name=call.call_name,
        )
        return Response({"task_id": task.id, "status": task.status})


class CallJobsViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = CallJob.objects.all().order_by("-created_at")
    serializer_class = CallJobSerializer
    filterset_class = CallJobsFilter
    filter_backends: ClassVar[list[DjangoFilterBackend]] = [DjangoFilterBackend]
