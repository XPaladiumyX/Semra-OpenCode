/**
 * SEMRA V2.7 - Système de workflow de génération de mails
 * Ce système gère les popups en cascade selon le plan d'application
 */

// ============================================================
// URL du client local (Outlook tourne sur le poste Windows)
// ============================================================
const CLIENT_API_URL = 'http://localhost:5000';

// ============================================================
// Données et Configuration
// ============================================================

const PLAN_APPLICATION = {
  "Interne EDF": {
    "Surveillance": {
      "Information, demande action": {
        "Retard tournée": {
          "Choix Ouvrage": "o",
          "Choix Périodicité": "o",
          "Saisie date tournée": "o",
          "Paramètres GED": "so",
          "Outlook": "o"
        },
        "Retard validation": {
          "Choix Ouvrage": "o",
          "Choix Périodicité": "o",
          "Saisie date tournée": "o",
          "Paramètres GED": "so",
          "Outlook": "o"
        },
        "Suivi rapproché": {
          "Choix Ouvrage": "o",
          "Choix Périodicité": "x",
          "Saisie date tournée": "x",
          "Paramètres GED": "so",
          "Outlook": "o"
        },
        "Demande confirmation": {
          "Choix Ouvrage": "o",
          "Choix Périodicité": "o",
          "Saisie date tournée": "o",
          "Paramètres GED": "so",
          "Outlook": "o"
        },
        "Autre": {
          "Choix Ouvrage": "o",
          "Choix Périodicité": "x",
          "Saisie date tournée": "x",
          "Paramètres GED": "so",
          "Outlook": "o"
        }
      },
      "Ecart surveillance": {
        "Vigilance comportement": {
          "Choix Ouvrage": "o",
          "Choix Périodicité": "x",
          "Saisie date tournée": "o",
          "Paramètres GED": "so",
          "Outlook": "o"
        },
        "Dysfonctionnement matériel": {
          "Choix Ouvrage": "o",
          "Choix Périodicité": "x",
          "Saisie date tournée": "o",
          "Paramètres GED": "so",
          "Outlook": "o"
        }
      },
      "Alerte": {
        "": {
          "Choix Ouvrage": "x",
          "Choix Périodicité": "x",
          "Saisie date tournée": "x",
          "Paramètres GED": "x",
          "Outlook": "o"
        }
      }
    },
    "Diffusion de documents": {
      "CR CDA": {
        "": {
          "Choix Ouvrage": "o",
          "Choix Périodicité": "so",
          "Saisie date tournée": "so",
          "Paramètres GED": "x",
          "Outlook": "o"
        }
      },
      "CR TOPO": {
        "": {
          "Choix Ouvrage": "o",
          "Choix Périodicité": "so",
          "Saisie date tournée": "so",
          "Paramètres GED": "x",
          "Outlook": "o"
        }
      },
      "CR INTERVENTION": {
        "": {
          "Choix Ouvrage": "o",
          "Choix Périodicité": "so",
          "Saisie date tournée": "so",
          "Paramètres GED": "x",
          "Outlook": "o"
        }
      },
      "RAPPORT": {
        "": {
          "Choix Ouvrage": "o",
          "Choix Périodicité": "so",
          "Saisie date tournée": "so",
          "Paramètres GED": "x",
          "Outlook": "o"
        }
      }
    }
  },
  "Tiers": {
    "Surveillance": {
      "Information, demande action": {
        "Mesure dépouillée": {
          "Choix Ouvrage": "o",
          "Choix Périodicité": "x",
          "Saisie date tournée": "o",
          "Paramètres GED": "so",
          "Outlook": "o"
        },
        "Retard tournée": {
          "Choix Ouvrage": "o",
          "Choix Périodicité": "o",
          "Saisie date tournée": "o",
          "Paramètres GED": "so",
          "Outlook": "o"
        },
        "Demande confirmation": {
          "Choix Ouvrage": "o",
          "Choix Périodicité": "x",
          "Saisie date tournée": "o",
          "Paramètres GED": "so",
          "Outlook": "o"
        },
        "Autre": {
          "Choix Ouvrage": "o",
          "Choix Périodicité": "x",
          "Saisie date tournée": "x",
          "Paramètres GED": "so",
          "Outlook": "o"
        }
      },
      "Ecart surveillance": {
        "Vigilance comportement": {
          "Choix Ouvrage": "o",
          "Choix Périodicité": "x",
          "Saisie date tournée": "o",
          "Paramètres GED": "so",
          "Outlook": "o"
        },
        "Dysfonctionnement matériel": {
          "Choix Ouvrage": "o",
          "Choix Périodicité": "x",
          "Saisie date tournée": "o",
          "Paramètres GED": "so",
          "Outlook": "o"
        }
      },
      "Alerte": {
        "": {
          "Choix Ouvrage": "so",
          "Choix Périodicité": "so",
          "Saisie date tournée": "so",
          "Paramètres GED": "so",
          "Outlook": "o"
        }
      }
    },
    "Diffusion de documents": {
      "CR CDA": {
        "": {
          "Choix Ouvrage": "o",
          "Choix Périodicité": "so",
          "Saisie date tournée": "so",
          "Paramètres GED": "PJ",
          "Outlook": "o"
        }
      },
      "CR TOPO": {
        "": {
          "Choix Ouvrage": "o",
          "Choix Périodicité": "so",
          "Saisie date tournée": "so",
          "Paramètres GED": "PJ",
          "Outlook": "o"
        }
      },
      "CR INTERVENTION": {
        "": {
          "Choix Ouvrage": "o",
          "Choix Périodicité": "so",
          "Saisie date tournée": "so",
          "Paramètres GED": "PJ",
          "Outlook": "o"
        }
      },
      "RAPPORT": {
        "": {
          "Choix Ouvrage": "o",
          "Choix Périodicité": "so",
          "Saisie date tournée": "so",
          "Paramètres GED": "PJ",
          "Outlook": "o"
        }
      }
    }
  }
};

const PERIODICITES = [
  "7 jours",
  "15 jours",
  "Mensuelle",
  "6 Semaines",
  "3 Mois",
  "Semestrielle",
  "Annuelle",
  "Comparative"
];

// ============================================================
// Classe de Workflow
// ============================================================

class MailWorkflow {
  constructor() {
    this.currentState = {
      entity: '',           // "Interne EDF" ou "Tiers"
      gu: '',              // Ex: "CAMPAN" ou pour Tiers = nom du barrage
      category: '',        // Ex: "Surveillance" ou "Diffusion de documents"
      subcategory: '',     // Ex: "Information, demande action"
      mailType: '',        // Ex: "Retard tournée"
      ouvrage: '',         // Ex: "Gréziolles"
      periodicite: '',     // Ex: "7 jours"
      dateTournee: '',     // Ex: "02/02/2026"
      workflow: null       // Configuration du workflow depuis PLAN_APPLICATION
    };

    this.config = null;
    this.loadConfig();
  }

  async loadConfig() {
    try {
      const response = await fetch('/get_config');
      if (!response.ok) throw new Error('Erreur chargement config');
      this.config = await response.json();
      console.log('✅ Configuration chargée:', this.config);
    } catch (error) {
      console.error('❌ Erreur config:', error);
    }
  }

  /**
   * Démarrer le workflow après sélection initiale
   */
  async startWorkflow(entity, gu, category, subcategory, mailType) {
    this.currentState.entity = entity;
    this.currentState.gu = gu;
    this.currentState.category = category;
    this.currentState.subcategory = subcategory;
    this.currentState.mailType = mailType || '';

    // ── Notifier l'intégration des destinataires ──────────────────────────
    if (typeof window.SEMRA_setMailType === 'function') {
      window.SEMRA_setMailType(
          this.currentState.mailType || '',
          this.currentState.subcategory
      );
    }
    // ─────────────────────────────────────────────────────────────────────

    // Récupérer le workflow depuis PLAN_APPLICATION
    try {
      console.log('🔍 Recherche workflow:', { entity, category, subcategory, mailType });

      // Vérifier que la structure existe
      if (!PLAN_APPLICATION[entity]) {
        throw new Error(`Entité "${entity}" non trouvée`);
      }
      if (!PLAN_APPLICATION[entity][category]) {
        throw new Error(`Catégorie "${category}" non trouvée pour "${entity}"`);
      }
      if (!PLAN_APPLICATION[entity][category][subcategory]) {
        throw new Error(`Sous-catégorie "${subcategory}" non trouvée`);
      }

      // Accéder au workflow
      const subcatData = PLAN_APPLICATION[entity][category][subcategory];

      if (mailType && subcatData[mailType]) {
        // Cas avec type de mail spécifique
        this.currentState.workflow = subcatData[mailType];
      } else if (subcatData['']) {
        // Cas avec clé vide (ex: Alerte, CR CDA, etc.)
        this.currentState.workflow = subcatData[''];
      } else {
        // Prendre le premier élément disponible
        const firstKey = Object.keys(subcatData)[0];
        this.currentState.workflow = subcatData[firstKey];
      }

      if (!this.currentState.workflow) {
        throw new Error('Workflow vide ou invalide');
      }

      console.log('✅ Workflow trouvé:', this.currentState.workflow);

    } catch (e) {
      console.error('❌ Workflow introuvable:', e);
      alert(`Configuration de workflow introuvable:\n${e.message}\n\nParamètres: ${entity} > ${category} > ${subcategory} > ${mailType || '(aucun)'}`);
      return;
    }

    console.log('🚀 Workflow démarré:', this.currentState);

    // Lancer la séquence de popups
    await this.processNextStep('Choix Ouvrage');
  }

  /**
   * Traiter l'étape suivante selon le workflow
   */
  async processNextStep(currentStep) {
    const stepValue = this.currentState.workflow[currentStep];

    console.log(`📍 Étape: ${currentStep} = ${stepValue}`);

    // Déterminer l'étape suivante
    const stepSequence = [
      'Choix Ouvrage',
      'Choix Périodicité',
      'Saisie date tournée',
      'Paramètres GED',
      'Outlook'
    ];

    const currentIndex = stepSequence.indexOf(currentStep);
    const nextStep = stepSequence[currentIndex + 1];

    // Gérer l'étape actuelle
    if (stepValue === 'o') {
      // Ouvrir la popup pour cette étape
      await this.openPopup(currentStep, nextStep);
    } else if (stepValue === 'x' || stepValue === '') {
      // Passer directement à l'étape suivante
      if (nextStep) {
        await this.processNextStep(nextStep);
      } else {
        await this.generateMail(); // Fin du workflow
      }
    } else if (stepValue === 'so' || stepValue === 'PJ') {
      // Étapes optionnelles - on passe pour l'instant
      if (nextStep) {
        await this.processNextStep(nextStep);
      } else {
        await this.generateMail();
      }
    }
  }

  /**
   * Ouvrir la popup appropriée
   */
  async openPopup(stepName, nextStep) {
    switch (stepName) {
      case 'Choix Ouvrage':
        await this.showPopupChoixOuvrage(nextStep);
        break;
      case 'Choix Périodicité':
        this.showPopupChoixPeriodicite(nextStep);
        break;
      case 'Saisie date tournée':
        this.showPopupSaisieDateTournee(nextStep);
        break;
      case 'Outlook':
        await this.generateMail();
        break;
      default:
        if (nextStep) {
          await this.processNextStep(nextStep);
        } else {
          await this.generateMail();
        }
    }
  }

  /**
   * Popup: Choix Ouvrage
   * Pour Tiers, le barrage a déjà été choisi dans initial_modal.js,
   * donc on charge directement les ouvrages de ce barrage
   */
  async showPopupChoixOuvrage(nextStep) {
    console.log('🏗️ Affichage popup choix ouvrage');
    console.log('📋 État actuel:', this.currentState);

    // Récupérer les ouvrages disponibles pour le GU/barrage sélectionné
    const ouvrages = await this.getOuvragesForGU(this.currentState.entity, this.currentState.gu);

    if (!ouvrages || ouvrages.length === 0) {
      alert(`Aucun ouvrage trouvé\n\nAucun ouvrage n'a été trouvé pour "${this.currentState.gu}"\n\nVeuillez vérifier que les données sont bien configurées dans le fichier JSON correspondant.`);
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'workflow-modal';
    modal.innerHTML = `
      <div class="workflow-modal-content">
        <div class="workflow-modal-header">
          <h2>🏗️ SEMRA : Choix de l'ouvrage</h2>
          <button class="workflow-modal-close" onclick="this.closest('.workflow-modal').remove()">×</button>
        </div>
        <div class="workflow-modal-body">
          <p class="workflow-info">${this.currentState.entity === 'Tiers' ? 'Barrage' : 'GU'} : <strong>${this.currentState.gu}</strong></p>
          <p class="workflow-label">Sélectionnez l'ouvrage concerné :</p>
          <div class="workflow-options">
            ${ouvrages.map(ouv => `
              <button class="workflow-option-btn" data-value="${ouv}">
                <span class="workflow-icon">🏗️</span>
                ${ouv}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    modal.querySelectorAll('.workflow-option-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        this.currentState.ouvrage = btn.dataset.value;
        console.log('✅ Ouvrage sélectionné:', this.currentState.ouvrage);
        modal.remove();
        if (nextStep) {
          await this.processNextStep(nextStep);
        } else {
          await this.generateMail();
        }
      });
    });
  }

  /**
   * Popup: Choix Périodicité
   */
  showPopupChoixPeriodicite(nextStep) {
    const modal = document.createElement('div');
    modal.className = 'workflow-modal';
    modal.innerHTML = `
      <div class="workflow-modal-content">
        <div class="workflow-modal-header">
          <h2>⏱️ SEMRA : Préparation du mail</h2>
          <button class="workflow-modal-close" onclick="this.closest('.workflow-modal').remove()">×</button>
        </div>
        <div class="workflow-modal-body">
          <p class="workflow-info">Ouvrage : <strong>${this.currentState.ouvrage}</strong></p>
          <p class="workflow-label">Sélectionnez la périodicité de la tournée :</p>
          <div class="workflow-options">
            ${PERIODICITES.map(per => `
              <button class="workflow-option-btn" data-value="${per}">
                <span class="workflow-icon">📅</span>
                ${per}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelectorAll('.workflow-option-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        this.currentState.periodicite = btn.dataset.value;
        modal.remove();
        if (nextStep) {
          await this.processNextStep(nextStep);
        } else {
          await this.generateMail();
        }
      });
    });
  }

  /**
   * Popup: Saisie Date Tournée
   */
  showPopupSaisieDateTournee(nextStep) {
    const modal = document.createElement('div');
    modal.className = 'workflow-modal';
    modal.innerHTML = `
      <div class="workflow-modal-content">
        <div class="workflow-modal-header">
          <h2>📆 SEMRA : Date de la tournée</h2>
          <button class="workflow-modal-close" onclick="this.closest('.workflow-modal').remove()">×</button>
        </div>
        <div class="workflow-modal-body">
          <p class="workflow-info">Ouvrage : <strong>${this.currentState.ouvrage}</strong></p>
          <p class="workflow-label">Date de la dernière tournée</p>
          <p class="workflow-sublabel">Quelle est la date de la dernière mesure ?</p>
          <input type="date" id="dateTourneeInput" class="workflow-date-input">
          <button class="workflow-submit-btn" id="submitDate">Valider</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Set date par défaut = aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateTourneeInput').value = today;

    document.getElementById('submitDate').addEventListener('click', async () => {
      const dateInput = document.getElementById('dateTourneeInput').value;
      if (!dateInput) {
        alert('Veuillez saisir une date');
        return;
      }

      // Convertir au format jj/mm/aaaa
      const [year, month, day] = dateInput.split('-');
      this.currentState.dateTournee = `${day}/${month}/${year}`;

      modal.remove();
      if (nextStep) {
        await this.processNextStep(nextStep);
      } else {
        await this.generateMail();
      }
    });
  }

  /**
   * Générer le mail final
   */
  async generateMail() {
    console.log('📧 Génération du mail avec état:', this.currentState);

    if (!this.config) {
      alert('Configuration non chargée. Veuillez réessayer.');
      return;
    }

    // Déterminer le template à utiliser selon le type de mail
    let subject;
    let body;

    const mailType = this.currentState.mailType;
    const isInterne = this.currentState.entity === "Interne EDF";
    const subcategory = this.currentState.subcategory;
    const barrage = this.currentState.ouvrage || '[BARRAGE À DÉFINIR]';

    // Mapping des templates selon la catégorie et sous-catégorie
    if (mailType === 'Retard tournée') {
      if (isInterne) {
        subject = `Auscultation du barrage de ${barrage} - Risque de retard réalisation d'une tournée d'auscultation`;
        body = this.generateRetardTourneeBody();
      } else {
        subject = (this.config.textes_mails.OBJET_TOURNEE_RETARD_TIERS || 'Retard tournée').replace('{BARRAGE}', barrage);
        body = this.generateRetardTourneeTiersBody();
      }
    } else if (mailType === 'Retard validation') {
      subject = `Auscultation du barrage de ${barrage} - Retard de validation`;
      body = this.generateRetardValidationBody();
    } else if (mailType === 'Suivi rapproché') {
      subject = (this.config.textes_mails.OBJET_SUIVI_RAPPROCHE || 'Suivi rapproché').replace('{BARRAGE}', barrage);
      body = this.generateSuiviRapprocheBody();
    } else if (mailType === 'Demande confirmation') {
      if (isInterne) {
        subject = `Auscultation du barrage de ${barrage} - Demande de confirmation`;
        body = this.generateDemandeConfirmationBody();
      } else {
        subject = (this.config.textes_mails.OBJET_MESURE_CONFIRMATION_TIERS || 'Demande de confirmation').replace('{BARRAGE}', barrage);
        body = this.generateDemandeConfirmationTiersBody();
      }
    } else if (mailType === 'Vigilance comportement') {
      subject = (this.config.textes_mails.OBJET_VIGILANCE_COMPORTEMENT || 'Vigilance comportement').replace('{BARRAGE}', barrage);
      body = this.generateVigilanceComportementBody();
    } else if (mailType === 'Dysfonctionnement matériel') {
      subject = (this.config.textes_mails.OBJET_DYSFONCTIONNEMENT_MATERIEL || 'Dysfonctionnement matériel').replace('{BARRAGE}', barrage);
      body = this.generateDysfonctionnementMaterielBody();
    } else if (mailType === 'Mesure dépouillée') {
      subject = `Auscultation du barrage de ${barrage} - Mesure dépouillée`;
      body = this.generateMesureDepouillee();
    } else if (subcategory === 'Alerte') {
      // Cas spécial pour Alerte (pas de type de mail spécifique)
      subject = (this.config.textes_mails.OBJET_ALERTE || 'Alerte').replace('{BARRAGE}', barrage);
      body = this.config.textes_mails.BODY_ALERTE || 'Bonjour,<br><br>Alerte concernant le barrage.<br><br>Cordialement.';
    } else if (subcategory === 'CR CDA') {
      // Diffusion CR CDA - utiliser les templates de settings.json
      if (isInterne) {
        subject = `Diffusion CR CDA - ${barrage}`;
        body = this.generateCRCDABody();
      } else {
        subject = `Diffusion CR CDA - ${barrage}`;
        body = this.generateCRCDATiersBody();
      }
    } else if (subcategory === 'CR TOPO') {
      // Diffusion CR TOPO - utiliser les templates de settings.json
      if (isInterne) {
        subject = `Diffusion CR TOPO - ${barrage}`;
        body = this.generateCRTOPOBody();
      } else {
        subject = `Diffusion CR TOPO - ${barrage}`;
        body = this.generateCRTOPOTiersBody();
      }
    } else if (subcategory === 'CR INTERVENTION') {
      // Diffusion CR INTERVENTION - utiliser les templates de settings.json
      if (isInterne) {
        subject = `Diffusion CR INTERVENTION - ${barrage}`;
        body = this.generateCRInterventionBody();
      } else {
        subject = `Diffusion CR INTERVENTION - ${barrage}`;
        body = this.generateCRInterventionTiersBody();
      }
    } else if (subcategory === 'RAPPORT') {
      // Diffusion RAPPORT - utiliser les templates de settings.json
      if (isInterne) {
        subject = `Diffusion RAPPORT - ${barrage}`;
        body = this.generateRapportBody();
      } else {
        subject = `Diffusion RAPPORT - ${barrage}`;
        body = await this.generateRapportTiersBody();  // ✅ AJOUT de "await"
      }
    } else if (subcategory.startsWith('CR ')) {
      // Autres CR - cas général
      subject = `Diffusion - ${subcategory} - ${barrage}`;
      body = `Bonjour,<br><br>Veuillez trouver ci-joint le ${subcategory} concernant le barrage de ${barrage}.<br><br>Cordialement.`;
    } else {
      // Cas par défaut
      subject = this.config.textes_mails.OBJET_AUTRE || 'Information';
      body = this.config.textes_mails.BODY_AUTRE || 'Bonjour,<br><br>Cordialement.';
    }

    // Créer le brouillon Outlook
    await this.createOutlookDraft(subject, body);
  }

  /**
   * Générer le corps du mail pour Retard Tournée (Interne)
   */
  generateRetardTourneeBody() {
    const nomTournee = `${this.currentState.ouvrage || 'N/A'} - ${this.currentState.periodicite || 'N/A'}`;
    const barrage = this.currentState.ouvrage || '[BARRAGE À DÉFINIR]';
    const periodicite = this.currentState.periodicite || '[PÉRIODICITÉ À DÉFINIR]';
    const dateTournee = this.currentState.dateTournee || '[DATE À DÉFINIR]';

    return `Bonjour,<br><br>
L'équipe de dépouillement a détecté que la tournée suivante pourrait être en retard :<br>
- Barrage de ${barrage}<br>
- Identifiant KOALA de la tournée = ${nomTournee}<br>
- Périodicité de cette tournée = ${periodicite}<br>
- Date de réalisation de la dernière tournée = ${dateTournee}<br><br>
Nous vous invitons à réaliser cette tournée dans les meilleurs délais ou nous faire un retour, notamment si la tournée a déjà été programmée.<br><br>
Vous pouvez contacter la permanence de dépouillement si nécessaire.<br><br>
Nota 1 : en cas de destinataire erroné, merci de nous le signaler par retour de mail pour que nous puissions effectuer les corrections nécessaires.<br>
Nota 2 : il n'est émis qu'une seule alerte en cas de retard ; aucun rappel ne sera réalisé.<br>
Nota 3 : ce suivi ne concerne que les tournées périodiques d'auscultation. DTG ne contrôle pas la bonne réalisation des tournées de la CSA à réaliser suite à aléas (séisme, crue,…) ou dans des conditions particulières d'exploitation (grand froid, variations de cotes importantes, cote haute ou basse …).<br><br>
Ce mail est envoyé conformément aux exigences de la Directive X-DR-01-02.<br><br>
Cordialement.`;
  }

  /**
   * Générer le corps du mail pour Retard Tournée (Tiers)
   */
  generateRetardTourneeTiersBody() {
    const nomTournee = `${this.currentState.ouvrage || 'N/A'} - ${this.currentState.periodicite || 'N/A'}`;
    let body = this.config.textes_mails.BODY_TOURNEE_RETARD_TIERS_1 || '';
    body += (this.config.textes_mails.BODY_TOURNEE_RETARD_TIERS_2 || '')
        .replace('{BARRAGE}', this.currentState.ouvrage || 'N/A')
        .replace('{NOM_TOURNEE}', nomTournee)
        .replace('{DATE_TOURNEE}', this.currentState.dateTournee || 'N/A');
    body += this.config.textes_mails.BODY_TOURNEE_RETARD_TIERS_3 || '';
    return body;
  }

  generateRetardValidationBody() {
    return `Bonjour,<br><br>Retard de validation détecté pour l'ouvrage ${this.currentState.ouvrage || '[BARRAGE À DÉFINIR]'}.<br><br>Cordialement.`;
  }

  generateSuiviRapprocheBody() {
    let body = this.config.textes_mails.BODY_SUIVI_RAPPROCHE_1 || '';
    body += (this.config.textes_mails.BODY_SUIVI_RAPPROCHE_2 || '').replace('{BARRAGE}', this.currentState.ouvrage || 'N/A');
    body += this.config.textes_mails.BODY_SUIVI_RAPPROCHE_3 || '';
    return body;
  }

  generateDemandeConfirmationBody() {
    const nomTournee = `${this.currentState.ouvrage || 'N/A'} - ${this.currentState.periodicite || 'N/A'}`;
    let body = this.config.textes_mails.BODY_MESURE_CONFIRMATION_1 || '';
    body += (this.config.textes_mails.BODY_MESURE_CONFIRMATION_2 || '')
        .replace('{BARRAGE}', this.currentState.ouvrage || 'N/A')
        .replace('{NOM_TOURNEE}', nomTournee)
        .replace('{DATE_TOURNEE}', this.currentState.dateTournee || 'N/A');
    body += this.config.textes_mails.BODY_MESURE_CONFIRMATION_3 || '';
    return body;
  }

  generateDemandeConfirmationTiersBody() {
    const nomTournee = `${this.currentState.ouvrage || 'N/A'} - ${this.currentState.periodicite || 'N/A'}`;
    let body = this.config.textes_mails.BODY_MESURE_CONFIRMATION_TIERS_1 || '';
    body += (this.config.textes_mails.BODY_MESURE_CONFIRMATION_TIERS_2 || '')
        .replace('{BARRAGE}', this.currentState.ouvrage || 'N/A')
        .replace('{NOM_TOURNEE}', nomTournee)
        .replace('{DATE_TOURNEE}', this.currentState.dateTournee || 'N/A');
    body += this.config.textes_mails.BODY_MESURE_CONFIRMATION_TIERS_3 || '';
    return body;
  }

  generateVigilanceComportementBody() {
    const isInterne = this.currentState.entity === "Interne EDF";
    const nomTournee = `${this.currentState.ouvrage || 'N/A'} - ${this.currentState.periodicite || 'N/A'}`;

    if (isInterne) {
      let body = this.config.textes_mails.BODY_VIGILANCE_COMPORTEMENT_1 || '';
      body += (this.config.textes_mails.BODY_VIGILANCE_COMPORTEMENT_2 || '')
          .replace('{BARRAGE}', this.currentState.ouvrage || 'N/A')
          .replace('{NOM_TOURNEE}', nomTournee)
          .replace('{DATE_TOURNEE}', this.currentState.dateTournee || 'N/A');
      body += this.config.textes_mails.BODY_VIGILANCE_COMPORTEMENT_3 || '';
      return body;
    } else {
      let body = this.config.textes_mails.BODY_VIGILANCE_COMPORTEMENT_TIERS_1 || '';
      body += (this.config.textes_mails.BODY_VIGILANCE_COMPORTEMENT_TIERS_2 || '')
          .replace('{BARRAGE}', this.currentState.ouvrage || 'N/A')
          .replace('{NOM_TOURNEE}', nomTournee)
          .replace('{DATE_TOURNEE}', this.currentState.dateTournee || 'N/A');
      body += this.config.textes_mails.BODY_VIGILANCE_COMPORTEMENT_TIERS_3 || '';
      return body;
    }
  }

  generateDysfonctionnementMaterielBody() {
    const isInterne = this.currentState.entity === "Interne EDF";
    const nomTournee = `${this.currentState.ouvrage || 'N/A'} - ${this.currentState.periodicite || 'N/A'}`;

    if (isInterne) {
      let body = this.config.textes_mails.BODY_DYSFONCTIONNEMENT_MATERIEL_1 || '';
      body += this.config.textes_mails.BODY_DYSFONCTIONNEMENT_MATERIEL_2 || '';
      body += this.config.textes_mails.BODY_DYSFONCTIONNEMENT_MATERIEL_3 || '';
      return body;
    } else {
      let body = this.config.textes_mails.BODY_DYSFONCTIONNEMENT_MATERIEL_TIERS_1 || '';
      body += (this.config.textes_mails.BODY_DYSFONCTIONNEMENT_MATERIEL_TIERS_2 || '')
          .replace('{BARRAGE}', this.currentState.ouvrage || 'N/A')
          .replace('{NOM_TOURNEE}', nomTournee)
          .replace('{DATE_TOURNEE}', this.currentState.dateTournee || 'N/A');
      body += this.config.textes_mails.BODY_DYSFONCTIONNEMENT_MATERIEL_TIERS_3 || '';
      return body;
    }
  }

  generateMesureDepouillee() {
    let body = (this.config.textes_mails.BODY_MESURE_DEPOUILLEE_1 || '')
        .replace('{BARRAGE}', this.currentState.ouvrage || 'N/A')
        .replace('{DATE_TOURNEE}', this.currentState.dateTournee || 'N/A');
    body += this.config.textes_mails.BODY_MESURE_DEPOUILLEE_2 || '';
    return body;
  }

  /**
   * Générer le corps du mail pour CR CDA (Interne EDF)
   */
  generateCRCDABody() {
    const barrage = this.currentState.ouvrage || '[BARRAGE À DÉFINIR]';
    const lienCDA = 'https://prod-hydro.edf.fr/GHY_PS/component/openlink?docbase=dpihghy1&org=44202629&ref=H-44202629-2026-000---';

    let body = (this.config.textes_mails.BODY_TEXTE_CR_CDA_1 || '').replace('{BARRAGE}', barrage);
    body += this.config.textes_mails.BODY_TEXTE_CR_CDA_2 || '';
    body += (this.config.textes_mails.BODY_TEXTE_CR_CDA_3 || '').replace('{LIEN_CR_CDA}', lienCDA);
    body += this.config.textes_mails.BODY_TEXTE_CR_CDA_4 || '';
    return body;
  }

  /**
   * Générer le corps du mail pour CR CDA (Tiers)
   */
  generateCRCDATiersBody() {
    const barrage = this.currentState.ouvrage || '[BARRAGE À DÉFINIR]';

    let body = (this.config.textes_mails.BODY_TEXTE_CR_CDA_TIERS_1 || '').replace('{BARRAGE}', barrage);
    body += this.config.textes_mails.BODY_TEXTE_CR_CDA_TIERS_2 || '';
    body += this.config.textes_mails.BODY_TEXTE_CR_CDA_TIERS_3 || '';
    return body;
  }

  /**
   * Générer le corps du mail pour CR TOPO (Interne EDF)
   */
  generateCRTOPOBody() {
    const barrage = this.currentState.ouvrage || '[BARRAGE À DÉFINIR]';
    const lienTOPO = 'https://prod-hydro.edf.fr/GHY_PS/component/openlink?docbase=dpihghy1&org=44202629&ref=H-44202629-2026-000---';

    let body = (this.config.textes_mails.BODY_TEXTE_CR_TOPO_1 || '').replace('{BARRAGE}', barrage);
    body += (this.config.textes_mails.BODY_TEXTE_CR_TOPO_2 || '').replace('{LIEN_CR_TOPO}', lienTOPO);
    body += this.config.textes_mails.BODY_TEXTE_CR_TOPO_3 || '';
    return body;
  }

  /**
   * Générer le corps du mail pour CR TOPO (Tiers)
   */
  generateCRTOPOTiersBody() {
    const barrage = this.currentState.ouvrage || '[BARRAGE À DÉFINIR]';

    let body = (this.config.textes_mails.BODY_TEXTE_CR_TOPO_TIERS_1 || '').replace('{BARRAGE}', barrage);
    body += this.config.textes_mails.BODY_TEXTE_CR_TOPO_TIERS_2 || '';
    return body;
  }

  /**
   * Générer le corps du mail pour CR INTERVENTION (Interne EDF)
   */
  generateCRInterventionBody() {
    const barrage = this.currentState.ouvrage || '[BARRAGE À DÉFINIR]';
    const lienIntervention = 'https://prod-hydro.edf.fr/GHY_PS/component/openlink?docbase=dpihghy1&org=44202629&ref=H-44202629-2026-000---';

    let body = (this.config.textes_mails.BODY_TEXTE_CR_INTERVENTION_1 || '').replace('{BARRAGE}', barrage);
    body += (this.config.textes_mails.BODY_TEXTE_CR_INTERVENTION_2 || '').replace('{LIEN_CR_INTERVENTION}', lienIntervention);
    body += this.config.textes_mails.BODY_TEXTE_CR_INTERVENTION_3 || '';
    return body;
  }

  /**
   * Générer le corps du mail pour CR INTERVENTION (Tiers)
   */
  generateCRInterventionTiersBody() {
    const barrage = this.currentState.ouvrage || '[BARRAGE À DÉFINIR]';

    let body = (this.config.textes_mails.BODY_TEXTE_CR_INTERVENTION_TIERS_1 || '').replace('{BARRAGE}', barrage);
    body += this.config.textes_mails.BODY_TEXTE_CR_INTERVENTION_TIERS_2 || '';
    return body;
  }

  /**
   * Générer le corps du mail pour RAPPORT (Interne EDF)
   */
  generateRapportBody() {
    const barrage = this.currentState.ouvrage || '[BARRAGE À DÉFINIR]';
    const index = '[INDEX À DÉFINIR]';
    const periode1 = '[PÉRIODE DÉBUT]';
    const periode2 = '[PÉRIODE FIN]';
    const caParc = this.config.charges_affaires?.Lucie_GAUZERE || '[CHARGÉ D\'AFFAIRES]';

    let body = (this.config.textes_mails.BODY_TEXTE_RAPPORT_1 || '')
        .replace('{INDEX}', index)
        .replace('{BARRAGE}', barrage)
        .replace('{PERIODE1}', periode1)
        .replace('{PERIODE2}', periode2);
    body += this.config.textes_mails.BODY_TEXTE_RAPPORT_2 || '';
    body += this.config.textes_mails.BODY_TEXTE_RAPPORT_3 || '';
    body += (this.config.textes_mails.BODY_TEXTE_RAPPORT_4 || '').replace('{CA_PARC}', caParc);
    body += this.config.textes_mails.TEXTE_INFO_RAPPORT_1 || '';
    body += this.config.textes_mails.TEXTE_INFO_RAPPORT_2 || '';
    return body;
  }

  /**
   * Générer le corps du mail pour RAPPORT (Tiers)
   */
  async generateRapportTiersBody() {
    const barrage = this.currentState.ouvrage || '[BARRAGE À DÉFINIR]';

    // 🔥 FIX : Récupérer le bon email du chargé d'affaires selon le site
    let caEmail = '[CHARGÉ D\'AFFAIRES EMAIL]';

    try {
      // Charger les données Tiers depuis l'API
      const response = await fetch('/api/tiers/data');
      if (response.ok) {
        const tiersData = await response.json();

        // Trouver l'index de la colonne correspondant au barrage sélectionné
        const colonneIndex = tiersData.columns.findIndex(col =>
            col.toLowerCase() === barrage.toLowerCase()
        );

        if (colonneIndex !== -1) {
          // Trouver la ligne "Chargé-e d'affaires CRA"
          const ligneCA = tiersData.rows.find(row =>
              row.label === "Chargé-e d'affaires CRA"
          );

          if (ligneCA && ligneCA.emails && ligneCA.emails[colonneIndex]) {
            caEmail = ligneCA.emails[colonneIndex];
            console.log(`✅ Email CA trouvé pour ${barrage}: ${caEmail}`);
          } else {
            console.warn(`⚠️ Email CA non trouvé pour la colonne ${colonneIndex}`);
          }
        } else {
          console.warn(`⚠️ Colonne "${barrage}" non trouvée dans tiers.json`);
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'email CA:', error);
    }

    let body = (this.config.textes_mails.BODY_TEXTE_RAPPORT_TIERS_1 || '').replace('{BARRAGE}', barrage);
    body += (this.config.textes_mails.BODY_TEXTE_RAPPORT_TIERS_2 || '').replace('{CA_PARC}', caEmail);
    return body;
  }

  /**
   * Créer le brouillon Outlook
   */
  async createOutlookDraft(subject, body) {
    const signatureKey = 'CHEMIN_SIGNATURE_' + this.config.signature_selectionnee;
    const signaturePath = this.config.chemins[signatureKey] || '';

    const requestData = { subject, body, signature_path: signaturePath };

    const loadingMsg = document.createElement('div');
    loadingMsg.style.cssText = `
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #003d7a 0%, #0056a8 100%);
      color: white; padding: 30px 50px; border-radius: 15px;
      z-index: 99999; font-size: 18px; font-weight: 600;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3); text-align: center;
    `;
    loadingMsg.innerHTML = `
      <div style="margin-bottom:15px;">⏳ Création du brouillon en cours...</div>
      <div style="font-size:14px;opacity:0.8;">Ouverture d'Outlook sur votre poste</div>
    `;
    document.body.appendChild(loadingMsg);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      // ✅ Appel vers le CLIENT LOCAL (port 5000) et non le serveur
      const response = await fetch(`${CLIENT_API_URL}/create_outlook_draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const result = await response.json();
      loadingMsg.remove();

      if (result.success) {
        const successMsg = document.createElement('div');
        successMsg.style.cssText = loadingMsg.style.cssText
            .replace('#003d7a', '#28a745').replace('#0056a8', '#20c997');
        successMsg.innerHTML = `
          <div style="font-size:48px;margin-bottom:10px;">✅</div>
          <div>Brouillon créé dans Outlook !</div>
        `;
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      loadingMsg.remove();
      if (error.name === 'AbortError') {
        alert('⏱️ Timeout Outlook.\nVérifiez qu\'Outlook est ouvert sur votre poste.');
      } else if (error.message.includes('fetch') || error.message.includes('Failed')) {
        alert('❌ Le client local SEMRA n\'est pas démarré.\nLancez semra_client.exe sur votre poste Windows.');
      } else {
        alert('❌ Erreur Outlook :\n' + error.message);
      }
    }
  }

  /**
   * Récupérer les ouvrages pour un GU donné depuis l'API
   */
  async getOuvragesForGU(entity, gu) {
    console.log(`🔍 Recherche des ouvrages pour GU: ${gu}, Entité: ${entity}`);

    // Déterminer quel endpoint appeler selon l'entité
    let apiEndpoint;

    if (entity === 'Interne EDF') {
      // Mapper le GU vers le bon endpoint
      const guMapping = {
        'CAMPAN': 'adour_et_gaves',
        'VAL D\'AZUN': 'adour_et_gaves',
        'PRAGNERES': 'adour_et_gaves',
        'LUCHON': 'adour_et_gaves',
        'NESTES': 'pyrenees',
        'COUSERANS': 'pyrenees',
        'SAINT-GAUDENS': 'pyrenees',
        'BAIGTS': 'pyrenees',
        'BARALET': 'pyrenees',
        'ASTON': 'aude_ariege',
        'AUDE': 'aude_ariege',
        'AUZAT': 'aude_ariege',
        'FERRIÈRES': 'aude_ariege',
        'PALAMINY': 'aude_ariege',
        'VALLÉE D\'AX': 'aude_ariege',
        'GOLFECH': 'tarn_agout',
        'POUGET - LÉVEZOU (PARELOUP)': 'tarn_agout',
        'POUGET - LÉVEZOU (BAGE, LA GOURDE)': 'tarn_agout',
        'POUGET - LÉVEZOU (PONT DE SALARS)': 'tarn_agout',
        'POUGET - TARN AMONT (VILLEFRANCHE)': 'tarn_agout',
        'POUGET - TARN AVAL (PINET)': 'tarn_agout',
        'POUGET - TARN AVAL (JOURDANIE)': 'tarn_agout',
        'SAUT DE SABO': 'tarn_agout',
        'BRASSAC - AGOUT': 'tarn_agout',
        'BRASSAC - ARN': 'tarn_agout',
        'MONTAHUT': 'tarn_agout',
        'CASTIRLA (CORSCIA, CALACUCCIA)': 'sei_corse',
        'CASTIRLA (SAMPOLO, TREVADINE)': 'sei_corse',
        'OCANA (PONT DE LA VANA, TOLLA)': 'sei_corse',
        'OCANA (RIZZANESE)': 'sei_corse'
      };

      apiEndpoint = guMapping[gu];
    } else {
      // Pour Tiers
      apiEndpoint = 'tiers';
    }

    // ── Notifier l'intégration du GEH maintenant qu'on le connaît ────────
    if (apiEndpoint && typeof window.SEMRA_setGeh === 'function') {
      window.SEMRA_setGeh(apiEndpoint, entity === 'Tiers');
    }
    // ─────────────────────────────────────────────────────────────────────

    if (!apiEndpoint) {
      console.error(`❌ Pas d'endpoint trouvé pour le GU: ${gu}`);
      return [];
    }

    try {
      // Charger les données depuis l'API
      console.log(`📡 Appel API: /api/${apiEndpoint}/data`);
      const response = await fetch(`/api/${apiEndpoint}/data`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des données');
      }

      const data = await response.json();
      console.log('📦 Données reçues:', data);

      // Trouver la ligne avec label "Ouvrage(s)" ou "Ouvrages" dans rows
      if (data.rows && Array.isArray(data.rows)) {
        const ouvragesRow = data.rows.find(row =>
            row.label === 'Ouvrage(s)' || row.label === 'Ouvrages'
        );

        if (ouvragesRow && ouvragesRow.values && Array.isArray(ouvragesRow.values)) {
          // Trouver l'index de la colonne correspondant au GU (insensible à la casse)
          const guIndex = data.columns.findIndex(col =>
              col.toUpperCase() === gu.toUpperCase()
          );

          // ── Notifier l'intégration de l'index de colonne GU ──────────
          if (guIndex !== -1 && typeof window.SEMRA_setGuColIndex === 'function') {
            window.SEMRA_setGuColIndex(guIndex, gu);
          }
          // ─────────────────────────────────────────────────────────────

          if (guIndex !== -1 && guIndex < ouvragesRow.values.length) {
            const ouvragesStr = ouvragesRow.values[guIndex];
            console.log(`📝 Chaîne d'ouvrages trouvée: "${ouvragesStr}"`);

            if (ouvragesStr) {
              // Séparer les ouvrages (séparés par ; ou ,)
              const ouvrages = ouvragesStr
                  .split(/[;,]/)
                  .map(o => o.trim())
                  .filter(o => o.length > 0);

              console.log('✅ Ouvrages trouvés:', ouvrages);
              return ouvrages;
            }
          } else {
            console.warn(`⚠️ GU "${gu}" non trouvé dans les colonnes:`, data.columns);
          }
        } else {
          console.warn('⚠️ Ligne "Ouvrage(s)" ou "Ouvrages" non trouvée dans les données');
        }
      } else {
        console.warn('⚠️ Structure de données invalide (pas de "rows")');
      }

      console.warn('⚠️ Aucun ouvrage trouvé dans les données');
      return [];

    } catch (error) {
      console.error('❌ Erreur lors du chargement des ouvrages:', error);
      return [];
    }
  }
}

// Instance globale du workflow
let mailWorkflowInstance = null;

function initMailWorkflow() {
  if (!mailWorkflowInstance) {
    mailWorkflowInstance = new MailWorkflow();
  }
  return mailWorkflowInstance;
}

// Exposer globalement
window.MailWorkflow = MailWorkflow;
window.initMailWorkflow = initMailWorkflow;