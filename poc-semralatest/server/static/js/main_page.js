/**
 * SEMRA V2.7 - Script principal pour la génération de mails
 * Version avec vérification du client local (SEMRA_Client.exe)
 */

// ============================================================
// FORWARD DECLARATIONS (évite ReferenceError avant chargement complet)
// ============================================================
if (typeof window.openMailModal === 'undefined') {
    window.openMailModal = function() {
        console.warn('⏳ openMailModal appelé avant chargement complet, réessai dans 500ms...');
        setTimeout(() => {
            if (typeof window.openMailModal === 'function') {
                window.openMailModal();
            } else {
                alert('Erreur: Module mail non chargé. Rechargez la page.');
            }
        }, 500);
    };
}

// ============================================================
// Données des ouvrages
// ============================================================

const ouvragesData = {
    "ADOUR ET GAVES": [
        ["CAMPAN", "Gréziolles", "Laquets", "Castillon"],
        ["VAL D'AZUN", "Migoëlou", "Tech", "Arcizans", "Canal de Nouaux"],
        ["PRAGNERES", "Aubert", "Aumar", "CapdeLong", "Escoubous", "Gloriettes", "Ossoue"],
        ["LUCHON", "Portillon", "LacBleu", "Oo", "Arbesquens", "Pland'Arem"]
    ],
    "PYRENEES": [
        ["NESTES", "Rioumajou", "CFFabian"],
        ["COUSERANS", "Araing"],
        ["SAINT-GAUDENS", "BMCValentine", "BMCGentille"],
        ["BAIGTS", "Baigts"],
        ["BARALET", "Peilhou", "Estaens"]
    ],
    "AUDE ARIEGE": [
        ["ASTON", "Laparan", "Riete", "CFAston"],
        ["AUDE", "Puyvalador", "Matemale", "GrandesPatures", "Laurenti"],
        ["AUZAT", "Gnioure", "Izourt", "PladeSoulcem"],
        ["FERRIÈRES", "Garrabet", "Pebernat", "Labarre"],
        ["PALAMINY", "Brioulette", "canaldeStJulien", "Saint-vidian", "canaldePalaminy", "Manciès"],
        ["VALLÉE D'AX", "Lanoux", "Naguilhes", "Besines", "Sisca", "Goulours", "CFHospitalet"]
    ],
    "TARN AGOUT": [
        ["GOLFECH", "Golfechcanal", "Golfechusine", "Malause"],
        ["POUGET - LÉVEZOU (PARELOUP)", "Pareloup"],
        ["POUGET - LÉVEZOU (BAGE, LA GOURDE)", "Bage", "LaGourde"],
        ["POUGET - LÉVEZOU (PONT DE SALARS)", "PontdeSalars"],
        ["POUGET - TARN AMONT (VILLEFRANCHE)", "SaintAmans", "VillefranchedePanat", "Truel"],
        ["POUGET - TARN AVAL (PINET)", "Pinet"],
        ["POUGET - TARN AVAL (JOURDANIE)", "Jourdanie"],
        ["SAUT DE SABO", "Rivières", "Thuries", "LaCroux"],
        ["BRASSAC - AGOUT", "Luzières", "Ponviel", "LaRaviège"],
        ["BRASSAC - ARN", "Baousaval", "Sirous", "SaintsPeyres"],
        ["MONTAHUT", "Laouzas", "SautdeVesoles"]
    ],
    "SEI CORSE": [
        ["CASTIRLA (CORSCIA, CALACUCCIA)", "Corscia", "Calacuccia"],
        ["CASTIRLA (SAMPOLO, TREVADINE)", "Sampolo", "Trévadine"],
        ["OCANA (PONT DE LA VANA, TOLLA)", "PontdelaVana", "Tolla"],
        ["OCANA (RIZZANESE)", "Rizzanese"]
    ],
    "TIERS": [
        ["NACHTIGAL", "Nachtigal"],
        ["CASTILLON SUR LEZ", "CastillonsurLez"],
        ["MOULIN DU CHÂTEAU", "Moulinduchateau"],
        ["FONTBONNE", "Fontbonne"],
        ["PAS DES BÊTES", "Pasdesbêtes"],
        ["NANGBETO", "Nangbeto"],
        ["YATÉ", "Yaté"]
    ]
};

// ============================================================
// Variables GLOBALES
// ============================================================

let mailFormSelection = {
    entity: '',
    gu: '',
    ouvrage: ''
};

let config = null;

// État du client local (SEMRA_Client.exe)
let clientLocalStatus = {
    isOnline: false,
    outlookAvailable: false,
    lastChecked: null,
    checking: false
};

// ============================================================
// Vérification du client local (SEMRA_Client.exe - port 5000)
// ============================================================

const CLIENT_LOCAL_URL = 'http://localhost:5000';
const CLIENT_CHECK_INTERVAL_MS = 30000;
let clientCheckIntervalId = null;

/**
 * Vérifie si le client local SEMRA (exe Windows) est actif.
 */
async function checkClientStatus() {
    if (clientLocalStatus.checking) return clientLocalStatus;
    clientLocalStatus.checking = true;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${CLIENT_LOCAL_URL}/health`, {
            method: 'GET',
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            clientLocalStatus.isOnline = true;
            clientLocalStatus.outlookAvailable = data.outlook_available === true;
        } else {
            clientLocalStatus.isOnline = false;
            clientLocalStatus.outlookAvailable = false;
        }
    } catch (_) {
        clientLocalStatus.isOnline = false;
        clientLocalStatus.outlookAvailable = false;
    }

    clientLocalStatus.lastChecked = new Date();
    clientLocalStatus.checking = false;
    updateClientStatusBanner();
    return clientLocalStatus;
}

/**
 * Met à jour le bandeau de statut en haut de page.
 */
function updateClientStatusBanner() {
    const banner = document.getElementById('client-status-banner');
    const icon = document.getElementById('client-status-icon');
    const text = document.getElementById('client-status-text');
    const retryBtn = document.getElementById('client-status-retry');

    if (!banner) return;

    banner.classList.remove(
        'client-status-checking',
        'client-status-online',
        'client-status-offline',
        'client-status-no-outlook'
    );

    if (clientLocalStatus.isOnline && clientLocalStatus.outlookAvailable) {
        banner.classList.add('client-status-online');
        icon.textContent = '✅';
        text.textContent = 'Connecté';
        banner.setAttribute('data-tooltip', 'Client SEMRA connecté — Outlook disponible');
        retryBtn.style.display = 'none';
    } else if (clientLocalStatus.isOnline && !clientLocalStatus.outlookAvailable) {
        banner.classList.add('client-status-no-outlook');
        icon.textContent = '⚠️';
        text.textContent = 'Outlook KO';
        banner.setAttribute('data-tooltip', 'Client SEMRA connecté — Outlook non disponible');
        retryBtn.style.display = 'inline-flex';
    } else {
        banner.classList.add('client-status-offline');
        icon.textContent = '❌';
        text.textContent = 'Client OFF';
        banner.setAttribute('data-tooltip', 'Client SEMRA non détecté — Lancez SEMRA_Client.exe');
        retryBtn.style.display = 'inline-flex';
    }
}

/**
 * Bouton "Réessayer" du bandeau.
 */
async function retryClientCheck() {
    const banner = document.getElementById('client-status-banner');
    const icon = document.getElementById('client-status-icon');
    const text = document.getElementById('client-status-text');
    const retryBtn = document.getElementById('client-status-retry');

    if (banner) banner.classList.add('client-status-checking');
    if (icon) icon.textContent = '⏳';
    if (text) text.textContent = 'Vérification en cours...';
    if (retryBtn) retryBtn.style.display = 'none';

    await checkClientStatus();
}

/**
 * Affiche une popup SweetAlert2 expliquant comment lancer l'exe.
 * Fix : heightAuto:false + scrollbarPadding:false + customClass
 * pour éviter tout débordement hors écran sur laptop.
 */
function showClientOfflineError() {
    Swal.fire({
        title: '<span style="font-size:16px;">❌ Client SEMRA non démarré</span>',
        html: `
            <div style="text-align: left; padding: 4px 0; font-size: 13px; line-height: 1.6;">
                <p style="margin: 0 0 10px;">
                    La génération de mails via Outlook nécessite que
                    <strong>SEMRA_Client.exe</strong> soit lancé sur votre poste Windows.
                </p>
                <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.15); margin: 10px 0;">
                <p style="margin: 0 0 8px; font-weight: 600;">Comment procéder :</p>
                <ol style="padding-left: 18px; margin: 0 0 12px; line-height: 2;">
                    <li>Retrouvez <code style="background:rgba(255,255,255,0.1);padding:1px 5px;border-radius:3px;">SEMRA_Client.exe</code> sur votre bureau ou dans le dossier SEMRA</li>
                    <li>Double-cliquez pour le lancer</li>
                    <li>Attendez le message <em>"Serveur client prêt sur le port 5000"</em></li>
                    <li>Revenez ici et cliquez sur <strong>🔄 Réessayer</strong> dans le bandeau en haut</li>
                </ol>
                <div style="background:rgba(255,200,0,0.12);border-left:3px solid #f39c12;padding:8px 12px;border-radius:4px;font-size:12px;line-height:1.5;">
                    ⚠️ SEMRA est hébergé sur un serveur Linux. La création des brouillons Outlook
                    ne peut se faire que via l'application locale installée sur votre poste Windows.
                </div>
            </div>
        `,
        icon: 'error',
        confirmButtonText: '🔄 Réessayer maintenant',
        confirmButtonColor: '#e67e22',
        showCancelButton: true,
        cancelButtonText: 'Fermer',
        cancelButtonColor: '#6c757d',
        background: '#1a1a2e',
        color: '#ffffff',
        // ── Clés anti-débordement ──────────────────────────────
        heightAuto: false,
        scrollbarPadding: false,
        customClass: {
            popup: 'swal-client-offline-popup'
        },
        // ─────────────────────────────────────────────────────
        preConfirm: async () => {
            await retryClientCheck();
            if (!clientLocalStatus.isOnline) {
                Swal.showValidationMessage('Client toujours non détecté. Assurez-vous que SEMRA_Client.exe est bien lancé.');
                return false;
            }
            return true;
        }
    });
}

/**
 * Vérifie le statut du client ET bloque l'action si offline.
 * Retourne true si on peut continuer, false sinon.
 */
async function guardClientOnline() {
    if (
        clientLocalStatus.lastChecked &&
        (new Date() - clientLocalStatus.lastChecked) < 10000
    ) {
        if (!clientLocalStatus.isOnline) {
            showClientOfflineError();
            return false;
        }
        return true;
    }

    await checkClientStatus();

    if (!clientLocalStatus.isOnline) {
        showClientOfflineError();
        return false;
    }
    return true;
}

// ============================================================
// Initialisation au chargement de la page
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    loadConfig();
    checkClientStatus();
    clientCheckIntervalId = setInterval(checkClientStatus, CLIENT_CHECK_INTERVAL_MS);
});

// ============================================================
// Chargement de la configuration
// ============================================================

async function loadConfig() {
    try {
        const response = await fetch('/get_config');
        if (!response.ok) throw new Error('Impossible de charger la configuration');
        config = await response.json();
        console.log('Configuration chargée:', config);
    } catch (error) {
        console.error('Erreur lors du chargement de la configuration:', error);
        config = {
            signature_selectionnee: 'DEFAULT',
            chemins: { 'CHEMIN_SIGNATURE_DEFAULT': '/path/to/signature.html' }
        };
    }
}

// ============================================================
// SweetAlert2 - Fonctions de notification
// ============================================================

function showError(title, message) {
    Swal.fire({
        title: title,
        text: message,
        icon: 'error',
        confirmButtonText: 'Fermer',
        confirmButtonColor: '#d33',
        background: '#1a1a2e',
        color: '#ffffff',
        heightAuto: false,
        scrollbarPadding: false
    });
}

function showSuccessMessage(message) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#28a745',
        color: '#ffffff',
        iconColor: '#ffffff',
        heightAuto: false,
        scrollbarPadding: false,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });
    Toast.fire({ icon: 'success', title: message });
}

function showLoading(message = 'Chargement en cours...') {
    Swal.fire({
        title: message,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        background: '#1a1a2e',
        color: '#ffffff',
        heightAuto: false,
        scrollbarPadding: false,
        didOpen: () => { Swal.showLoading(); }
    });
}

function hideLoading() {
    Swal.close();
}

function showConfirmation(title, text, confirmText = 'Oui', cancelText = 'Annuler') {
    return Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        background: '#1a1a2e',
        color: '#ffffff',
        heightAuto: false,
        scrollbarPadding: false
    });
}

function showInfo(title, message) {
    Swal.fire({
        title: title,
        text: message,
        icon: 'info',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
        background: '#1a1a2e',
        color: '#ffffff',
        heightAuto: false,
        scrollbarPadding: false
    });
}

// ============================================================
// Vérification des signatures
// ============================================================

async function checkSignatureAccess() {
    if (!config) throw new Error('Configuration non chargée');
    showLoading('Vérification de la signature...');

    try {
        const signatureSelectionnee = config.signature_selectionnee;
        const cheminKey = `CHEMIN_SIGNATURE_${signatureSelectionnee}`;
        const cheminSignature = config.chemins[cheminKey];

        if (!cheminSignature) {
            throw new Error(`Chemin de signature non trouvé pour ${signatureSelectionnee}`);
        }

        const response = await fetch(`${CLIENT_LOCAL_URL}/check_signature`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ signature_path: cheminSignature })
        });

        const result = await response.json();
        hideLoading();

        if (!result.success) throw new Error(result.message || 'Impossible d\'accéder à la signature');
        return true;
    } catch (error) {
        hideLoading();
        throw error;
    }
}

// ============================================================
// Génération de contenu de mail
// ============================================================

function generateMailContent(actionType) {
    const entity = mailFormSelection.entity;
    const gu = mailFormSelection.gu;
    const ouvrage = mailFormSelection.ouvrage;

    if (!entity || !gu || !ouvrage) {
        throw new Error('Veuillez sélectionner une entité, une GU et un ouvrage');
    }

    const mailTemplates = {
        'information': {
            subject: `Information - Auscultation ${ouvrage}`,
            body: `Bonjour,<br><br>Nous souhaitons vous informer concernant l'auscultation de l'ouvrage ${ouvrage} (GU: ${gu}, Entité: ${entity}).<br><br>Cordialement.`
        },
        'ecart': {
            subject: `Écart Surveillance - ${ouvrage}`,
            body: `Bonjour,<br><br>Un écart de surveillance a été détecté sur l'ouvrage ${ouvrage} (GU: ${gu}, Entité: ${entity}).<br><br>Cordialement.`
        },
        'grand_chaud': {
            subject: `Surveillance Rapprochée "Grand Chaud" - ${ouvrage}`,
            body: `Bonjour,<br><br>Une surveillance rapprochée "Grand Chaud" est requise pour l'ouvrage ${ouvrage} (GU: ${gu}, Entité: ${entity}).<br><br>Cordialement.`
        },
        'alerte': {
            subject: `Alerte Comportement - ${ouvrage}`,
            body: `Bonjour,<br><br>Une alerte comportement a été émise pour l'ouvrage ${ouvrage} (GU: ${gu}, Entité: ${entity}).<br><br>Cordialement.`
        },
        'cr_cda': {
            subject: `Compte-Rendu CDA - ${ouvrage}`,
            body: `Bonjour,<br><br>Veuillez trouver ci-joint le compte-rendu de CDA pour l'ouvrage ${ouvrage} (GU: ${gu}, Entité: ${entity}).<br><br>Cordialement.`
        },
        'cr_topo': {
            subject: `Compte-Rendu Topographie - ${ouvrage}`,
            body: `Bonjour,<br><br>Veuillez trouver ci-joint le compte-rendu de topographie pour l'ouvrage ${ouvrage} (GU: ${gu}, Entité: ${entity}).<br><br>Cordialement.`
        },
        'cr_intervention': {
            subject: `Compte-Rendu Intervention - ${ouvrage}`,
            body: `Bonjour,<br><br>Veuillez trouver ci-joint le compte-rendu d'intervention pour l'ouvrage ${ouvrage} (GU: ${gu}, Entité: ${entity}).<br><br>Cordialement.`
        },
        'rapport': {
            subject: `Rapport - ${ouvrage}`,
            body: `Bonjour,<br><br>Veuillez trouver ci-joint le rapport pour l'ouvrage ${ouvrage} (GU: ${gu}, Entité: ${entity}).<br><br>Cordialement.`
        }
    };

    return mailTemplates[actionType] || mailTemplates['information'];
}

// ============================================================
// Gestion des actions de mail (formulaire SweetAlert2 legacy)
// ============================================================

async function handleMailAction(actionType) {
    try {
        if (!mailFormSelection.entity || !mailFormSelection.gu || !mailFormSelection.ouvrage) {
            showError('Sélection incomplète', 'Veuillez sélectionner une entité, une GU et un ouvrage');
            return;
        }

        const clientOk = await guardClientOnline();
        if (!clientOk) return;

        try {
            await checkSignatureAccess();
        } catch (signatureError) {
            console.warn('Erreur de signature, continuation sans signature:', signatureError);
        }

        showLoading('Création du brouillon Outlook...');

        const mailContent = generateMailContent(actionType);
        const signatureSelectionnee = config?.signature_selectionnee || 'DEFAULT';
        const cheminKey = `CHEMIN_SIGNATURE_${signatureSelectionnee}`;
        const cheminSignature = config?.chemins?.[cheminKey] || '';

        const response = await fetch(`${CLIENT_LOCAL_URL}/create_outlook_draft`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject: mailContent.subject,
                body: mailContent.body,
                signature_path: cheminSignature
            })
        });

        const result = await response.json();
        hideLoading();

        if (result.success) {
            Swal.fire({
                title: 'Succès! 🎉',
                text: 'Le brouillon de mail a été créé dans Outlook avec succès !',
                icon: 'success',
                confirmButtonText: 'Parfait!',
                confirmButtonColor: '#28a745',
                background: '#1a1a2e',
                color: '#ffffff',
                timer: 3000,
                timerProgressBar: true,
                heightAuto: false,
                scrollbarPadding: false
            });
        } else {
            showError('Erreur de création', `Impossible de créer le brouillon Outlook: ${result.message}`);
        }

    } catch (error) {
        hideLoading();
        showError('Erreur de génération', `Impossible de générer le mail: ${error.message}`);
    }
}

// ============================================================
// Custom Select helpers
// ============================================================

function generateCustomEntityOptions() {
    let options = '';
    Object.keys(ouvragesData).forEach(entity => {
        options += `<div class="custom-option" data-value="${entity}">${entity}</div>`;
    });
    return options;
}

function initCustomSelect(selectId, onSelect) {
    const customSelect = document.getElementById(selectId);
    if (!customSelect) return;

    const trigger = customSelect.querySelector('.custom-select-trigger');
    const options = customSelect.querySelector('.custom-options');

    const newTrigger = trigger.cloneNode(true);
    trigger.parentNode.replaceChild(newTrigger, trigger);
    const newOptions = options.cloneNode(true);
    options.parentNode.replaceChild(newOptions, options);

    newTrigger.addEventListener('click', function(e) {
        e.stopPropagation();
        document.querySelectorAll('.custom-select').forEach(select => {
            if (select !== customSelect) select.classList.remove('open');
        });
        customSelect.classList.toggle('open');
    });

    newOptions.addEventListener('click', function(e) {
        if (e.target.classList.contains('custom-option')) {
            const value = e.target.getAttribute('data-value');
            const text = e.target.textContent;
            newTrigger.querySelector('span').textContent = text;
            customSelect.classList.remove('open');
            if (onSelect) onSelect(value, text);
        }
    });
}

document.addEventListener('click', function(e) {
    if (!e.target.closest('.custom-select')) {
        document.querySelectorAll('.custom-select').forEach(select => select.classList.remove('open'));
    }
});

function initializeMailFormEvents() {
    const guSection = document.getElementById('swal-gu-section');
    const ouvrageSection = document.getElementById('swal-ouvrage-section');
    const actionSection = document.getElementById('swal-action-section');

    initCustomSelect('custom-entity', (value) => {
        mailFormSelection.entity = value;
        mailFormSelection.gu = '';
        mailFormSelection.ouvrage = '';

        const guSelect = document.getElementById('custom-gu');
        const ouvrageSelect = document.getElementById('custom-ouvrage');

        if (guSelect) {
            guSelect.querySelector('.custom-select-trigger span').textContent = 'Sélectionner une GU...';
            guSelect.querySelector('.custom-options').innerHTML = '';
        }
        if (ouvrageSelect) {
            ouvrageSelect.querySelector('.custom-select-trigger span').textContent = 'Sélectionner un ouvrage...';
            ouvrageSelect.querySelector('.custom-options').innerHTML = '';
        }

        ouvrageSection.style.display = 'none';
        actionSection.style.display = 'none';

        if (value && ouvragesData[value]) {
            guSection.style.display = 'block';
            const guOptions = guSelect.querySelector('.custom-options');

            ouvragesData[value].forEach(gu => {
                const option = document.createElement('div');
                option.className = 'custom-option';
                option.setAttribute('data-value', gu[0]);
                option.textContent = gu[0];
                guOptions.appendChild(option);
            });

            initCustomSelect('custom-gu', (guValue) => {
                mailFormSelection.gu = guValue;
                mailFormSelection.ouvrage = '';

                const ouvrageSelect = document.getElementById('custom-ouvrage');
                ouvrageSelect.querySelector('.custom-select-trigger span').textContent = 'Sélectionner un ouvrage...';
                actionSection.style.display = 'none';

                if (guValue && ouvragesData[mailFormSelection.entity]) {
                    const guData = ouvragesData[mailFormSelection.entity].find(gu => gu[0] === guValue);
                    if (guData) {
                        ouvrageSection.style.display = 'block';
                        const ouvrageOptions = ouvrageSelect.querySelector('.custom-options');
                        ouvrageOptions.innerHTML = '';

                        for (let i = 1; i < guData.length; i++) {
                            const option = document.createElement('div');
                            option.className = 'custom-option';
                            option.setAttribute('data-value', guData[i]);
                            option.textContent = guData[i];
                            ouvrageOptions.appendChild(option);
                        }

                        initCustomSelect('custom-ouvrage', (ouvrageValue) => {
                            mailFormSelection.ouvrage = ouvrageValue;
                            if (ouvrageValue) actionSection.style.display = 'block';
                            else actionSection.style.display = 'none';
                        });
                    }
                } else {
                    ouvrageSection.style.display = 'none';
                }
            });
        } else {
            guSection.style.display = 'none';
        }
    });
}

// ============================================================
// Recherche d'ouvrages
// ============================================================

const gehMapping = {
    'ADOUR ET GAVES': { url: '/adour-et-gaves', jsonFile: 'adour_et_gaves.json' },
    'PYRENEES': { url: '/pyrenees', jsonFile: 'pyrenees.json' },
    'AUDE ARIEGE': { url: '/aude_ariege', jsonFile: 'aude_ariege.json' },
    'TARN AGOUT': { url: '/tarn_agout', jsonFile: 'tarn_agout.json' },
    'SEI CORSE': { url: '/sei_corse', jsonFile: 'sei_corse.json' },
    'TIERS': { url: '/tiers', jsonFile: 'tiers.json' }
};

function normalizeString(str) {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
}

function openSearchPopup() {
    Swal.fire({
        title: '🔍 Rechercher un ouvrage',
        html: `
            <div class="swal-search-container">
                <input type="text"
                       id="swal-search-input"
                       class="swal2-input"
                       placeholder="Tapez le nom d'un ouvrage..."
                       autocomplete="off">
                <div id="swal-search-results" class="swal-search-results"></div>
            </div>
        `,
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: 'Fermer',
        cancelButtonColor: '#6c757d',
        width: '500px',
        background: '#1a1a2e',
        color: '#ffffff',
        heightAuto: false,
        scrollbarPadding: false,
        didOpen: () => {
            const searchInput = document.getElementById('swal-search-input');
            searchInput.focus();
            searchInput.addEventListener('input', function(e) { searchOuvrage(e.target.value); });
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const results = document.querySelectorAll('.swal-result-item');
                    if (results.length > 0) results[0].click();
                }
            });
        }
    });
}

function searchOuvrage(query) {
    const resultsContainer = document.getElementById('swal-search-results');
    if (!query || query.trim() === '') { resultsContainer.innerHTML = ''; return; }

    const normalizedQuery = normalizeString(query);
    const results = [];

    for (const [gehName, gusData] of Object.entries(ouvragesData)) {
        gusData.forEach(guData => {
            const guName = guData[0];
            for (let i = 1; i < guData.length; i++) {
                const ouvrage = guData[i];
                if (normalizeString(ouvrage).includes(normalizedQuery)) {
                    results.push({ ouvrage, gu: guName, geh: gehName, url: gehMapping[gehName].url });
                }
            }
        });
    }

    displaySearchResults(results, query);
}

function displaySearchResults(results, query) {
    const resultsContainer = document.getElementById('swal-search-results');

    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="swal-no-results">
                <div class="swal-no-results-icon">🔍</div>
                <div>Aucun ouvrage trouvé pour "${query}"</div>
            </div>
        `;
        return;
    }

    let html = '';
    results.forEach(result => {
        html += `
            <div class="swal-result-item" onclick="goToOuvragePage('${result.url}')">
                <div class="swal-result-info">
                    <div class="swal-result-ouvrage">${result.ouvrage}</div>
                    <div class="swal-result-location">${result.geh} › ${result.gu}</div>
                </div>
                <div class="swal-result-arrow">→</div>
            </div>
        `;
    });

    resultsContainer.innerHTML = html;
}

function goToOuvragePage(url) {
    Swal.close();
    showSuccessMessage(`Navigation vers ${url}...`);
    setTimeout(() => { window.location.href = url; }, 500);
}

// ============================================================
// Exposition globale
// ============================================================

window.checkClientStatus = checkClientStatus;
window.retryClientCheck = retryClientCheck;
window.guardClientOnline = guardClientOnline;
window.showClientOfflineError = showClientOfflineError;
window.openMailModal = openMailModal;
window.handleMailAction = handleMailAction;
window.openSearchPopup = openSearchPopup;
window.searchOuvrage = searchOuvrage;
window.goToOuvragePage = goToOuvragePage;
window.showError = showError;
window.showSuccessMessage = showSuccessMessage;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showConfirmation = showConfirmation;
window.showInfo = showInfo;