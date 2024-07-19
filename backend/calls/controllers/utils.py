import json


def save_json(path: str, data: dict):
    with open(path, "w") as f:
        json.dump(data, f)


def read_json(path: str):
    with open(path) as f:
        return json.load(f)
