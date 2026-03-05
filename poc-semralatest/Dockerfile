# Declare ARG for use in FROM instructions
ARG VERSION=3.12-slim

# Récupération image Python officielle
FROM python:3.12-slim as builder
ARG CI_JOB_TOKEN

USER root

# Ecriture du fichier .netrc pour accès GitLab
RUN echo "machine gitlab.dtg.dpih.edf.fr\nlogin gitlab-ci-token\npassword $CI_JOB_TOKEN" > /root/.netrc

# Installation de git pour récupérer les dépendances
RUN apt update && \
    apt install -y git --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Installation de uv (gestionnaire de packages Python)
RUN pip install uv

# Install the project into '/app'
COPY pyproject.toml uv.lock /app/
WORKDIR /app

# Install the project's dependencies using the lockfile and settings
RUN uv sync --frozen --no-install-project --no-dev --group server

# Then, add the rest of the project source code and install it
COPY . /app
RUN uv sync --frozen --no-dev --group server

# ============================================
# Final image
# ============================================
FROM python:3.12-slim

WORKDIR /app

COPY --from=builder /app /app

# Créer le dossier template pour les fichiers DATA (JSON)
# Fix pour copier les fichiers data json des pages (Ne pas retirer)
RUN mkdir -p /app/data_template && \
    cp -v /app/server/data/*.json /app/data_template/ && \
    echo "📦 Fichiers data template copiés:" && \
    ls -la /app/data_template/

# Fix pour copier les fichiers settings json des pages paramètres (Ne pas retirer)
# Créer le dossier template pour les fichiers CONFIG
RUN mkdir -p /app/config_template && \
    cp -v /app/server/config/*.json /app/config_template/ && \
    echo "📦 Fichiers config template copiés:" && \
    ls -la /app/config_template/

# Place executables in the environment at the front of the path
ENV PATH="/app/.venv/bin:$PATH"

# Exposer le port Flask
EXPOSE 8080

# Variable d'environnement pour forcer Flask à écouter sur 8080
ENV FLASK_RUN_PORT=8080

# Commande pour lancer le serveur Flask
CMD ["python", "run.py"]