import json
import os
import traceback

import matplotlib
from celery import shared_task
from libdc3.methods.bril_actions import BrilActions
from libdc3.methods.json_producer import JsonProducer
from libdc3.methods.lumiloss_analyzer import LumilossAnalyzer
from libdc3.methods.lumiloss_plotter import LumilossPlotter
from libdc3.methods.rr_actions import RunRegistryActions

from ..models import Job, JobStatus
from ..serializers import JobSerializer


matplotlib.use("Agg")


def _run_lumiloss_task(job: dict):
    """
    Parameters needed:
    - included_runs
    - not_in_dcs_runs
    - low_lumi_runs
    - ignore_runs
    - class_name
    - dataset_name
    - ignore_hlt_emergency
    - pre_json_oms_flags
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
    - target_lumiloss_unit
    - lumiloss_dcs_flags
    - lumiloss_subsystems_flags
    - lumiloss_subdetectors_flags
    """
    run_list = [
        *job["params"]["included_runs"],
        *job["params"]["not_in_dcs_runs"],
        *job["params"]["low_lumi_runs"],
        *job["params"]["ignore_runs"],
    ]

    # Fetch RR and OMS lumisection flags/bits
    rra = RunRegistryActions(class_name=job["params"]["class_name"], dataset_name=job["params"]["dataset_name"])
    offline_lumis = rra.multi_fetch_rr_oms_joint_lumis(run_list=run_list)
    del rra

    # Genrate all jsons
    elegible_runs = [*job["params"]["included_runs"], *job["params"]["not_in_dcs_runs"]]
    elegible_lumis = [lumi for lumi in offline_lumis if lumi["run_number"] in elegible_runs]
    producer = JsonProducer(rr_oms_lumis=elegible_lumis, ignore_hlt_emergency=job["params"]["ignore_hlt_emergency"])
    pre_json = producer.generate(oms_flags=job["params"]["pre_json_oms_flags"])
    golden_json = producer.generate(
        oms_flags=job["params"]["golden_json_oms_flags"], rr_flags=job["params"]["golden_json_rr_flags"]
    )
    muon_json = producer.generate(
        oms_flags=job["params"]["muon_json_oms_flags"], rr_flags=job["params"]["muon_json_rr_flags"]
    )
    del producer, elegible_runs, elegible_lumis

    # Save JSONs
    base_path = os.path.join(job["results_dir"], "jsons")
    os.makedirs(base_path, exist_ok=True)
    with open(os.path.join(base_path, "pre.json"), "w") as f:
        json.dump(pre_json, f, ensure_ascii=False, indent=4)
    with open(os.path.join(base_path, "golden.json"), "w") as f:
        json.dump(golden_json, f, ensure_ascii=False, indent=4)
    with open(os.path.join(base_path, "muon.json"), "w") as f:
        json.dump(muon_json, f, ensure_ascii=False, indent=4)

    del muon_json

    # Fetch BRIL lumisections
    min_run = min(run_list)
    max_run = max(run_list)
    ba = BrilActions(
        brilws_version=job["params"]["bril_brilws_version"],
        unit=job["params"]["bril_unit"],
        low_lumi_thr=job["params"]["bril_low_lumi_thr"],
        beamstatus=job["params"]["bril_beamstatus"],
        amodetag=job["params"]["bril_amodetag"],
        normtag=job["params"]["bril_normtag"],
    )
    bril_lumis = ba.fetch_lumis(begin=min_run, end=max_run).get("detailed")
    bril_lumis = [lumi for lumi in bril_lumis if lumi["run_number"] in run_list]
    used_keys = ["run_number", "ls_number", "delivered", "recorded", "datetime"]
    bril_lumis = [{key: value for key, value in item.items() if key in used_keys} for item in bril_lumis]

    # Compute lumiloss
    lumiloss = LumilossAnalyzer(
        rr_oms_lumis=offline_lumis,
        bril_lumis=bril_lumis,
        pre_json=pre_json,
        dc_json=golden_json,
        low_lumi_runs=job["params"]["low_lumi_runs"],
        ignore_runs=job["params"]["ignore_runs"],
        bril_unit=job["params"]["bril_unit"],
        target_unit=job["params"]["target_lumiloss_unit"],
    )
    lumiloss_results = lumiloss.analyze(
        dcs=job["params"]["lumiloss_dcs_flags"],
        subsystems=job["params"]["lumiloss_subsystems_flags"],
        subdetectors=job["params"]["lumiloss_subdetectors_flags"],
    )
    txt_inclusive = lumiloss.format_lumiloss_by_run(data=lumiloss_results["subsystem_run_inclusive_loss"])
    txt_exclusive = lumiloss.format_lumiloss_by_run(data=lumiloss_results["subsystem_run_exclusive_loss"])
    del offline_lumis, bril_lumis

    # Save lumiloss results
    lumiloss_data_path = os.path.join(job["results_dir"], "lumiloss/data")
    os.makedirs(lumiloss_data_path, exist_ok=True)
    for key, value in lumiloss_results.items():
        fpath = os.path.join(lumiloss_data_path, f"{key}.json")
        with open(fpath, "w") as f:
            json.dump(value, f)
    with open(os.path.join(lumiloss_data_path, "inclusive_loss_by_run.txt"), "w") as f:
        f.write(txt_inclusive)
    with open(os.path.join(lumiloss_data_path, "exclusive_loss_by_run.txt"), "w") as f:
        f.write(txt_exclusive)
    del txt_inclusive, txt_exclusive

    # Generate lumiloss plots
    lumiloss_plots_path = os.path.join(job["results_dir"], "lumiloss/plots")
    os.makedirs(lumiloss_plots_path, exist_ok=True)
    plots = LumilossPlotter(
        lumiloss=lumiloss_results, unit=job["params"]["target_lumiloss_unit"], output_path=lumiloss_plots_path
    )
    plots.plot_subsystem_dqmflag_loss()
    plots.plot_dcs_loss()
    plots.plot_cms_inclusive_loss()
    plots.plot_cms_exclusive_loss()
    plots.plot_cms_detailed_fraction_exclusive_loss()
    plots.plot_inclusive_loss_by_subdetector()
    plots.plot_exclusive_loss_by_subdetector()
    plots.plot_fraction_of_exclusive_loss_by_subdetector()
    del lumiloss_plots_path, plots


@shared_task
def run_lumiloss_task(job_id):
    job = Job.objects.get(pk=job_id)
    job.status = JobStatus.STARTED
    job.save()
    job_input = JobSerializer(job).data

    try:
        _run_lumiloss_task(job_input)
        job.status = JobStatus.SUCCESS
        job.save()
    except Exception as err:
        job.status = JobStatus.FAILURE
        job.traceback = traceback.format_exc()
        job.save()
        raise err
