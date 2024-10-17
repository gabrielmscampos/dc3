import inspect
import json
import traceback

from celery import shared_task
from django.conf import settings
from utils.htcondor.htcondor import HTCondorExecutor
from utils.htcondor.utils import create_python_script, create_shell_script, create_submit_file

from ...models import Job, JobStatus
from ...serializers import JobSerializer
from . import method


@shared_task
def run_json_production_task(job_id):
    try:
        job = Job.objects.get(pk=job_id)
        job.status = JobStatus.STARTED
        job.save()
        job_input = JobSerializer(job).data
        method.run_json_production(job_input)
    except Exception as err:
        job.status = JobStatus.FAILURE
        job.traceback = traceback.format_exc()
        job.save()
        raise err
    else:
        job.status = JobStatus.SUCCESS
        job.save()


@shared_task
def run_json_production_htcondor_task(job_id):
    try:
        job = Job.objects.get(pk=job_id)
        job.status = JobStatus.STARTED
        job.save()
        job_input = JobSerializer(job).data

        # Prepare HTCondor paths
        remote_work_path = f"{settings.BASE_CONDOR_WORK_DIR}/jobs/{job_id}"
        remote_results_dir = f"{settings.BASE_CONDOR_RESULTS_DIR}/jobs/{job_id}"

        # Prepare HTCondor files
        src = inspect.getsource(method)
        sub = create_submit_file(
            request_cpus=1,
            request_disk=252000,
            request_memory=10240,
            environment={
                "CERT_FPATH": settings.CONDOR_CERT_FPATH,
                "KEY_FPATH": settings.CONDOR_KEY_FPATH,
                "SSO_CLIENT_ID": settings.RR_SSO_CLIENT_ID,
                "SSO_CLIENT_SECRET": settings.RR_SSO_CLIENT_SECRET,
            },
        )
        sh = create_shell_script(src)
        py = create_python_script(src, method.run_json_production.__name__)
        job_input["results_dir"] = remote_results_dir
        job_input = json.dumps({"job": job_input})

        with HTCondorExecutor(settings.KEYTAB_USR, settings.KEYTAB_PWD) as htcondor:
            htcondor.mkdir(remote_work_path)
            htcondor.mkdir(remote_results_dir)
            htcondor.put_str_as_file(sub, f"{remote_work_path}/main.sub")
            htcondor.put_str_as_file(sh, f"{remote_work_path}/main.sh")
            htcondor.put_str_as_file(py, f"{remote_work_path}/main.py")
            htcondor.put_str_as_file(job_input, f"{remote_work_path}/input.json")
            htcondor.chmod_x(f"{remote_work_path}/main.sh")
            schedd, _, _ = htcondor.myschedd_bump()
            condor_id = htcondor.condor_submit(remote_work_path, "main.sub")

            has_err = None
            try:
                htcondor.wait_job(schedd, condor_id)
            except Exception as err:  # noqa: BLE001
                has_err = err
            finally:
                eos_history_path = f"{remote_results_dir}/htcondor"
                htcondor.mkdir(eos_history_path)
                htcondor.mv(f"{remote_work_path}/*", eos_history_path)
                htcondor.rm(remote_work_path, recursive=True)

            if has_err:
                raise has_err
    except Exception as err:
        job.status = JobStatus.FAILURE
        job.traceback = traceback.format_exc()
        job.save()
        raise err
    else:
        job.status = JobStatus.SUCCESS
        job.save()
