@echo off

echo Installation de uv
call python -m pip install --upgrade uv --index-url=https://si-devops-mirror.edf.fr/repository/pypi.python.org/simple

echo Installation de l'environnement
call python -m uv sync

pause
