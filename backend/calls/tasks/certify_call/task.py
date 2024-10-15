import json
import traceback

from celery import shared_task

from ...models import Call, CallJob, CallJobStatus
from ...serializers import CallJobSerializer, CallSerializer
from .method import certify_call


@shared_task
def certify_call_task(job_id):
    try:
        job = CallJob.objects.get(pk=job_id)
        job.status = CallJobStatus.STARTED
        job.save()
        job_input = CallJobSerializer(job).data
        call_meta = Call.objects.get(pk=job_input["call_id"])
        call_meta = CallSerializer(call_meta).data
        run_job = CallJob.objects.get(pk=job_input["params"]["run_job_id"])
        with open(run_job.results_dir + "/results.json") as f:
            run_job_result = json.load(f)
        run_job = {**run_job.params, "result": run_job_result}
        certify_call(call_meta, run_job, job_input)
    except Exception as err:
        job.status = CallJobStatus.FAILURE
        job.traceback = traceback.format_exc()
        job.save()
        raise err
    else:
        job.status = CallJobStatus.SUCCESS
        job.save()
