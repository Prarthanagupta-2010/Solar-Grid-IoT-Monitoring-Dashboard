#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
docker compose up --build -d
printf '%s\n' "SolarGrid: http://localhost:3000" "Swagger: http://localhost:8080/swagger-ui.html"

