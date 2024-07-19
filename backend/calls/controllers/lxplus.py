import logging
import os
import os.path
import re

import paramiko
from scp import SCPClient


logging.getLogger("paramiko").setLevel(logging.WARNING)


class LXPLusDC3Space:
    SERVER = "lxplus.cern.ch"
    BASE_DIR = "/eos/project-m/mlplayground/public/dc3"
    DC_SCRIPTS_REPO = "https://github.com/syuvivida/DQMSpace"

    def __init__(
        self,
        keytab_usr: str,
        keytab_pwd: str,
        call_id: int,
        rr_sso_client_id: str | None = None,
        rr_sso_client_secret: str | None = None,
    ):
        self.call_id = call_id
        self.call_filespath = os.path.join(self.BASE_DIR, self.call_id)
        self.client = paramiko.SSHClient()
        self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        self.client.connect(self.SERVER, username=keytab_usr, password=keytab_pwd)
        self.rr_sso_client_id = rr_sso_client_id
        self.rr_sso_client_secret = rr_sso_client_secret

    def read_file(self, filepath: str):
        command = f"cat {filepath}"
        _, stdout, _ = self.client.exec_command(command)
        return_code = stdout.channel.recv_exit_status()
        stdout = stdout.read().decode("utf-8").strip()

        if return_code != 0:
            raise RuntimeError

        return stdout

    def clone_dqmspace(self):
        command = f"""
        mkdir -p {self.call_filespath} \\
        && cd {self.call_filespath} \\
        && git clone {self.DC_SCRIPTS_REPO}
        """
        _, stdout, _ = self.client.exec_command(command)
        return_code = stdout.channel.recv_exit_status()

        if return_code != 0:
            raise RuntimeError

    def clean_dqmspace(self):
        dqmspace_scripts = os.path.join(self.call_filespath, "DQMSpace")
        command = f"""
        cd {self.call_filespath} \\
        && rm -rf {dqmspace_scripts}
        """
        _, stdout, _ = self.client.exec_command(command)
        return_code = stdout.channel.recv_exit_status()

        if return_code != 0:
            raise RuntimeError

    def run_brilcalc_checkminimum(self, run_numbers: list[int]):
        brilcalc_scripts = os.path.join(self.call_filespath, "DQMSpace/brilcalc_scripts")
        input_runs = "\n".join(str(r) for r in run_numbers)
        command = f"""
        cd {brilcalc_scripts} \\
        && echo '{input_runs}' > runList.txt \\
        && chmod +x run_brilcalc_checkminimum.sh \\
        && ./run_brilcalc_checkminimum.sh runList.txt
        """
        _, stdout, stderr = self.client.exec_command(command)
        return_code = stdout.channel.recv_exit_status()
        stdout = stdout.read().decode("utf-8").strip()
        stderr = stderr.read().decode("utf-8").strip()

        if return_code != 0:
            raise RuntimeError(stderr)

        return stdout, stderr

    def run_allsteps_lumiloss(
        self,
        mode: str,
        run_numbers: list[int],
        dataset_name: str,
        class_name: str,
        period: str = "dc3",
        step: str = "all",
        dir_: str = "outputtest",
        input_run_file: str = "runList.txt",
    ):
        if self.rr_sso_client_id is None or self.rr_sso_client_secret is None:
            raise ValueError("RR SSO credentials are missing")

        results_path = os.path.join(self.call_filespath, mode)
        lumiloss_scripts = os.path.join(self.call_filespath, "DQMSpace/runregistry_scripts/lumiloss")
        input_runs = "\n".join(str(r) for r in run_numbers)
        command = f"""
        cd {lumiloss_scripts} \\
        && echo '{input_runs}' > {input_run_file} \\
        && echo 'SSO_CLIENT_ID={self.rr_sso_client_id}' > .env \\
        && echo 'SSO_CLIENT_SECRET={self.rr_sso_client_secret}' >> .env \\
        && chmod +x runAllSteps_lumiloss.sh \\
        && ./runAllSteps_lumiloss.sh {period} {step} {dir_} {input_run_file} {dataset_name} {class_name} \\
        && mkdir -p {results_path} \\
        && mv {dir_}/* {results_path}
        """
        _, stdout, stderr = self.client.exec_command(command)
        return_code = stdout.channel.recv_exit_status()
        stdout = stdout.read().decode("utf-8").strip()
        stderr = stderr.read().decode("utf-8").strip()

        if return_code != 0:
            raise RuntimeError(stderr)

        return stdout, stderr

    def download_lumiloss_results(self, mode: str, local_path: str):
        results_path = os.path.join(self.call_filespath, mode)

        # Only download if EOS is not mounted locally
        if os.path.isdir(results_path) is False:
            with SCPClient(self.client.get_transport()) as scp:
                scp.get(results_path, local_path, recursive=True)

    @staticmethod
    def parse_brilcalc_checkminimum(stdout: str):
        pattern = r"run (\d+) has integrated luminosity ([+-]?\d*\.?\d+) \/(f|n|p)b, shall be removed from the DC call"
        matches = re.findall(pattern, stdout)
        return [{"run_number": match[0], "lumi": match[1]} for match in matches]
