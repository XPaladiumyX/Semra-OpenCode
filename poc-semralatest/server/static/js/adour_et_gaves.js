class EditableTable {
    constructor(config = {}) {
        // Configuration
        this.apiUrl = config.apiUrl || '/api/adour_et_gaves';
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
            // Charger depuis localStorage ou données par défaut
            const saved = localStorage.getItem('adour_et_gaves_data');
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
            localStorage.setItem('adour_et_gaves_data', JSON.stringify(this.data));
            this.setModified(false);
            this.toast('Sauvegardé localement', 'info');
        }
    }

    // ==================== RENDU ====================

    render() {
        const table = this.container.querySelector('.editable-table') || document.createElement('table');
        table.className = 'editable-table';

        let html = `
            <tr>
                <td class="header col-gu no-edit">${this.data.title}</td>
                <td class="bg-gray col-site no-edit"></td>
                <td class="bg-gray col-site-large no-edit"></td>
                <td class="bg-gray col-site no-edit"></td>
                <td class="bg-gray col-site no-edit"></td>
            </tr>
            <tr>
                <td class="col-gu bg-gray bold no-edit">GU</td>
                ${this.data.columns.map((col, i) => 
                    `<td class="${i === 1 ? 'col-site-large' : 'col-site'} bg-gray bold border-top-none no-edit">${col}</td>`
                ).join('')}
            </tr>
        `;

        this.data.rows.forEach((row, ri) => {
            const bg = row.bgClass || '';
            const txt = row.textClass || 'normal';

            if (row.type === 'contact') {
                // Ligne nom + téléphone
                html += `<tr>
                    <td rowspan="2" class="col-gu ${bg} bold border-top-none no-edit">${row.label}</td>
                    ${row.values.map((v, ci) => {
                        const colCls = ci === 1 ? 'col-site-large' : 'col-site';
                        // Utilise textToHtml pour préserver les retours à la ligne
                        const nameHtml = this.textToHtml(v.name);
                        const phoneHtml = this.textToHtml(v.phone);
                        const content = v.phone ? `${nameHtml}<br>${phoneHtml}` : nameHtml;
                        return `<td class="${colCls} ${bg} normal border-top-none" contenteditable="true" 
                            data-row="${ri}" data-col="${ci}" data-field="name">${content}</td>`;
                    }).join('')}
                </tr>`;

                // Ligne email
                html += `<tr>
                    ${row.emails.map((email, ci) => {
                        const colCls = ci === 1 ? 'col-site-large' : 'col-site';
                        const emailCls = row.emailClass || '';
                        const emailHtml = this.textToHtml(email);
                        const content = email?.includes('@') ? `<a href="mailto:${email}">${email}</a>` : emailHtml;
                        return `<td class="${colCls} ${bg} normal ${emailCls} border-top-none" contenteditable="true"
                            data-row="${ri}" data-col="${ci}" data-field="email">${emailHtml}</td>`;
                    }).join('')}
                </tr>`;
            } else {
                // Ligne simple
                html += `<tr>
                    <td class="col-gu ${bg} ${row.textClass || 'bold'} border-top-none no-edit">${row.label}</td>
                    ${row.values.map((val, ci) => {
                        const colCls = ci === 1 ? 'col-site-large' : 'col-site';
                        const isLink = row.isLink && val?.includes('@');
                        const valHtml = this.textToHtml(val);
                        const content = isLink ? `<a href="mailto:${val}">${val}</a>` : valHtml;
                        return `<td class="${colCls} ${bg} ${txt} border-top-none" contenteditable="true"
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
        // Délégation d'événements pour le toolbar
        document.querySelector('.edit-toolbar').onclick = e => {
            const action = e.target.dataset.action;
            if (action === 'save') this.saveData();
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
        // Auto-lien pour emails
        const text = cell.textContent.trim();
        if (text.includes('@') && !cell.innerHTML.includes('<a')) {
            cell.innerHTML = `<a href="mailto:${text}">${text}</a>`;
        }
    }

    // Convertir HTML vers texte (préserve les retours à la ligne)
    htmlToText(html) {
        return html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
    }

    // Convertir texte vers HTML (préserve les retours à la ligne)
    textToHtml(text) {
        if (!text) return '';
        // Échapper le HTML et convertir \n en <br>
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    }

    onCellInput(cell) {
        const { row, col, field } = cell.dataset;
        const r = parseInt(row), c = parseInt(col);
        const rowData = this.data.rows[r];
        const oldVal = this.getCellValue(r, c, field);
        const newVal = this.htmlToText(cell.innerHTML);

        // Historique
        if (oldVal !== newVal) {
            this.history.unshift({
                time: new Date().toLocaleTimeString(),
                cell: `${this.data.columns[c]} - ${rowData.label}`,
                old: oldVal,
                new: newVal
            });
            this.updateHistoryPanel();
        }

        // Mise à jour données
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
                // Shift+Enter = retour à la ligne dans la cellule (comportement par défaut)
                return;
            }
            // Enter seul = passer à la ligne suivante
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
                // Séparer nom et téléphone par le premier retour à la ligne
                const lines = value.split('\n');
                rowData.values[col] = {
                    name: lines[0] || '',
                    phone: lines.slice(1).join('\n') || '' // Garde tous les retours à la ligne restants
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
        link.download = 'adour_et_gaves.csv';
        link.click();
        this.toast('CSV exporté', 'success');
    }

    // ==================== DONNÉES PAR DÉFAUT ====================

    getDefaultData() {
        return {
            title: "* GEH Adour et Gaves *",
            columns: ["CAMPAN", "VAL D'AZUN", "PRAGNERES", "LUCHON"],
            rows: [
                { label: "Correspondant SDO", type: "contact", bgClass: "bg-blue",
                  values: [
                      {name:"Benoit ALEXANDRE", phone:"05 62 91 69 74"},
                      {name:"Malvin HADET", phone:"05 62 97 60 11"},
                      {name:"Hervé LEVRIER", phone:"05 62 92 43 30"},
                      {name:"Christophe CARLES", phone:"0561962604/0644954887"}
                  ],
                  emails: ["benoit.alexandre@edf.fr","philippe.abat@edf.fr;malvin.hadet@edf.fr","herve.levrier@edf.fr","christophe.carles@edf.fr"]
                },
                { label: "Coordo SDO", type: "contact", bgClass: "bg-cyan",
                  values: [
                      {name:"Didier RAFFENAUD", phone:"05 62 91 69 83"},
                      {name:"Paul BOURDIER", phone:""},
                      {name:"LALANNE BARBE Hervé", phone:"05 62 92 43 32"},
                      {name:"Sofiene BEN SALEM", phone:"05 61 94 62 53 / 06 70 22 11 21"}
                  ],
                  emails: ["didier.raffenaud@edf.fr","paul.bourdier@edf.fr","herve.lalanne-barbe@edf.fr","sofiene.ben-salem@edf.fr"]
                },
                { label: "Coordo Planning", type: "contact", bgClass: "bg-cyan",
                  values: [
                      {name:"Patrick ANTHIAN", phone:"05 62 91 69 85"},
                      {name:"Marion SIMON", phone:"05 82 06 04 58"},
                      {name:"Pierre MOUSQUE\nSimon LAVABRE", phone:"05 62 92 43 22"},
                      {name:"", phone:""}
                  ],
                  emails: ["patrick.anthian@edf.fr","marion.simon@edf.fr","simon.lavabre@edf.fr; pierre.mousque@edf.fr",""]
                },
                { label: "Chargé-e d'affaires CRA", type: "contact", bgClass: "bg-cyan", emailClass: "gray-text",
                  values: [
                      {name:"Matthieu CASTAY", phone:""},
                      {name:"Elisabeth BARROS-MAUREL", phone:""},
                      {name:"Barthélémy STECK", phone:""},
                      {name:"Phillipe BOURGEY", phone:""}
                  ],
                  emails: ["matthieu.castay@edf.fr","elisabeth.barros-maurel@edf.fr","barthelemy.steck@edf.fr","philippe.bourgey@edf.fr"]
                },
                { label: "Chargé-e d'affaires remplaçant", type: "contact", bgClass: "bg-cyan", emailClass: "gray-text",
                  values: [{name:"",phone:""},{name:"",phone:""},{name:"",phone:""},{name:"",phone:""}],
                  emails: ["","","",""]
                },
                { label: "Ouvrages", type: "simple", bgClass: "bg-cyan",
                  values: [
                      "Gréziolles; Laquets; Castillon",
                      "Migoëlou; Tech; Arcizans; Canal_de_Nouaux",
                      "Aubert; Aumar; Cap de Long; Escoubous; Gloriettes; Ossoue",
                      "Portillon; Lac Bleu; Oo; Arbesquens; Plan d'Arem"
                  ]
                },
                { label: "Chef du GU", type: "contact", bgClass: "bg-cyan",
                  values: [
                      {name:"Grégoire MOLLARET", phone:""},
                      {name:"", phone:""},
                      {name:"Laurent GOUBERT", phone:""},
                      {name:"Eric TIBOLLA", phone:""}
                  ],
                  emails: ["gregoire.mollaret@edf.fr","","laurent.goubert@edf.fr","eric.tibolla@edf.fr"]
                },
                { label: "Ingénieur UP", type: "simple", bgClass: "bg-blue", isLink: true,
                  values: ["adelise.lafrique@edf.fr","adelise.lafrique@edf.fr","adelise.lafrique@edf.fr","nicolas.donio@edf.fr"]
                },
                { label: "CORBAR", type: "simple", bgClass: "bg-blue",
                  values: ["jordan.sauvage@edf.fr","laurent.faramond@edf.fr","eloise.guerrere@edf.fr","elise.boyenval@edf.fr"]
                },
                { label: "Correspondant SDO GEH", type: "simple", bgClass: "bg-cyan",
                  values: ["luc.teroin@edf.fr","luc.teroin@edf.fr","luc.teroin@edf.fr","luc.teroin@edf.fr"]
                },
                { label: "BAL générique GU", type: "simple", bgClass: "bg-blue",
                  values: ["exploitant-campan@edf.fr","exploitant-val-d-azun@edf.fr","exploitant-pragneres@edf.fr","exploitant-luchon@edf.fr"]
                },
                { label: "Equipe dépouillement", type: "simple", bgClass: "bg-blue",
                  values: ["Toulouse","Toulouse","Toulouse","Toulouse"]
                },
                { label: "Téléphone barrage", type: "simple", bgClass: "bg-light", textClass: "small", values: ["","","",""] },
                { label: "Téléphone général", type: "simple", bgClass: "bg-light", textClass: "small", values: ["","","",""] },
                { label: "Ligne PAD", type: "simple", bgClass: "bg-light", textClass: "small", values: ["","","",""] },
                { label: "Numéro usine X", type: "simple", bgClass: "bg-light", textClass: "small", values: ["","","",""] },
                { label: "Adresse postale", type: "simple", bgClass: "bg-light", textClass: "small", values: ["","","",""] }
            ]
        };
    }
}

// Lancement au chargement de la page
document.addEventListener('DOMContentLoaded', () => new EditableTable());