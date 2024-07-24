import json

from celery import Task

from ..models import CallTask


class CustomBaseTask(Task):
    def apply_async(self, args=None, kwargs=None, **options):
        task_instance = super().apply_async(args=args, kwargs=kwargs, **options)
        CallTask.objects.create(
            call_id=options.get("call_id"),
            task_id=task_instance.id,
            task_name=options.get("task_name", ""),
            task_args=json.dumps(args),
            created_by=options.get("username"),
        )
        return task_instance
