class EditableTable {
    constructor(config = {}) {
        // Configuration
        this.apiUrl = config.apiUrl || '/api/sei_corse';
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
                <button class="reset-btn" data-action="reset">Réinitialiser</button>
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
            const saved = localStorage.getItem('sei_corse_data');
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
            localStorage.setItem('sei_corse_data', JSON.stringify(this.data));
            this.setModified(false);
            this.toast('Sauvegardé localement', 'info');
        }
    }

    async resetData() {
        this.data = this.getDefaultData();
        this.originalData = JSON.parse(JSON.stringify(this.data));
        localStorage.removeItem('sei_corse_data');
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
            localStorage.setItem('sei_corse_data', JSON.stringify(this.data));
            this.setModified(false);
            this.toast('Données réinitialisées (sauvegarde locale)', 'info');
        }
    }

    // ==================== RENDU ====================

    render() {
        const table = this.container.querySelector('.editable-table') || document.createElement('table');
        table.className = 'editable-table';

        const numCols = this.data.columns.length;

        let html = `
            <tr>
                <td class="header col-gu no-edit">${this.data.title}</td>
                ${this.data.columns.map(() => `<td class="bg-gray col-site no-edit"></td>`).join('')}
            </tr>
            <tr>
                <td class="col-gu bg-gray bold no-edit">GU</td>
                ${this.data.columns.map(col => 
                    `<td class="col-site bg-gray bold border-top-none no-edit">${col}</td>`
                ).join('')}
            </tr>
        `;

        this.data.rows.forEach((row, ri) => {
            const bg = row.bgClass || '';
            const txt = row.textClass || 'normal';

            if (row.type === 'contact') {
                html += `<tr>
                    <td rowspan="2" class="col-gu ${bg} bold border-top-none no-edit">${row.label}</td>
                    ${row.values.map((v, ci) => {
                        const cellBg = row.cellBgClasses ? (row.cellBgClasses[ci] || bg) : bg;
                        const nameHtml = this.textToHtml(v.name);
                        const phoneHtml = this.textToHtml(v.phone);
                        const content = v.phone ? `${nameHtml}<br>${phoneHtml}` : nameHtml;
                        return `<td class="col-site ${cellBg} normal border-top-none" contenteditable="true" 
                            data-row="${ri}" data-col="${ci}" data-field="name">${content}</td>`;
                    }).join('')}
                </tr>`;

                html += `<tr>
                    ${row.emails.map((email, ci) => {
                        const cellBg = row.emailBgClasses ? (row.emailBgClasses[ci] || bg) : bg;
                        const emailCls = row.emailClass || '';
                        const emailHtml = this.textToHtml(email);
                        const content = email?.includes('@') ? `<a href="mailto:${email}">${email}</a>` : emailHtml;
                        return `<td class="col-site ${cellBg} normal ${emailCls} border-top-none" contenteditable="true"
                            data-row="${ri}" data-col="${ci}" data-field="email">${content}</td>`;
                    }).join('')}
                </tr>`;
            } else {
                html += `<tr>
                    <td class="col-gu ${bg} ${row.textClass || 'bold'} border-top-none no-edit">${row.label}</td>
                    ${row.values.map((val, ci) => {
                        const cellBg = row.cellBgClasses ? (row.cellBgClasses[ci] || bg) : bg;
                        const isLink = row.isLink && val?.includes('@');
                        const valHtml = this.textToHtml(val);
                        const content = isLink ? `<a href="mailto:${val}">${val}</a>` : valHtml;
                        return `<td class="col-site ${cellBg} ${txt} border-top-none" contenteditable="true"
                            data-row="${ri}" data-col="${ci}" data-field="value">${content}</td>`;
                    }).join('')}
                </tr>`;
            }
        });

        table.innerHTML = html;
        if (!this.container.contains(table)) {
            this.container.querySelector('.cell-info-bar').after(table);
        }
    }

    // ==================== ÉVÉNEMENTS ====================

    bindEvents() {
        document.querySelector('.edit-toolbar').onclick = e => {
            const action = e.target.dataset.action;
            if (action === 'save') this.saveData();
            if (action === 'reset') this.showModal('Réinitialiser toutes les modifications ?', () => this.resetData());
            if (action === 'history') this.toggleHistory();
            if (action === 'export') this.exportCSV();
            if (action === 'closeHistory') this.toggleHistory();
        };

        document.getElementById('modal').onclick = e => {
            if (e.target.dataset.modal === 'cancel') this.hideModal();
            if (e.target.dataset.modal === 'confirm' && this.modalCallback) {
                this.modalCallback();
            }
        };

        document.getElementById('historyPanel').onclick = e => {
            if (e.target.dataset.action === 'closeHistory') this.toggleHistory();
        };

        this.container.querySelectorAll('td[contenteditable="true"]').forEach(cell => {
            cell.onfocus = () => this.onCellFocus(cell);
            cell.onblur = () => this.onCellBlur(cell);
            cell.oninput = () => this.onCellInput(cell);
            cell.onkeydown = e => this.onCellKeydown(e, cell);
        });

        document.onkeydown = e => {
            if (e.ctrlKey && e.key === 's') { e.preventDefault(); this.saveData(); }
        };
    }

    onCellFocus(cell) {
        this.currentCell = cell;
        const { row, col, field } = cell.dataset;
        const colName = this.data.columns[col] || '';
        const rowLabel = this.data.rows[row]?.label || '';

        document.getElementById('cellRef').textContent = `${colName}`;
        document.getElementById('cellPreview').textContent = cell.textContent || '(vide)';
        cell.classList.add('editing');
    }

    onCellBlur(cell) {
        cell.classList.remove('editing');
        const text = cell.textContent.trim();
        if (text.includes('@') && !cell.innerHTML.includes('<a')) {
            cell.innerHTML = `<a href="mailto:${text}">${text}</a>`;
        }
    }

    htmlToText(html) {
        return html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
    }

    textToHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    }

    onCellInput(cell) {
        const { row, col, field } = cell.dataset;
        const r = parseInt(row), c = parseInt(col);
        const rowData = this.data.rows[r];
        const oldVal = this.getCellValue(r, c, field);
        const newVal = this.htmlToText(cell.innerHTML);

        if (oldVal !== newVal) {
            this.history.unshift({
                time: new Date().toLocaleTimeString(),
                cell: `${this.data.columns[c]} - ${rowData.label}`,
                old: oldVal,
                new: newVal
            });
            this.updateHistoryPanel();
        }

        this.setCellValue(r, c, field, newVal);
        this.setModified(true);
        document.getElementById('cellPreview').textContent = newVal || '(vide)';
    }

    onCellKeydown(e, cell) {
        const { row, col } = cell.dataset;
        let r = parseInt(row), c = parseInt(col);

        if (e.key === 'Tab') {
            e.preventDefault();
            c += e.shiftKey ? -1 : 1;
        } else if (e.key === 'Enter') {
            if (e.shiftKey) {
                return;
            }
            e.preventDefault();
            r++;
        } else if (e.key === 'Escape') {
            cell.blur();
            return;
        } else {
            return;
        }

        const next = this.container.querySelector(`td[data-row="${r}"][data-col="${c}"]`);
        if (next) next.focus();
    }

    // ==================== HELPERS ====================

    getCellValue(row, col, field) {
        const rowData = this.data.rows[row];
        if (!rowData) return '';
        if (rowData.type === 'contact') {
            if (field === 'email') return rowData.emails[col] || '';
            const v = rowData.values[col];
            return v.phone ? `${v.name}\n${v.phone}` : (v.name || '');
        }
        return rowData.values[col] || '';
    }

    setCellValue(row, col, field, value) {
        const rowData = this.data.rows[row];
        if (!rowData) return;

        if (rowData.type === 'contact') {
            if (field === 'email') {
                rowData.emails[col] = value;
            } else {
                const lines = value.split('\n');
                rowData.values[col] = {
                    name: lines[0] || '',
                    phone: lines.slice(1).join('\n') || ''
                };
            }
        } else {
            rowData.values[col] = value;
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
        let csv = 'GU;' + this.data.columns.join(';') + '\n';
        this.data.rows.forEach(row => {
            if (row.type === 'contact') {
                csv += `${row.label};${row.values.map(v => `${v.name} ${v.phone}`.trim()).join(';')}\n`;
                csv += `;${row.emails.join(';')}\n`;
            } else {
                csv += `${row.label};${row.values.join(';')}\n`;
            }
        });

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'sei_corse.csv';
        link.click();
        this.toast('CSV exporté', 'success');
    }

    // ==================== DONNÉES PAR DÉFAUT ====================

    getDefaultData() {
        return {
            title: "* SEI Corse *",
            columns: [
                "Castirla (Corsica, Calacuccia)",
                "Castirla (Sampolo, Trevadine)",
                "Ocana (Pont de la Vana, Tolla)",
                "Ocana (Rizzanese)"
            ],
            rows: [
                {
                    label: "Correspondant SDO",
                    type: "contact",
                    bgClass: "bg-blue",
                    values: [
                        {name: "SALINI Daniel", phone: "04 95 21 26 27"},
                        {name: "SALINI Daniel", phone: "04 95 21 26 27"},
                        {name: "PROTTI Ugo", phone: "04 95 21 26 27"},
                        {name: "ADRIAN Hubert", phone: "04 95 29 86 31 / 06 69 15 65 27"}
                    ],
                    emails: [
                        "daniel.salini@edf.fr",
                        "daniel.salini@edf.fr",
                        "gaetan.evangelisti@edf.fr;ugo.protti@edf.fr",
                        "fabien.vincensini@edf.fr; adrian-a.hubert@edf.fr"
                    ],
                    emailBgClasses: ["bg-cyan", "bg-cyan", "bg-cyan", "bg-cyan"]
                },
                {
                    label: "Coordo SDO",
                    type: "contact",
                    bgClass: "bg-cyan",
                    values: [
                        {name: "SALINI Daniel", phone: "04 95 21 26 27"},
                        {name: "FIORENTINI Philippe", phone: "04 95 56 68 03"},
                        {name: "PROTTI Ugo", phone: "04 95 21 26 27"},
                        {name: "PROTTI Ugo", phone: "04 95 21 26 27"}
                    ],
                    emails: [
                        "daniel.salini@edf.fr",
                        "philippe.fiorentini@edf.fr",
                        "ugo.protti@edf.fr",
                        "ugo.protti@edf.fr"
                    ],
                    cellBgClasses: ["bg-blue", "bg-cyan", "bg-cyan", "bg-cyan"]
                },
                {
                    label: "Coordo Planning",
                    type: "contact",
                    bgClass: "bg-cyan",
                    values: [
                        {name: "", phone: ""},
                        {name: "", phone: ""},
                        {name: "", phone: ""},
                        {name: "", phone: ""}
                    ],
                    emails: ["", "", "", ""]
                },
                {
                    label: "Chargé-e d'affaires CRA",
                    type: "contact",
                    bgClass: "bg-cyan",
                    emailClass: "gray-text",
                    values: [
                        {name: "Elisabeth BARROS-MAUREL", phone: ""},
                        {name: "Elisabeth BARROS-MAUREL", phone: ""},
                        {name: "Elisabeth BARROS-MAUREL", phone: ""},
                        {name: "Elisabeth BARROS-MAUREL", phone: ""}
                    ],
                    emails: [
                        "elisabeth.barros-maurel@edf.fr",
                        "elisabeth.barros-maurel@edf.fr",
                        "elisabeth.barros-maurel@edf.fr",
                        "elisabeth.barros-maurel@edf.fr"
                    ]
                },
                {
                    label: "Chargé-e d'affaires remplaçant",
                    type: "contact",
                    bgClass: "bg-cyan",
                    emailClass: "gray-text",
                    values: [
                        {name: "", phone: ""},
                        {name: "", phone: ""},
                        {name: "", phone: ""},
                        {name: "", phone: ""}
                    ],
                    emails: ["", "", "", ""]
                },
                {
                    label: "Ouvrages",
                    type: "simple",
                    bgClass: "bg-cyan",
                    values: [
                        "Corscia; Calacuccia",
                        "Sampolo; Trévadine",
                        "Pont de la Vana; Tolla",
                        "Rizzanese"
                    ]
                },
                {
                    label: "Chef du GU",
                    type: "contact",
                    bgClass: "bg-cyan",
                    values: [
                        {name: "Mathieu Cannata", phone: ""},
                        {name: "Mathieu Cannata", phone: ""},
                        {name: "Cyril Llorens", phone: ""},
                        {name: "Cyril Llorens", phone: ""}
                    ],
                    emails: [
                        "mathieu.cannata@edf.fr",
                        "mathieu.cannata@edf.fr",
                        "cyril.llorens@edf.fr",
                        "cyril.llorens@edf.fr"
                    ]
                },
                {
                    label: "Ingénieur UP",
                    type: "simple",
                    bgClass: "bg-blue",
                    isLink: true,
                    values: [
                        "sebastien.philippe@edf.fr;florent.cardolaccia@edf.fr",
                        "sebastien.philippe@edf.fr;florent.cardolaccia@edf.fr",
                        "sebastien.philippe@edf.fr;florent.cardolaccia@edf.fr",
                        "sebastien.philippe@edf.fr;florent.cardolaccia@edf.fr"
                    ]
                },
                {
                    label: "CORBAR",
                    type: "simple",
                    bgClass: "bg-blue",
                    values: [
                        "sammy.essir@edf.fr",
                        "sammy.essir@edf.fr",
                        "madly.leroux@edf.fr",
                        "madly.leroux@edf.fr"
                    ]
                },
                {
                    label: "Correspondant SDO GEH",
                    type: "simple",
                    bgClass: "bg-cyan",
                    isLink: true,
                    values: [
                        "florent.cardolaccia@edf.fr",
                        "florent.cardolaccia@edf.fr",
                        "florent.cardolaccia@edf.fr",
                        "florent.cardolaccia@edf.fr"
                    ]
                },
                {
                    label: "BAL générique GU",
                    type: "simple",
                    bgClass: "bg-blue",
                    values: [
                        "sei-corse-sp-gh-castirla@edf.fr",
                        "sei-corse-sp-gh-castirla@edf.fr",
                        "",
                        ""
                    ]
                },
                {
                    label: "Equipe dépouillement",
                    type: "simple",
                    bgClass: "bg-blue",
                    values: ["Toulouse", "Toulouse", "Toulouse", "Toulouse"]
                },
                {
                    label: "Téléphone barrage",
                    type: "simple",
                    bgClass: "bg-light",
                    textClass: "small",
                    values: ["", "", "", ""]
                },
                {
                    label: "Téléphone général",
                    type: "simple",
                    bgClass: "bg-light",
                    textClass: "small",
                    values: ["", "", "", "04 95 72 93 65"]
                },
                {
                    label: "Ligne PAD",
                    type: "simple",
                    bgClass: "bg-light",
                    textClass: "small",
                    values: ["", "", "", ""]
                },
                {
                    label: "Numéro usine X",
                    type: "simple",
                    bgClass: "bg-light",
                    textClass: "small",
                    values: ["", "", "", ""]
                },
                {
                    label: "Adresse postale",
                    type: "simple",
                    bgClass: "bg-light",
                    textClass: "small",
                    values: ["", "", "", ""]
                }
            ]
        };
    }
}

// Lancement au chargement de la page
document.addEventListener('DOMContentLoaded', () => new EditableTable());