import json
import os
import traceback

import matplotlib
from celery import shared_task
from libdc3.methods.acc_lumi_analyzer import AccLuminosityAnalyzer
from libdc3.methods.bril_actions import BrilActions
from libdc3.methods.era_plotter import EraPlotter
from libdc3.methods.json_producer import JsonProducer
from libdc3.methods.lumiloss_analyzer import LumilossAnalyzer
from libdc3.methods.lumiloss_plotter import LumilossPlotter
from libdc3.methods.rr_actions import RunRegistryActions
from libdc3.methods.t0_actions import T0Actions
from libdc3.services.caf.client import CAF

from ..models import Job, JobStatus
from ..serializers import JobSerializer


matplotlib.use("Agg")


def _run_full_certification(job: dict):
    """
    Parameters needed:
    - class_name
    - dataset_name
    - cycles
    - min_run
    - max_run
    - ignore_runs
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
    - eras_prefix
    - ignore_eras
    - lumiloss_dcs_flags
    - lumiloss_subsystems_flags
    - lumiloss_subdetectors_flags
    - target_lumiloss_unit
    - acc_lumi_year
    - acc_lumi_beam_energy
    - acc_lumi_additional_label_on_plot
    """
    rra = RunRegistryActions(class_name=job["params"]["class_name"], dataset_name=job["params"]["dataset_name"])

    if job["params"].get("cycles"):
        runs_in_all_cycles = rra.fetch_runs_in_cycles(cycles_list=job["params"]["cycles"])
        min_run = min(runs_in_all_cycles)
        max_run = max(runs_in_all_cycles)
    elif job["params"].get("min_run") and job["params"].get("max_run"):
        min_run = job["params"]["min_run"]
        max_run = job["params"]["max_run"]
        runs_in_all_cycles = rra.fetch_runs_from_all_cycles()
        runs_in_all_cycles = [run for run in runs_in_all_cycles if run >= min_run and run <= max_run]

    all_datasets = rra.fetch_datasets(min_run=min_run, max_run=max_run)
    all_runs = [dataset["run_number"] for dataset in all_datasets]

    # Fetch RR and OMS lumisections
    offline_lumis = rra.multi_fetch_rr_oms_joint_lumis(run_list=all_runs)
    del rra

    # Check which runs are not in the DCSOnly JSON
    caf = CAF(job["params"]["class_name"], kind="dcs")
    dcs_json = caf.download(latest=True)
    runs_not_in_dcs_json = [run for run in all_runs if str(run) not in dcs_json.keys()]
    del caf, dcs_json

    # Genrate all jsons
    elegible_runs = [*runs_in_all_cycles, *runs_not_in_dcs_json]
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

    # Fetch BRIL lumisections
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
    bril_lumis_by_run = ba.agg_by_run(bril_lumis)

    # Fetch T0 eras
    t0a = T0Actions()
    eras = t0a.eras_history(era=job["params"]["eras_prefix"])
    eras = [era for era in eras if era["era"] not in job["params"]["ignore_eras"]]

    # Analyse lumiloss and generate plots by era
    eras_statistics = []
    ignore_runs = job["params"]["ignore_runs"].copy()
    for era in eras:
        era_name = era["era"]
        min_run_in_era = era["min_run"]
        max_run_in_era = era["max_run"]

        # All runs (from RR datasets) in this interval
        runs_in_era = [run for run in all_runs if run >= min_run_in_era and run <= max_run_in_era]
        if len(runs_in_era) == 0:
            continue

        # Filter data to era scope
        offline_lumis_in_era = [
            lumi
            for lumi in offline_lumis
            if lumi["run_number"] >= min_run_in_era and lumi["run_number"] <= max_run_in_era
        ]
        pjson_in_era = {
            run: lumi_ranges for run, lumi_ranges in pre_json.items() if run >= min_run_in_era and run <= max_run_in_era
        }
        gjson_in_era = {
            run: lumi_ranges
            for run, lumi_ranges in golden_json.items()
            if run >= min_run_in_era and run <= max_run_in_era
        }
        mjson_in_era = {
            run: lumi_ranges
            for run, lumi_ranges in muon_json.items()
            if run >= min_run_in_era and run <= max_run_in_era
        }
        bril_lumis_in_era = [
            lumi for lumi in bril_lumis if lumi["run_number"] >= min_run_in_era and lumi["run_number"] <= max_run_in_era
        ]
        bril_lumis_by_run_in_era = [
            run
            for run in bril_lumis_by_run
            if run["run_number"] >= min_run_in_era and run["run_number"] <= max_run_in_era
        ]

        # It is possible that a run included in an old cycle (from eraB for example) wasn't low lumi at the time
        # and now (with normtag updates) is considered low lumi.
        #
        # This run will appear in both arrays:
        # - runs_in_all_cycles
        # - low_lumi_runs
        #
        # We need to remove this run from the `low_lumi_runs` since it was certified in the past!
        runs_from_cycles_in_era = [run for run in runs_in_all_cycles if run >= min_run_in_era and run <= max_run_in_era]
        low_lumi_runs_in_era = [
            run["run_number"]
            for run in bril_lumis_by_run_in_era
            if run["run_number"] not in runs_from_cycles_in_era and run["has_low_recorded"]
        ]

        # It is possible that the last era contains runs that weren't sent to certification yet
        # because at the time of the latest DC call these runs hadn't all datasets in DQM GUI.
        # We need to ignore this run in lumiloss, but consider in Acc Lumi!
        #
        # To identify these runs:
        # - Shouldn't be in any cycle
        # - Shouldn't be in low lumi list
        # - Shouldn't be in ignore runs list
        # - Shouldn't be in not in DCSOnly list
        runs_not_in_dcs_json_for_era = [
            run for run in runs_in_era if run in runs_not_in_dcs_json and run not in low_lumi_runs_in_era
        ]
        classified_runs = [*runs_not_in_dcs_json_for_era, *runs_from_cycles_in_era, *low_lumi_runs_in_era, *ignore_runs]
        other_runs_in_era = [run for run in runs_in_era if run not in classified_runs]
        ignore_runs.extend(other_runs_in_era)

        # Check lumiloss
        lumiloss_for_era = LumilossAnalyzer(
            rr_oms_lumis=offline_lumis_in_era,
            bril_lumis=bril_lumis_in_era,
            pre_json=pjson_in_era,
            dc_json=gjson_in_era,
            low_lumi_runs=low_lumi_runs_in_era,
            ignore_runs=ignore_runs,
            bril_unit=job["params"]["bril_unit"],
            target_unit=job["params"]["target_lumiloss_unit"],
        )
        lumiloss_results = lumiloss_for_era.analyze(
            job["params"]["lumiloss_dcs_flags"],
            job["params"]["lumiloss_subsystems_flags"],
            job["params"]["lumiloss_subdetectors_flags"],
        )
        txt_inclusive = lumiloss_for_era.format_lumiloss_by_run(data=lumiloss_results["subsystem_run_inclusive_loss"])
        txt_exclusive = lumiloss_for_era.format_lumiloss_by_run(data=lumiloss_results["subsystem_run_exclusive_loss"])

        # Setup directory for plots
        era_outpath = job["results_dir"] + "/eras/" + era_name
        os.makedirs(era_outpath, exist_ok=True)

        # Save jsons
        era_jsons_path = os.path.join(era_outpath, "jsons")
        os.makedirs(era_jsons_path, exist_ok=True)

        fpath = os.path.join(era_jsons_path, "pre.json")
        with open(fpath, "w") as f:
            json.dump(pjson_in_era, f, ensure_ascii=False, indent=4)

        fpath = os.path.join(era_jsons_path, "golden.json")
        with open(fpath, "w") as f:
            json.dump(gjson_in_era, f, ensure_ascii=False, indent=4)

        fpath = os.path.join(era_jsons_path, "muon.json")
        with open(fpath, "w") as f:
            json.dump(mjson_in_era, f, ensure_ascii=False, indent=4)

        # Save lumiloss results
        lumiloss_data_path = os.path.join(era_outpath, "lumiloss/data")
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

        # Plot lumiloss
        lumiloss_plots_path = os.path.join(era_outpath, "lumiloss/plots")
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

        # Plot acc luminosity for goldenJSON
        acc_lumi_plots_path = os.path.join(era_outpath, "acc_lumi/golden")
        os.makedirs(acc_lumi_plots_path, exist_ok=True)

        acc_lumi = AccLuminosityAnalyzer(
            dc_json=gjson_in_era,
            bril_lumis=bril_lumis_in_era,
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

        # Plot acc luminosity for muonJSON
        acc_lumi_plots_path = os.path.join(era_outpath, "acc_lumi/muon")
        os.makedirs(acc_lumi_plots_path, exist_ok=True)

        acc_lumi = AccLuminosityAnalyzer(
            dc_json=mjson_in_era,
            bril_lumis=bril_lumis_in_era,
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
        del acc_lumi, bril_lumis_in_era

        # Save era statistics
        eras_statistics.append(
            {
                "era": era_name,
                "start_run": min_run_in_era,
                "end_run": max_run_in_era,
                "lhc_delivered": lumiloss_for_era.total_delivered,
                "cms_recorded": lumiloss_for_era.total_recorded,
                "total_low_lumi": lumiloss_for_era.total_low_lumi,
                "total_ignore_runs": lumiloss_for_era.total_ignore_runs,
                "total_not_stable_beams": lumiloss_for_era.total_not_stable_beams,
                "total_not_in_oms_rr": lumiloss_for_era.total_not_in_oms_rr,
                "dc_processed": lumiloss_for_era.total_processed,
                "total_loss": lumiloss_for_era.total_loss,
                "dc_certified": lumiloss_for_era.total_certified,
                "processed_eff": lumiloss_for_era.processed_eff,
                "data_taking_eff": lumiloss_for_era.data_taking_eff,
                "recorded_eff": lumiloss_for_era.recorded_eff,
            }
        )

        del (
            pjson_in_era,
            mjson_in_era,
            gjson_in_era,
            offline_lumis_in_era,
            bril_lumis_by_run_in_era,
            low_lumi_runs_in_era,
            lumiloss_for_era,
            plots,
            lumiloss_results,
        )

    del offline_lumis

    # Generate combined eras plot
    eras_eff_plots_path = os.path.join(job["results_dir"], "eras")
    os.makedirs(eras_eff_plots_path, exist_ok=True)

    era_plotter = EraPlotter(eras_statistics, eras_eff_plots_path)
    era_plotter.plot_dc_efficiency_by_processed_per_era()
    era_plotter.plot_dc_efficiency_by_recorded_per_era()

    acc_lumi_path = os.path.join(job["results_dir"], "acc_lumi")
    os.makedirs(acc_lumi_path, exist_ok=True)
    all_in_stats_path = os.path.join(acc_lumi_path, "stats.json")
    with open(all_in_stats_path, "w") as f:
        all_in = {"min_run_rr": min_run, "max_run_rr": max_run, **eras_statistics[-1]}
        json.dump(all_in, f)

    del era_plotter, eras_eff_plots_path

    # Generate Acc Luminosity plots for golden JSON
    acc_lumi_plots_path = os.path.join(acc_lumi_path, "golden")
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
    acc_lumi_plots_path = os.path.join(acc_lumi_path, "muon")
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
def run_full_certification_task(job_id):
    job = Job.objects.get(pk=job_id)
    job.status = JobStatus.STARTED
    job.save()
    job_input = JobSerializer(job).data

    try:
        _run_full_certification(job_input)
        job.status = JobStatus.SUCCESS
        job.save()
    except Exception as err:
        job.status = JobStatus.FAILURE
        job.traceback = traceback.format_exc()
        job.save()
        raise err
