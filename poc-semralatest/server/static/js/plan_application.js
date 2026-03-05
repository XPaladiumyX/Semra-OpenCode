class PlanApplicationTable {
    constructor(config = {}) {
        // Configuration
        this.apiUrl = config.apiUrl || '/api/plan_application';
        this.container = document.querySelector('.table-container');

        // État
        this.data = null;
        this.originalData = null;
        this.isModified = false;
        this.history = [];
        this.currentCell = null;

        // Ordre dynamique des éléments (sera initialisé au chargement)
        this.orderIndex = null;

        this.init();
    }

    // ==================== INITIALISATION ====================

    async init() {
        this.createUI();
        await this.loadData();
        this.render();
        this.bindEvents();
    }

    createUI() {
        // Barre d'outils
        const toolbar = document.createElement('div');
        toolbar.className = 'edit-toolbar';
        toolbar.innerHTML = `
            <div class="edit-toolbar-left">
                <button class="save-btn" data-action="save">💾 Sauvegarder</button>
                <button class="reset-btn" data-action="reset">🔄 Réinitialiser</button>
                <button data-action="history">📜 Historique</button>
            </div>
            <div class="edit-toolbar-right">
                <span class="status-indicator" id="status">✓ Aucune modification</span>
                <button data-action="export">📥 Exporter CSV</button>
            </div>
        `;

        // Barre d'info cellule
        const infoBar = document.createElement('div');
        infoBar.className = 'cell-info-bar';
        infoBar.innerHTML = `
            <div class="cell-ref" id="cellRef">-</div>
            <div class="cell-content-preview" id="cellPreview">Cliquez sur une cellule pour l'éditer</div>
            <div class="cell-hint" style="color:#888;font-size:12px;margin-left:auto;">💡 Shift+Enter = retour à la ligne</div>
        `;

        // Toast container
        const toasts = document.createElement('div');
        toasts.className = 'toast-container';
        toasts.id = 'toasts';

        // Modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>⚠️ Confirmation</h3>
                <p id="modalMsg">Êtes-vous sûr ?</p>
                <div class="modal-buttons">
                    <button class="btn-cancel" data-modal="cancel">Annuler</button>
                    <button class="btn-confirm" data-modal="confirm">Confirmer</button>
                </div>
            </div>
        `;

        // Panneau historique
        const historyPanel = document.createElement('div');
        historyPanel.className = 'history-panel';
        historyPanel.id = 'historyPanel';
        historyPanel.innerHTML = `
            <div class="history-panel-header">
                <h3>📜 Historique</h3>
                <button class="history-panel-close" data-action="closeHistory">&times;</button>
            </div>
            <div class="history-list" id="historyList">
                <p style="color:#999;text-align:center;padding:20px;">Aucune modification</p>
            </div>
        `;

        // Insérer les éléments
        this.container.insertBefore(toolbar, this.container.firstChild);
        toolbar.after(infoBar);
        document.body.append(toasts, modal, historyPanel);
    }

    // ==================== CONFIGURATION ORDRE ====================

    // Ordre par défaut (utilisé pour les nouvelles données ou reset)
    getDefaultOrderConfig() {
        return {
            sections: ["Interne EDF", "Tiers"],
            categories: ["Surveillance", "Diffusion de documents"],
            mailTypes: {
                "Surveillance": ["Information, demande action", "Ecart surveillance", "Alerte"],
                "Diffusion de documents": ["CR CDA", "CR TOPO", "CR INTERVENTION", "RAPPORT"]
            },
            subtypes: {
                "Interne EDF": {
                    "Information, demande action": ["Retard tournée", "Retard validation", "Suivi rapproché", "Demande confirmation", "Autre"],
                    "Ecart surveillance": ["Vigilance comportement", "Dysfonctionnement matériel"],
                    "Alerte": [""],
                    "CR CDA": [""],
                    "CR TOPO": [""],
                    "CR INTERVENTION": [""],
                    "RAPPORT": [""]
                },
                "Tiers": {
                    "Information, demande action": ["Mesure dépouillée", "Retard tournée", "Demande confirmation", "Autre"],
                    "Ecart surveillance": ["Vigilance comportement", "Dysfonctionnement matériel"],
                    "Alerte": [""],
                    "CR CDA": [""],
                    "CR TOPO": [""],
                    "CR INTERVENTION": [""],
                    "RAPPORT": [""]
                }
            }
        };
    }

    // Construire l'index d'ordre à partir des données actuelles
    buildOrderIndex(data) {
        const defaultOrder = this.getDefaultOrderConfig();
        const orderIndex = {
            sections: [],
            categories: [],
            mailTypes: {},
            subtypes: {}
        };

        // Utiliser l'ordre par défaut comme base, puis ajouter les éléments manquants
        orderIndex.sections = this.mergeOrder(defaultOrder.sections, Object.keys(data));
        orderIndex.categories = defaultOrder.categories.slice();

        // Pour chaque section
        orderIndex.sections.forEach(section => {
            if (!data[section]) return;
            orderIndex.subtypes[section] = {};

            // Pour chaque catégorie
            orderIndex.categories.forEach(category => {
                if (!data[section][category]) return;

                // Mail types
                const defaultMailTypes = defaultOrder.mailTypes[category] || [];
                const actualMailTypes = Object.keys(data[section][category]);
                if (!orderIndex.mailTypes[category]) {
                    orderIndex.mailTypes[category] = this.mergeOrder(defaultMailTypes, actualMailTypes);
                }

                // Subtypes pour chaque mail type
                orderIndex.mailTypes[category].forEach(mailType => {
                    if (!data[section][category][mailType]) return;

                    const defaultSubtypes = defaultOrder.subtypes[section]?.[mailType] || [];
                    const actualSubtypes = Object.keys(data[section][category][mailType]);
                    orderIndex.subtypes[section][mailType] = this.mergeOrder(defaultSubtypes, actualSubtypes);
                });
            });
        });

        return orderIndex;
    }

    // Fusionner l'ordre par défaut avec les clés actuelles
    mergeOrder(defaultOrder, actualKeys) {
        const result = [];
        // D'abord ajouter les éléments de l'ordre par défaut qui existent
        defaultOrder.forEach(key => {
            if (actualKeys.includes(key)) {
                result.push(key);
            }
        });
        // Ensuite ajouter les nouveaux éléments qui ne sont pas dans l'ordre par défaut
        actualKeys.forEach(key => {
            if (!result.includes(key)) {
                result.push(key);
            }
        });
        return result;
    }

    // Méthode helper pour obtenir les clés dans l'ordre correct
    getOrderedKeys(obj, orderArray) {
        if (!orderArray || !obj) return Object.keys(obj || {});
        // Retourne les clés dans l'ordre spécifié, puis ajoute les clés non spécifiées
        const orderedKeys = orderArray.filter(key => obj.hasOwnProperty(key));
        const remainingKeys = Object.keys(obj).filter(key => !orderArray.includes(key));
        return [...orderedKeys, ...remainingKeys];
    }

    // Mettre à jour l'ordre d'un sous-type après renommage
    updateSubtypeOrder(section, mailType, oldName, newName) {
        if (!this.orderIndex.subtypes[section]) {
            this.orderIndex.subtypes[section] = {};
        }
        if (!this.orderIndex.subtypes[section][mailType]) {
            this.orderIndex.subtypes[section][mailType] = [];
        }

        const order = this.orderIndex.subtypes[section][mailType];
        const index = order.indexOf(oldName);
        if (index !== -1) {
            order[index] = newName;
        } else {
            order.push(newName);
        }
    }

    // ==================== DONNÉES ====================

    async loadData() {
        try {
            const res = await fetch(`${this.apiUrl}/data`);
            if (!res.ok) throw new Error('Erreur serveur');
            this.data = await res.json();
            this.originalData = JSON.parse(JSON.stringify(this.data));
            this.orderIndex = this.buildOrderIndex(this.data);
            this.toast('Données chargées', 'success');
        } catch (e) {
            console.warn('Chargement local:', e);
            const saved = localStorage.getItem('plan_application_data');
            this.data = saved ? JSON.parse(saved) : this.getDefaultData();
            this.originalData = JSON.parse(JSON.stringify(this.data));
            this.orderIndex = this.buildOrderIndex(this.data);
            this.toast('Données chargées localement', 'info');
        }
    }

    async saveData() {
        try {
            const res = await fetch(`${this.apiUrl}/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.data)
            });
            if (!res.ok) throw new Error('Erreur serveur');
            this.originalData = JSON.parse(JSON.stringify(this.data));
            this.setModified(false);
            this.toast('Sauvegardé !', 'success');
        } catch (e) {
            localStorage.setItem('plan_application_data', JSON.stringify(this.data));
            this.setModified(false);
            this.toast('Sauvegardé localement', 'info');
        }
    }

    async resetData() {
        this.data = this.getDefaultData();
        this.originalData = JSON.parse(JSON.stringify(this.data));
        this.orderIndex = this.buildOrderIndex(this.data);
        localStorage.removeItem('plan_application_data');

        this.history = [];
        this.render();
        this.bindEvents();
        this.updateHistoryPanel();
        this.hideModal();

        try {
            const res = await fetch(`${this.apiUrl}/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.data)
            });
            if (!res.ok) throw new Error('Erreur serveur');
            this.setModified(false);
            this.toast('Données réinitialisées et sauvegardées !', 'success');
        } catch (e) {
            localStorage.setItem('plan_application_data', JSON.stringify(this.data));
            this.setModified(false);
            this.toast('Données réinitialisées (sauvegarde locale)', 'info');
        }
    }

    // ==================== RENDU ====================

    render() {
        const table = this.container.querySelector('.plan-table') || document.createElement('table');
        table.className = 'plan-table';

        let html = '';

        // Pour chaque section (Interne EDF, Tiers) - DANS L'ORDRE DÉFINI
        const orderedSections = this.getOrderedKeys(this.data, this.orderIndex.sections);

        orderedSections.forEach(section => {
            const sectionData = this.data[section];
            if (!sectionData) return;

            // Titre de la section
            html += `<tr><td colspan="8" class="section no-edit">${section}</td></tr>`;

            // En-têtes
            html += `
                <tr>
                    <td rowspan="2" class="header no-edit">Catégories</td>
                    <td rowspan="2" class="header left no-edit">Types de mail</td>
                    <td colspan="5" class="header no-edit">Affichage de boite de dialogues</td>
                    <td rowspan="2" class="header no-edit">Outlook</td>
                </tr>
                <tr>
                    <td class="header left no-edit">Sous-types de mail</td>
                    <td class="header no-edit">Choix ouvrages</td>
                    <td class="header no-edit">Choix périodicité</td>
                    <td class="header no-edit">Saisie date tournée</td>
                    <td class="header no-edit">Paramètres GED</td>
                </tr>
            `;

            // Parcourir les catégories - DANS L'ORDRE DÉFINI
            const orderedCategories = this.getOrderedKeys(sectionData, this.orderIndex.categories);

            orderedCategories.forEach(category => {
                const categoryData = sectionData[category];
                if (!categoryData) return;

                // Calculer le rowspan total pour la catégorie
                let totalCategoryRows = 0;
                const orderedMailTypes = this.getOrderedKeys(categoryData, this.orderIndex.mailTypes[category]);

                orderedMailTypes.forEach(mailType => {
                    if (categoryData[mailType]) {
                        const subtypeOrder = this.orderIndex.subtypes[section]?.[mailType];
                        const orderedSubtypes = this.getOrderedKeys(categoryData[mailType], subtypeOrder);
                        totalCategoryRows += orderedSubtypes.length;
                    }
                });

                let firstRowOfCategory = true;

                // Parcourir les types de mail - DANS L'ORDRE DÉFINI
                orderedMailTypes.forEach(mailType => {
                    const mailTypeData = categoryData[mailType];
                    if (!mailTypeData) return;

                    const subtypeOrder = this.orderIndex.subtypes[section]?.[mailType];
                    const orderedSubtypes = this.getOrderedKeys(mailTypeData, subtypeOrder);
                    const mailTypeRowspan = orderedSubtypes.length;

                    orderedSubtypes.forEach((subtype, idx) => {
                        const values = mailTypeData[subtype];
                        if (!values) return;

                        const cellId = `${section}|${category}|${mailType}|${subtype}`;

                        html += '<tr>';

                        // Catégorie (fusion de lignes sur toute la catégorie)
                        if (firstRowOfCategory) {
                            html += `<td rowspan="${totalCategoryRows}" class="cat no-edit">${category}</td>`;
                            firstRowOfCategory = false;
                        }

                        // Type de mail (fusion de lignes sur ses sous-types)
                        if (idx === 0) {
                            html += `<td rowspan="${mailTypeRowspan}" class="left ${mailType === category ? 'cat' : ''} no-edit">${mailType}</td>`;
                        }

                        // Sous-type (stocker l'original dans data-original-subtype)
                        html += `<td class="left" contenteditable="true" data-cell="${cellId}|subtype" data-original-subtype="${subtype}">${subtype}</td>`;

                        // Valeurs (Choix Ouvrage, Périodicité, Date, GED, Outlook)
                        ['Choix Ouvrage', 'Choix Périodicité', 'Saisie date tournée', 'Paramètres GED', 'Outlook'].forEach(field => {
                            const value = values[field] || '';
                            const cssClass = this.getValueClass(value);
                            html += `<td class="${cssClass}" contenteditable="true" data-cell="${cellId}|${field}">${value}</td>`;
                        });

                        html += '</tr>';
                    });
                });
            });

            // Espace entre sections
            html += '<tr><td colspan="8" class="empty no-edit">&nbsp;</td></tr>';
        });

        // Légende
        html += `
            <tr><td class="legend-title no-edit">Légende :</td><td class="o no-edit">o</td><td colspan="2" class="left no-edit">La boite de dialogues s'affiche</td><td colspan="4" class="empty no-edit"></td></tr>
            <tr><td class="empty no-edit"></td><td class="x no-edit">x</td><td colspan="2" class="left no-edit">La boite de dialogues ne s'affiche pas</td><td colspan="4" class="empty no-edit"></td></tr>
            <tr><td class="empty no-edit"></td><td class="so no-edit">so</td><td colspan="2" class="left no-edit">Sans objet</td><td colspan="4" class="empty no-edit"></td></tr>
            <tr><td class="empty no-edit"></td><td class="pj no-edit">PJ</td><td colspan="2" class="left no-edit">Rappel insertion de pièce jointe</td><td colspan="4" class="empty no-edit"></td></tr>
        `;

        table.innerHTML = html;

        const existingTable = this.container.querySelector('.plan-table');
        if (existingTable) {
            existingTable.replaceWith(table);
        } else {
            this.container.appendChild(table);
        }
    }

    getValueClass(value) {
        const v = (value || '').toLowerCase().trim();
        if (v === 'o') return 'o';
        if (v === 'x') return 'x';
        if (v === 'so') return 'so';
        if (v === 'pj') return 'pj';
        return '';
    }

    // ==================== ÉVÉNEMENTS ====================

    bindEvents() {
        // Boutons toolbar
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                if (action === 'save') this.saveData();
                else if (action === 'reset') this.showModal('Réinitialiser toutes les données ?', () => this.resetData());
                else if (action === 'history') this.toggleHistory();
                else if (action === 'closeHistory') this.toggleHistory();
                else if (action === 'export') this.exportCSV();
            };
        });

        // Modal
        document.querySelectorAll('[data-modal]').forEach(btn => {
            btn.onclick = () => {
                if (btn.dataset.modal === 'confirm' && this.modalCallback) this.modalCallback();
                this.hideModal();
            };
        });

        // Édition cellules
        document.querySelectorAll('td[contenteditable="true"]').forEach(cell => {
            cell.addEventListener('focus', (e) => this.onCellFocus(cell));
            cell.addEventListener('blur', (e) => this.onCellBlur(cell));
            cell.addEventListener('input', (e) => this.onCellInput(cell));
            cell.addEventListener('keydown', (e) => this.onCellKeydown(e, cell));
        });

        // Raccourci clavier Ctrl+S pour sauvegarder
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveData();
            }
        });
    }

    onCellFocus(cell) {
        this.currentCell = cell;
        cell.classList.add('editing');

        // Stocker la valeur initiale au focus
        cell.dataset.initialValue = cell.textContent;

        const cellId = cell.dataset.cell;
        document.getElementById('cellRef').textContent = cellId;
        document.getElementById('cellPreview').textContent = cell.textContent;
    }

    onCellBlur(cell) {
        cell.classList.remove('editing');

        const cellId = cell.dataset.cell;
        const newValue = cell.textContent.trim();
        const initialValue = cell.dataset.initialValue || '';

        // Vérifier si c'est une cellule de sous-type
        if (cellId.endsWith('|subtype')) {
            // Traiter le renommage du sous-type seulement au blur
            if (newValue !== initialValue) {
                this.handleSubtypeRename(cell, cellId, initialValue, newValue);
            }
        }
    }

    onCellInput(cell) {
        const cellId = cell.dataset.cell;
        const newValue = cell.textContent.trim();

        // Pour les sous-types, on ne fait rien pendant la frappe
        // La modification sera appliquée au blur
        if (cellId.endsWith('|subtype')) {
            document.getElementById('cellPreview').textContent = newValue;
            return;
        }

        // Pour les autres cellules, traitement normal
        const oldValue = this.getCellValue(cellId);

        if (newValue !== oldValue) {
            this.setCellValue(cellId, newValue);
            this.setModified(true);

            // Historique
            this.history.unshift({
                time: new Date().toLocaleTimeString(),
                cell: cellId,
                old: oldValue,
                new: newValue
            });
            this.updateHistoryPanel();

            // Update classe CSS si c'est une valeur o/x/so/PJ
            cell.className = this.getValueClass(newValue);
        }

        document.getElementById('cellPreview').textContent = newValue;
    }

    handleSubtypeRename(cell, cellId, oldValue, newValue) {
        const parts = cellId.split('|');
        if (parts.length !== 5) return;

        const [section, category, mailType, oldSubtype, field] = parts;

        if (!this.data[section]?.[category]?.[mailType]) return;

        const mailTypeData = this.data[section][category][mailType];

        // Vérifier que l'ancien sous-type existe
        if (!mailTypeData[oldSubtype]) return;

        // Renommer la clé
        const values = mailTypeData[oldSubtype];
        delete mailTypeData[oldSubtype];
        mailTypeData[newValue] = values;

        // Mettre à jour l'ordre
        this.updateSubtypeOrder(section, mailType, oldSubtype, newValue);

        // Mettre à jour le data-cell et data-original-subtype
        const newCellId = `${section}|${category}|${mailType}|${newValue}|subtype`;
        cell.dataset.cell = newCellId;
        cell.dataset.originalSubtype = newValue;

        // Mettre à jour les cellules de la même ligne (même sous-type)
        const row = cell.closest('tr');
        if (row) {
            row.querySelectorAll('td[data-cell]').forEach(td => {
                if (td !== cell) {
                    const tdCellId = td.dataset.cell;
                    if (tdCellId.startsWith(`${section}|${category}|${mailType}|${oldSubtype}|`)) {
                        const fieldName = tdCellId.split('|')[4];
                        td.dataset.cell = `${section}|${category}|${mailType}|${newValue}|${fieldName}`;
                    }
                }
            });
        }

        this.setModified(true);

        // Historique
        this.history.unshift({
            time: new Date().toLocaleTimeString(),
            cell: `${section}|${category}|${mailType}|subtype`,
            old: oldValue,
            new: newValue
        });
        this.updateHistoryPanel();

        // Mettre à jour l'affichage
        document.getElementById('cellRef').textContent = newCellId;
    }

    onCellKeydown(e, cell) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            cell.blur();
        }
    }

    getCellValue(cellId) {
        const parts = cellId.split('|');

        if (parts.length === 5) {
            // Format: section|category|mailType|subtype|field
            const [section, category, mailType, subtype, field] = parts;

            if (field === 'subtype') {
                return subtype;
            }

            return this.data[section]?.[category]?.[mailType]?.[subtype]?.[field] || '';
        }

        return '';
    }

    setCellValue(cellId, value) {
        const parts = cellId.split('|');

        if (parts.length === 5) {
            const [section, category, mailType, subtype, field] = parts;

            if (!this.data[section]?.[category]?.[mailType]?.[subtype]) return;

            // Modifier la valeur (les sous-types sont gérés par handleSubtypeRename)
            if (field !== 'subtype') {
                this.data[section][category][mailType][subtype][field] = value;
            }
        }
    }

    setModified(val) {
        this.isModified = val;
        const status = document.getElementById('status');
        status.textContent = val ? '⚠ Non sauvegardé' : '✓ Sauvegardé';
        status.className = 'status-indicator ' + (val ? 'modified' : 'saved');
    }

    // ==================== UI HELPERS ====================

    toast(msg, type = 'info') {
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.innerHTML = `<span class="toast-icon">${{success:'✅',error:'❌',info:'ℹ️'}[type]}</span><span>${msg}</span>`;
        document.getElementById('toasts').appendChild(t);
        setTimeout(() => t.classList.add('show'), 10);
        setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
    }

    showModal(msg, callback) {
        document.getElementById('modalMsg').textContent = msg;
        document.getElementById('modal').classList.add('show');
        this.modalCallback = callback;
    }

    hideModal() {
        document.getElementById('modal').classList.remove('show');
        this.modalCallback = null;
    }

    toggleHistory() {
        document.getElementById('historyPanel').classList.toggle('open');
    }

    updateHistoryPanel() {
        const list = document.getElementById('historyList');
        if (!this.history.length) {
            list.innerHTML = '<p style="color:#999;text-align:center;padding:20px;">Aucune modification</p>';
            return;
        }
        list.innerHTML = this.history.slice(0, 30).map(h => `
            <div class="history-item">
                <div class="history-time">${h.time}</div>
                <div class="history-cell">${h.cell}</div>
                <div class="history-old">${h.old || '(vide)'}</div>
                <div class="history-new">${h.new || '(vide)'}</div>
            </div>
        `).join('');
    }

    exportCSV() {
        let csv = '';

        const orderedSections = this.getOrderedKeys(this.data, this.orderIndex.sections);

        orderedSections.forEach(section => {
            csv += `${section}\n`;
            csv += 'Catégorie;Type de mail;Sous-type;Choix Ouvrage;Choix Périodicité;Saisie date tournée;Paramètres GED;Outlook\n';

            const sectionData = this.data[section];
            const orderedCategories = this.getOrderedKeys(sectionData, this.orderIndex.categories);

            orderedCategories.forEach(category => {
                const categoryData = sectionData[category];
                const orderedMailTypes = this.getOrderedKeys(categoryData, this.orderIndex.mailTypes[category]);

                orderedMailTypes.forEach(mailType => {
                    const mailTypeData = categoryData[mailType];
                    const subtypeOrder = this.orderIndex.subtypes[section]?.[mailType];
                    const orderedSubtypes = this.getOrderedKeys(mailTypeData, subtypeOrder);

                    orderedSubtypes.forEach(subtype => {
                        const values = mailTypeData[subtype];
                        csv += `${category};${mailType};${subtype};${values['Choix Ouvrage']};${values['Choix Périodicité']};${values['Saisie date tournée']};${values['Paramètres GED']};${values['Outlook']}\n`;
                    });
                });
            });
            csv += '\n';
        });

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'plan_application.csv';
        link.click();
        this.toast('CSV exporté', 'success');
    }

    // ==================== DONNÉES PAR DÉFAUT ====================

    getDefaultData() {
        return {
            "Interne EDF": {
                "Surveillance": {
                    "Information, demande action": {
                        "Retard tournée": {"Choix Ouvrage": "o", "Choix Périodicité": "o", "Saisie date tournée": "o", "Paramètres GED": "so", "Outlook": "o"},
                        "Retard validation": {"Choix Ouvrage": "o", "Choix Périodicité": "o", "Saisie date tournée": "o", "Paramètres GED": "so", "Outlook": "o"},
                        "Suivi rapproché": {"Choix Ouvrage": "o", "Choix Périodicité": "x", "Saisie date tournée": "x", "Paramètres GED": "so", "Outlook": "o"},
                        "Demande confirmation": {"Choix Ouvrage": "o", "Choix Périodicité": "o", "Saisie date tournée": "o", "Paramètres GED": "so", "Outlook": "o"},
                        "Autre": {"Choix Ouvrage": "o", "Choix Périodicité": "x", "Saisie date tournée": "x", "Paramètres GED": "so", "Outlook": "o"}
                    },
                    "Ecart surveillance": {
                        "Vigilance comportement": {"Choix Ouvrage": "", "Choix Périodicité": "", "Saisie date tournée": "", "Paramètres GED": "", "Outlook": ""},
                        "Dysfonctionnement matériel": {"Choix Ouvrage": "o", "Choix Périodicité": "x", "Saisie date tournée": "o", "Paramètres GED": "so", "Outlook": "o"}
                    },
                    "Alerte": {
                        "": {"Choix Ouvrage": "", "Choix Périodicité": "", "Saisie date tournée": "", "Paramètres GED": "", "Outlook": "o"}
                    }
                },
                "Diffusion de documents": {
                    "CR CDA": {
                        "": {"Choix Ouvrage": "o", "Choix Périodicité": "so", "Saisie date tournée": "so", "Paramètres GED": "x", "Outlook": "o"}
                    },
                    "CR TOPO": {
                        "": {"Choix Ouvrage": "o", "Choix Périodicité": "so", "Saisie date tournée": "so", "Paramètres GED": "x", "Outlook": "o"}
                    },
                    "CR INTERVENTION": {
                        "": {"Choix Ouvrage": "o", "Choix Périodicité": "so", "Saisie date tournée": "so", "Paramètres GED": "x", "Outlook": "o"}
                    },
                    "RAPPORT": {
                        "": {"Choix Ouvrage": "o", "Choix Périodicité": "so", "Saisie date tournée": "so", "Paramètres GED": "x", "Outlook": "o"}
                    }
                }
            },
            "Tiers": {
                "Surveillance": {
                    "Information, demande action": {
                        "Mesure dépouillée": {"Choix Ouvrage": "o", "Choix Périodicité": "x", "Saisie date tournée": "o", "Paramètres GED": "so", "Outlook": "o"},
                        "Retard tournée": {"Choix Ouvrage": "o", "Choix Périodicité": "o", "Saisie date tournée": "o", "Paramètres GED": "so", "Outlook": "o"},
                        "Demande confirmation": {"Choix Ouvrage": "o", "Choix Périodicité": "x", "Saisie date tournée": "o", "Paramètres GED": "so", "Outlook": "o"},
                        "Autre": {"Choix Ouvrage": "o", "Choix Périodicité": "x", "Saisie date tournée": "x", "Paramètres GED": "so", "Outlook": "o"}
                    },
                    "Ecart surveillance": {
                        "Vigilance comportement": {"Choix Ouvrage": "o", "Choix Périodicité": "x", "Saisie date tournée": "o", "Paramètres GED": "so", "Outlook": "o"},
                        "Dysfonctionnement matériel": {"Choix Ouvrage": "o", "Choix Périodicité": "x", "Saisie date tournée": "o", "Paramètres GED": "so", "Outlook": "o"}
                    },
                    "Alerte": {
                        "": {"Choix Ouvrage": "so", "Choix Périodicité": "so", "Saisie date tournée": "so", "Paramètres GED": "so", "Outlook": "o"}
                    }
                },
                "Diffusion de documents": {
                    "CR CDA": {
                        "": {"Choix Ouvrage": "o", "Choix Périodicité": "so", "Saisie date tournée": "so", "Paramètres GED": "PJ", "Outlook": "o"}
                    },
                    "CR TOPO": {
                        "": {"Choix Ouvrage": "o", "Choix Périodicité": "so", "Saisie date tournée": "so", "Paramètres GED": "PJ", "Outlook": "o"}
                    },
                    "CR INTERVENTION": {
                        "": {"Choix Ouvrage": "o", "Choix Périodicité": "so", "Saisie date tournée": "so", "Paramètres GED": "PJ", "Outlook": "o"}
                    },
                    "RAPPORT": {
                        "": {"Choix Ouvrage": "o", "Choix Périodicité": "so", "Saisie date tournée": "so", "Paramètres GED": "PJ", "Outlook": "o"}
                    }
                }
            }
        };
    }
}

// Lancement au chargement de la page
document.addEventListener('DOMContentLoaded', () => new PlanApplicationTable());