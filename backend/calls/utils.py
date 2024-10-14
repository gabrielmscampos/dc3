from functools import wraps

from rest_framework.exceptions import PermissionDenied

from .models import CallStatus


def block_if_closed(view_method):
    @wraps(view_method)
    def _wrapped_view(self, *args, **kwargs):
        call = self.get_object()
        if call.status == CallStatus.CLOSED:
            raise PermissionDenied("This call is closed and cannot be modified.")
        return view_method(self, call, *args, **kwargs)

    return _wrapped_view
