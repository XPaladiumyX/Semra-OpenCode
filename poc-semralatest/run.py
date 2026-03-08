"""
SEMRA - Point d'entrée serveur
Initialise les fichiers de données et config puis lance Flask
"""

import os
import shutil
import logging

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)


def init_data_files():
    """
    Copie. les fichiers JSON par défaut si le volume PVC est vide.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, 'server', 'data')
    template_dir = os.path.join(base_dir, 'data_template')

    critical_files = [
        'grille_envoi_edf.json',
        'grille_envoi_tiers.json',
        'adour_et_gaves.json',
        'pyrenees.json',
        'aude_ariege.json',
        'tarn_agout.json',
        'sei_corse.json',
        'tiers.json',
        'bugs_ou_ameliorations.json',
        'plan_application.json'
    ]

    logger.info("=" * 60)
    logger.info("🚀 SEMRA - Initialisation des données")
    logger.info(f"📁 Data dir: {data_dir}")
    logger.info(f"📁 Template dir: {template_dir}")
    logger.info("=" * 60)

    os.makedirs(data_dir, exist_ok=True)

    if not os.path.exists(template_dir):
        logger.warning(f"⚠️ Dossier template non trouvé: {template_dir}")
        return

    copied_count = 0
    for filename in critical_files:
        src = os.path.join(template_dir, filename)
        dst = os.path.join(data_dir, filename)

        if not os.path.exists(dst):
            if os.path.exists(src):
                shutil.copy2(src, dst)
                logger.info(f"✅ Copié: {filename}")
                copied_count += 1
            else:
                logger.warning(f"⚠️ Template manquant: {filename}")
        else:
            logger.info(f"⏭️  Existe déjà: {filename}")

    if copied_count > 0:
        logger.info(f"📦 {copied_count} fichier(s) data initialisé(s)")
    else:
        logger.info("✅ Tous les fichiers data sont déjà présents")


def init_config_files():
    """
    Copie les fichiers de configuration par défaut si absents.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    config_dir = os.path.join(base_dir, 'server', 'config')
    template_dir = os.path.join(base_dir, 'config_template')

    critical_files = [
        'settings.json'
    ]

    logger.info("=" * 60)
    logger.info("🚀 SEMRA - Initialisation de la configuration")
    logger.info(f"📁 Config dir: {config_dir}")
    logger.info(f"📁 Template dir: {template_dir}")
    logger.info("=" * 60)

    os.makedirs(config_dir, exist_ok=True)

    if not os.path.exists(template_dir):
        logger.warning(f"⚠️ Dossier config template non trouvé: {template_dir}")
        # Créer un settings.json par défaut si aucun template
        default_settings = os.path.join(config_dir, 'settings.json')
        if not os.path.exists(default_settings):
            logger.info("📝 Création d'un settings.json par défaut...")
            import json
            default_config = {
                "charges_affaires": {},
                "chemins": {},
                "interlocuteurs": {},
                "signature_selectionnee": "GRENOBLE_A",
                "textes_mails": {}
            }
            with open(default_settings, 'w', encoding='utf-8') as f:
                json.dump(default_config, f, ensure_ascii=False, indent=2)
            logger.info(f"✅ Créé: settings.json (défaut)")
        return

    copied_count = 0
    for filename in critical_files:
        src = os.path.join(template_dir, filename)
        dst = os.path.join(config_dir, filename)

        if not os.path.exists(dst):
            if os.path.exists(src):
                shutil.copy2(src, dst)
                logger.info(f"✅ Copié: {filename}")
                copied_count += 1
            else:
                logger.warning(f"⚠️ Template manquant: {filename}")
        else:
            logger.info(f"⏭️  Existe déjà: {filename}")

    if copied_count > 0:
        logger.info(f"📦 {copied_count} fichier(s) config initialisé(s)")
    else:
        logger.info("✅ Tous les fichiers config sont déjà présents")


# ✅ IMPORTANT: Initialiser les fichiers AVANT d'importer l'app Flask
init_data_files()
init_config_files()

# Importer l'application Flask
from app import app

if __name__ == '__main__':
    port = int(os.environ.get('FLASK_RUN_PORT', 8080))
    host = os.environ.get('FLASK_RUN_HOST', '0.0.0.')
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'

    logger.info("=" * 60)
    logger.info(f"  SEMRA - Serveur Flask")
    logger.info(f"  Host: {host}")
    logger.info(f"  Port: {port}")
    logger.info(f"  Debug: {debug}")
    logger.info("=" * 60)

    app.run(
        host=host,
        port=port,
        debug=debug,
        threaded=True
    )