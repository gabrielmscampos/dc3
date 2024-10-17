import json
import re
import time
from typing import ClassVar

from .exceptions import (
    CondorJobFailedError,
    CondorJobHeldError,
    CondorJobRemovedError,
    CondorJobSuspendedError,
    CondorRmError,
    CondorSubmitError,
    MyScheddBumpError,
)
from .ssh import SSHExecutor


class HTCondorExecutor(SSHExecutor):
    STATUS: ClassVar[dict[int, str]] = {
        1: "IDLE",
        2: "RUNNING",
        3: "REMOVED",
        4: "COMPLETED",
        5: "HELD",
        6: "TRANSFERRING_OUTPUT",
        7: "SUSPENDED",
    }

    def myschedd_bump(self) -> tuple[str]:
        _, stdout, stderr = self.client.exec_command("myschedd bump")
        stdout = stdout.read().decode("utf-8").strip()
        match = re.search(r"Selected best schedd '(.*)' for user '(.*)' in pool '(.*)'", stdout)
        if match is None:
            stderr = stderr.read().decode("utf-8").strip()
            raise MyScheddBumpError(stderr)
        return match.groups()  # schedd, user, pool

    def condor_submit(self, remote_directory: str, submit_file: str):
        _, stdout, stderr = self.client.exec_command(f"cd {remote_directory} && condor_submit {submit_file}")
        stdout = stdout.read().decode("utf-8").strip()

        if stdout and "1 job(s) submitted to cluster" in stdout:
            job_id = int(float(stdout.split()[-1]))
        else:
            stderr = stderr.read().decode("utf-8").strip()
            raise CondorSubmitError(stderr)

        return job_id

    def condor_q(
        self,
        schedd: str | None = None,
        job_id: str | None = None,
        long: bool | None = False,
        as_json: bool | None = False,
    ):
        cmd = "condor_q"
        if schedd:
            cmd += f" -name {schedd}"
        if as_json:
            cmd += " -long"
        if long:
            cmd += " -json"
        if job_id:
            cmd += f" {job_id}"

        _, stdout, _ = self.client.exec_command(cmd)
        stdout = stdout.read().decode("utf-8").strip()
        return stdout

    def condor_history(
        self,
        schedd: str | None = None,
        job_id: str | None = None,
        long: bool | None = False,
        as_json: bool | None = False,
        limit: int | None = None,
    ):
        cmd = "condor_history"
        if schedd:
            cmd += f" -name {schedd}"
        if as_json:
            cmd += " -long"
        if long:
            cmd += " -json"
        if limit:
            cmd += f" -limit {limit}"
        if job_id:
            cmd += f" {job_id}"

        _, stdout, _ = self.client.exec_command(cmd)
        stdout = stdout.read().decode("utf-8").strip()
        return stdout

    def wait_job(self, schedd: str | None, job_id: str | None, interval: int = 10):
        status = None
        while True:
            status = self.condor_q(schedd, job_id, long=True, as_json=True).strip()
            if status == "":
                status = self.condor_history(schedd, job_id, long=True, as_json=True, limit=1)

            status = json.loads(status)
            if len(status) == 0:
                continue
            status = status[0]
            status["JobStatus"] = self.STATUS[status.get("JobStatus")]
            if status["JobStatus"] == "HELD":
                self.condor_rm(job_id, schedd)
                raise CondorJobHeldError()
            elif status["JobStatus"] == "SUSPENDED":
                self.condor_rm(job_id, schedd)
                raise CondorJobSuspendedError()
            elif status["JobStatus"] == "REMOVED":
                raise CondorJobRemovedError()
            elif status["JobStatus"] == "COMPLETED":
                err_content = self.cat(f"{status.get('Iwd')}/{job_id}_0.err")
                if "Traceback (most recent call last):" in err_content:
                    traceback_err = err_content.strip().split("\n")
                    traceback_err = "\n".join(
                        traceback_err[traceback_err.index("Traceback (most recent call last):") :]
                    )
                    raise CondorJobFailedError(traceback_err)
                break

            # IDLE, RUNNING, TRANSFERRING_OUTPUT
            time.sleep(interval)

        return status

    def condor_rm(self, job_id: str, schedd: str | None = None):
        cmd = "condor_rm"
        if schedd:
            cmd += f" -name {schedd}"
        cmd += f" {job_id}"
        _, stdout, stderr = self.client.exec_command(cmd)
        stdout = stdout.read().decode("utf-8").strip()

        if stdout and "marked for removal" in stdout:
            return True

        stderr = stderr.read().decode("utf-8").strip()
        raise CondorRmError(stderr)

    def __enter__(self) -> "HTCondorExecutor":
        return self
