import logging
from io import BytesIO

import paramiko


logging.getLogger("paramiko").setLevel(logging.WARNING)


class SSHExecutor:
    SERVER = "lxplus.cern.ch"

    def __init__(self, lxplus_user: str, lxplus_pwd: str, timeout: int = 5 * 60):
        self.timeout = timeout
        self.client = paramiko.SSHClient()
        self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        self.client.connect(self.SERVER, username=lxplus_user, password=lxplus_pwd)

    def ls(self, remote_path: str) -> list:
        _, stdout, _ = self.client.exec_command(f"ls {remote_path}")
        return stdout.read().decode("utf-8").strip().split("\n")

    def cat(self, remote_path: str) -> list:
        _, stdout, _ = self.client.exec_command(f"cat {remote_path}")
        return stdout.read().decode("utf-8")

    def mkdir(self, remote_path: str) -> None:
        _, stdout, _ = self.client.exec_command(f"mkdir -p {remote_path}")
        stdout.channel.recv_exit_status()

    def mv(self, from_: str, to_: str) -> None:
        _, stdout, _ = self.client.exec_command(f"mv {from_} {to_}")
        stdout.channel.recv_exit_status()

    def rm(self, remote_path: str, recursive: bool = False) -> None:
        rm_base = "rm -rf" if recursive else "rm"
        _, stdout, _ = self.client.exec_command(f"{rm_base} {remote_path}")
        stdout.channel.recv_exit_status()

    def chmod_x(self, remote_fpath: str):
        _, stdout, _ = self.client.exec_command(f"chmod +x {remote_fpath}")
        stdout.channel.recv_exit_status()

    def is_file(self, remote_fpath: str) -> list:
        _, stdout, _ = self.client.exec_command(f"test -f {remote_fpath} && echo Success")
        stdout = stdout.read().decode("utf-8").strip()
        return True if stdout == "Success" else False

    def is_dir(self, remote_path: str) -> list:
        _, stdout, _ = self.client.exec_command(f"test -d {remote_path} && echo Success")
        stdout = stdout.read().decode("utf-8").strip()
        return True if stdout == "Success" else False

    def put_file(self, local_fpath: str, remote_fpath: str):
        sftp = self.client.open_sftp()
        sftp.put(local_fpath, remote_fpath)
        sftp.close()

    def put_str_as_file(self, file_content: str, remote_fpath: str):
        sftp = self.client.open_sftp()
        sftp.putfo(BytesIO(file_content.encode()), remote_fpath)
        sftp.close()

    def __enter__(self) -> "SSHExecutor":
        return self

    def __exit__(self, exc_type, exc_val, traceback) -> None:
        self.close()

    def close(self) -> None:
        self.client.close()
