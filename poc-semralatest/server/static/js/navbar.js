/**
 * SEMRA - Navigation Bar Component (FIXED)
 * Les flèches sont maintenant EN DEHORS du conteneur scrollable
 */

function initNavbar() {
    const navbarHTML = `
        <nav class="bottom-navbar">
            <button class="nav-arrow nav-arrow-left" onclick="scrollNavbar(-200)">&lt;</button>
            
            <div class="nav-buttons-container" id="navButtonsContainer">
                <button class="nav-btn nav-btn-menu"><a href="/">MENU</a></button>
                <button class="nav-btn"><a href="/adour-et-gaves">Adour et Gaves</a></button>
                <button class="nav-btn"><a href="/pyrenees">Pyrénées</a></button>
                <button class="nav-btn"><a href="/aude_ariege">Aude Ariège</a></button>
                <button class="nav-btn"><a href="/tarn_agout">Tarn Agout</a></button>
                <button class="nav-btn"><a href="/sei_corse">SEI Corse</a></button>
                <button class="nav-btn"><a href="/tiers">Tiers</a></button>
                <button class="nav-btn"><a href="/bugs_ou_ameliorations">Bugs ou améliorations</a></button>
                <button class="nav-btn"><a href="/liste_ouvrages">LISTE_OUVRAGES</a></button>
                <button class="nav-btn"><a href="/grille_envoi_edf">GRILLE_ENVOI_EDF</a></button>
                <button class="nav-btn"><a href="/grille_envoi_tiers">GRILLE_ENVOI_TIERS</a></button>
                <button class="nav-btn"><a href="/config">CONFIG</a></button>
                <button class="nav-btn"><a href="/plan_application">PLAN APPLICATION</a></button>
            </div>
            
            <button class="nav-arrow nav-arrow-right" onclick="scrollNavbar(200)">&gt;</button>
        </nav>
    `;

    // Injecter la navbar dans le body
    document.body.insertAdjacentHTML('beforeend', navbarHTML);
}

function scrollNavbar(amount) {
    // Maintenant on scroll le CONTENEUR des boutons, pas la navbar entière
    const container = document.getElementById('navButtonsContainer');
    if (container) {
        container.scrollLeft += amount;
    }
}

// Initialiser la navbar au chargement du DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
} else {
    initNavbar();
}

// Exposer les fonctions globalement
window.scrollNavbar = scrollNavbar;