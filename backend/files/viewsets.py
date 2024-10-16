import os
from datetime import datetime
from typing import ClassVar

from django.conf import settings
from django.http import FileResponse, HttpResponse
from rest_framework import status, viewsets
from rest_framework.authentication import BaseAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response
from utils.rest_framework_cern_sso.authentication import (
    CERNKeycloakConfidentialAuthentication,
)


class FileViewSet(viewsets.ViewSet):
    authentication_classes: ClassVar[list[BaseAuthentication]] = [
        CERNKeycloakConfidentialAuthentication,
    ]

    def is_safe_path(self, base_dir, path):
        absolute_path = os.path.abspath(path)
        return absolute_path.startswith(os.path.abspath(base_dir))

    def list(self, request):
        dir_path = request.query_params.get("dir", "")
        if not self.is_safe_path(settings.BASE_LOCAL_RESULTS_DIR, dir_path):
            return Response({"error": "Invalid directory path"}, status=status.HTTP_400_BAD_REQUEST)

        if not os.path.exists(dir_path):
            return Response({"error": "Directory does not exist"}, status=status.HTTP_404_NOT_FOUND)

        files = []
        for entry in os.listdir(dir_path):
            entry_path = os.path.join(dir_path, entry)
            files.append(
                {
                    "name": entry,
                    "is_directory": os.path.isdir(entry_path),
                    "size": os.path.getsize(entry_path) if os.path.isfile(entry_path) else None,
                    "last_modified": datetime.fromtimestamp(os.path.getmtime(entry_path)).isoformat(),
                }
            )

        return Response(files)

    @action(detail=False, methods=["GET"], url_path="content")
    def file_content(self, request):
        file_path = request.query_params.get("path", "")
        if not self.is_safe_path(settings.BASE_LOCAL_RESULTS_DIR, file_path):
            return Response({"error": "Invalid directory path"}, status=status.HTTP_400_BAD_REQUEST)

        if not os.path.exists(file_path):
            return Response({"error": "File does not exist"}, status=status.HTTP_404_NOT_FOUND)
        if not os.path.isfile(file_path):
            return Response({"error": "Entry is not a file"}, status=status.HTTP_404_NOT_FOUND)

        file_extension = os.path.splitext(file_path)[1].lower()
        mime_types = {
            ".json": "application/json",
            ".txt": "text/plain",
            ".csv": "text/csv",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
        }

        if file_extension in [".png", ".jpg", ".jpeg"]:
            return FileResponse(open(file_path, "rb"), content_type=mime_types[file_extension])
        else:
            with open(file_path) as file:
                content = file.read()
            return HttpResponse(content, content_type=mime_types.get(file_extension, "text/plain"))

    @action(detail=False, methods=["GET"], url_path="download")
    def download_file(self, request):
        file_path = request.query_params.get("path", "")
        if not self.is_safe_path(settings.BASE_LOCAL_RESULTS_DIR, file_path):
            return Response({"error": "Invalid directory path"}, status=status.HTTP_400_BAD_REQUEST)

        if not os.path.exists(file_path):
            return Response({"error": "File does not exist"}, status=status.HTTP_404_NOT_FOUND)

        return FileResponse(open(file_path, "rb"), as_attachment=True)
