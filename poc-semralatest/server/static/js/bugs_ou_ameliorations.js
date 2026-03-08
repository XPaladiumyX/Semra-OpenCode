class BugsTable {
    constructor(config = {}) {
        // Configuration
        this.apiUrl = config.apiUrl || '/api/bugs_ou_ameliorations';
        this.container = document.querySelector('.table-container');

        // État
        this.data = null;
        this.originalData = null;
        this.isModified = false;
        this.history = [];
        this.currentCell = null;

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
                <button class="save-btn" data-action="save">Sauvegarder</button>
                <button class="add-btn" data-action="add">➕ Nouvelle ligne</button>
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
            <div class="row-count" id="rowCount">0 lignes</div>
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

    // ==================== DONNÉES ====================

    async loadData() {
        try {
            const res = await fetch(`${this.apiUrl}/data`);
            if (!res.ok) throw new Error('Erreur serveur');
            this.data = await res.json();
            this.originalData = JSON.parse(JSON.stringify(this.data));
            this.toast('Données chargées', 'success');
        } catch (e) {
            console.warn('Chargement local:', e);
            const saved = localStorage.getItem('bugs_ou_ameliorations_data');
            this.data = saved ? JSON.parse(saved) : this.getDefaultData();
            this.originalData = JSON.parse(JSON.stringify(this.data));
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
            localStorage.setItem('bugs_ou_ameliorations_data', JSON.stringify(this.data));
            this.setModified(false);
            this.toast('Sauvegardé localement', 'info');
        }
    }

    // ==================== RENDU ====================

    render() {
        const table = this.container.querySelector('.editable-table') || document.createElement('table');
        table.className = 'editable-table';

        let html = `
            <thead>
                <tr class="header">
                    <td class="col-num">N°</td>
                    <td class="col-date">Date</td>
                    <td class="col-author">Auteur</td>
                    <td class="col-bug">Bug ou écart constaté</td>
                    <td class="col-proposal">Proposition d'amélioration</td>
                    <td class="col-status">Suivi du traitement</td>
                    <td class="col-comment">Commentaire</td>
                    <td class="col-actions">Actions</td>
                </tr>
            </thead>
            <tbody>
        `;

        this.data.rows.forEach((row, ri) => {
            const rowClass = row.isExample ? 'example' : (row.isHighlight ? 'highlight' : '');

            html += `<tr class="${rowClass}" data-row="${ri}">
                <td class="col-num" contenteditable="true" data-row="${ri}" data-field="num">${this.textToHtml(row.num)}</td>
                <td class="col-date" contenteditable="true" data-row="${ri}" data-field="date">${this.textToHtml(row.date)}</td>
                <td class="col-author" contenteditable="true" data-row="${ri}" data-field="author">${this.textToHtml(row.author)}</td>
                <td class="col-bug" contenteditable="true" data-row="${ri}" data-field="bug">${this.textToHtml(row.bug)}</td>
                <td class="col-proposal" contenteditable="true" data-row="${ri}" data-field="proposal">${this.textToHtml(row.proposal)}</td>
                <td class="col-status" contenteditable="true" data-row="${ri}" data-field="status">${this.textToHtml(row.status)}</td>
                <td class="col-comment" contenteditable="true" data-row="${ri}" data-field="comment">${this.textToHtml(row.comment)}</td>
                <td class="col-actions">
                    <div class="row-actions">
                        <button class="btn-highlight ${row.isHighlight ? 'active' : ''}" data-action="toggleHighlight" data-row="${ri}" title="Surligner">🔆</button>
                        <button class="btn-delete" data-action="deleteRow" data-row="${ri}" title="Supprimer">🗑️</button>
                    </div>
                </td>
            </tr>`;
        });

        html += '</tbody>';
        table.innerHTML = html;

        if (!this.container.contains(table)) {
            this.container.querySelector('.cell-info-bar').after(table);
        }

        // Mettre à jour le compteur
        document.getElementById('rowCount').textContent = `${this.data.rows.length} lignes`;
    }

    // ==================== ÉVÉNEMENTS ====================

    bindEvents() {
        // Délégation d'événements pour le toolbar
        document.querySelector('.edit-toolbar').onclick = e => {
            const action = e.target.dataset.action;
            if (action === 'save') this.saveData();
            if (action === 'add') this.addRow();
            if (action === 'history') this.toggleHistory();
            if (action === 'export') this.exportCSV();
            if (action === 'closeHistory') this.toggleHistory();
        };

        // Modal
        document.getElementById('modal').onclick = e => {
            if (e.target.dataset.modal === 'cancel') this.hideModal();
            if (e.target.dataset.modal === 'confirm' && this.modalCallback) {
                this.modalCallback();
            }
        };

        // Panneau historique
        document.getElementById('historyPanel').onclick = e => {
            if (e.target.dataset.action === 'closeHistory') this.toggleHistory();
        };

        // Actions sur les lignes (suppression, highlight)
        this.container.querySelector('.editable-table').onclick = e => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const action = btn.dataset.action;
            const rowIndex = parseInt(btn.dataset.row);

            if (action === 'deleteRow') {
                this.showModal(`Supprimer la ligne ${this.data.rows[rowIndex]?.num || rowIndex + 1} ?`, () => {
                    this.deleteRow(rowIndex);
                    this.hideModal();
                });
            }
            if (action === 'toggleHighlight') {
                this.toggleHighlight(rowIndex);
            }
        };

        // Cellules éditables
        this.container.querySelectorAll('td[contenteditable="true"]').forEach(cell => {
            cell.onfocus = () => this.onCellFocus(cell);
            cell.onblur = () => this.onCellBlur(cell);
            cell.oninput = () => this.onCellInput(cell);
            cell.onkeydown = e => this.onCellKeydown(e, cell);
        });

        // Raccourcis clavier globaux
        document.onkeydown = e => {
            if (e.ctrlKey && e.key === 's') { e.preventDefault(); this.saveData(); }
            if (e.ctrlKey && e.key === 'n') { e.preventDefault(); this.addRow(); }
        };
    }

    onCellFocus(cell) {
        this.currentCell = cell;
        const { row, field } = cell.dataset;
        const fieldNames = {
            num: 'N°',
            date: 'Date',
            author: 'Auteur',
            bug: 'Bug',
            proposal: 'Proposition',
            status: 'Suivi',
            comment: 'Commentaire'
        };

        document.getElementById('cellRef').textContent = `Ligne ${parseInt(row) + 1} - ${fieldNames[field] || field}`;
        document.getElementById('cellPreview').textContent = cell.textContent || '(vide)';
        cell.classList.add('editing');
    }

    onCellBlur(cell) {
        cell.classList.remove('editing');
    }

    htmlToText(html) {
        return html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
    }

    textToHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    }

    onCellInput(cell) {
        const { row, field } = cell.dataset;
        const r = parseInt(row);
        const rowData = this.data.rows[r];
        const oldVal = rowData[field] || '';
        const newVal = this.htmlToText(cell.innerHTML);

        if (oldVal !== newVal) {
            this.history.unshift({
                time: new Date().toLocaleTimeString(),
                cell: `Ligne ${r + 1} - ${field}`,
                old: oldVal,
                new: newVal
            });
            this.updateHistoryPanel();
        }

        rowData[field] = newVal;
        this.setModified(true);
        document.getElementById('cellPreview').textContent = newVal || '(vide)';
    }

    onCellKeydown(e, cell) {
        const { row, field } = cell.dataset;
        let r = parseInt(row);

        if (e.key === 'Tab') {
            e.preventDefault();
            const fields = ['num', 'date', 'author', 'bug', 'proposal', 'status', 'comment'];
            let fieldIndex = fields.indexOf(field);

            if (e.shiftKey) {
                fieldIndex--;
                if (fieldIndex < 0) {
                    fieldIndex = fields.length - 1;
                    r--;
                }
            } else {
                fieldIndex++;
                if (fieldIndex >= fields.length) {
                    fieldIndex = 0;
                    r++;
                }
            }

            if (r >= 0 && r < this.data.rows.length) {
                const next = this.container.querySelector(`td[data-row="${r}"][data-field="${fields[fieldIndex]}"]`);
                if (next) next.focus();
            }
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            r++;
            if (r < this.data.rows.length) {
                const next = this.container.querySelector(`td[data-row="${r}"][data-field="${field}"]`);
                if (next) next.focus();
            }
        } else if (e.key === 'Escape') {
            cell.blur();
        }
    }

    // ==================== ACTIONS LIGNES ====================

    addRow() {
        // Trouver le prochain numéro
        const maxNum = Math.max(0, ...this.data.rows.filter(r => !r.isExample).map(r => parseInt(r.num) || 0));
        const today = new Date().toLocaleDateString('fr-FR');

        this.data.rows.push({
            num: String(maxNum + 1),
            date: today,
            author: '',
            bug: '',
            proposal: '',
            status: '',
            comment: '',
            isExample: false,
            isHighlight: false
        });

        this.render();
        this.bindEvents();
        this.setModified(true);
        this.toast('Nouvelle ligne ajoutée', 'success');

        // Focus sur la nouvelle ligne
        setTimeout(() => {
            const newRow = this.container.querySelector(`td[data-row="${this.data.rows.length - 1}"][data-field="author"]`);
            if (newRow) newRow.focus();
        }, 100);
    }

    deleteRow(index) {
        if (index >= 0 && index < this.data.rows.length) {
            const deleted = this.data.rows.splice(index, 1)[0];
            this.history.unshift({
                time: new Date().toLocaleTimeString(),
                cell: `Ligne ${deleted.num} supprimée`,
                old: `${deleted.date} - ${deleted.author}`,
                new: '(supprimé)'
            });
            this.render();
            this.bindEvents();
            this.setModified(true);
            this.updateHistoryPanel();
            this.toast('Ligne supprimée', 'info');
        }
    }

    toggleHighlight(index) {
        if (index >= 0 && index < this.data.rows.length) {
            this.data.rows[index].isHighlight = !this.data.rows[index].isHighlight;
            this.render();
            this.bindEvents();
            this.setModified(true);
        }
    }

    // ==================== HELPERS ====================

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
        list.innerHTML = this.history.slice(0, 50).map(h => `
            <div class="history-item">
                <div class="history-time">${h.time}</div>
                <div class="history-cell">${h.cell}</div>
                <div class="history-old">${h.old || '(vide)'}</div>
                <div class="history-new">${h.new || '(vide)'}</div>
            </div>
        `).join('');
    }

    exportCSV() {
        let csv = 'N°;Date;Auteur;Bug ou écart;Proposition;Suivi;Commentaire\n';
        this.data.rows.forEach(row => {
            csv += `${row.num};${row.date};${row.author};${row.bug};${row.proposal};${row.status};${row.comment}\n`;
        });

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'bugs_ameliorations.csv';
        link.click();
        this.toast('CSV exporté', 'success');
    }

    // ==================== DONNÉES PAR DÉFAUT ====================

    getDefaultData() {
        return {
            rows: [
                { num: "Exemple", date: "15/01/2020", author: "Arnaud RIVIER", bug: "Plantage sur Alerte Tiers Yaté", proposal: "", status: "En cours", comment: "", isExample: true, isHighlight: false },
                { num: "Exemple", date: "16/01/2020", author: "Pascal Monnereau", bug: "", proposal: "Changer les formes des boutons car ils sont trop petits !", status: "", comment: "", isExample: true, isHighlight: false },
                { num: "1", date: "01/02/2021", author: "Pascal Monnereau", bug: "MISE EN SERVICE DE SEMRA V2.1 à BRIVE", proposal: "", status: "Fait", comment: "", isExample: false, isHighlight: false },
                { num: "2", date: "05/03/2021", author: "Pascal Monnereau", bug: "Bug sur lien vers GED d'un CR CDA (manque 'org')", proposal: "Correction du code", status: "Corrigé", comment: "", isExample: false, isHighlight: false },
                { num: "3", date: "20/05/2021", author: "Pascal Monnereau", bug: "Passage à V2.2", proposal: "Icone \"Recherche\" sur la page principale : recherche d'un ouvrage + onglet liste des ouvrages sur tout le parc surveillé", status: "Fait", comment: "", isExample: false, isHighlight: false },
                { num: "4", date: "09/07/2021", author: "François Timbal", bug: "MAJ CONTACTS SHEMA Bretagne", proposal: "", status: "", comment: "", isExample: false, isHighlight: false },
                { num: "5", date: "10/07/2021", author: "François Timbal", bug: "ouvrages tiers SHEMA", proposal: "l'entrée Tiers ne permet pas d'accéder aux ouvrages SHEMA", status: "à faire", comment: "", isExample: false, isHighlight: false },
                { num: "6", date: "17/09/2021", author: "Pascal Monnereau", bug: "", proposal: "Supp. Mention envoi papier pour les rapports", status: "Fait", comment: "", isExample: false, isHighlight: false },
                { num: "7", date: "17/09/2021", author: "Pascal Monnereau", bug: "", proposal: "Supp. Secrétaires comme destinataire des CR Intervention", status: "Fait", comment: "", isExample: false, isHighlight: false },
                { num: "8", date: "12/10/2021", author: "François Timbal", bug: "GU Vézère", proposal: "MAJ coord. SDO (suite mobilité F. Dezerces)", status: "Fait", comment: "", isExample: false, isHighlight: false },
                { num: "9", date: "19/10/2021", author: "François Timbal", bug: "GU Eguzon", proposal: "MAJ coord. SDO (changement d'attributions d'A. Valentin)", status: "Fait", comment: "", isExample: false, isHighlight: false },
                { num: "10", date: "08/11/2021", author: "Pascal Monnereau", bug: "", proposal: "Modifs affectations CA Parc", status: "Fait", comment: "", isExample: false, isHighlight: false },
                { num: "11", date: "09/11/2021", author: "Pascal Monnereau", bug: "Modifs mails Semra suite MàJ note XDR", proposal: "", status: "Fait", comment: "", isExample: false, isHighlight: false },
                { num: "12", date: "10/11/2021", author: "Pascal Monnereau", bug: "Modifs Liste des actions / type mail", proposal: "", status: "Fait", comment: "", isExample: false, isHighlight: false },
                { num: "13", date: "11/11/2021", author: "Pascal Monnereau", bug: "Modifs des destinataires / type de mail", proposal: "", status: "Fait", comment: "", isExample: false, isHighlight: false },
                { num: "14", date: "16/11/2021", author: "Pascal Monnereau", bug: "Préparation au passage O365", proposal: "", status: "Fait", comment: "", isExample: false, isHighlight: false },
                { num: "15", date: "14/12/2021", author: "Pascal Monnereau", bug: "", proposal: "V2.3 : Version compatible Excel 2016 / Excel 365", status: "Fait", comment: "", isExample: false, isHighlight: false },
                { num: "16", date: "14/12/2021", author: "Pascal Monnereau", bug: "", proposal: "V2.3 : Intégration des modèles de mails note XDR mise à jour", status: "Fait", comment: "", isExample: false, isHighlight: false },
                { num: "17", date: "14/12/2021", author: "Pascal Monnereau", bug: "", proposal: "V2.3 : Intégration des directives envoi selon note XDR mise à jour", status: "Fait", comment: "", isExample: false, isHighlight: false },
                { num: "18", date: "03/01/2022", author: "Pascal Monnereau", bug: "Bug dans mise à jour auto de mail CA ou CA Parc", proposal: "", status: "Corrigé", comment: "", isExample: false, isHighlight: false },
                { num: "19", date: "04/02/2022", author: "Elisabeth Barros-Maurel", bug: "", proposal: "mettre la liste de tous les ouvrages du Parc, yc ceux pas encore / pas auscultés (je pense aux CF notamment)", status: "", comment: "", isExample: false, isHighlight: false },
                { num: "20", date: "04/02/2022", author: "Barthélémy Steck", bug: "séparer les chefs des différents services et mettre à jour les diffusions par service", proposal: "", status: "", comment: "", isExample: false, isHighlight: false },
                { num: "21", date: "04/02/2022", author: "Barthélémy Steck", bug: "Problématique CORBAR CIH ou HSM sur un même GU", proposal: "voir la meilleure solution => faire des sous GU GH / PH ?", status: "", comment: "", isExample: false, isHighlight: false },
                { num: "22", date: "30/03/2022", author: "Barthélémy Steck", bug: "Suite aux changements de référence de service sur Alexandr'hy", proposal: "modifier les liens pour l'envoi des mails", status: "", comment: "", isExample: false, isHighlight: false },
                { num: "23", date: "07/04/2022", author: "Pascal Monnereau", bug: "Montee de version V2.4 (integration nouveaux services)", proposal: "", status: "Fait", comment: "", isExample: false, isHighlight: false },
                { num: "24", date: "19/05/2022", author: "Nabil GHALIB", bug: "Bugs dans l'envoi des CR topo", proposal: "", status: "", comment: "", isExample: false, isHighlight: false },
                { num: "25", date: "30/05/2022", author: "Pascal Monnereau", bug: "", proposal: "MàJ grille d'envois des alertes comportement suite nouvelles préconisations Jean Noel Ponsard 24/05/22", status: "Fait", comment: "", isExample: false, isHighlight: false },
                { num: "26", date: "21/07/2022", author: "Claire de Lansalut", bug: "changer la question du choix du service dans l'envoi des CR (CDA notamment)", proposal: "", status: "", comment: "", isExample: false, isHighlight: false },
                { num: "27", date: "16/01/2023", author: "Maryse Bretagnolle", bug: "Envoi des Rapports d'Auscult. : enlever Chef de Département en copie. Merci", proposal: "", status: "Fait", comment: "", isExample: false, isHighlight: false },
                { num: "28", date: "16/01/2023", author: "Pascal Monnereau", bug: "", proposal: "Ajout de Michel Lion comme chef de Dpt, en doublure de Benoit en attendant son départ en février 2023", status: "Fait", comment: "", isExample: false, isHighlight: false },
                { num: "29", date: "10/02/2023", author: "Barthélémy Steck", bug: "", proposal: "Les CORBAR sont de moins en moins par GU, il faudrait envisager d'associer les CORBAR par ouvrage et pas par GU", status: "Montée de version nécessaire", comment: "", isExample: false, isHighlight: false },
                { num: "30", date: "25/04/2023", author: "Pascal Monnereau", bug: "Ajout de vincent.guihard en compteur CDA + secrétaires en copie des envois de CR CDA", proposal: "", status: "Fait", comment: "", isExample: false, isHighlight: false },
                { num: "31", date: "09/05/2023", author: "Pascal Monnereau", bug: "", proposal: "Ajout de Jean-Baptiste Guaus en copie de tous les envois externes (cf. DTG_DEP dans l'onglet Config)", status: "Fait", comment: "", isExample: false, isHighlight: false },
                { num: "32", date: "04/09/2023", author: "Maryse Bretagnolle", bug: "A FAIRE DEBUT DECEMBRE 2023 : Retirer le mail de Camille ALAVA pour GU LUCHON (GEH Adour & Gaves) et le remplacer par nicolas.donio@edf.fr", proposal: "", status: "", comment: "", isExample: false, isHighlight: true },
                { num: "33", date: "17/11/2023", author: "Pascal Monnereau", bug: "Maj config : Melisa Le Chevanton , Emmanuel Robbe, Remi Bernard", proposal: "départ à la retraite de Maryse + chang Laurent Bessaidi", status: "Fait", comment: "", isExample: false, isHighlight: false },
                { num: "34", date: "30/01/2024", author: "Elisabeth Barros-Maurel", bug: "", proposal: "Ortographe erronnée d'un ouvrage sur UPSO - GEH Adour et Gaves - GU Val d'Azun : écrire Migoëlou au lieu de Migouelou", status: "Fait", comment: "", isExample: false, isHighlight: false },
                { num: "35", date: "04/03/2024", author: "Elisabeth Barros-Maurel", bug: "Faire un mail d'alerte moins large dans les destinataires. Celui actuellement configuré est trop alarmant avec copie à bcp de hiérarchie.", proposal: "", status: "", comment: "", isExample: false, isHighlight: false },
                { num: "36", date: "27/06/2024", author: "Pascal Monnereau", bug: "Suppression T. Guilloteau des experts DTG", proposal: "", status: "Fait", comment: "", isExample: false, isHighlight: false },
                { num: "37", date: "11/07/2024", author: "Pascal Monnereau", bug: "V2.5 : Ajout Mail Grand Chaud Canicule", proposal: "", status: "", comment: "", isExample: false, isHighlight: false },
                { num: "38", date: "12/12/2024", author: "Pascal Monnereau", bug: "V2.6 : Modification des BAL Dépouillement de Brive et Toulouse + modif des cartouches associés", proposal: "", status: "Fait", comment: "", isExample: false, isHighlight: false },
                { num: "39", date: "29/01/2026", author: "Yann Allegra", bug: "V2.7 : Migration de SEMRA vers Application Web + Nouvelle Améliorations Graphique", proposal: "", status: "Fait", comment: "", isExample: false, isHighlight: false },
                { num: "40", date: "", author: "", bug: "", proposal: "", status: "", comment: "", isExample: false, isHighlight: false },
                { num: "41", date: "", author: "", bug: "", proposal: "", status: "", comment: "", isExample: false, isHighlight: false }
            ]
        };
    }
}

// Lancement au chargement de la page
document.addEventListener('DOMContentLoaded', () => new BugsTable());