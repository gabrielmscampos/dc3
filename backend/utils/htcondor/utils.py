import sys

import pkg_resources


shell_template = """#!/bin/sh

python3 -m venv venv
source venv/bin/activate
{pip_install_packages}
python3 main.py
"""


script_template = """{src}

if __name__ == "__main__":
    import os
    import json
    from libdc3.config import dc3_config

    with open("input.json") as f:
        input_data = json.load(f)

    # Keeping it here for documentation:
    # Since cvmfs is mounted in HTCondor environment,
    # we don't need to set LXPLUS credentials to run bril though ssh
    # dc3_config.set_keytab_usr(os.getenv("KEYTAB_USR"))
    # dc3_config.set_keytab_pwd(os.getenv("KEYTAB_PWD"))

    dc3_config.set_auth_cert_path(os.getenv("CERT_FPATH"))
    dc3_config.set_auth_key_path(os.getenv("KEY_FPATH"))
    {entrypoint_func}(**input_data)
"""


def list_thirdparty_in_src(src: str) -> dict[str, str]:
    mods = list(sys.modules.keys())
    result = {}
    for mod in mods:
        # Skip bultin and submodules
        if mod in sys.builtin_module_names or "." in mod or "_" in mod:
            continue

        # skip modules not imported in the module src code
        from_ = f"from {mod}"
        import_ = f"import {mod}"
        if from_ not in src and import_ not in src:
            continue

        # get third party package version
        try:
            result[mod] = pkg_resources.get_distribution(mod).version
        except pkg_resources.DistributionNotFound:
            # if the module is bultin-in ("os", "json") it will fail here
            pass

    return result


def create_submit_file(request_cpus: int, request_disk: int, request_memory: int, environment: dict[str, str]) -> str:
    content = {
        "universe": "vanilla",
        "executable": "main.sh",
        "transfer_input_files": "main.py, input.json",
        "+JobFlavour": '"espresso"',
        "output": "$(ClusterId)_$(ProcId).out",
        "error": "$(ClusterId)_$(ProcId).err",
        "log": "$(ClusterId).log",
        "RequestCpus": str(request_cpus),
        "RequestDisk": str(request_disk),  # 124 MB
        "RequestMemory": str(request_memory),  # 6 GB
        "environment": '"' + " ".join([f"{key}={value}" for key, value in environment.items()]) + '"',
        "queue": None,
    }

    result = []
    for key, value in content.items():
        if value is None:
            result.append(f"{key}")
        else:
            result.append(f"{key} = {value}")

    return "\n".join(result)


def create_shell_script(src: str) -> str:
    packages = list_thirdparty_in_src(src)
    pip_install_packages = [f"{pkg}=={version}" for pkg, version in packages.items()]
    pip_install_packages = " ".join(pip_install_packages)
    pip_install_packages = f"pip install {pip_install_packages}"
    return shell_template.format(pip_install_packages=pip_install_packages)


def create_python_script(src: str, entrypoint_func: str) -> str:
    return script_template.format(src=src, entrypoint_func=entrypoint_func)
