"""
SEMRA V2.7 - Backend Flask SERVEUR
Version serveur (Linux/Windows) - Sans pywin32
Les routes Outlook sont gérées par le client local (port 5000)
"""

from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import json
import os
import re
import sys
import logging
import unicodedata

app = Flask(__name__,
            template_folder='server/templates',
            static_folder='server/static')
CORS(app)  # Autorise les appels depuis le client local

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

# Force le flush immédiat
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

CONFIG_PATH = os.path.join(os.path.dirname(__file__), 'server', 'config', 'settings.json')
DATA_PATH = os.path.join(os.path.dirname(__file__), 'server', 'data')

logger.info(f"📁 CONFIG_PATH: {CONFIG_PATH}")
logger.info(f"📁 DATA_PATH: {DATA_PATH}")


# ============================================================
# Routes principales des pages
# ============================================================
@app.route('/')
def semra():
    return render_template('main_page.html')

@app.route('/adour-et-gaves')
def adour_et_gaves():
    return render_template('adour_et_gaves.html')

@app.route('/pyrenees')
def pyrenees():
    return render_template('pyrenees.html')

@app.route('/aude_ariege')
def aude_ariege():
    return render_template('aude_ariege.html')

@app.route('/tarn_agout')
def tarn_agout():
    return render_template('tarn_agout.html')

@app.route('/sei_corse')
def sei_corse():
    return render_template('sei_corse.html')

@app.route('/tiers')
def tiers():
    return render_template('tiers.html')

@app.route('/bugs_ou_ameliorations')
def bugs_ou_ameliorations():
    return render_template('bugs_ou_ameliorations.html')

@app.route('/liste_ouvrages')
def liste_ouvrages():
    return render_template('liste_ouvrages.html')

@app.route('/grille_envoi_edf')
def grille_envoi_edf():
    return render_template('grille_envoi_edf.html')

@app.route('/grille_envoi_tiers')
def grille_envoi_tiers():
    return render_template('grille_envoi_tiers.html')

@app.route('/config')
def config():
    return render_template('config.html')

@app.route('/plan_application')
def plan_application():
    return render_template('plan_application.html')

@app.route('/form')
def form():
    return render_template('forms/form.html')


# ============================================================
# API Configuration
# ============================================================

@app.route('/api/config', methods=['GET'])
def get_config():
    try:
        with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
            return jsonify(json.load(f))
    except FileNotFoundError:
        return jsonify({"error": "Fichier de configuration introuvable"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Erreur de lecture de la configuration"}), 500


@app.route('/api/config', methods=['POST'])
def save_config():
    try:
        config = request.get_json()
        os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)
        with open(CONFIG_PATH, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)
        return jsonify({"success": True, "message": "Configuration sauvegardée"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/get_config', methods=['GET'])
def get_mail_config():
    """Alias pour compatibilité avec le JS existant"""
    try:
        with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
            return jsonify(json.load(f)), 200
    except FileNotFoundError:
        return jsonify({'error': 'CONFIG_NOT_FOUND', 'message': 'Configuration introuvable'}), 404
    except Exception as e:
        return jsonify({'error': 'UNKNOWN_ERROR', 'message': str(e)}), 500


# ============================================================
# NOTE: Les routes Outlook sont sur le client local (port 5000)
# ============================================================

@app.route('/create_mailto_link', methods=['POST'])
def create_mailto_link():
    """Fallback mailto (ne nécessite pas Outlook)"""
    try:
        import urllib.parse
        data = request.get_json()
        subject = data.get('subject', '')
        body = re.sub('<[^<]+?>', '', data.get('body', '').replace('<br>', '\n'))
        to = data.get('to', '')
        mailto_link = f"mailto:{urllib.parse.quote(to)}?subject={urllib.parse.quote(subject)}&body={urllib.parse.quote(body)}"
        return jsonify({'success': True, 'mailto_link': mailto_link}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ============================================================
# Helpers pour extraction d'emails et lecture des données
# ============================================================

def _normalize_text(text):
    """Normalise le texte : minuscules, sans accents, espaces nettoyés."""
    if not text:
        return ''
    # Supprimer les accents
    text = ''.join(
        c for c in unicodedata.normalize('NFD', text)
        if unicodedata.category(c) != 'Mn'
    )
    return text.lower().strip()


def _extract_emails(text):
    """Extrait toutes les adresses email d'une chaîne de texte."""
    if not text:
        return []
    return re.findall(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', str(text))


def _get_emails_from_geh_row(geh_data, row_label, col_index):
    """
    Cherche dans un tableau GEH les emails pour un libellé de ligne et un index de colonne.
    """
    for row in geh_data.get('rows', []):
        if row.get('label', '').strip() == row_label.strip():
            row_type = row.get('type', 'simple')
            if row_type == 'contact' and 'emails' in row:
                emails_list = row['emails']
                raw = emails_list[col_index] if col_index < len(emails_list) else ''
                return _extract_emails(raw)
            elif row_type == 'simple':
                values = row.get('values', [])
                raw = values[col_index] if col_index < len(values) else ''
                return _extract_emails(raw)
    return []


def _load_json_data(filename):
    """Charge un fichier JSON depuis le dossier data."""
    path = os.path.join(DATA_PATH, filename)
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}


# ============================================================
# API Destinataires de mail automatiques
# ============================================================

_STATIC_INTERLOCUTEURS_LABELS = {
    'RAPPORTS_REGLEMENTAIRES', 'Liste_dest_recurrents', 'Chef_DPT',
    'CDS_CRACP', 'CDS_S2MA_Ouest', 'CDS_S2MA_Est', 'CDS_ASOH',
    'EXPERT_1', 'EXPERT_2', 'SECRETAIRES', 'DTG_DEP', 'SDO_DTG',
    'COMPTEUR_RAPPORT', 'COMPTEUR_CDA', 'COMPTEUR_TOPO', 'COMPTEUR_INTERVENTION',
    'CM_GC_FC_DI', 'DTG_DEP_TOULOUSE', 'DTG_DEP_BRIVE',
    'DTG_DEP_GRENOBLE_A', 'DTG_DEP_GRENOBLE_B', 'DTG_DMM_MAINTENANCE',
}

_TIERS_LABEL_MAP = {
    'Exploitant': 'Mail Exploitant',
    "Maitre d'ouvrage": 'Mail Maitre d\'ouvrage',
    "Chargé-e d'affaires CRA": "Mail Chargé-e d'affaires CRA",
    "Chargé-e d'affaires remplaçant": "Mail Chargé-e d'affaires remplaçant",
}


@app.route('/api/mail/get_recipients', methods=['POST'])
def get_mail_recipients():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"success": False, "error": "Corps JSON manquant"}), 400

        geh_name      = data.get('geh', '').strip()
        gu_col_index  = int(data.get('gu_col_index', 0))
        mail_type     = data.get('mail_type', '').strip()
        is_tiers      = bool(data.get('is_tiers', False))

        # ✅ LOG DEBUG
        logger.info("=" * 60)
        logger.info(f"📧 GET RECIPIENTS REQUEST")
        logger.info(f"   GEH: {geh_name}")
        logger.info(f"   Mail Type: '{mail_type}'")
        logger.info(f"   Is Tiers: {is_tiers}")
        logger.info(f"   GU Col Index: {gu_col_index}")

        allowed_gehs = {'adour_et_gaves', 'pyrenees', 'aude_ariege', 'tarn_agout', 'sei_corse', 'tiers'}
        if geh_name not in allowed_gehs:
            logger.error(f"❌ GEH inconnu: {geh_name}")
            return jsonify({"success": False, "error": f"GEH inconnu : '{geh_name}'"}), 400

        # Chargement config
        settings = _load_json_data('../config/settings.json') or {}
        if not settings:
            try:
                with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
                    settings = json.load(f)
            except Exception:
                settings = {}
        interlocuteurs = settings.get('interlocuteurs', {})

        # Chargement grille
        grille_file = 'grille_envoi_tiers.json' if is_tiers else 'grille_envoi_edf.json'
        logger.info(f"   Grille File: {grille_file}")

        grille = _load_json_data(grille_file)
        if not grille:
            logger.error(f"❌ Grille non trouvée: {grille_file}")
            return jsonify({"success": False, "error": f"Grille introuvable : {grille_file}"}), 404

        grille_columns = grille.get('columns', [])
        logger.info(f"   Colonnes grille: {grille_columns}")

        # ✅ RECHERCHE INSENSIBLE À LA CASSE ET AUX ACCENTS
        mail_col_index = None
        mail_type_normalized = _normalize_text(mail_type)

        for i, col in enumerate(grille_columns):
            col_normalized = _normalize_text(col)
            if col_normalized == mail_type_normalized:
                mail_col_index = i
                logger.info(f"✅ Colonne trouvée: '{col}' (index {i})")
                break

        if mail_col_index is None:
            available = ', '.join(f'"{c}"' for c in grille_columns)
            logger.error(f"❌ Type de mail '{mail_type}' introuvable")
            logger.error(f"   Colonnes disponibles: {available}")
            return jsonify({
                "success": False,
                "error":   f"Type de mail '{mail_type}' introuvable. Disponibles : {available}"
            }), 400

        # Chargement données GEH
        geh_data    = _load_json_data(f'{geh_name}.json')
        geh_columns = geh_data.get('columns', [])
        gu_name     = geh_columns[gu_col_index] if gu_col_index < len(geh_columns) else str(gu_col_index)

        logger.info(f"   GU Name: {gu_name}")

        # Parcours grille
        to_list  = []
        cc_list  = []
        bcc_list = []

        for row in grille.get('rows', []):
            label  = row.get('label', '').strip()
            values = row.get('values', [])

            if mail_col_index >= len(values):
                continue

            cell_val = values[mail_col_index].strip().upper()
            if not cell_val:
                continue

            emails = []

            if label in _STATIC_INTERLOCUTEURS_LABELS:
                raw    = interlocuteurs.get(label, '')
                emails = _extract_emails(raw)
                if emails:
                    logger.info(f"   📧 {label} → {len(emails)} email(s)")
            elif is_tiers and geh_name == 'tiers':
                actual_label = _TIERS_LABEL_MAP.get(label, label)
                emails = _get_emails_from_geh_row(geh_data, actual_label, gu_col_index)
                if emails:
                    logger.info(f"   📧 {label} (Tiers) → {len(emails)} email(s)")
            elif not is_tiers and geh_data:
                emails = _get_emails_from_geh_row(geh_data, label, gu_col_index)
                if emails:
                    logger.info(f"   📧 {label} (GEH) → {len(emails)} email(s)")

            if not emails:
                continue

            if cell_val == 'A':
                to_list.extend(emails)
            elif cell_val == 'CC':
                cc_list.extend(emails)
            elif cell_val in ('CCI', 'BCC'):
                bcc_list.extend(emails)

        def _dedup(lst):
            seen, out = set(), []
            for e in lst:
                key = e.lower().strip()
                if key and key not in seen:
                    seen.add(key)
                    out.append(e.strip())
            return out

        result = {
            "success": True,
            "to":   _dedup(to_list),
            "cc":   _dedup(cc_list),
            "bcc":  _dedup(bcc_list),
            "summary": {
                "mail_type":    mail_type,
                "geh":          geh_name,
                "gu_col_index": gu_col_index,
                "gu_name":      gu_name,
                "is_tiers":     is_tiers
            }
        }

        logger.info(f"✅ Résultat: TO={len(result['to'])} CC={len(result['cc'])} BCC={len(result['bcc'])}")
        logger.info("=" * 60)

        return jsonify(result), 200

    except ValueError as e:
        logger.error(f"❌ Paramètre invalide: {e}")
        return jsonify({"success": False, "error": f"Paramètre invalide : {str(e)}"}), 400
    except Exception as e:
        logger.error(f"❌ Erreur inattendue: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/mail/list_types', methods=['GET'])
def get_mail_types():
    try:
        edf_data   = _load_json_data('grille_envoi_edf.json')
        tiers_data = _load_json_data('grille_envoi_tiers.json')
        return jsonify({
            "success": True,
            "edf_types":   edf_data.get('columns', []),
            "tiers_types": tiers_data.get('columns', [])
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/mail/list_geh_columns', methods=['GET'])
def get_geh_columns():
    try:
        geh_name = request.args.get('geh', '').strip()
        allowed  = {'adour_et_gaves', 'pyrenees', 'aude_ariege', 'tarn_agout', 'sei_corse', 'tiers'}
        if geh_name not in allowed:
            return jsonify({"success": False, "error": f"GEH inconnu : '{geh_name}'"}), 400

        geh_data = _load_json_data(f'{geh_name}.json')
        return jsonify({
            "success": True,
            "geh":     geh_name,
            "columns": geh_data.get('columns', [])
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================
# API Données
# ============================================================

def _read_data(filename):
    filepath = os.path.join(DATA_PATH, filename)

    logger.info(f"📂 Tentative lecture: {filepath}")
    logger.info(f"📂 Fichier existe: {os.path.exists(filepath)}")

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            logger.info(f"✅ Fichier lu: {filename}")
            return jsonify(data)
    except FileNotFoundError:
        logger.error(f"❌ Fichier introuvable: {filepath}")
        logger.error(f"📂 Contenu de DATA_PATH: {os.listdir(DATA_PATH) if os.path.exists(DATA_PATH) else 'N/A'}")
        return jsonify({"error": f"Fichier introuvable: {filename}"}), 404
    except json.JSONDecodeError as e:
        logger.error(f"❌ JSON invalide dans {filename}: {e}")
        return jsonify({"error": f"JSON invalide: {str(e)}"}), 500
    except Exception as e:
        logger.error(f"❌ Erreur inattendue: {e}")
        return jsonify({"error": str(e)}), 500


def _save_data(filename):
    """Sauvegarde les données JSON avec logging détaillé."""
    try:
        logger.info("="*60)
        logger.info(f"📁 SAVE REQUEST pour {filename}")

        data = request.get_json()

        if data is None:
            logger.error(f"❌ Aucune donnée JSON reçue pour {filename}")
            return jsonify({"error": "Aucune donnée JSON reçue"}), 400

        filepath = os.path.join(DATA_PATH, filename)

        logger.info(f"📁 Fichier: {filename}")
        logger.info(f"📁 DATA_PATH: {DATA_PATH}")
        logger.info(f"📁 Chemin complet: {filepath}")
        logger.info(f"📁 DATA_PATH existe: {os.path.exists(DATA_PATH)}")
        logger.info(f"📁 Fichier existe: {os.path.exists(filepath)}")

        try:
            test_file = os.path.join(DATA_PATH, '.test_write')
            with open(test_file, 'w') as f:
                f.write('test')
            os.remove(test_file)
            logger.info(f"📁 Test écriture: ✅ OK")
        except Exception as e:
            logger.error(f"📁 Test écriture: ❌ ÉCHEC - {e}")

        os.makedirs(DATA_PATH, exist_ok=True)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        logger.info(f"✅ Fichier sauvegardé avec succès : {filepath}")
        logger.info("="*60)
        return jsonify({"success": True, "message": "Données sauvegardées"})

    except PermissionError as e:
        logger.error(f"❌ SAVE ERROR (PermissionError): {e}")
        return jsonify({"error": f"Permission refusée: {str(e)}"}), 500
    except OSError as e:
        logger.error(f"❌ SAVE ERROR (OSError): {e}")
        return jsonify({"error": f"Erreur système: {str(e)}"}), 500
    except Exception as e:
        logger.error(f"❌ SAVE ERROR (Exception): {type(e).__name__}: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


@app.route('/api/adour_et_gaves/data', methods=['GET'])
def get_adour_et_gaves_data(): return _read_data('adour_et_gaves.json')

@app.route('/api/adour_et_gaves/save', methods=['POST'])
def save_adour_et_gaves_data(): return _save_data('adour_et_gaves.json')

@app.route('/api/pyrenees/data', methods=['GET'])
def get_pyrenees_data(): return _read_data('pyrenees.json')

@app.route('/api/pyrenees/save', methods=['POST'])
def save_pyrenees_data(): return _save_data('pyrenees.json')

@app.route('/api/aude_ariege/data', methods=['GET'])
def get_aude_ariege_data(): return _read_data('aude_ariege.json')

@app.route('/api/aude_ariege/save', methods=['POST'])
def save_aude_ariege_data(): return _save_data('aude_ariege.json')

@app.route('/api/tarn_agout/data', methods=['GET'])
def get_tarn_agout_data(): return _read_data('tarn_agout.json')

@app.route('/api/tarn_agout/save', methods=['POST'])
def save_tarn_agout_data(): return _save_data('tarn_agout.json')

@app.route('/api/sei_corse/data', methods=['GET'])
def get_sei_corse_data(): return _read_data('sei_corse.json')

@app.route('/api/sei_corse/save', methods=['POST'])
def save_sei_corse_data(): return _save_data('sei_corse.json')

@app.route('/api/bugs_ou_ameliorations/data', methods=['GET'])
def get_bugs_data(): return _read_data('bugs_ou_ameliorations.json')

@app.route('/api/bugs_ou_ameliorations/save', methods=['POST'])
def save_bugs_data(): return _save_data('bugs_ou_ameliorations.json')

@app.route('/api/plan_application/data', methods=['GET'])
def get_plan_application_data(): return _read_data('plan_application.json')

@app.route('/api/plan_application/save', methods=['POST'])
def save_plan_application_data(): return _save_data('plan_application.json')

@app.route('/api/tiers/data', methods=['GET'])
def get_tiers_data(): return _read_data('tiers.json')

@app.route('/api/tiers/save', methods=['POST'])
def save_tiers_data(): return _save_data('tiers.json')

@app.route('/api/grille_envoi_edf/data', methods=['GET'])
def get_grille_envoi_edf_data(): return _read_data('grille_envoi_edf.json')

@app.route('/api/grille_envoi_edf/save', methods=['POST'])
def save_grille_envoi_edf_data(): return _save_data('grille_envoi_edf.json')

@app.route('/api/grille_envoi_tiers/data', methods=['GET'])
def get_grille_envoi_tiers_data(): return _read_data('grille_envoi_tiers.json')

@app.route('/api/grille_envoi_tiers/save', methods=['POST'])
def save_grille_envoi_tiers_data(): return _save_data('grille_envoi_tiers.json')


@app.route('/api/geh/<geh_name>/data', methods=['GET'])
def get_geh_data(geh_name):
    allowed = ['adour_et_gaves', 'pyrenees', 'aude_ariege', 'tarn_agout', 'sei_corse', 'tiers']
    if geh_name not in allowed:
        return jsonify({"error": "GEH non reconnu"}), 400
    return _read_data(f'{geh_name}.json')


@app.route('/api/geh/<geh_name>/save', methods=['POST'])
def save_geh_data(geh_name):
    allowed = ['adour_et_gaves', 'pyrenees', 'aude_ariege', 'tarn_agout', 'sei_corse', 'tiers']
    if geh_name not in allowed:
        return jsonify({"error": "GEH non reconnu"}), 400
    return _save_data(f'{geh_name}.json')

# ============================================================
# Debug Temporaire
# ============================================================

@app.route('/api/debug/paths', methods=['GET'])
def debug_paths():
    import glob
    return jsonify({
        "DATA_PATH": DATA_PATH,
        "exists": os.path.exists(DATA_PATH),
        "files": os.listdir(DATA_PATH) if os.path.exists(DATA_PATH) else [],
        "all_json": glob.glob(os.path.join(DATA_PATH, "*.json"))
    })


# ============================================================
# Point d'entrée
# ============================================================

if __name__ == '__main__':
    port = int(os.environ.get('FLASK_RUN_PORT', 5001))
    host = os.environ.get('FLASK_RUN_HOST', '0.0.0.0')
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'

    logger.info("=" * 60)
    logger.info(f"  SEMRA V2.7 - Serveur Flask (port {port})")
    logger.info(f"  Mode: {'DÉVELOPPEMENT' if debug else 'PRODUCTION'}")
    logger.info("=" * 60)

    app.run(
        host=host,
        port=port,
        debug=debug,
        threaded=True
    )