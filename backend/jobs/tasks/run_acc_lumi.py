import json
import os
import traceback

import matplotlib
from celery import shared_task
from libdc3.methods.acc_lumi_analyzer import AccLuminosityAnalyzer
from libdc3.methods.bril_actions import BrilActions
from libdc3.methods.json_producer import JsonProducer
from libdc3.methods.rr_actions import RunRegistryActions

from ..models import Job, JobStatus
from ..serializers import JobSerializer


matplotlib.use("Agg")


def _run_acc_lumi_task(job: dict):
    """
    Parameters needed:
    - class_name
    - dataset_name
    - run_list
    - ignore_hlt_emergency
    - golden_json_oms_flags
    - golden_json_rr_flags
    - muon_json_oms_flags
    - muon_json_rr_flags
    - bril_brilws_version
    - bril_unit
    - bril_low_lumi_thr
    - bril_beamstatus
    - bril_amodetag
    - bril_normtag
    - target_acclumi_unit
    - acc_lumi_year
    - acc_lumi_beam_energy
    - acc_lumi_additional_label_on_plot
    """
    # Fetch RR and OMS lumisection flags/bits
    rra = RunRegistryActions(class_name=job["params"]["class_name"], dataset_name=job["params"]["dataset_name"])
    offline_lumis = rra.multi_fetch_rr_oms_joint_lumis(run_list=job["params"]["run_list"])
    del rra

    # Genrate all jsons
    producer = JsonProducer(rr_oms_lumis=offline_lumis, ignore_hlt_emergency=job["params"]["ignore_hlt_emergency"])
    golden_json = producer.generate(
        oms_flags=job["params"]["golden_json_oms_flags"], rr_flags=job["params"]["golden_json_rr_flags"]
    )
    muon_json = producer.generate(
        oms_flags=job["params"]["muon_json_oms_flags"], rr_flags=job["params"]["muon_json_rr_flags"]
    )
    del producer

    # Save JSONs
    base_path = os.path.join(job["results_dir"], "jsons")
    os.makedirs(base_path, exist_ok=True)
    with open(os.path.join(base_path, "golden.json"), "w") as f:
        json.dump(golden_json, f, ensure_ascii=False, indent=4)
    with open(os.path.join(base_path, "muon.json"), "w") as f:
        json.dump(muon_json, f, ensure_ascii=False, indent=4)

    # Fetch BRIL lumisections
    min_run = min(job["params"]["run_list"])
    max_run = max(job["params"]["run_list"])
    ba = BrilActions(
        brilws_version=job["params"]["bril_brilws_version"],
        unit=job["params"]["bril_unit"],
        low_lumi_thr=job["params"]["bril_low_lumi_thr"],
        beamstatus=job["params"]["bril_beamstatus"],
        amodetag=job["params"]["bril_amodetag"],
        normtag=job["params"]["bril_normtag"],
    )
    bril_lumis = ba.fetch_lumis(begin=min_run, end=max_run).get("detailed")
    used_keys = ["run_number", "ls_number", "delivered", "recorded", "datetime"]
    bril_lumis = [{key: value for key, value in item.items() if key in used_keys} for item in bril_lumis]

    # Generate Acc Luminosity plots for golden JSON
    acc_lumi_plots_path = os.path.join(job["results_dir"], "acc_lumi/golden")
    os.makedirs(acc_lumi_plots_path, exist_ok=True)
    acc_lumi = AccLuminosityAnalyzer(
        dc_json=golden_json,
        bril_lumis=bril_lumis,
        bril_amodetag=job["params"]["bril_amodetag"],
        bril_unit=job["params"]["bril_unit"],
        target_unit=job["params"]["target_acclumi_unit"],
        year=job["params"]["acc_lumi_year"],
        beam_energy=job["params"]["acc_lumi_beam_energy"],
        output_path=acc_lumi_plots_path,
        additional_label_on_plot=job["params"]["acc_lumi_additional_label_on_plot"],
    )
    acc_lumi.plot_acc_lumi_by_day()
    acc_lumi.plot_acc_lumi_by_week()
    del acc_lumi, golden_json

    # Generate Acc Luminosity plots for muon JSON
    acc_lumi_plots_path = os.path.join(job["results_dir"], "acc_lumi/muon")
    os.makedirs(acc_lumi_plots_path, exist_ok=True)
    acc_lumi = AccLuminosityAnalyzer(
        dc_json=muon_json,
        bril_lumis=bril_lumis,
        bril_amodetag=job["params"]["bril_amodetag"],
        bril_unit=job["params"]["bril_unit"],
        target_unit=job["params"]["target_acclumi_unit"],
        year=job["params"]["acc_lumi_year"],
        beam_energy=job["params"]["acc_lumi_beam_energy"],
        output_path=acc_lumi_plots_path,
        additional_label_on_plot=job["params"]["acc_lumi_additional_label_on_plot"],
    )
    acc_lumi.plot_acc_lumi_by_day()
    acc_lumi.plot_acc_lumi_by_week()
    del acc_lumi


@shared_task
def run_acc_lumi_task(job_id):
    job = Job.objects.get(pk=job_id)
    job.status = JobStatus.STARTED
    job.save()
    job_input = JobSerializer(job).data

    try:
        _run_acc_lumi_task(job_input)
        job.status = JobStatus.SUCCESS
        job.save()
    except Exception as err:
        job.status = JobStatus.FAILURE
        job.traceback = traceback.format_exc()
        job.save()
        raise err
