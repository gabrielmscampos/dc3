import runregistry as rr


class RunRegistry:
    def get_runs_from_all_cycles(self):
        cycles = rr.get_cycles()
        all_runs = [cd["run_number"] for cycle in cycles for cd in cycle["CycleDataset"]]
        return sorted(set(all_runs))

    def get_next_call_runs(self, not_in_list_of_run_numbers: list[int], class_name: str, dataset_name: str):
        datasets = rr.get_datasets(
            filter={
                "and": [
                    {"and": [{"run_number": {"<>": rn}} for rn in not_in_list_of_run_numbers]},
                    {"rr_attributes.class": {"=": class_name}},
                    {"name": {"=": dataset_name}},
                    {"dataset_attributes.global_state": {"=": "OPEN"}},
                ],
                "name": {"and": [{"<>": "online"}]},
                "dataset_attributes.global_state": {
                    "and": [{"or": [{"=": "OPEN"}, {"=": "SIGNOFF"}, {"=": "COMPLETED"}]}]
                },
            },
            ignore_filter_transformation=True,
        )
        return sorted([dt["run_number"] for dt in datasets])
