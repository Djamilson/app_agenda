#!/bin/sh
docker network create web
docker-compose --compatibility -f docker-compose.yml -f docker-production.yml up -d --remove-orphans --no-deps --build
