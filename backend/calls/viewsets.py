import logging
from typing import ClassVar

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from .filters import CallTaskFilter
from .models import Call, CallStatus, CallTask
from .serializers import CallSerializer, CallTaskSerializer
from .tasks import close_call, discover_runs, generate_lumiloss_plots, setup_call


logger = logging.getLogger(__name__)


class CallsViewSet(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    unauthenticated_user = "demo"
    queryset = Call.objects.all().order_by("-call_id")
    serializer_class = CallSerializer

    def current_user(self):
        has_user = self.request and hasattr(self.request, "user")
        username = self.request.user.username if has_user else None
        return username if username else "demo"

    def raise_if_closed(self, from_obj: bool = True, pk=None):
        call = self.get_object() if from_obj else Call.objects.get(pk=pk)
        if call.status == CallStatus.CLOSED:
            raise ValidationError("Operation blocked, call is CLOSED.")
        return call

    def perform_create(self, serializer):
        instance = serializer.save()
        task_function = setup_call
        task_function.apply_async(
            args=[instance.call_id],
            task_name=task_function.__name__,
            call_id=instance.call_id,
            username=self.current_user(),
        )

    def perform_update(self, serializer):
        initial_instance = self.raise_if_closed()
        updated_instance = serializer.save()
        if initial_instance.status != CallStatus.CLOSED and updated_instance.status == CallStatus.CLOSED:
            task_function = close_call
            task_function.apply_async(
                args=[updated_instance.call_id],
                task_name=task_function.__name__,
                call_id=updated_instance.call_id,
                username=self.current_user(),
            )

    @action(detail=False, methods=["POST"], url_path=r"discover-runs")
    def discover_runs(self, request):
        call_id = request.data.get("call_id")

        self.raise_if_closed(from_obj=False, pk=call_id)
        task_function = discover_runs
        task = task_function.apply_async(
            args=[call_id], task_name=task_function.__name__, call_id=call_id, username=self.current_user()
        )
        return Response({"task_id": task.id, "status": task.status})

    @action(detail=False, methods=["POST"], url_path=r"generate-lumiloss-plots")
    def generate_lumiloss_plots(self, request):
        call_id = request.data.get("call_id")
        mode = request.data.get("mode")
        remove_runs = request.data.get("remove_runs", [])

        self.raise_if_closed(from_obj=False, pk=call_id)
        task_function = generate_lumiloss_plots
        task = task_function.apply_async(
            args=[call_id, mode, remove_runs],
            task_name=task_function.__name__,
            call_id=call_id,
            username=self.current_user(),
        )
        return Response({"task_id": task.id, "status": task.status})


class CallsTasksViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = CallTask.objects.all().order_by("id")
    serializer_class = CallTaskSerializer
    filterset_class = CallTaskFilter
    filter_backends: ClassVar[list[DjangoFilterBackend]] = [DjangoFilterBackend]
