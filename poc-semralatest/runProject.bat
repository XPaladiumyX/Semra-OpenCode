@echo off

if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate.bat
    call python -m streamlit run run.py
) else (echo "ERROR: Pas d'environnement virtuel trouve")

pause
