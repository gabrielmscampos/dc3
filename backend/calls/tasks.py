import os
import os.path

from celery import Task, shared_task, signals, states
from celery.result import AsyncResult
from django.conf import settings

from .controllers.dcs import DailyDCSJson
from .controllers.dqmgui import DQMGUI
from .controllers.lxplus import LXPLusDC3Space
from .controllers.rr import RunRegistry
from .controllers.utils import read_json, save_json
from .models import Call, CallTask


DATASETS_TO_CHECK = [
    "/ZeroBias/Run2024.*-PromptReco-v.*?/DQMIO",
    "/JetMET1/Run2024.*-PromptReco-v.*?/DQMIO",
    "/Muon1/Run2024.*-PromptReco-v.*?/DQMIO",
]


class CustomBaseTask(Task):
    def apply_async(self, args=None, kwargs=None, **options):
        task_instance = super().apply_async(args=args, kwargs=kwargs, **options)
        CallTask.objects.create(call_id=args[0], task_id=task_instance.id)
        return task_instance


@signals.task_prerun.connect
def task_prerun_handler(sender, task_id, task, *args, **kwargs):
    try:
        call_task = CallTask.objects.get(task_id=task_id)
        call_task.status = states.STARTED
        call_task.save()
    except CallTask.DoesNotExist:
        pass


@signals.task_postrun.connect
def task_postrun_handler(sender, task_id, task, args, kwargs, retval, state, **kw):
    try:
        task = AsyncResult(task_id)
        call_task = CallTask.objects.get(task_id=task_id)
        call_task.status = task.state
        call_task.save()
    except CallTask.DoesNotExist:
        pass


@signals.task_failure.connect
def task_failure_handler(sender, task_id, exception, args, kwargs, traceback, einfo, **kw):
    try:
        task = AsyncResult(task_id)
        call_task = CallTask.objects.get(task_id=task_id)
        call_task.status = task.state
        call_task.traceback = str(einfo)
        call_task.save()
    except CallTask.DoesNotExist:
        pass


@shared_task(base=CustomBaseTask)
def setup_call(call_id: int):
    call = Call.objects.get(pk=call_id)
    lxp = LXPLusDC3Space(settings.KEYTAB_USR, settings.KEYTAB_PWD, str(call.call_id))
    lxp.clone_dqmspace()


@shared_task(base=CustomBaseTask)
def clean_call_space(call_id: int):
    call = Call.objects.get(pk=call_id)
    lxp = LXPLusDC3Space(settings.KEYTAB_USR, settings.KEYTAB_PWD, str(call.call_id))
    lxp.clean_dqmspace()


@shared_task(base=CustomBaseTask)
def discover_call_runs(call_id: int):
    call = Call.objects.get(pk=call_id)
    results_dir = os.path.join(settings.BASE_RESULTS_DIR, str(call.call_id), "runs")
    if not os.path.exists(results_dir):
        os.makedirs(results_dir)

    # Get runs not sent in previous cycles
    rr = RunRegistry()
    not_in_run_numbers = rr.get_runs_from_all_cycles()
    other_run_numbers = rr.get_next_call_runs(not_in_run_numbers, call.class_name, call.dataset_name)
    save_json(os.path.join(results_dir, "runs_from_rr.json"), other_run_numbers)

    # Filter out runs not found in DCS json
    dcs = DailyDCSJson(call.class_name)
    dcs_json = dcs.download(latest=True)
    runs_to_include = [run for run in other_run_numbers if str(run) in dcs_json.keys()]
    runs_not_in_dcs_json = [run for run in other_run_numbers if str(run) not in dcs_json.keys()]
    runs_not_in_dcs_json = {"filename": dcs.latest.get("name"), "runs": runs_not_in_dcs_json}
    save_json(os.path.join(results_dir, "runs_not_in_dcs.json"), runs_not_in_dcs_json)

    # Filter out runs with low luminosity using Brilcalc
    lxp = LXPLusDC3Space(settings.KEYTAB_USR, settings.KEYTAB_PWD, str(call.call_id))
    stdout, stderr = lxp.run_brilcalc_checkminimum(runs_to_include)
    low_stat_runs = lxp.parse_brilcalc_checkminimum(stdout)
    save_json(os.path.join(results_dir, "low_stat_runs.json"), low_stat_runs)
    low_stat_runs = [r.get("run_number") for r in low_stat_runs]
    runs_to_include = [run for run in runs_to_include if str(run) not in low_stat_runs]

    # Filter out runs which any dataset in datasets list is not yet in DQMGUI
    runs_not_in_gui_by_dt = {}
    dqmgui = DQMGUI(settings.CERT_FPATH, settings.KEY_FPATH)
    for dt in DATASETS_TO_CHECK:
        runs_not_in_gui = dqmgui.check_if_runs_are_present(dt, runs_to_include)
        runs_not_in_gui_by_dt[dt] = runs_not_in_gui
        [runs_to_include.remove(run) for run in runs_not_in_gui if run in runs_to_include]

    save_json(os.path.join(results_dir, "runs_not_in_gui.json"), runs_not_in_gui_by_dt)
    save_json(os.path.join(results_dir, "included_runs.json"), runs_to_include)


@shared_task(base=CustomBaseTask)
def generate_lumiloss_plots(call_id: int, mode: str, remove_runs: list[int]):
    call = Call.objects.get(pk=call_id)
    results_dir = os.path.join(settings.BASE_RESULTS_DIR, str(call.call_id))
    runs_dir = os.path.join(results_dir, "runs")
    included_runs = read_json(os.path.join(runs_dir, "included_runs.json"))
    included_runs = [run for run in included_runs if run not in remove_runs]
    save_json(os.path.join(runs_dir, "final_included_runs.json"), included_runs)

    lxp = LXPLusDC3Space(
        settings.KEYTAB_USR,
        settings.KEYTAB_PWD,
        str(call.call_id),
        settings.RR_SSO_CLIENT_ID,
        settings.RR_SSO_CLIENT_SECRET,
    )
    lxp.run_allsteps_lumiloss(
        mode=mode, run_numbers=included_runs, dataset_name=call.dataset_name, class_name=call.class_name
    )
    lxp.download_lumiloss_results(mode, results_dir)
