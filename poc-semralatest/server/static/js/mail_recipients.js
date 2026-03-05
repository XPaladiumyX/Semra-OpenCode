/**
 * SEMRA - Mail Recipients (intégration complète)
 */

(function () {
    'use strict';

    // ── MAPPING des types de mail (workflow → grille) ─────────────────────
    const _mailTypeMapping = {
        // Surveillance - Information
        'Retard tournée':        'Tournée Retard',
        'Retard validation':     'Validation Retard',
        'Demande confirmation':  'Demande Confirmation',
        'Suivi rapproché':       'Suivi Canicule',
        'Autre':                 'Autre demande',

        // Surveillance - Ecart
        'Vigilance comportement':     'Alerte comportement',
        'Dysfonctionnement matériel': 'Dysfonctionnement matériel',

        // Diffusion de documents
        'CR CDA':           'CR CDA',
        'CR TOPO':          'CR TOPO',
        'CR INTERVENTION':  'CR Intervention',
        'RAPPORT':          'Rapport',

        // ✅ FIX: Tiers - Adapter au nom exact de la colonne
        'Mesure dépouillée': 'Mesures dépouillées', // ← Pluriel !

        // Alerte
        'Alerte': 'Alerte comportement'
    };

    // ── Config ────────────────────────────────────────────────────────────
    const _config = Object.assign({
        geh:       null,
        isTiers:   false,
        serverUrl: '',
        clientUrl: 'http://localhost:5000'
    }, window.SEMRA_PAGE_CONFIG || {});

    // ── État courant ─────────────────────────────────────────────────────
    const _state = {
        guColIndex:  null,
        mailType:    null,
        subcategory: null,
        guName:      null
    };

    // ═══════════════════════════════════════════════════════════════════════
    // API PUBLIQUE
    // ═══════════════════════════════════════════════════════════════════════

    window.SEMRA_setGeh = function (geh, isTiers) {
        _config.geh     = geh;
        _config.isTiers = !!isTiers;
        _log(`GEH → "${geh}" | Tiers: ${_config.isTiers}`);
    };

    window.SEMRA_setMailType = function (type, subcategory) {
        _state.mailType    = type;
        _state.subcategory = subcategory || null;
        _log(`MailType → "${type}" | Subcategory → "${subcategory || '(none)'}"`);
    };

    window.SEMRA_setGuColIndex = function (index, name) {
        _state.guColIndex = index;
        _state.guName     = name || String(index);
        _log(`GU → col[${index}] "${_state.guName}"`);
    };

    window.SEMRA_getMailState = function () {
        return Object.assign({}, _config, _state);
    };

    // ═══════════════════════════════════════════════════════════════════════
    // FETCH INTERCEPTOR
    // ═══════════════════════════════════════════════════════════════════════

    const _origFetch = window.fetch.bind(window);

    window.fetch = async function (input, init) {
        const url = typeof input === 'string' ? input : (input && input.url) || '';

        // ✅ Ne pas intercepter les appels autres que create_outlook_draft
        if (!url.includes('create_outlook_draft')) {
            return _origFetch(input, init);
        }

        _log('🎯 Interception fetch → create_outlook_draft');

        // ── Parse payload ────────────────────────────────────────────────
        let payload = {};
        try {
            const bodyStr = (init && init.body) ? init.body : '{}';
            payload = JSON.parse(typeof bodyStr === 'string' ? bodyStr : await new Response(bodyStr).text());
        } catch (e) {
            _warn('⚠️ Impossible de parser le payload Outlook', e);
            return _origFetch(input, init);
        }

        // ── Récupération état ────────────────────────────────────────────
        const geh        = _config.geh;
        const isTiers    = _config.isTiers;
        const guColIndex = (_state.guColIndex !== null) ? _state.guColIndex : 0;

        // ✅ PRIORITÉ: mailType → subcategory
        let mailType = _state.mailType || _state.subcategory;

        if (!mailType) {
            _warn('⚠️ Type de mail non défini — envoi sans destinataires auto');
            return _origFetch(input, init);
        }

        if (!geh) {
            _warn('⚠️ GEH non défini — envoi sans destinataires auto');
            return _origFetch(input, init);
        }

        // ── Mapping et appel API ─────────────────────────────────────────
        const mappedMailType = _mailTypeMapping[mailType] || mailType;
        _log(`📝 Mapping type: "${mailType}" → "${mappedMailType}"`);

        let recips = { to: [], cc: [], bcc: [] };

        try {
            const apiUrl = `${_config.serverUrl}/api/mail/get_recipients`;
            _log(`🌐 Appel API: ${apiUrl}`);

            const resp = await _origFetch(apiUrl, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    geh:          geh,
                    gu_col_index: guColIndex,
                    mail_type:    mappedMailType,
                    is_tiers:     isTiers
                })
            });

            if (!resp.ok) {
                _warn(`⚠️ API HTTP ${resp.status} ${resp.statusText}`);
            } else {
                const data = await resp.json();
                if (data.success) {
                    recips = data;
                    _log(`✅ Destinataires récupérés: TO=${data.to.length} CC=${data.cc.length} BCC=${data.bcc.length}`);
                } else {
                    _warn('⚠️ API erreur:', data.error || 'Unknown error');
                }
            }
        } catch (e) {
            _warn('❌ Erreur appel API get_recipients:', e.message);
        }

        // ── Enrichissement du payload ────────────────────────────────────
        const enriched = Object.assign({}, payload);

        // ✅ FUSION INTELLIGENTE (ne pas écraser si déjà présent)
        if (!enriched.to && recips.to && recips.to.length) {
            enriched.to = recips.to.join('; ');
        }
        if (!enriched.cc && recips.cc && recips.cc.length) {
            enriched.cc = recips.cc.join('; ');
        }
        if (!enriched.bcc && recips.bcc && recips.bcc.length) {
            enriched.bcc = recips.bcc.join('; ');
        }

        // ── Log détaillé ─────────────────────────────────────────────────
        console.groupCollapsed(`📧 [SEMRA] ${mappedMailType} → ${geh} | GU[${guColIndex}]`);
        console.log('📥 Payload original:', payload);
        console.log('📨 Destinataires API:', recips);
        console.log('📤 Payload enrichi:', enriched);
        if (enriched.to)  console.log('   TO  :', enriched.to);
        if (enriched.cc)  console.log('   CC  :', enriched.cc);
        if (enriched.bcc) console.log('   BCC :', enriched.bcc);
        console.groupEnd();

        // ── Envoi enrichi ────────────────────────────────────────────────
        const newInit = Object.assign({}, init, {
            body: JSON.stringify(enriched),
            headers: Object.assign({}, (init && init.headers) || {}, {
                'Content-Type': 'application/json'
            })
        });

        return _origFetch(input, newInit);
    };

    // ═══════════════════════════════════════════════════════════════════════
    // INIT
    // ═══════════════════════════════════════════════════════════════════════

    document.addEventListener('DOMContentLoaded', function () {
        _log(`✅ Module chargé | GEH: "${_config.geh}" | Tiers: ${_config.isTiers}`);
        _log('⏳ En attente de SEMRA_setGeh() depuis mail_workflow.js...');
    });

    function _log(...args)  { console.log ('%c[SEMRA Recipients]', 'color: #4CAF50; font-weight: bold', ...args); }
    function _warn(...args) { console.warn('%c[SEMRA Recipients]', 'color: #FF9800; font-weight: bold', ...args); }

})();