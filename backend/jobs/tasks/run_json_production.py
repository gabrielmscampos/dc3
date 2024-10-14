import json
import os
import traceback

import matplotlib
from celery import shared_task
from libdc3.methods.json_producer import JsonProducer
from libdc3.methods.rr_actions import RunRegistryActions

from ..models import Job, JobStatus
from ..serializers import JobSerializer


matplotlib.use("Agg")


def _run_json_production_task(job: dict):
    """
    Parameters needed:
    - class_name
    - dataset_name
    - run_list
    - ignore_hlt_emergency
    - pre_json_oms_flags
    - golden_json_oms_flags
    - golden_json_rr_flags
    - muon_json_oms_flags
    - muon_json_rr_flags
    """
    # Fetch RR and OMS lumisection flags/bits
    rra = RunRegistryActions(class_name=job["params"]["class_name"], dataset_name=job["params"]["dataset_name"])
    offline_lumis = rra.multi_fetch_rr_oms_joint_lumis(run_list=job["params"]["run_list"])
    del rra

    # Genrate all jsons
    producer = JsonProducer(rr_oms_lumis=offline_lumis, ignore_hlt_emergency=job["params"]["ignore_hlt_emergency"])
    pre_json = producer.generate(oms_flags=job["params"]["pre_json_oms_flags"])
    golden_json = producer.generate(
        oms_flags=job["params"]["golden_json_oms_flags"], rr_flags=job["params"]["golden_json_rr_flags"]
    )
    muon_json = producer.generate(
        oms_flags=job["params"]["muon_json_oms_flags"], rr_flags=job["params"]["muon_json_rr_flags"]
    )
    del producer, offline_lumis

    # Save JSONs
    base_path = os.path.join(job["results_dir"], "jsons")
    os.makedirs(base_path, exist_ok=True)
    with open(os.path.join(base_path, "pre.json"), "w") as f:
        json.dump(pre_json, f, ensure_ascii=False, indent=4)
    with open(os.path.join(base_path, "golden.json"), "w") as f:
        json.dump(golden_json, f, ensure_ascii=False, indent=4)
    with open(os.path.join(base_path, "muon.json"), "w") as f:
        json.dump(muon_json, f, ensure_ascii=False, indent=4)


@shared_task
def run_json_production_task(job_id):
    job = Job.objects.get(pk=job_id)
    job.status = JobStatus.STARTED
    job.save()
    job_input = JobSerializer(job).data

    try:
        _run_json_production_task(job_input)
        job.status = JobStatus.SUCCESS
        job.save()
    except Exception as err:
        job.status = JobStatus.FAILURE
        job.traceback = traceback.format_exc()
        job.save()
        raise err
