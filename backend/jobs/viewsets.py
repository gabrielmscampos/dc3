import logging
import os
import uuid
from typing import ClassVar

from django.conf import settings
from django.http import HttpResponseBadRequest
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
    run_acc_lumi_htcondor_task,
    run_acc_lumi_task,
    run_full_certification_htcondor_task,
    run_full_certification_task,
    run_full_lumi_analysis_htcondor_task,
    run_full_lumi_analysis_task,
    run_json_production_htcondor_task,
    run_json_production_task,
    run_lumiloss_htcondor_task,
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
        results_dir = os.path.join(settings.BASE_LOCAL_RESULTS_DIR, "jobs", job_id)
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
        if not request.data.get("run_list"):
            raise HttpResponseBadRequest("cycles or min_run/max_run should be specified.")

        run_list = request.data.get("run_list")
        task_function = run_json_production_htcondor_task if len(run_list) > 150 else run_json_production_task
        task = self.__schedule_generic_task(task_function=task_function, task_input=request.data)
        return Response({"task_id": task.id, "status": task.status})

    @action(detail=False, methods=["POST"], url_path=r"run-lumiloss")
    def run_lumiloss(self, request, pk=None):
        included_runs = request.data.get("included_runs")
        not_in_dcs_runs = request.data.get("not_in_dcs_runs", [])
        low_lumi_runs = request.data.get("low_lumi_runs", [])
        ignore_runs = request.data.get("ignore_runs", [])
        if not included_runs:
            raise HttpResponseBadRequest("included_runs should be specified.")

        all_runs = [*included_runs, *not_in_dcs_runs, *low_lumi_runs, *ignore_runs]
        task_function = run_lumiloss_htcondor_task if len(all_runs) > 150 else run_lumiloss_task
        task = self.__schedule_generic_task(task_function=task_function, task_input=request.data)
        return Response({"task_id": task.id, "status": task.status})

    @action(detail=False, methods=["POST"], url_path=r"run-full-lumi-analysis")
    def run_full_lumi_analysis(self, request, pk=None):
        included_runs = request.data.get("included_runs")
        not_in_dcs_runs = request.data.get("not_in_dcs_runs", [])
        low_lumi_runs = request.data.get("low_lumi_runs", [])
        ignore_runs = request.data.get("ignore_runs", [])
        if not included_runs:
            raise HttpResponseBadRequest("included_runs should be specified.")

        all_runs = [*included_runs, *not_in_dcs_runs, *low_lumi_runs, *ignore_runs]
        task_function = run_full_lumi_analysis_htcondor_task if len(all_runs) > 150 else run_full_lumi_analysis_task
        task = self.__schedule_generic_task(task_function=task_function, task_input=request.data)
        return Response({"task_id": task.id, "status": task.status})

    @action(detail=False, methods=["POST"], url_path=r"run-acc-lumi")
    def run_acc_lumi(self, request, pk=None):
        if not request.data.get("run_list"):
            raise HttpResponseBadRequest("cycles or min_run/max_run should be specified.")

        run_list = request.data.get("run_list")
        task_function = run_acc_lumi_htcondor_task if len(run_list) > 150 else run_acc_lumi_task
        task = self.__schedule_generic_task(task_function=task_function, task_input=request.data)
        return Response({"task_id": task.id, "status": task.status})

    @action(detail=False, methods=["POST"], url_path=r"run-full-certification")
    def run_full_certification(self, request, pk=None):
        if request.data.get("cycles"):
            cycles = request.data.get("cycles")
            task_function = run_full_certification_htcondor_task if len(cycles) > 10 else run_full_certification_task
        elif request.data.get("min_run") and request.data.get("max_run"):
            n_runs_max = request.data.get("max_run") - request.data.get("min_run")
            task_function = run_full_certification_htcondor_task if n_runs_max > 150 else run_full_certification_task
        else:
            raise HttpResponseBadRequest("cycles or min_run/max_run should be specified.")

        task = self.__schedule_generic_task(task_function=task_function, task_input=request.data)
        return Response({"task_id": task.id, "status": task.status})
