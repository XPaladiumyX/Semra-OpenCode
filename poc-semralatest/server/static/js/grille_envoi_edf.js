// Grille Envoi EDF - Tableau éditable avec fonctionnalités Excel
// ✅ Version corrigée avec vérification de page et namespace isolé

(function() {
    'use strict';

    // ✅ Vérifier qu'on est sur la bonne page AVANT tout
    const currentPath = window.location.pathname;
    if (!currentPath.includes('grille_envoi_edf')) {
        console.log('[grille_envoi_edf.js] Page non concernée, skip');
        return; // Sortir immédiatement
    }

    let tableData = null;
    let originalData = null;
    let modificationHistory = [];
    let isModified = false;

    // Charger les données JSON via l'API
    async function loadTableData() {
        try {
            const response = await fetch('/api/grille_envoi_edf/data');
            if (!response.ok) throw new Error('Erreur serveur');
            tableData = await response.json();
            originalData = JSON.parse(JSON.stringify(tableData)); // Deep copy
            renderTable();
            setupEventListeners();
            console.log('✅ [grille_envoi_edf] Données chargées');
        } catch (error) {
            console.error('[grille_envoi_edf] Erreur lors du chargement des données:', error);
            showToast('Erreur de chargement', 'error');
        }
    }

    // Rendre le tableau
    function renderTable() {
        const table = document.querySelector('.editable-table');
        if (!table || !tableData) return;

        let html = '';

        // En-tête principal
        html += `<thead><tr><td colspan="${tableData.columns.length + 1}" class="header">${tableData.title}</td></tr>`;

        // En-têtes de colonnes
        html += '<tr><th class="no-edit"></th>';
        tableData.columns.forEach((col, index) => {
            const colClass = tableData.columnClasses?.[index] || '';
            html += `<th class="no-edit ${colClass}">${col}</th>`;
        });
        html += '</tr></thead>';

        // Corps du tableau
        html += '<tbody>';
        tableData.rows.forEach((row, rowIndex) => {
            html += '<tr>';
            // Colonne label (nom de la ligne)
            html += `<td class="name ${row.rowClass || ''} no-edit">${row.label}</td>`;

            // Colonnes de valeurs (éditables)
            row.values.forEach((value, colIndex) => {
                const cellId = `cell-${rowIndex}-${colIndex}`;
                let valueClass = '';

                // Déterminer la classe en fonction de la valeur
                if (value === 'A') valueClass = 'A';
                else if (value === 'CC') valueClass = 'CC';
                else if (value === 'CCI') valueClass = 'CCI';

                html += `<td 
                    class="${row.rowClass || ''} ${valueClass}" 
                    contenteditable="true" 
                    data-row="${rowIndex}" 
                    data-col="${colIndex}"
                    data-original="${value}"
                    id="${cellId}"
                >${value}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody>';

        table.innerHTML = html;
    }

    // Configurer les écouteurs d'événements
    function setupEventListeners() {
        const editableCells = document.querySelectorAll('td[contenteditable="true"]');

        editableCells.forEach(cell => {
            cell.addEventListener('focus', function() {
                this.classList.add('editing');
                updateCellInfo(this);
            });

            cell.addEventListener('blur', function() {
                this.classList.remove('editing');
                handleCellEdit(this);
            });

            cell.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.blur();
                }
            });

            cell.addEventListener('click', function() {
                if (document.activeElement !== this) {
                    this.focus();
                    selectAllContent(this);
                }
            });
        });

        // Boutons de la toolbar
        document.getElementById('saveBtn')?.addEventListener('click', saveChanges);
        document.getElementById('exportBtn')?.addEventListener('click', exportToJSON);
        document.getElementById('historyBtn')?.addEventListener('click', toggleHistory);
        document.getElementById('undoBtn')?.addEventListener('click', undoLastChange);

        // Fermer le panneau d'historique
        document.querySelector('.history-panel-close')?.addEventListener('click', function() {
            document.querySelector('.history-panel')?.classList.remove('open');
        });
    }

    function selectAllContent(cell) {
        const range = document.createRange();
        range.selectNodeContents(cell);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    function updateCellInfo(cell) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const cellRef = `${tableData.rows[row]?.label || ''} × ${tableData.columns[col] || ''}`;
        const content = cell.textContent.trim();

        const cellInfoBar = document.querySelector('.cell-info-bar');
        if (cellInfoBar) {
            const refEl = cellInfoBar.querySelector('.cell-ref');
            const previewEl = cellInfoBar.querySelector('.cell-content-preview');
            if (refEl) refEl.textContent = cellRef;
            if (previewEl) previewEl.textContent = content || '(vide)';
        }
    }

    function handleCellEdit(cell) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const newValue = cell.textContent.trim();
        const originalValue = cell.dataset.original;

        if (newValue !== originalValue) {
            tableData.rows[row].values[col] = newValue;

            addToHistory({
                row: row,
                col: col,
                oldValue: originalValue,
                newValue: newValue,
                timestamp: new Date().toISOString(),
                cellRef: `${tableData.rows[row]?.label || ''} × ${tableData.columns[col] || ''}`
            });

            updateCellClass(cell, newValue);
            isModified = true;
            updateStatusIndicator();
            cell.dataset.original = newValue;
        }
    }

    function updateCellClass(cell, value) {
        cell.classList.remove('A', 'CC', 'CCI');
        if (value === 'A') cell.classList.add('A');
        else if (value === 'CC') cell.classList.add('CC');
        else if (value === 'CCI') cell.classList.add('CCI');
    }

    function addToHistory(change) {
        modificationHistory.push(change);
        updateHistoryPanel();
    }

    function updateHistoryPanel() {
        const historyList = document.querySelector('.history-list');
        if (!historyList) return;

        historyList.innerHTML = modificationHistory
            .slice()
            .reverse()
            .map(change => {
                const date = new Date(change.timestamp);
                const timeStr = date.toLocaleTimeString('fr-FR');
                return `
                    <div class="history-item">
                        <div class="history-time">${timeStr}</div>
                        <div class="history-cell">${change.cellRef}</div>
                        <div><span class="history-old">${change.oldValue || '(vide)'}</span> → <span class="history-new">${change.newValue || '(vide)'}</span></div>
                    </div>
                `;
            })
            .join('');
    }

    function updateStatusIndicator() {
        const indicator = document.querySelector('.status-indicator');
        if (!indicator) return;

        if (isModified) {
            indicator.textContent = '● Modifications non sauvegardées';
            indicator.classList.remove('saved');
            indicator.classList.add('modified');
        } else {
            indicator.textContent = '✓ Sauvegardé';
            indicator.classList.remove('modified');
            indicator.classList.add('saved');
        }
    }

    async function saveChanges() {
        try {
            const response = await fetch('/api/grille_envoi_edf/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tableData)
            });

            if (response.ok) {
                isModified = false;
                updateStatusIndicator();
                showToast('Modifications sauvegardées avec succès', 'success');
                originalData = JSON.parse(JSON.stringify(tableData));

                document.querySelectorAll('td[contenteditable="true"]').forEach(cell => {
                    const row = parseInt(cell.dataset.row);
                    const col = parseInt(cell.dataset.col);
                    cell.dataset.original = tableData.rows[row].values[col];
                });
            } else {
                showToast('Erreur lors de la sauvegarde', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showToast('Erreur de connexion', 'error');
        }
    }

    function exportToJSON() {
        const dataStr = JSON.stringify(tableData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `grille_envoi_edf_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('Export JSON réussi', 'success');
    }

    function toggleHistory() {
        const panel = document.querySelector('.history-panel');
        if (panel) panel.classList.toggle('open');
    }

    function undoLastChange() {
        if (modificationHistory.length === 0) {
            showToast('Aucune modification à annuler', 'info');
            return;
        }

        const lastChange = modificationHistory.pop();
        tableData.rows[lastChange.row].values[lastChange.col] = lastChange.oldValue;

        const cell = document.querySelector(`[data-row="${lastChange.row}"][data-col="${lastChange.col}"]`);
        if (cell) {
            cell.textContent = lastChange.oldValue;
            cell.dataset.original = lastChange.oldValue;
            updateCellClass(cell, lastChange.oldValue);
        }

        updateHistoryPanel();
        isModified = modificationHistory.length > 0;
        updateStatusIndicator();
        showToast('Modification annulée', 'info');
    }

    function showToast(message, type = 'info') {
        const toastContainer = document.querySelector('.toast-container') || createToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = { success: '✓', error: '✗', info: 'ℹ' };
        toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ'}</span><span>${message}</span>`;

        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    // ✅ Initialisation au chargement de la page
    document.addEventListener('DOMContentLoaded', loadTableData);

})();