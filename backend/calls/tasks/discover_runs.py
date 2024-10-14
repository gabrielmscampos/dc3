import json
import os
import traceback

from celery import shared_task
from libdc3.methods.next_call import NextCallGenerator

from ..models import Call, CallJob, CallJobStatus
from ..serializers import CallJobSerializer


def _discovery_runs_task(job: dict):
    """
    Parameters needed:
    - bril_brilws_version
    - bril_unit
    - bril_low_lumi_thr
    - bril_beamstatus
    - bril_amodetag
    - bril_normtag
    - gui_lookup_datasets
    - refresh_runs_if_needed
    """
    call = Call.objects.get(pk=job["call_id"])

    # Generate list of runs for next calls
    call = NextCallGenerator(
        rr_class_name=call.class_name,
        rr_dataset_name=call.dataset_name,
        bril_brilws_version=job["params"]["bril_brilws_version"],
        bril_unit=job["params"]["bril_unit"],
        bril_low_lumi_thr=job["params"]["bril_low_lumi_thr"],
        bril_beamstatus=job["params"]["bril_beamstatus"],
        bril_amodetag=job["params"]["bril_amodetag"],
        bril_normtag=job["params"]["bril_normtag"],
        gui_lookup_datasets=job["params"]["gui_lookup_datasets"],
        refresh_runs_if_needed=job["params"]["refresh_runs_if_needed"],
    )
    results = call.generate()

    # Store results in results_dir
    fpath = os.path.join(job["results_dir"], "results.json")
    with open(fpath, "w") as f:
        json.dump(results, f)


@shared_task
def discover_runs_task(job_id):
    job = CallJob.objects.get(pk=job_id)
    job.status = CallJobStatus.STARTED
    job.save()
    job_input = CallJobSerializer(job).data

    try:
        _discovery_runs_task(job_input)
        job.status = CallJobStatus.SUCCESS
        job.save()
    except Exception as err:
        job.status = CallJobStatus.FAILURE
        job.traceback = traceback.format_exc()
        job.save()
        raise err
