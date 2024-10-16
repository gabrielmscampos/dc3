from typing import ClassVar

from django_filters import rest_framework as filters

from .models import CallJob


class CallJobsFilter(filters.FilterSet):
    class Meta:
        model = CallJob
        fields: ClassVar[dict[str, list[str]]] = {
            "call_id": ["exact"],
            "name": ["exact"],
            "status": ["exact"],
        }
