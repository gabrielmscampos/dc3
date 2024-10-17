class MyScheddBumpError(Exception):
    pass


class CondorSubmitError(Exception):
    pass


class CondorRmError(Exception):
    pass


class CondorJobHeldError(Exception):
    pass


class CondorJobSuspendedError(Exception):
    pass


class CondorJobRemovedError(Exception):
    pass


class CondorJobFailedError(Exception):
    pass
