import json
import os

from libdc3.methods.next_call import NextCallGenerator


def discover_runs(call_meta: dict, job: dict):
    """
    Parameters needed:
    - bril_brilws_version
    - bril_unit
    - bril_low_lumi_thr
    - bril_beamstatus
    - bril_amodetag
    - bril_normtag
    - gui_lookup_datasets
    - refresh_runs_if_needed
    """
    call = NextCallGenerator(
        rr_class_name=call_meta["class_name"],
        rr_dataset_name=call_meta["dataset_name"],
        bril_brilws_version=job["params"]["bril_brilws_version"],
        bril_unit=job["params"]["bril_unit"],
        bril_low_lumi_thr=job["params"]["bril_low_lumi_thr"],
        bril_beamstatus=job["params"]["bril_beamstatus"],
        bril_amodetag=job["params"]["bril_amodetag"],
        bril_normtag=job["params"]["bril_normtag"],
        gui_lookup_datasets=job["params"]["gui_lookup_datasets"],
        refresh_runs_if_needed=job["params"]["refresh_runs_if_needed"],
    )
    results = call.generate()

    # Store results in results_dir
    fpath = os.path.join(job["results_dir"], "results.json")
    with open(fpath, "w") as f:
        json.dump(results, f)
