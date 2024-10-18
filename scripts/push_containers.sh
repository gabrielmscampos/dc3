#!/bin/bash

REGISTRY_REPO=registry.cern.ch/cms-dqmdc

# Build locally
docker build -f ./backend/Dockerfile -t dc3_backend_release .
docker build -f ./frontend/Dockerfile.prod -t dc3_frontend_release .
docker pull nginxinc/nginx-unprivileged

# Tag containers according to remote registry
docker tag dc3_backend_release $REGISTRY_REPO/dc3-backend
docker tag dc3_frontend_release $REGISTRY_REPO/dc3-frontend
docker tag nginxinc/nginx-unprivileged:latest $REGISTRY_REPO/nginxinc-nginx-unprivileged

# Login to registry and push containers
docker login https://registry.cern.ch
docker push $REGISTRY_REPO/dc3-backend
docker push $REGISTRY_REPO/dc3-frontend
docker push $REGISTRY_REPO/nginxinc-nginx-unprivileged
