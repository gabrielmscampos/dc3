import traceback

from celery import shared_task

from ...models import Call, CallJob, CallJobStatus
from ...serializers import CallJobSerializer, CallSerializer
from .method import discover_runs


@shared_task
def discover_runs_task(job_id):
    try:
        job = CallJob.objects.get(pk=job_id)
        job.status = CallJobStatus.STARTED
        job.save()
        job_input = CallJobSerializer(job).data
        call_meta = Call.objects.get(pk=job_input["call_id"])
        call_meta = CallSerializer(call_meta).data
        discover_runs(call_meta, job_input)
    except Exception as err:
        job.status = CallJobStatus.FAILURE
        job.traceback = traceback.format_exc()
        job.save()
        raise err
    else:
        job.status = CallJobStatus.SUCCESS
        job.save()
