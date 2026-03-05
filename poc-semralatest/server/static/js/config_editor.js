/**
 * SEMRA - Configuration Editor JavaScript
 * Gestion de la configuration de l'application
 */

// ============================================
// Configuration par défaut (pour réinitialisation)
// ============================================
const DEFAULT_CONFIG = {
    "signature_selectionnee": "TOULOUSE",
    "interlocuteurs": {
        "RAPPORTS_REGLEMENTAIRES": "rapports-reglementaires@edf.fr",
        "Liste_dest_recurrents": "BARROS-MAUREL Elisabeth elisabeth.barros-maurel@edf.fr; RIEUX Christophe christophe.rieux@edf.fr",
        "CDS_CRACP": "FELZINES Alain alain.felzines@edf.fr; GAUZERE Lucie lucie.gauzere@edf.fr",
        "EXPERT_1": "BOURGEY Philippe philippe.bourgey@edf.fr; SAUSSE Jerome jerome.sausse@edf.fr; SIMON Alexandre alexandre-gilles.simon@edf.fr",
        "EXPERT_2": "ROBBE Emmanuel emmanuel.robbe@edf.fr",
        "SECRETAIRES": "BOUYGE Mathilde mathilde.bouyge@edf.fr",
        "DTG_DEP": "GUAUS Jean-Baptiste jean-baptiste.guaus@edf.fr",
        "SDO_DTG": "DTG-ALERTES-SDO@edf.fr",
        "COMPTEUR_RAPPORT": "",
        "COMPTEUR_TOPO": "DA-COSTA Sebastien sebastien.da-costa@edf.fr; vincent.guihard@edf.fr",
        "COMPTEUR_CDA": "DA-COSTA Sebastien sebastien.da-costa@edf.fr; vincent.guihard@edf.fr",
        "COMPTEUR_INTERVENTION": "GAUZERE Lucie lucie.gauzere@edf.fr; vincent.guihard@edf.fr",
        "CM_GC_FC_DI": "BERNARD Remi remi-2.bernard@edf.fr",
        "DTG_DEP_TOULOUSE": "hydro-dtg-toulouse-depouillement@edf.fr",
        "DTG_DEP_BRIVE": "hydro-dtg-brive-depouillement@edf.fr",
        "DTG_DEP_GRENOBLE_A": "dtg.grenoble-depouillement-A@edf.fr",
        "DTG_DEP_GRENOBLE_B": "dtg.grenoble-depouillement-B@edf.fr",
        "DTG_DMM_MAINTENANCE": "dtg-dmm-maintenance@edf.fr",
        "CDS_S2MA_Ouest": "GAUZERE Lucie lucie.gauzere@edf.fr; vincent.guihard@edf.fr",
        "CDS_S2MA_Est": "HEMOUCH Karim karim.hemouch@edf.fr",
        "CDS_ASOH": "FELZINES Alain alain.felzines@edf.fr; BARROS-MAUREL Elisabeth elisabeth.barros-maurel@edf.fr; PONSARD Jean-Noel jean-noel.ponsard@edf.fr",
        "Chef_DPT": "LION Michel michel-j.lion@edf.fr"
    },
    "chemins": {
        "CHEMIN_SIGNATURE": "\\\\Atlas.edf.fr\\TE\\DPIH-DTG-VIVANT\\ouvr.018\\ausc-hyd.004\\BRI\\Documents\\signature_depouillement_brive.png",
        "CHEMIN_YATE": "\\\\Atlas.edf.fr\\TE\\DPIH-DTG-VIVANT\\ouvr.018\\ausc-hyd.004\\UPSO\\YATB-Yate\\Correspondances\\Details PM",
        "CHEMIN_SIGNATURE2": "C:\\Users\\NNI\\Desktop\\signature_depouillement.png",
        "CHEMIN_SIGNATURE_TOULOUSE": "\\\\atlas.edf.fr\\CO\\dpih-hydro-dtg\\OUVRAGE.003\\MMA-OUEST.004\\00_Outils\\SEMRA\\Signatures_BAL\\Signature BAL S2MA Ouest - Toulouse.PNG",
        "CHEMIN_SIGNATURE_BRIVE": "\\\\atlas.edf.fr\\CO\\dpih-hydro-dtg\\OUVRAGE.003\\MMA-OUEST.004\\00_Outils\\SEMRA\\Signatures_BAL\\Signature BAL S2MA Ouest - Brive.PNG",
        "CHEMIN_SIGNATURE_GRENOBLE_A": "\\\\atlas.edf.fr\\CO\\dpih-hydro-dtg\\OUVRAGE.003\\MMA-OUEST.004\\00_Outils\\SEMRA\\Signatures_BAL\\Signature BAL S2MA Est - Grenoble Equipe A.PNG",
        "CHEMIN_SIGNATURE_GRENOBLE_B": "\\\\atlas.edf.fr\\CO\\dpih-hydro-dtg\\OUVRAGE.003\\MMA-OUEST.004\\00_Outils\\SEMRA\\Signatures_BAL\\Signature BAL S2MA Est - Grenoble Equipe B.PNG"
    },
    "charges_affaires": {
        "Lucie_GAUZERE": "lucie.gauzere@edf.fr",
        "Barthelemy_STECK": "barthelemy.steck@edf.fr",
        "Claire_DE_LANSALUT": "claire.de-lansalut@edf.fr",
        "Matthieu_CASTAY": "matthieu.castay@edf.fr",
        "Elisabeth_BARROS-MAUREL": "elisabeth.barros-maurel@edf.fr",
        "Philippe_BOURGEY": "philippe.bourgey@edf.fr",
        "Daniel_SANTIN": "daniel.santin@edf.fr"
    },
    "textes_mails": {
        "TEXTE_INFO_RAPPORT_1": "<br>Nb :<br> --------------------------------------------------------------------------------------------------------------------------------------------------------------------<br><font color=#0070C0><strong>INFO</strong></font><br>pour visualiser les Graphiques de surveillance et les Effets réversibles qui se trouvent en PJ du rapport, il faut sélectionner, à l'ouverture du lien :<br>- 1/ l'onglet « Afficher les propriétés »<br>- 2/ l'onglet « Annexes »<br> --------------------------------------------------------------------------------------------------------------------------------------------------------------------<br>",
        "TEXTE_INFO_RAPPORT_2": "<font color=#0070C0><br>Pour EDF HYDRO <strong>'CENTRE'</strong> ou <strong>'SUD-OUEST'</strong> <br>➔ l'Enquête Satisfaction Client suit via l'outil <u>'Interviews'.</u> <br></font>",
        "BODY_TEXTE_RAPPORT_1": "Bonjour,<br><br>Veuillez trouver ci-joint, les liens GED pour le rapport :<br><br>- Rapport n° : {INDEX}<br>- Barrage : {BARRAGE}<br>- Période du rapport : {PERIODE1} à {PERIODE2}<br><br><br>",
        "BODY_TEXTE_RAPPORT_2": "<strong><u>Résumé des constatations :</u></strong><br><br><font color=#FF0000>Coller ici le résumé du rapport !</font><br><br><u><br><strong>Observations :</u></strong><br><br><font color=#FF0000>Coller ici les observations !</font><br><br>",
        "BODY_TEXTE_RAPPORT_3_1": "Lettre :<br>{LIEN_LETTRE}<br><br>",
        "BODY_TEXTE_RAPPORT_3_2": "Rapport + Graphiques (sont disponibles en annexe dans 'afficher les propriétés') :<br>{LIEN_RAPPORT}<br><br>",
        "BODY_TEXTE_RAPPORT_3_3": "Dispositifs : <br>{LIEN_DISPOSITIFS}<br><br>",
        "BODY_TEXTE_RAPPORT_4": "<br>Pour toute demande complémentaire, merci de contacter {CA_PARC}.<br><br>Cordialement.<br><br>",
        "BODY_TEXTE_CR_CDA_1": "Bonjour,<br><br>Veuillez trouver ci-joint, le lien GED pour le compte-rendu de CDA :<br><br>- Barrage : {BARRAGE}<br><br>",
        "BODY_TEXTE_CR_CDA_2": "<strong><u>Liste des écarts constatés et/ou des actions attendues :</u></strong><br><br><font color=#FF0000>Renseigner ici les écarts et les attentes !</font><br><br><u><br></u>",
        "BODY_TEXTE_CR_CDA_3": "Compte-rendu CDA : <br>{LIEN_CR_CDA}<br><br>",
        "BODY_TEXTE_CR_CDA_4": "En vous souhaitant une bonne réception.<br>Cordialement.<br>",
        "BODY_TEXTE_CR_TOPO_1": "Bonjour,<br><br>Veuillez trouver ci-joint, le lien GED pour le compte-rendu de mesures topographiques de {BARRAGE}.<br><br>",
        "BODY_TEXTE_CR_TOPO_2": "Compte-rendu TOPO : <br>{LIEN_CR_TOPO}<br><br>",
        "BODY_TEXTE_CR_TOPO_3": "En vous souhaitant une bonne réception.<br>Cordialement.<br>",
        "BODY_TEXTE_CR_TOPO_TIERS_1": "Bonjour, <br><br>Veuillez trouver ci-joint le compte-rendu de mesures topographiques sur l'ouvrage de {BARRAGE}.<br>",
        "BODY_TEXTE_CR_TOPO_TIERS_2": "En vous souhaitant une bonne réception.<br>Cordialement.<br>",
        "BODY_TEXTE_CR_CDA_TIERS_1": "Bonjour,<br><br>Veuillez trouver ci-joint le compte-rendu de CDA pour le barrage de {BARRAGE}.<br><br><br>",
        "BODY_TEXTE_CR_CDA_TIERS_2": "<strong><u>Liste des écarts constatés et/ou des actions attendues :</u></strong><br><br><font color=#FF0000>Renseigner ici les écarts et les attentes !</font><br><br><u><br></u>",
        "BODY_TEXTE_CR_CDA_TIERS_3": "En vous souhaitant une bonne réception.<br>Cordialement.<br>",
        "BODY_TEXTE_RAPPORT_TIERS_1": "Bonjour,<br><br>Veuillez trouver ci-joint le rapport pour le barrage de {BARRAGE}.<br><br><br><br>",
        "BODY_TEXTE_RAPPORT_TIERS_2": "<br>Pour toute demande complémentaire, merci de contacter {CA_PARC}.<br><br>En vous souhaitant une bonne réception.<br>Cordialement.<br><br>",
        "OBJET_TOURNEE_RETARD": "Auscultation du barrage de {BARRAGE} - Risque de Tournée en retard (écart à la CDSA)",
        "BODY_TOURNEE_RETARD_1": "Bonjour,<br><br>L'équipe de dépouillement a détecté que la tournée suivante pourrait être en retard :<br><br>",
        "BODY_TOURNEE_RETARD_2": "<br>- Barrage de {BARRAGE}<br>- Identifiant KOALA de la tournée = {NOM_TOURNEE}<br>- Périodicité de cette tournée = {PERIODE}<br>- Date de réalisation de la dernière tournée = {DATE_TOURNEE}<br><br>",
        "BODY_TOURNEE_RETARD_3": "Nous vous invitons à réaliser cette tournée dans les meilleurs délais ou nous faire un retour, notamment si la tournée a déjà été programmée.<br><br>Vous pouvez contacter la permanence de dépouillement si nécessaire.<br><br><br><u>Nota 1 </u>: en cas de destinataire erroné, merci de nous le signaler par retour de mail pour que nous puissions effectuer les corrections nécessaires.<br><u>Nota 2 </u>: il n'est émis qu'une seule alerte en cas de retard ; aucun rappel ne sera réalisé.<br><u>Nota 3</u> : ce suivi ne concerne que les tournées périodiques d'auscultation. DTG ne contrôle pas la bonne réalisation des tournées de la CSA à réaliser suite à aléas (séisme, crue,…) ou dans des conditions particulières d'exploitation (grand froid, variations de cotes importantes, cote haute ou basse …).<br>Ce mail est envoyé conformément aux exigences de la Directive X-DR-01-02.<br><br>Cordialement.<br>",
        "OBJET_VALIDATION_RETARD": "Auscultation du barrage de {BARRAGE} - Retard de validation mesure",
        "BODY_VALIDATION_RETARD_1": "Bonjour,<br><br>L'équipe de dépouillement a détecté que la tournée suivante est en retard de validation mesure :<br>",
        "BODY_VALIDATION_RETARD_2": "<br>- Nom de la tournée = {NOM_TOURNEE}<br>- Date de réalisation de la tournée = {DATE_TOURNEE}<br><br>",
        "BODY_VALIDATION_RETARD_3": "Merci d'avance de valider les mesures de cette tournée sous KOALA ou nous faire un retour si vous rencontrez une difficulté particulière.<br><br>Nous sommes à votre disposition pour tout renseignement complémentaire.<br><br>Cordialement<br><br><u>Nota</u> : en cas de destinataire erroné, merci de nous le signaler par retour de mail pour que nous puissions effectuer les corrections nécessaires.<br><br>Ce mail est envoyé conformément aux exigences de la Directive X-DR-01-02.<br>",
        "OBJET_MESURE_CONFIRMATION": "Auscultation du barrage de {BARRAGE} - Demande de Confirmation de mesure",
        "BODY_MESURE_CONFIRMATION_1": "Bonjour,<br>L'équipe de dépouillement a détecté un écart suite à la validation de la tournée suivante :<br>",
        "BODY_MESURE_CONFIRMATION_2": "<br>- Barrage de {BARRAGE}<br>- Identifiant KOALA de la tournée = {NOM_TOURNEE}<br>- Date de réalisation de la dernière tournée = {DATE_TOURNEE}<br>- Description de l'écart : <font color=#00B050>Décrivez l'écart ou l'anomalie, éventuellement coller un graphique</font><br><br>Nous vous invitons à engager la (ou les) action(s) suivantes :<font color=#00B050> (préciser l'objectif et les attendus de l'action)</font><br><br><br><br>",
        "BODY_MESURE_CONFIRMATION_3": "Nous sommes à votre disposition pour tout renseignement complémentaire.<br><br>Ce mail est envoyé conformément aux exigences de la Directive X-DR-01-02.<br><u>Nota </u>: en cas de destinataire erroné, merci de nous le signaler par retour de mail pour que nous puissions effectuer les corrections nécessaires.<br><br>Cordialement.<br>",
        "OBJET_ALERTE": "Auscultation du barrage de {BARRAGE} - Alerte comportement suite à un écart concernant l'auscultation",
        "BODY_ALERTE": "Bonjour,<br><br><font color=#FF0000><i>Le texte est libre car nécessitant d'être adapté au contexte. Il pourra être accompagné d'une note d'analyse, de graphiques de mesures, …<br><br>Ce qui devra apparaître clairement, a minima :<br>- la caractérisation factuelle de l'écart constaté, sa chronologie, le rappel de toutes les informations disponibles, et rappelant les actions qui ont éventuellement déjà été engagées, …<br>- une première analyse des causes et conséquences potentielles (plusieurs hypothèses pourront être suggérées),<br>- des actions préconisées et des suites à donner.<br><br>L'instruction et le traitement de cet écart nécessite de notre point de vue une coordination pilotée par vos services, et la sollicitation éventuelle d'autres services (à préciser), l'intervention d'un prestataire … Pour cela, nous vous proposons d'organiser une réunion (ou un point téléphonique ou …) afin de partager notre analyse et étudier avec vous les suites à donner.</i><br></font><br>Cordialement<br><br><u>Nota</u> : en cas de destinataire ou d'alerte erronée, merci de nous le signaler par retour de mail pour que nous puissions effectuer les corrections nécessaires.<br><br><font color=#FF0000>Signature mail chargé d'affaire DTG (ou un autre chargé d'affaire en son absence)</font>",
        "OBJET_TOURNEE_RETARD_TIERS": "Risque de retard réalisation d'une tournée d'auscultation",
        "BODY_TOURNEE_RETARD_TIERS_1": "Bonjour,<br><br>Dans le cadre de la mission confiée à DTG d'appuyer l'exploitant quant au respect des fréquences des tournées périodiques, nous vous informons que la tournée suivante est en retard par rapport à la périodicité et tolérance configurées dans KOALA.",
        "BODY_TOURNEE_RETARD_TIERS_2": "<br>- Barrage de {BARRAGE}<br>- Identifiant de la tournée = {NOM_TOURNEE}<br>- Date de réalisation de la dernière tournée = {DATE_TOURNEE}<br><br>",
        "BODY_TOURNEE_RETARD_TIERS_3": "Merci d'avance de réaliser les mesures et nous les faire parvenir par mail, ou nous indiquer la raison de cette/ces non-réalisations.<br><br>Cordialement",
        "OBJET_MESURE_CONFIRMATION_TIERS": "Demande d'action suite à un écart concernant l'auscultation",
        "BODY_MESURE_CONFIRMATION_TIERS_1": "Bonjour,<br><br>Dans le cadre de la mission confiée à DTG de réaliser un contrôle de 2° niveau de toutes les tournées d'auscultation du dispositif principal réalisées sur les barrages, nous souhaiterions une mesure de confirmation sur la tournée suivante :",
        "BODY_MESURE_CONFIRMATION_TIERS_2": "<br>- Barrage de {BARRAGE} <br>- Identifiant de la tournée = {NOM_TOURNEE}<br>- Date de réalisation de la dernière tournée = {DATE_TOURNEE}<br><br>",
        "BODY_MESURE_CONFIRMATION_TIERS_3": "Nous sommes à votre disposition pour tout renseignement complémentaire.<br><br>Cordialement",
        "BODY_MESURE_DEPOUILLEE_1": "Bonjour,<br><br>Nous avons bien reçu et validé la tournée d'auscultation suivante : {BARRAGE} du {DATE_TOURNEE}.<br>",
        "BODY_MESURE_DEPOUILLEE_2": "Les mesures n'appellent pas de remarque particulière.<br><br>Cordialement.",
        "BODY_TEXTE_CR_INTERVENTION_1": "Bonjour,<br><br>Veuillez trouver ci-joint, le lien GED pour le rapport d'intervention au {BARRAGE}.<br><br>",
        "BODY_TEXTE_CR_INTERVENTION_2": "Compte-rendu d'INTERVENTION : <br>{LIEN_CR_INTERVENTION}<br><br>",
        "BODY_TEXTE_CR_INTERVENTION_3": "En vous souhaitant une bonne réception.<br>Cordialement.<br>",
        "BODY_TEXTE_CR_INTERVENTION_TIERS_1": "Bonjour, <br><br>Veuillez trouver ci-joint le compte-rendu de fin d'intervention sur l'ouvrage de {BARRAGE}.<br>",
        "BODY_TEXTE_CR_INTERVENTION_TIERS_2": "En vous souhaitant une bonne réception.<br>Cordialement.<br>",
        "OBJET_MESURES_TIERS_LAOS": "Reception of monitoring measurements ",
        "BODY_MESURES_TIERS_LAOS_1": "Sabaïdee ! <br><br>We received the measurements of the<font color=#FF0000> {DATE_TOURNEE} </font> of <font color=#FF0000>Nakaï Dam and/or Regulating Dam</font>.<br><br><font color=#FF0000>We have nothing to report on the results. / We have the following remarks after their treatment:<br>- Nakai<br>- Regulating</font><br>",
        "BODY_MESURES_TIERS_LAOS_2": "Thank you in advance for your complements<br>Best Regards, <br><br><font color=#FF0000> {CA_PARC}</font>",
        "OBJET_VIGILANCE_COMPORTEMENT": "Vigilance sur le comportement",
        "BODY_VIGILANCE_COMPORTEMENT_1": "Bonjour,<br><br>Conformément aux exigences de la Directive X-DR-01-02, DTG réalise un contrôle de 2° niveau sur les mesures d'auscultation du dispositif principal réalisées sur les barrages dans les 48 h ouvrées qui suivent la validation de premier niveau que vous avez effectuée en GU.<br><br>Dans ce cadre, il a été constaté une anomalie suite au traitement de la tournée :",
        "BODY_VIGILANCE_COMPORTEMENT_2": "<br>- Barrage de {BARRAGE}<br>- Identifiant KOALA de la tournée = {NOM_TOURNEE}<br>- Date de réalisation de la dernière tournée = {DATE_TOURNEE}<br>- Description de l'anomalie : <font color=#FF0000>Décrivez l'anomalie</font><br><br>Nous vous invitons à engager la (ou les) action(s) suivantes afin de <font color=#FF0000>XXX (préciser l'objectif et les attendus de l'action)<br></font><br><br><br>",
        "BODY_VIGILANCE_COMPORTEMENT_3": "Vous pouvez contacter la permanence de dépouillement du CRA si nécessaire.<br><br>Cordialement.<br><br>Nota : en cas de destinataire ou d'alerte erronée, merci de nous le signaler par retour de mail pour que nous puissions effectuer les corrections nécessaires.",
        "OBJET_DYSFONCTIONNEMENT_MATERIEL": "Auscultation du barrage de {BARRAGE} - Alerte dysfonctionnement matériel suite à un écart concernant l'auscultation",
        "BODY_DYSFONCTIONNEMENT_MATERIEL_1": "Bonjour,<br>",
        "BODY_DYSFONCTIONNEMENT_MATERIEL_2": "<font color=#FF0000><i>Le texte est libre car nécessitant d'être adapté au contexte. Il pourra être accompagné d'une note d'analyse, de graphiques de mesures, …<br><br>Ce qui devra apparaître clairement, a minima :<br>- la caractérisation du dysfonctionnement constaté, la date de la dernière mesure disponible, le rappel de toutes les informations à disposition, et des actions qui ont éventuellement déjà été engagées, …<br> - une première analyse des causes possibles du dysfonctionnement et de l'impact éventuel sur la qualité de la surveillance <br> - des actions préconisées et des suites envisagées<br><br>L'instruction et le traitement de ce dysfonctionnement nécessite que nous nous coordonnions (dans le but de caler notre intervention, celle d'un prestataire … ).<br>Pour cela, nous vous proposons d'organiser une réunion (ou un point téléphonique ou …) afin de partager notre analyse et étudier ensemble les suites à donner.<br><br><u></font>Nota </u>: en cas de destinataire ou d'alerte erronée, merci de nous le signaler par retour de mail pour que nous puissions effectuer les corrections nécessaires.</i><br>",
        "BODY_DYSFONCTIONNEMENT_MATERIEL_3": "<br> <br>Cordialement.<br><br><font color=#FF0000>Signature mail chargé d'affaire DTG (ou un autre chargé d'affaire en son absence)</font><br><br>",
        "OBJET_VIGILANCE_COMPORTEMENT_TIERS": "Vigilance sur le comportement",
        "BODY_VIGILANCE_COMPORTEMENT_TIERS_1": "Bonjour,<br><br>Dans le cadre de la mission confiée à DTG, notre équipe de surveillance a constaté une anomalie :",
        "BODY_VIGILANCE_COMPORTEMENT_TIERS_2": "<br>- Barrage de {BARRAGE}<br>- Identifiant KOALA de la tournée = {NOM_TOURNEE}<br>- Date de réalisation de la dernière tournée = {DATE_TOURNEE}<br>- Description de l'anomalie : <font color=#FF0000>Décrivez l'anomalie</font><br><br>Nous vous invitons à engager la (ou les) action(s) suivantes afin de <font color=#FF0000>XXX (préciser l'objectif et les attendus de l'action)<br></font><br><br><br>",
        "BODY_VIGILANCE_COMPORTEMENT_TIERS_3": "Nous sommes à votre disposition pour tout renseignement complémentaire.<br><br>Cordialement",
        "OBJET_DYSFONCTIONNEMENT_MATERIEL_TIERS": "Dysfonctionnement matériel",
        "BODY_DYSFONCTIONNEMENT_MATERIEL_TIERS_1": "Bonjour,<br><br>Dans le cadre de la mission confiée à DTG, notre équipe de surveillance a constaté un dysfonctionnement matériel suite au traitement de la tournée :",
        "BODY_DYSFONCTIONNEMENT_MATERIEL_TIERS_2": "<br>- Barrage de {BARRAGE}<br>- Identifiant KOALA de la tournée = {NOM_TOURNEE}<br>- Date de réalisation de la dernière tournée = {DATE_TOURNEE}<br>- Dysfonctionnement du matériel : <font color=#FF0000>Décrivez le dispostif d'auscultation défectueux ou défaillant<br></font><br><font color=#FF0000>Préciser le type d'action engagée par DTG ou attendue de la part de l'exploitant.</font><br><br>",
        "BODY_DYSFONCTIONNEMENT_MATERIEL_TIERS_3": "Nous sommes à votre disposition pour tout renseignement complémentaire.<br><br>Cordialement",
        "OBJET_SUIVI_RAPPROCHE": "Suivi rapproché programmé",
        "BODY_SUIVI_RAPPROCHE_1": "Bonjour,<br>Dans le cadre des <font color=#FF0000>travaux/vidange</font>, une surveillance rapprochée a été définie. <br>",
        "BODY_SUIVI_RAPPROCHE_2": "<br>- Barrage de {BARRAGE}<br>- Description du suivi : <font color=#FF0000>Décrivez le suivi (par exemples : rapprochement des mesures, mesures tous les x mètres d'abaissement de cotes...)</font><br><br><font color=#FF0000>Préciser la période prévue du suivi rapproché (du... au...) <br>ou <br>signifier l'arrêt du suivi rapproché mis en place à compter du...</font><br><br><br><br>",
        "BODY_SUIVI_RAPPROCHE_3": "Vous pouvez contacter la permanence de dépouillement du CRA si nécessaire.<br><br>Cordialement.<br><br>Nota : en cas de destinataire erroné, merci de nous le signaler par retour de mail pour que nous puissions effectuer les corrections nécessaires.",
        "OBJET_SUIVI_CANICULE": "Auscultation du barrage de {BARRAGE} – Surveillance rapprochée en cas d'événement \"Grand chaud\"",
        "BODY_SUIVI_CANICULE_1": "Bonjour,<br>",
        "BODY_SUIVI_CANICULE_2": "<font color=#FF0000><strong><i><br>(en italique rouge--> texte à adapter et à supprimer avant envoi !! )<br></strong><br>Le texte est libre car nécessitant d'être adapté au contexte météo (canicule en cours, à venir…), d'exploitation (cote basse en cours ou à venir…) . <br>Il pourra être accompagné du graphique de prévisions SITCOM…<br><br>Ce qui devra apparaître clairement, a minima :<br>   - la caractérisation de la situation météo actuelle et à venir, l'écart constaté sur le phénomène de référence ou prévu via le tableau de bord Sitcom, le rappel de toutes les informations disponibles…<br>   - des actions préconisées et des suites à donner (mise en place d'une surveillance rapprochée, collecte des prévisions d'exploitation, réalisation d'une mesure topo par DTG ou sous-traitant…)<br>   - préconisations de mesures : s'assurer que la mesure de déplacement par pendule est opérationnelle (utilisation possible d'ODEPEN pour s'assurer du domaine libre du pendule)</font></i>",
        "BODY_SUIVI_CANICULE_3": "<br><br>Cordialement.<br><br><u>Nota :</u> en cas de destinataire ou d'alerte erronée, merci de nous le signaler par retour de mail pour que nous puissions effectuer les corrections nécessaires.<br>Ce mail est envoyé conformément à la note d'organisation pour la surveillance des ouvrages lors d'épisodes climatiques exceptionnels (Réf. GTA X EX 02 31).<br>",
        "OBJET_AUTRE": "Information",
        "BODY_AUTRE": "Bonjour,<br><br><br>Cordialement"
    }
};

// ============================================
// Configuration des champs de formulaire
// ============================================
const FIELD_CONFIG = {
    interlocuteurs: [
        'RAPPORTS_REGLEMENTAIRES', 'Liste_dest_recurrents', 'CDS_CRACP',
        'EXPERT_1', 'EXPERT_2', 'SECRETAIRES', 'DTG_DEP', 'SDO_DTG',
        'COMPTEUR_RAPPORT', 'COMPTEUR_TOPO', 'COMPTEUR_CDA', 'COMPTEUR_INTERVENTION',
        'CM_GC_FC_DI', 'DTG_DEP_TOULOUSE', 'DTG_DEP_BRIVE', 'DTG_DEP_GRENOBLE_A',
        'DTG_DEP_GRENOBLE_B', 'DTG_DMM_MAINTENANCE', 'CDS_S2MA_Ouest',
        'CDS_S2MA_Est', 'CDS_ASOH', 'Chef_DPT'
    ],
    chemins: [
        'CHEMIN_SIGNATURE', 'CHEMIN_YATE', 'CHEMIN_SIGNATURE2',
        'CHEMIN_SIGNATURE_TOULOUSE', 'CHEMIN_SIGNATURE_BRIVE',
        'CHEMIN_SIGNATURE_GRENOBLE_A', 'CHEMIN_SIGNATURE_GRENOBLE_B'
    ],
    charges_affaires: [
        'Lucie_GAUZERE', 'Barthelemy_STECK', 'Claire_DE_LANSALUT',
        'Matthieu_CASTAY', 'Elisabeth_BARROS-MAUREL', 'Philippe_BOURGEY',
        'Daniel_SANTIN'
    ],
    mails: [
        // Rapports EDF
        { id: 'TEXTE_INFO_RAPPORT_1', rows: 6, category: 'rapport' },
        { id: 'TEXTE_INFO_RAPPORT_2', rows: 3, category: 'rapport' },
        { id: 'BODY_TEXTE_RAPPORT_1', rows: 4, category: 'rapport' },
        { id: 'BODY_TEXTE_RAPPORT_2', rows: 4, category: 'rapport' },
        { id: 'BODY_TEXTE_RAPPORT_3_1', rows: 2, category: 'rapport' },
        { id: 'BODY_TEXTE_RAPPORT_3_2', rows: 2, category: 'rapport' },
        { id: 'BODY_TEXTE_RAPPORT_3_3', rows: 2, category: 'rapport' },
        { id: 'BODY_TEXTE_RAPPORT_4', rows: 2, category: 'rapport' },
        // CR CDA EDF
        { id: 'BODY_TEXTE_CR_CDA_1', rows: 3, category: 'cda' },
        { id: 'BODY_TEXTE_CR_CDA_2', rows: 4, category: 'cda' },
        { id: 'BODY_TEXTE_CR_CDA_3', rows: 2, category: 'cda' },
        { id: 'BODY_TEXTE_CR_CDA_4', rows: 2, category: 'cda' },
        // CR TOPO EDF
        { id: 'BODY_TEXTE_CR_TOPO_1', rows: 3, category: 'topo' },
        { id: 'BODY_TEXTE_CR_TOPO_2', rows: 2, category: 'topo' },
        { id: 'BODY_TEXTE_CR_TOPO_3', rows: 2, category: 'topo' },
        // CR INTERVENTION EDF
        { id: 'BODY_TEXTE_CR_INTERVENTION_1', rows: 3, category: 'intervention' },
        { id: 'BODY_TEXTE_CR_INTERVENTION_2', rows: 2, category: 'intervention' },
        { id: 'BODY_TEXTE_CR_INTERVENTION_3', rows: 2, category: 'intervention' },
        // CR TOPO TIERS
        { id: 'BODY_TEXTE_CR_TOPO_TIERS_1', rows: 2, category: 'tiers' },
        { id: 'BODY_TEXTE_CR_TOPO_TIERS_2', rows: 2, category: 'tiers' },
        // CR CDA TIERS
        { id: 'BODY_TEXTE_CR_CDA_TIERS_1', rows: 3, category: 'tiers' },
        { id: 'BODY_TEXTE_CR_CDA_TIERS_2', rows: 4, category: 'tiers' },
        { id: 'BODY_TEXTE_CR_CDA_TIERS_3', rows: 2, category: 'tiers' },
        // Rapport TIERS
        { id: 'BODY_TEXTE_RAPPORT_TIERS_1', rows: 3, category: 'tiers' },
        { id: 'BODY_TEXTE_RAPPORT_TIERS_2', rows: 4, category: 'tiers' },
        // CR INTERVENTION TIERS
        { id: 'BODY_TEXTE_CR_INTERVENTION_TIERS_1', rows: 2, category: 'tiers' },
        { id: 'BODY_TEXTE_CR_INTERVENTION_TIERS_2', rows: 2, category: 'tiers' },
        // Alertes Tournée EDF
        { id: 'OBJET_TOURNEE_RETARD', rows: 1, category: 'alerte' },
        { id: 'BODY_TOURNEE_RETARD_1', rows: 2, category: 'alerte' },
        { id: 'BODY_TOURNEE_RETARD_2', rows: 3, category: 'alerte' },
        { id: 'BODY_TOURNEE_RETARD_3', rows: 6, category: 'alerte' },
        // Alertes Validation EDF
        { id: 'OBJET_VALIDATION_RETARD', rows: 1, category: 'alerte' },
        { id: 'BODY_VALIDATION_RETARD_1', rows: 2, category: 'alerte' },
        { id: 'BODY_VALIDATION_RETARD_2', rows: 3, category: 'alerte' },
        { id: 'BODY_VALIDATION_RETARD_3', rows: 5, category: 'alerte' },
        // Demande Confirmation Mesure EDF
        { id: 'OBJET_MESURE_CONFIRMATION', rows: 1, category: 'alerte' },
        { id: 'BODY_MESURE_CONFIRMATION_1', rows: 2, category: 'alerte' },
        { id: 'BODY_MESURE_CONFIRMATION_2', rows: 5, category: 'alerte' },
        { id: 'BODY_MESURE_CONFIRMATION_3', rows: 4, category: 'alerte' },
        // Alerte Comportement EDF
        { id: 'OBJET_ALERTE', rows: 1, category: 'alerte' },
        { id: 'BODY_ALERTE', rows: 10, category: 'alerte' },
        // Vigilance Comportement EDF
        { id: 'OBJET_VIGILANCE_COMPORTEMENT', rows: 1, category: 'vigilance' },
        { id: 'BODY_VIGILANCE_COMPORTEMENT_1', rows: 4, category: 'vigilance' },
        { id: 'BODY_VIGILANCE_COMPORTEMENT_2', rows: 5, category: 'vigilance' },
        { id: 'BODY_VIGILANCE_COMPORTEMENT_3', rows: 3, category: 'vigilance' },
        // Dysfonctionnement Matériel EDF
        { id: 'OBJET_DYSFONCTIONNEMENT_MATERIEL', rows: 1, category: 'dysfonctionnement' },
        { id: 'BODY_DYSFONCTIONNEMENT_MATERIEL_1', rows: 1, category: 'dysfonctionnement' },
        { id: 'BODY_DYSFONCTIONNEMENT_MATERIEL_2', rows: 8, category: 'dysfonctionnement' },
        { id: 'BODY_DYSFONCTIONNEMENT_MATERIEL_3', rows: 3, category: 'dysfonctionnement' },
        // Tournée Retard TIERS
        { id: 'OBJET_TOURNEE_RETARD_TIERS', rows: 1, category: 'tiers' },
        { id: 'BODY_TOURNEE_RETARD_TIERS_1', rows: 3, category: 'tiers' },
        { id: 'BODY_TOURNEE_RETARD_TIERS_2', rows: 3, category: 'tiers' },
        { id: 'BODY_TOURNEE_RETARD_TIERS_3', rows: 2, category: 'tiers' },
        // Confirmation Mesure TIERS
        { id: 'OBJET_MESURE_CONFIRMATION_TIERS', rows: 1, category: 'tiers' },
        { id: 'BODY_MESURE_CONFIRMATION_TIERS_1', rows: 3, category: 'tiers' },
        { id: 'BODY_MESURE_CONFIRMATION_TIERS_2', rows: 3, category: 'tiers' },
        { id: 'BODY_MESURE_CONFIRMATION_TIERS_3', rows: 2, category: 'tiers' },
        // Mesure Dépouillée TIERS
        { id: 'BODY_MESURE_DEPOUILLEE_1', rows: 2, category: 'tiers' },
        { id: 'BODY_MESURE_DEPOUILLEE_2', rows: 2, category: 'tiers' },
        // Vigilance Comportement TIERS
        { id: 'OBJET_VIGILANCE_COMPORTEMENT_TIERS', rows: 1, category: 'tiers' },
        { id: 'BODY_VIGILANCE_COMPORTEMENT_TIERS_1', rows: 2, category: 'tiers' },
        { id: 'BODY_VIGILANCE_COMPORTEMENT_TIERS_2', rows: 5, category: 'tiers' },
        { id: 'BODY_VIGILANCE_COMPORTEMENT_TIERS_3', rows: 2, category: 'tiers' },
        // Dysfonctionnement Matériel TIERS
        { id: 'OBJET_DYSFONCTIONNEMENT_MATERIEL_TIERS', rows: 1, category: 'tiers' },
        { id: 'BODY_DYSFONCTIONNEMENT_MATERIEL_TIERS_1', rows: 2, category: 'tiers' },
        { id: 'BODY_DYSFONCTIONNEMENT_MATERIEL_TIERS_2', rows: 5, category: 'tiers' },
        { id: 'BODY_DYSFONCTIONNEMENT_MATERIEL_TIERS_3', rows: 2, category: 'tiers' },
        // Suivi Rapproché
        { id: 'OBJET_SUIVI_RAPPROCHE', rows: 1, category: 'suivi' },
        { id: 'BODY_SUIVI_RAPPROCHE_1', rows: 2, category: 'suivi' },
        { id: 'BODY_SUIVI_RAPPROCHE_2', rows: 6, category: 'suivi' },
        { id: 'BODY_SUIVI_RAPPROCHE_3', rows: 3, category: 'suivi' },
        // Suivi Canicule
        { id: 'OBJET_SUIVI_CANICULE', rows: 1, category: 'canicule' },
        { id: 'BODY_SUIVI_CANICULE_1', rows: 1, category: 'canicule' },
        { id: 'BODY_SUIVI_CANICULE_2', rows: 10, category: 'canicule' },
        { id: 'BODY_SUIVI_CANICULE_3', rows: 4, category: 'canicule' },
        // Mesures LAOS
        { id: 'OBJET_MESURES_TIERS_LAOS', rows: 1, category: 'laos' },
        { id: 'BODY_MESURES_TIERS_LAOS_1', rows: 4, category: 'laos' },
        { id: 'BODY_MESURES_TIERS_LAOS_2', rows: 2, category: 'laos' },
        // Autre
        { id: 'OBJET_AUTRE', rows: 1, category: 'autre' },
        { id: 'BODY_AUTRE', rows: 2, category: 'autre' }
    ]
};

// Labels des catégories pour les badges
const CATEGORY_LABELS = {
    'rapport': { label: 'Rapport EDF', class: 'cat-rapport' },
    'cda': { label: 'CR CDA', class: 'cat-cda' },
    'topo': { label: 'CR TOPO', class: 'cat-topo' },
    'intervention': { label: 'CR Intervention', class: 'cat-intervention' },
    'tiers': { label: 'TIERS', class: 'cat-tiers' },
    'alerte': { label: 'Alerte EDF', class: 'cat-alerte' },
    'vigilance': { label: 'Vigilance', class: 'cat-vigilance' },
    'dysfonctionnement': { label: 'Dysfonctionnement', class: 'cat-dysfonctionnement' },
    'laos': { label: 'LAOS', class: 'cat-laos' },
    'suivi': { label: 'Suivi Rapproché', class: 'cat-suivi' },
    'canicule': { label: 'Canicule', class: 'cat-canicule' },
    'autre': { label: 'Autre', class: 'cat-autre' }
};

// Mapping des signatures
const SIGNATURES = {
    'TOULOUSE': {
        name: 'S2MA Ouest - Toulouse',
        email: 'hydro-dtg-toulouse-depouillement@edf.fr',
        path: 'CHEMIN_SIGNATURE_TOULOUSE',
        icon: '🏔️'
    },
    'BRIVE': {
        name: 'S2MA Ouest - Brive',
        email: 'hydro-dtg-brive-depouillement@edf.fr',
        path: 'CHEMIN_SIGNATURE_BRIVE',
        icon: '🏞️'
    },
    'GRENOBLE_A': {
        name: 'S2MA Est - Grenoble Équipe A',
        email: 'dtg.grenoble-depouillement-A@edf.fr',
        path: 'CHEMIN_SIGNATURE_GRENOBLE_A',
        icon: '⛰️'
    },
    'GRENOBLE_B': {
        name: 'S2MA Est - Grenoble Équipe B',
        email: 'dtg.grenoble-depouillement-B@edf.fr',
        path: 'CHEMIN_SIGNATURE_GRENOBLE_B',
        icon: '🗻'
    }
};

// Variables globales
let currentSignature = 'TOULOUSE';
let currentConfig = null;

// ============================================
// Fonctions de génération HTML
// ============================================

function createInput(prefix, name, type = 'text') {
    return `
        <div class="config-item">
            <label class="config-label" for="${prefix}_${name}">${name.replace(/_/g, ' ')}</label>
            <input type="${type}" id="${prefix}_${name}" class="config-input">
        </div>`;
}

function createMailItem({ id, rows, category }) {
    const catInfo = CATEGORY_LABELS[category] || { label: '', class: '' };
    return `
        <div class="mail-item">
            <label class="config-label" for="mail_${id}">
                ${id}
                <span class="mail-category ${catInfo.class}">${catInfo.label}</span>
            </label>
            <div class="mail-editor-container">
                <div class="mail-editor-side">
                    <span class="mail-editor-side-label">📝 Code HTML</span>
                    <textarea id="mail_${id}" class="config-input" rows="${rows}"></textarea>
                </div>
                <div class="mail-editor-side">
                    <span class="mail-editor-side-label">👁️ Prévisualisation</span>
                    <div class="mail-preview" id="preview_mail_${id}"></div>
                </div>
            </div>
        </div>`;
}

function createSection(title, content, style = '') {
    return `
        <div class="config-section">
            <h3 style="${style}">${title}</h3>
            ${content}
        </div>`;
}

// ============================================
// Génération du contenu du formulaire
// ============================================

function generateFormContent() {
    const container = document.getElementById('configContent');
    if (!container) return;

    container.innerHTML =
        createSection('👥 Interlocuteurs récurrents',
            FIELD_CONFIG.interlocuteurs.map(n => createInput('interlocuteur', n)).join('')) +
        createSection("📁 Configuration des chemins d'accès fichiers",
            FIELD_CONFIG.chemins.map(n => createInput('chemin', n)).join('')) +
        createSection("👔 Chargés d'affaires",
            FIELD_CONFIG.charges_affaires.map(n => createInput('ca', n, 'email')).join('')) +
        createSection('📧 Configuration des textes utilisés dans les mails',
            `<p style="color:#666;font-size:14px;margin-bottom:20px;">
                <strong>Note :</strong> Les balises HTML doivent être conservées. Les variables 
                <span class="preview-variables">{BARRAGE}</span>, 
                <span class="preview-variables">{INDEX}</span>, 
                <span class="preview-variables">{PERIODE1}</span>, 
                <span class="preview-variables">{PERIODE2}</span>, 
                <span class="preview-variables">{CA_PARC}</span>, 
                <span class="preview-variables">{NOM_TOURNEE}</span>, 
                <span class="preview-variables">{DATE_TOURNEE}</span>, 
                <span class="preview-variables">{PERIODE}</span>, etc. seront remplacées automatiquement.
                <br><br><strong>La prévisualisation s'affiche en temps réel à droite.</strong>
            </p>` + FIELD_CONFIG.mails.map(createMailItem).join(''),
            'background:#FFD966;padding:12px;border-radius:5px;');

    // Ajouter les event listeners pour les previews
    document.querySelectorAll('textarea[id^="mail_"]').forEach(ta => {
        ta.addEventListener('input', () => updatePreview(ta));
    });
}

// ============================================
// Prévisualisation des mails
// ============================================

function updatePreview(textarea) {
    const preview = document.getElementById('preview_' + textarea.id);
    if (!preview) return;

    const vars = [
        'BARRAGE', 'INDEX', 'PERIODE1', 'PERIODE2', 'CA_PARC', 'NOM_TOURNEE',
        'DATE_TOURNEE', 'PERIODE', 'LIEN_LETTRE', 'LIEN_RAPPORT', 'LIEN_DISPOSITIFS',
        'LIEN_CR_CDA', 'LIEN_CR_TOPO', 'LIEN_CR_INTERVENTION', 'GEH', 'GU', 'DATE',
        'PERIODICITE', 'TYPE_RAPPORT', 'ANNEE', 'MOIS', 'JOUR', 'OUVRAGE',
        'NOM_EXPLOITANT', 'PRENOM_EXPLOITANT', 'EMAIL_EXPLOITANT'
    ];

    let html = textarea.value;
    vars.forEach(v => {
        html = html.replace(new RegExp(`\\{${v}\\}`, 'g'),
            `<span class="preview-variables">{${v}}</span>`);
    });
    preview.innerHTML = html;
}

function initAllPreviews() {
    document.querySelectorAll('textarea[id^="mail_"]').forEach(updatePreview);
}

// ============================================
// Gestion des signatures
// ============================================

function selectSignature(element) {
    document.querySelectorAll('.signature-option').forEach(opt => {
        opt.classList.remove('selected');
        const radio = opt.querySelector('input[type="radio"]');
        if (radio) radio.checked = false;
    });

    element.classList.add('selected');
    const radio = element.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;

    currentSignature = element.dataset.signature;

    const display = document.getElementById('selectedSignatureDisplay');
    if (display) {
        display.textContent = SIGNATURES[currentSignature].name;
    }
}

function getCurrentSignaturePath() {
    if (!currentConfig) return '';
    const pathKey = SIGNATURES[currentSignature].path;
    return currentConfig.chemins?.[pathKey] || DEFAULT_CONFIG.chemins[pathKey];
}

// ============================================
// Toast Notifications
// ============================================

function showToast(message, type = 'success') {
    const overlay = document.getElementById('toastOverlay');
    const toast = document.getElementById('toastNotification');

    if (!overlay || !toast) return;

    const icon = toast.querySelector('.toast-icon');
    const msg = toast.querySelector('.toast-message');

    toast.className = 'toast-notification ' + type;
    if (icon) icon.textContent = type === 'success' ? '✅' : '❌';
    if (msg) msg.textContent = message;

    overlay.classList.add('show');
    toast.classList.add('show');

    setTimeout(() => {
        overlay.classList.remove('show');
        toast.classList.remove('show');
    }, 3000);

    overlay.onclick = () => {
        overlay.classList.remove('show');
        toast.classList.remove('show');
    };
}

// ============================================
// Chargement / Sauvegarde Configuration
// ============================================

async function loadConfiguration() {
    try {
        const response = await fetch('/api/config');
        if (!response.ok) throw new Error('Erreur réseau');

        currentConfig = await response.json();
        fillFormWithConfig(currentConfig);

    } catch (error) {
        console.error('Erreur lors du chargement:', error);
        // Utiliser les valeurs par défaut
        currentConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
        fillFormWithConfig(currentConfig);
    }
}

function fillFormWithConfig(config) {
    // Signature
    if (config.signature_selectionnee) {
        currentSignature = config.signature_selectionnee;
        const sigOption = document.querySelector(`[data-signature="${currentSignature}"]`);
        if (sigOption) selectSignature(sigOption);
    }

    // Interlocuteurs
    if (config.interlocuteurs) {
        for (const [key, value] of Object.entries(config.interlocuteurs)) {
            const input = document.getElementById(`interlocuteur_${key}`);
            if (input) input.value = value || '';
        }
    }

    // Chemins
    if (config.chemins) {
        for (const [key, value] of Object.entries(config.chemins)) {
            const input = document.getElementById(`chemin_${key}`);
            if (input) input.value = value || '';
        }
    }

    // Chargés d'affaires
    if (config.charges_affaires) {
        for (const [key, value] of Object.entries(config.charges_affaires)) {
            const input = document.getElementById(`ca_${key}`);
            if (input) input.value = value || '';
        }
    }

    // Textes mails
    if (config.textes_mails) {
        for (const [key, value] of Object.entries(config.textes_mails)) {
            const textarea = document.getElementById(`mail_${key}`);
            if (textarea) {
                textarea.value = value || '';
                updatePreview(textarea);
            }
        }
    }
}

function collectFormData() {
    const config = {
        signature_selectionnee: currentSignature,
        interlocuteurs: {},
        chemins: {},
        charges_affaires: {},
        textes_mails: {}
    };

    // Interlocuteurs
    document.querySelectorAll('[id^="interlocuteur_"]').forEach(input => {
        const key = input.id.replace('interlocuteur_', '');
        config.interlocuteurs[key] = input.value;
    });

    // Chemins
    document.querySelectorAll('[id^="chemin_"]').forEach(input => {
        const key = input.id.replace('chemin_', '');
        config.chemins[key] = input.value;
    });

    // Chargés d'affaires
    document.querySelectorAll('[id^="ca_"]').forEach(input => {
        const key = input.id.replace('ca_', '');
        config.charges_affaires[key] = input.value;
    });

    // Textes mails
    document.querySelectorAll('[id^="mail_"]').forEach(textarea => {
        const key = textarea.id.replace('mail_', '');
        config.textes_mails[key] = textarea.value;
    });

    return config;
}

async function saveConfiguration() {
    const config = collectFormData();

    try {
        const response = await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });

        if (response.ok) {
            currentConfig = config;
            showToast('Configuration sauvegardée avec succès !', 'success');
        } else {
            throw new Error('Erreur serveur');
        }
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        showToast('Erreur lors de la sauvegarde de la configuration', 'error');
    }
}

async function resetConfiguration() {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser la configuration aux valeurs par défaut ? Cette action est irréversible.')) {
        return;
    }

    try {
        const response = await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(DEFAULT_CONFIG)
        });

        if (response.ok) {
            currentConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
            fillFormWithConfig(currentConfig);
            showToast('Configuration réinitialisée aux valeurs par défaut', 'success');
        } else {
            throw new Error('Erreur serveur');
        }
    } catch (error) {
        console.error('Erreur lors de la réinitialisation:', error);
        showToast('Erreur lors de la réinitialisation', 'error');
    }
}

// ============================================
// Génération de mails avec signature
// ============================================

function generateMailWithSignature(templateKey, variables = {}) {
    if (!currentConfig) return '';

    let body = currentConfig.textes_mails[templateKey] || '';

    // Remplacer les variables
    for (const [key, value] of Object.entries(variables)) {
        body = body.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }

    // Ajouter la signature
    const signaturePath = getCurrentSignaturePath();
    if (signaturePath) {
        body += `<br><br><img src="${signaturePath}" alt="Signature">`;
    }

    return body;
}

// ============================================
// Initialisation
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Afficher la popup d'avertissement
    const warningOverlay = document.getElementById('warningOverlay');
    const warningOkBtn = document.getElementById('warningOkBtn');

    if (warningOverlay) {
        warningOverlay.classList.add('active');
    }

    if (warningOkBtn) {
        warningOkBtn.addEventListener('click', function() {
            warningOverlay.classList.remove('active');
        });
    }

    // Générer le formulaire
    generateFormContent();

    // Charger la configuration
    loadConfiguration();

    // Event listeners pour les boutons du BAS
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveConfiguration);
    }

    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetConfiguration);
    }

    // Event listeners pour les boutons du HAUT
    const saveBtnTop = document.getElementById('saveBtnTop');
    if (saveBtnTop) {
        saveBtnTop.addEventListener('click', saveConfiguration);
    }

    const resetBtnTop = document.getElementById('resetBtnTop');
    if (resetBtnTop) {
        resetBtnTop.addEventListener('click', resetConfiguration);
    }
});

// ============================================
// Exports globaux
// ============================================

window.selectSignature = selectSignature;
window.generateMailWithSignature = generateMailWithSignature;
window.getCurrentSignaturePath = getCurrentSignaturePath;
window.SIGNATURES = SIGNATURES;
window.DEFAULT_CONFIG = DEFAULT_CONFIG;
window.showToast = showToast;