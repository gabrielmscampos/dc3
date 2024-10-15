import traceback

from celery import shared_task

from ...models import Job, JobStatus
from ...serializers import JobSerializer
from .method import run_lumiloss


@shared_task
def run_lumiloss_task(job_id):
    try:
        job = Job.objects.get(pk=job_id)
        job.status = JobStatus.STARTED
        job.save()
        job_input = JobSerializer(job).data
        run_lumiloss(job_input)
    except Exception as err:
        job.status = JobStatus.FAILURE
        job.traceback = traceback.format_exc()
        job.save()
        raise err
    else:
        job.status = JobStatus.SUCCESS
        job.save()
