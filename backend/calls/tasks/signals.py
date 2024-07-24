from celery import signals, states
from celery.result import AsyncResult

from ..models import CallTask


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
