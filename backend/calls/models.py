from typing import ClassVar

from django.db import models


class CallStatus:
    OPEN = "OPEN"
    CLOSED = "CLOSED"


class CallJobStatus:
    PENDING = "PENDING"
    STARTED = "STARTED"
    SUCCESS = "SUCCESS"
    FAILURE = "FAILURE"


class Call(models.Model):
    call_id = models.AutoField(primary_key=True)
    call_name = models.CharField(max_length=255, unique=True)
    dataset_name = models.CharField(max_length=255)
    class_name = models.CharField(max_length=255)
    status = models.CharField(default=CallStatus.OPEN, max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "tx_calls"
        indexes: ClassVar[list[models.Index]] = [
            models.Index(name="idx_call_name", fields=["call_name"]),
        ]

    def __str__(self) -> str:
        return f"Call <{self.call_id}>"


class CallJob(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    call_id = models.IntegerField()
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=255, default=CallJobStatus.PENDING)
    params = models.JSONField()
    results_dir = models.TextField(default="")
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    traceback = models.TextField(default="")

    class Meta:
        db_table = "tx_call_jobs"
        indexes: ClassVar[list[models.Index]] = [
            models.Index(name="idx_ch_call_id", fields=["call_id"]),
            models.Index(name="idx_ch_name", fields=["name"]),
            models.Index(name="idx_ch_status", fields=["status"]),
        ]

    def __str__(self) -> str:
        return f"CallJob <{self.id}>"
