#!/bin/bash


# Запускаем Job с расписанием
kubectl apply -f timetable-job.yaml

# Запускаем Job с ссылками
kubectl apply -f sbj-job.yaml
kubectl wait --for=condition=complete --timeout=300s job/sbj-urls || exit 1

# Запускаем Job зачетками
kubectl apply -f zach-job.yaml

# Запускаем Job с рейтингом
kubectl apply -f raiting-job.yaml

echo "Все Job'ы запущены!"