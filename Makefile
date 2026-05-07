.PHONY: up down build logs migrate test shell frontend

up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build

logs:
	docker-compose logs -f

migrate:
	docker-compose exec backend alembic upgrade head

makemigrations:
	docker-compose exec backend alembic revision --autogenerate -m "$(msg)"

test:
	docker-compose exec backend pytest

shell:
	docker-compose exec backend bash

frontend:
	docker-compose exec frontend bash
