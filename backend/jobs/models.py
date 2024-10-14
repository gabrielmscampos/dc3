from typing import ClassVar

from django.db import models


class JobStatus:
    PENDING = "PENDING"
    STARTED = "STARTED"
    SUCCESS = "SUCCESS"
    FAILURE = "FAILURE"


class Job(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    name = models.CharField(max_length=255)
    action = models.CharField(max_length=255)
    params = models.JSONField()
    created_by = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=255, default=JobStatus.PENDING)
    results_dir = models.TextField(default="")
    traceback = models.TextField(default="")

    class Meta:
        db_table = "tx_jobs"
        indexes: ClassVar[list[models.Index]] = [
            models.Index(name="idx_tx_jobs_name", fields=["name"]),
            models.Index(name="idx_tx_jobs_action", fields=["action"]),
            models.Index(name="idx_tx_jobs_created_by", fields=["created_by"]),
            models.Index(name="idx_tx_jobs_status", fields=["status"]),
        ]

    def __str__(self) -> str:
        return f"Job <{self.id}>"
