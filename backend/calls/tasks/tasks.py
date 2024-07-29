import os
import os.path

from celery import shared_task
from django.conf import settings

from ..controllers.dcs import DailyDCSJson
from ..controllers.dqmgui import DQMGUI
from ..controllers.lxplus import LXPLusDC3Space
from ..controllers.rr import RunRegistry
from ..controllers.utils import save_json
from ..models import Call
from .base import CustomBaseTask


DATASETS_TO_CHECK = [
    "/ZeroBias/Run2024.*-PromptReco-v.*?/DQMIO",
    "/JetMET0/Run2024.*-PromptReco-v.*?/DQMIO",
    "/Muon0/Run2024.*-PromptReco-v.*?/DQMIO",
    "/EGamma0/Run2024.*-PromptReco-v.*?/DQMIO",
    "/HcalNZS/Run2024.*-PromptReco-v.*?/DQMIO",
    "/HLTPhysics/Run2024.*-PromptReco-v.*?/DQMIO",
]


@shared_task(base=CustomBaseTask)
def setup_call(call_id: int):
    lxp = LXPLusDC3Space(settings.KEYTAB_USR, settings.KEYTAB_PWD, str(call_id))
    lxp.clone_dqmspace()


@shared_task(base=CustomBaseTask)
def close_call(call_id: int):
    lxp = LXPLusDC3Space(settings.KEYTAB_USR, settings.KEYTAB_PWD, str(call_id))
    lxp.clean_dqmspace()


@shared_task(base=CustomBaseTask)
def discover_runs(call_id: int):
    call = Call.objects.get(pk=call_id)
    results_dir = os.path.join(settings.BASE_RESULTS_DIR, str(call.call_id), "runs")
    if not os.path.exists(results_dir):
        os.makedirs(results_dir)

    # Get runs not sent in previous cycles
    rr = RunRegistry()
    not_in_run_numbers = rr.get_runs_from_all_cycles()
    other_run_numbers = rr.get_next_call_runs(not_in_run_numbers, call.class_name, call.dataset_name)
    save_json(os.path.join(results_dir, "runs_from_rr.json"), other_run_numbers)

    # Filter out runs with low luminosity using Brilcalc
    lxp = LXPLusDC3Space(settings.KEYTAB_USR, settings.KEYTAB_PWD, str(call.call_id))
    stdout, stderr = lxp.run_brilcalc_checkminimum(other_run_numbers)
    low_stat_runs = lxp.parse_brilcalc_checkminimum(stdout)
    save_json(os.path.join(results_dir, "low_stat_runs.json"), low_stat_runs)
    low_stat_runs = [r.get("run_number") for r in low_stat_runs]
    runs_to_include = [run for run in other_run_numbers if str(run) not in low_stat_runs]

    # Filter out runs not found in DCS json
    dcs = DailyDCSJson(call.class_name)
    dcs_json = dcs.download(latest=True)
    runs_to_include = [run for run in runs_to_include if str(run) in dcs_json.keys()]
    runs_not_in_dcs_json = [run for run in runs_to_include if str(run) not in dcs_json.keys()]
    runs_not_in_dcs_json = {"filename": dcs.latest.get("name"), "runs": runs_not_in_dcs_json}
    save_json(os.path.join(results_dir, "runs_not_in_dcs.json"), runs_not_in_dcs_json)

    # Filter out runs which any dataset in datasets list is not yet in DQMGUI
    runs_not_in_gui_by_dt = {}
    dqmgui = DQMGUI(settings.CERT_FPATH, settings.KEY_FPATH)
    for dt in DATASETS_TO_CHECK:
        runs_not_in_gui = dqmgui.check_if_runs_are_present(dt, runs_to_include)
        runs_not_in_gui_by_dt[dt] = runs_not_in_gui
        [runs_to_include.remove(run) for run in runs_not_in_gui if run in runs_to_include]

    save_json(os.path.join(results_dir, "runs_not_in_gui.json"), runs_not_in_gui_by_dt)
    save_json(os.path.join(results_dir, "base_included_runs.json"), runs_to_include)


@shared_task(base=CustomBaseTask)
def generate_lumiloss_plots(call_id: int, mode: str, runs: list[int]):
    call = Call.objects.get(pk=call_id)
    results_dir = os.path.join(settings.BASE_RESULTS_DIR, str(call.call_id))

    lxp = LXPLusDC3Space(
        settings.KEYTAB_USR,
        settings.KEYTAB_PWD,
        str(call.call_id),
        settings.RR_SSO_CLIENT_ID,
        settings.RR_SSO_CLIENT_SECRET,
    )
    lxp.run_allsteps_lumiloss(mode=mode, run_numbers=runs, dataset_name=call.dataset_name, class_name=call.class_name)
    lxp.download_lumiloss_results(mode, results_dir)
