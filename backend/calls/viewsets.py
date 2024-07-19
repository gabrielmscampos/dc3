import logging

from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Call, CallStatus
from .serializers import CallSerializer
from .tasks import clean_call_space, discover_call_runs, generate_lumiloss_plots, setup_call


logger = logging.getLogger(__name__)


class CallsViewSet(mixins.CreateModelMixin, mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Call.objects.all().order_by("call_id")
    serializer_class = CallSerializer

    def perform_create(self, serializer):
        """
        This will be executed when a POST request
        successfully add a new call to the database
        """
        instance = serializer.save()
        setup_call.apply_async(args=[instance.call_id])

    @action(detail=False, methods=["POST"], url_path=r"discover-runs")
    def discover_runs(self, request):
        call_id = request.data.get("call_id")

        task = discover_call_runs.apply_async(args=[call_id])
        return Response({"task_id": task.id, "status": task.status})

    @action(detail=False, methods=["POST"], url_path=r"generate-lumiloss-plots")
    def generate_lumiloss_plots(self, request):
        call_id = request.data.get("call_id")
        mode = request.data.get("mode")
        remove_runs = request.data.get("remove_runs", [])

        task = generate_lumiloss_plots.apply_async(args=[call_id, mode, remove_runs])
        return Response({"task_id": task.id, "status": task.status})

    @action(detail=False, methods=["POST"], url_path=r"close")
    def close_call(self, request):
        call_id = request.data.get("call_id")

        call = Call.objects.get(pk=call_id)
        call.status = CallStatus.CLOSED
        call.save()

        task = clean_call_space.apply_async(args=[call_id])
        return Response({"task_id": task.id, "status": task.status})
