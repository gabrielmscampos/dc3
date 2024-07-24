from typing import ClassVar

from django_filters import rest_framework as filters

from .models import CallTask


class CallTaskFilter(filters.FilterSet):
    class Meta:
        model = CallTask
        fields: ClassVar[dict[str, list[str]]] = {
            "call_id": ["exact"],
            "task_id": ["exact"],
        }
