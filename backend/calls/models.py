from typing import ClassVar

from celery import states
from django.db import models


ALL_STATES = sorted(states.ALL_STATES)
TASK_STATE_CHOICES = sorted(zip(ALL_STATES, ALL_STATES, strict=True))


class CallStatus:
    OPEN = "OPEN"
    CLOSED = "CLOSED"


class Call(models.Model):
    call_id = models.AutoField(primary_key=True)
    call_name = models.CharField(max_length=255)
    dataset_name = models.CharField(max_length=255)
    class_name = models.CharField(max_length=255)
    status = models.CharField(default=CallStatus.OPEN, max_length=255)
    created_by = models.CharField(max_length=255)
    modified_by = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "fact_calls"
        indexes: ClassVar[list[models.Index]] = [
            models.Index(name="idx_call_name", fields=["call_name"]),
        ]

    def __str__(self) -> str:
        return f"Call <{self.call_id}>"


class CallTask(models.Model):
    id = models.AutoField(primary_key=True)
    call_id = models.CharField(max_length=255)
    task_id = models.CharField(max_length=255, unique=True)
    status = models.CharField(max_length=255, default=states.PENDING, choices=TASK_STATE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    traceback = models.TextField(default="")

    class Meta:
        db_table = "fact_calls_tasks"
        indexes: ClassVar[list[models.Index]] = [
            models.Index(name="idx_calls_tasks_call_id", fields=["call_id"]),
            models.Index(name="idx_calls_tasks_task_id", fields=["task_id"]),
        ]

    def __str__(self) -> str:
        return f"CallTask <{self.call_id}> <{self.task_id}>"
