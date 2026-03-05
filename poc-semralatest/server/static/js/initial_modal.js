/**
 * SEMRA V2.7 - Popup Initiale de Sélection
 * Avec vérification du client local (SEMRA_Client.exe) avant ouverture
 */

/**
 * Ouvrir la popup principale — vérifie d'abord que le client local est actif.
 */
async function openMailModal() {
    // Vérification du client local AVANT d'ouvrir le workflow
    const clientOk = await guardClientOnline();
    if (!clientOk) {
        // guardClientOnline() a déjà affiché la popup d'erreur
        return;
    }

    _openMailModalInternal();
}

/**
 * Ouvre réellement la modale (appelé uniquement si client OK)
 */
function _openMailModalInternal() {
    const modal = document.createElement('div');
    modal.id = 'initialMailModal';
    modal.className = 'workflow-modal';
    modal.innerHTML = `
        <div class="workflow-modal-content" style="max-width: 900px;">
            <div class="workflow-modal-header">
                <h2>📧 SEMRA : Génération d'un mail</h2>
                <button class="workflow-modal-close" onclick="closeInitialModal()">×</button>
            </div>
            <div class="workflow-modal-body">
                <!-- Résumé des sélections -->
                <div id="selectionSummary" class="selection-summary" style="display: none;">
                    <p><strong>📋 Sélections:</strong></p>
                    <div id="summaryContent"></div>
                </div>

                <!-- Étape 1: Sélection Entité -->
                <div id="step1" class="modal-step">
                    <p class="workflow-label">1. Sélectionnez le type de destinataire :</p>
                    <div class="workflow-options">
                        <button class="workflow-option-btn" data-step="entity" data-value="Interne EDF" onclick="selectEntity('Interne EDF')">
                            <span class="workflow-icon">🏢</span>
                            Interne EDF
                        </button>
                        <button class="workflow-option-btn" data-step="entity" data-value="Tiers" onclick="selectEntity('Tiers')">
                            <span class="workflow-icon">🤝</span>
                            Tiers
                        </button>
                    </div>
                </div>

                <!-- Étape 2: Sélection GU (caché au départ) -->
                <div id="step2" class="modal-step" style="display: none;">
                    <p class="workflow-label">2. Sélectionnez le Groupement d'Usines (GU) :</p>
                    <div id="guOptionsContainer" class="workflow-options"></div>
                </div>

                <!-- Étape 3: Sélection Catégorie (caché au départ) -->
                <div id="step3" class="modal-step" style="display: none;">
                    <p class="workflow-label" id="step3Label">3. Sélectionnez la catégorie de mail :</p>
                    <div id="categoryOptionsContainer" class="workflow-options"></div>
                </div>

                <!-- Étape 4: Sélection Sous-catégorie (caché au départ) -->
                <div id="step4" class="modal-step" style="display: none;">
                    <p class="workflow-label" id="step4Label">4. Sélectionnez la sous-catégorie :</p>
                    <div id="subcategoryOptionsContainer" class="workflow-options"></div>
                </div>

                <!-- Étape 5: Sélection Type de mail (caché au départ) -->
                <div id="step5" class="modal-step" style="display: none;">
                    <p class="workflow-label" id="step5Label">5. Sélectionnez le type de mail :</p>
                    <div id="mailTypeOptionsContainer" class="workflow-options"></div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Variables pour stocker les sélections
let modalSelections = {
    entity: '',
    gu: '',
    category: '',
    subcategory: '',
    mailType: ''
};

function updateSelectionSummary() {
    const summary = document.getElementById('selectionSummary');
    const content = document.getElementById('summaryContent');
    if (!summary || !content) return;

    let html = '';
    if (modalSelections.entity) html += `<span class="selection-tag">📍 ${modalSelections.entity}</span>`;
    if (modalSelections.gu) html += `<span class="selection-tag">🏭 ${modalSelections.gu}</span>`;
    if (modalSelections.category) html += `<span class="selection-tag">📂 ${modalSelections.category}</span>`;
    if (modalSelections.subcategory) html += `<span class="selection-tag">📋 ${modalSelections.subcategory}</span>`;
    if (modalSelections.mailType) html += `<span class="selection-tag">✉️ ${modalSelections.mailType}</span>`;

    content.innerHTML = html;
    summary.style.display = html ? 'block' : 'none';
}

function markButtonAsSelected(button) {
    const step = button.getAttribute('data-step');
    document.querySelectorAll(`[data-step="${step}"]`).forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
}

function closeInitialModal() {
    const modal = document.getElementById('initialMailModal');
    if (modal) modal.remove();
    modalSelections = { entity: '', gu: '', category: '', subcategory: '', mailType: '' };
}

function selectEntity(entity) {
    console.log('🎯 Entité sélectionnée:', entity);
    modalSelections.entity = entity;
    updateSelectionSummary();

    event.currentTarget.classList.add('selected');

    if (entity === 'Tiers') {
        modalSelections.gu = 'TIERS';
        showTiersBarrages();
    } else {
        document.getElementById('step2').style.display = 'block';

        const container = document.getElementById('guOptionsContainer');
        container.innerHTML = '';

        const gus = [
            { name: 'ADOUR ET GAVES', icon: '🏔️' },
            { name: 'PYRENEES', icon: '⛰️' },
            { name: 'AUDE ARIEGE', icon: '🏞️' },
            { name: 'TARN AGOUT', icon: '🌊' },
            { name: 'SEI CORSE', icon: '🏝️' }
        ];

        gus.forEach(gu => {
            const btn = document.createElement('button');
            btn.className = 'workflow-option-btn';
            btn.setAttribute('data-step', 'gu');
            btn.setAttribute('data-value', gu.name);
            btn.innerHTML = `<span class="workflow-icon">${gu.icon}</span>${gu.name}`;
            btn.onclick = (e) => {
                markButtonAsSelected(e.currentTarget);
                selectGU(gu.name);
            };
            container.appendChild(btn);
        });

        setTimeout(() => {
            document.getElementById('step2').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

async function showTiersBarrages() {
    console.log('🏗️ Chargement des barrages Tiers...');
    document.getElementById('step2').style.display = 'block';

    const step2Label = document.querySelector('#step2 .workflow-label');
    if (step2Label) step2Label.textContent = '2. Sélectionnez le barrage :';

    const container = document.getElementById('guOptionsContainer');
    container.innerHTML = '<p style="text-align: center; padding: 20px;">⏳ Chargement des barrages...</p>';

    try {
        const response = await fetch('/api/tiers/data');
        if (!response.ok) throw new Error('Erreur lors du chargement des données Tiers');

        const data = await response.json();
        if (!data.columns || !Array.isArray(data.columns)) throw new Error('Structure de données Tiers invalide');

        container.innerHTML = '';

        data.columns.forEach(barrage => {
            const btn = document.createElement('button');
            btn.className = 'workflow-option-btn';
            btn.setAttribute('data-step', 'gu');
            btn.setAttribute('data-value', barrage);
            btn.innerHTML = `<span class="workflow-icon">🏗️</span>${barrage}`;
            btn.onclick = (e) => {
                markButtonAsSelected(e.currentTarget);
                modalSelections.gu = barrage;
                updateSelectionSummary();
                showCategories();
            };
            container.appendChild(btn);
        });

        setTimeout(() => {
            document.getElementById('step2').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);

    } catch (error) {
        console.error('❌ Erreur chargement barrages Tiers:', error);
        container.innerHTML = `<p style="text-align: center; padding: 20px; color: red;">❌ Erreur: ${error.message}</p>`;
    }
}

function selectGU(gu) {
    console.log('🎯 GU sélectionné:', gu);
    modalSelections.gu = gu;
    updateSelectionSummary();

    const isMainGU = ['ADOUR ET GAVES', 'PYRENEES', 'AUDE ARIEGE', 'TARN AGOUT', 'SEI CORSE'].includes(gu);
    if (isMainGU) showSubGUs(gu);
    else showCategories();
}

function showSubGUs(mainGU) {
    const container = document.getElementById('guOptionsContainer');
    container.innerHTML = '';

    const subGUs = ouvragesData[mainGU] || [];

    subGUs.forEach(group => {
        const subGU = group[0];
        const btn = document.createElement('button');
        btn.className = 'workflow-option-btn';
        btn.setAttribute('data-step', 'subgu');
        btn.setAttribute('data-value', subGU);
        btn.innerHTML = `<span class="workflow-icon">📍</span>${subGU}`;
        btn.onclick = (e) => {
            markButtonAsSelected(e.currentTarget);
            modalSelections.gu = subGU;
            updateSelectionSummary();
            showCategories();
        };
        container.appendChild(btn);
    });

    setTimeout(() => {
        document.getElementById('step2').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

function showCategories() {
    document.getElementById('step3').style.display = 'block';
    document.getElementById('step3Label').textContent = '3. Sélectionnez la catégorie de mail :';

    const container = document.getElementById('categoryOptionsContainer');
    container.innerHTML = '';

    const categories = [
        { name: 'Surveillance', icon: '👁️' },
        { name: 'Diffusion de documents', icon: '📄' }
    ];

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'workflow-option-btn';
        btn.setAttribute('data-step', 'category');
        btn.setAttribute('data-value', cat.name);
        btn.innerHTML = `<span class="workflow-icon">${cat.icon}</span>${cat.name}`;
        btn.onclick = (e) => {
            markButtonAsSelected(e.currentTarget);
            selectCategory(cat.name);
        };
        container.appendChild(btn);
    });

    setTimeout(() => {
        document.getElementById('step3').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

function selectCategory(category) {
    console.log('🎯 Catégorie sélectionnée:', category);
    modalSelections.category = category;
    updateSelectionSummary();

    document.getElementById('step4').style.display = 'block';

    const container = document.getElementById('subcategoryOptionsContainer');
    container.innerHTML = '';

    let subcategories = [];

    if (category === 'Surveillance') {
        subcategories = [
            { name: 'Information, demande action', icon: 'ℹ️' },
            { name: 'Ecart surveillance', icon: '⚠️' },
            { name: 'Alerte', icon: '🚨' }
        ];
    } else {
        subcategories = [
            { name: 'CR CDA', icon: '📋' },
            { name: 'CR TOPO', icon: '🗺️' },
            { name: 'CR INTERVENTION', icon: '🔧' },
            { name: 'RAPPORT', icon: '📊' }
        ];
    }

    subcategories.forEach(sub => {
        const btn = document.createElement('button');
        btn.className = 'workflow-option-btn';
        btn.setAttribute('data-step', 'subcategory');
        btn.setAttribute('data-value', sub.name);
        btn.innerHTML = `<span class="workflow-icon">${sub.icon}</span>${sub.name}`;
        btn.onclick = (e) => {
            markButtonAsSelected(e.currentTarget);
            selectSubcategory(sub.name);
        };
        container.appendChild(btn);
    });

    setTimeout(() => {
        document.getElementById('step4').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

function selectSubcategory(subcategory) {
    console.log('🎯 Sous-catégorie sélectionnée:', subcategory);
    modalSelections.subcategory = subcategory;
    updateSelectionSummary();

    const mailTypes = getMailTypesForSubcategory(subcategory);

    if (mailTypes && mailTypes.length > 0) {
        document.getElementById('step5').style.display = 'block';

        const container = document.getElementById('mailTypeOptionsContainer');
        container.innerHTML = '';

        mailTypes.forEach(type => {
            const btn = document.createElement('button');
            btn.className = 'workflow-option-btn';
            btn.setAttribute('data-step', 'mailtype');
            btn.setAttribute('data-value', type.name);
            btn.innerHTML = `<span class="workflow-icon">${type.icon}</span>${type.name}`;
            btn.onclick = (e) => {
                markButtonAsSelected(e.currentTarget);
                selectMailType(type.name);
            };
            container.appendChild(btn);
        });

        setTimeout(() => {
            document.getElementById('step5').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    } else {
        launchWorkflow('');
    }
}

function getMailTypesForSubcategory(subcategory) {
    const isInterne = modalSelections.entity === 'Interne EDF';

    if (subcategory === 'Information, demande action') {
        if (isInterne) {
            return [
                { name: 'Retard tournée', icon: '⏰' },
                { name: 'Retard validation', icon: '✅' },
                { name: 'Suivi rapproché', icon: '🔍' },
                { name: 'Demande confirmation', icon: '❓' },
                { name: 'Autre', icon: '📝' }
            ];
        } else {
            return [
                { name: 'Mesure dépouillée', icon: '📊' },
                { name: 'Retard tournée', icon: '⏰' },
                { name: 'Demande confirmation', icon: '❓' },
                { name: 'Autre', icon: '📝' }
            ];
        }
    } else if (subcategory === 'Ecart surveillance') {
        return [
            { name: 'Vigilance comportement', icon: '👀' },
            { name: 'Dysfonctionnement matériel', icon: '⚙️' }
        ];
    } else if (subcategory === 'Alerte') {
        return [];
    } else {
        return [];
    }
}

function selectMailType(mailType) {
    console.log('🎯 Type de mail sélectionné:', mailType);
    modalSelections.mailType = mailType;
    updateSelectionSummary();
    launchWorkflow(mailType);
}

function launchWorkflow(mailType) {
    console.log('🚀 Lancement du workflow avec:', modalSelections);

    if (!modalSelections.entity) {
        alert('Erreur: L\'entité n\'a pas été sélectionnée correctement. Veuillez recommencer.');
        return;
    }
    if (!modalSelections.gu) {
        alert('Erreur: Le GU n\'a pas été sélectionné correctement. Veuillez recommencer.');
        return;
    }
    if (!modalSelections.category) {
        alert('Erreur: La catégorie n\'a pas été sélectionnée correctement. Veuillez recommencer.');
        return;
    }
    if (!modalSelections.subcategory) {
        alert('Erreur: La sous-catégorie n\'a pas été sélectionnée correctement. Veuillez recommencer.');
        return;
    }

    const savedEntity = modalSelections.entity;
    const savedGU = modalSelections.gu;
    const savedCategory = modalSelections.category;
    const savedSubcategory = modalSelections.subcategory;
    const savedMailType = mailType;

    closeInitialModal();

    const workflow = window.mailWorkflowInstance || initMailWorkflow();
    workflow.startWorkflow(savedEntity, savedGU, savedCategory, savedSubcategory, savedMailType);
}

// Initialisation automatique au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('📦 Initialisation du système de workflow...');
    window.mailWorkflowInstance = initMailWorkflow();
    console.log('✅ Workflow initialisé');
});

// Exposer globalement
window.openMailModal = openMailModal;
window.closeInitialModal = closeInitialModal;