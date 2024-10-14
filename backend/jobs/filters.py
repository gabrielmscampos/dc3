from typing import ClassVar

from django_filters import rest_framework as filters

from .models import Job


class JobFilter(filters.FilterSet):
    class Meta:
        model = Job
        fields: ClassVar[dict[str, list[str]]] = {
            "name": ["exact"],
            "action": ["exact"],
            "created_by": ["exact"],
            "status": ["exact"],
        }
