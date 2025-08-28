// ==========================================
// DONNÉES FACTICES POUR LA GESTION D'INVENTAIRE
// ==========================================

let inventaires = [
    {
        id: 1,
        reference: 'INV-2024-001',
        entrepot: 'entrepot-principal',
        zone: 'Zone A (A1-A10)',
        dateDebut: '2024-05-20 08:30',
        dateFin: '2024-05-20 12:45',
        type: 'cycle',
        statut: 'completed',
        produitsTotal: 45,
        produitsComptes: 45,
        ecarts: 2,
        valeurEcarts: -150.50,
        operateur: 'Jean Dupont'
    },
    {
        id: 2,
        reference: 'INV-2024-002',
        entrepot: 'entrepot-est',
        zone: 'Complet',
        dateDebut: '2024-05-22 09:00',
        dateFin: null,
        type: 'complete',
        statut: 'in-progress',
        produitsTotal: 120,
        produitsComptes: 78,
        ecarts: 5,
        valeurEcarts: -420.75,
        operateur: 'Marie Lambert'
    },
    {
        id: 3,
        reference: 'INV-2024-003',
        entrepot: 'entrepot-ouest',
        zone: 'Rayon Électronique',
        dateDebut: '2024-05-25 14:00',
        dateFin: null,
        type: 'partial',
        statut: 'planned',
        produitsTotal: 25,
        produitsComptes: 0,
        ecarts: 0,
        valeurEcarts: 0,
        operateur: 'Pierre Martin'
    },
    {
        id: 4,
        reference: 'INV-2024-004',
        entrepot: 'entrepot-principal',
        zone: 'Zone B (B1-B15)',
        dateDebut: '2024-05-18 10:00',
        dateFin: '2024-05-18 15:30',
        type: 'cycle',
        statut: 'completed',
        produitsTotal: 60,
        produitsComptes: 60,
        ecarts: 1,
        valeurEcarts: -89.99,
        operateur: 'Sophie Moreau'
    }
];

let currentInventory = null;
let currentProductIndex = 0;
let inventoryProducts = [];

// ==========================================
// FONCTIONS D'AFFICHAGE
// ==========================================

// Affiche la liste des inventaires
function displayInventoryList() {
    const tbody = document.getElementById('inventory-table-body');
    const statusFilter = document.getElementById('filter-status').value;
    
    let filteredInventaires = inventaires;
    
    if (statusFilter !== 'all') {
        filteredInventaires = filteredInventaires.filter(inv => inv.statut === statusFilter);
    }
    
    tbody.innerHTML = '';
    
    filteredInventaires.forEach(inventory => {
        const row = document.createElement('tr');
        
        const progressPercent = inventory.statut === 'completed' ? 100 : 
                              Math.round((inventory.produitsComptes / inventory.produitsTotal) * 100);
        
        row.innerHTML = `
            <td><strong>${inventory.reference}</strong></td>
            <td>${getEntrepotName(inventory.entrepot)}</td>
            <td>${inventory.zone}</td>
            <td>${formatDate(inventory.dateDebut)}</td>
            <td>${inventory.dateFin ? formatDate(inventory.dateFin) : '-'}</td>
            <td>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <span>${inventory.produitsComptes}/${inventory.produitsTotal}</span>
                </div>
            </td>
            <td>
                <span class="${inventory.ecarts > 0 ? 'variance-negative' : 'variance-positive'}">
                    ${inventory.ecarts} écart(s)
                </span>
            </td>
            <td>
                <span class="status-badge ${getStatusClass(inventory.statut)}">
                    ${getStatusText(inventory.statut)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    ${inventory.statut === 'in-progress' ? `
                        <button class="btn-icon" onclick="continueInventory(${inventory.id})" title="Continuer">
                            <i class="fas fa-play"></i>
                        </button>
                    ` : ''}
                    
                    ${inventory.statut === 'planned' ? `
                        <button class="btn-icon" onclick="startInventory(${inventory.id})" title="Démarrer">
                            <i class="fas fa-play"></i>
                        </button>
                    ` : ''}
                    
                    ${inventory.statut === 'completed' ? `
                        <button class="btn-icon" onclick="viewInventoryReport(${inventory.id})" title="Rapport">
                            <i class="fas fa-chart-bar"></i>
                        </button>
                    ` : ''}
                    
                    <button class="btn-icon btn-danger" onclick="deleteInventory(${inventory.id})" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Affiche le modal de saisie d'inventaire
function showCountModal(product) {
    document.getElementById('count-modal-title').textContent = `Inventaire: ${currentInventory.reference}`;
    document.getElementById('count-product-name').textContent = product.nom;
    document.getElementById('count-product-ref').textContent = `Référence: ${product.reference}`;
    document.getElementById('count-theoretical').innerHTML = `Stock théorique: <strong>${product.stockTheorique}</strong>`;
    document.getElementById('count-quantity').value = product.stockCompte || 0;
    document.getElementById('count-notes').value = product.notes || '';
    
    updateCountDifference();
    
    document.getElementById('count-modal').style.display = 'block';
}

// Met à jour l'affichage de la différence de stock
function updateCountDifference() {
    const theoretical = parseInt(document.getElementById('count-theoretical').querySelector('strong').textContent);
    const counted = parseInt(document.getElementById('count-quantity').value) || 0;
    const difference = counted - theoretical;
    
    const diffElement = document.getElementById('count-difference');
    diffElement.textContent = difference;
    diffElement.className = difference === 0 ? 'variance-zero' : 
                           difference > 0 ? 'variance-positive' : 'variance-negative';
}

// ==========================================
// GESTION DES INVENTAIRES
// ==========================================

// Démarre un nouvel inventaire
function startNewInventory() {
    const entrepot = document.getElementById('inventory-warehouse').value;
    const zone = document.getElementById('inventory-zone').value;
    const type = document.getElementById('inventory-type').value;
    
    if (!entrepot) {
        alert('Veuillez sélectionner un entrepôt');
        return;
    }
    
    // Génère une référence d'inventaire
    const ref = `INV-${new Date().getFullYear()}-${String(inventaires.length + 1).padStart(3, '0')}`;
    
    const newInventory = {
        id: inventaires.length + 1,
        reference: ref,
        entrepot: entrepot,
        zone: zone || 'Complet',
        dateDebut: new Date().toLocaleString('fr-FR'),
        dateFin: null,
        type: type,
        statut: 'in-progress',
        produitsTotal: 0,
        produitsComptes: 0,
        ecarts: 0,
        valeurEcarts: 0,
        operateur: 'Utilisateur Actuel'
    };
    
    inventaires.unshift(newInventory);
    currentInventory = newInventory;
    
    // Charge les produits pour cet inventaire (simulation)
    loadInventoryProducts();
    
    closeModal();
    displayInventoryList();
    
    // Passe directement à la saisie
    startCounting();
}

// Charge les produits pour l'inventaire en cours
function loadInventoryProducts() {
    // Simulation: on prend les 10 premiers produits pour cet exemple
    inventoryProducts = produitsStock.slice(0, 10).map(prod => ({
        ...prod,
        stockTheorique: prod.stocks.principal, // Pour cet exemple
        stockCompte: null,
        notes: '',
        ecart: 0
    }));
    
    currentInventory.produitsTotal = inventoryProducts.length;
}

// Démarre le processus de comptage
function startCounting() {
    if (!inventoryProducts.length) {
        alert('Aucun produit à inventorier');
        return;
    }
    
    currentProductIndex = 0;
    showCountModal(inventoryProducts[0]);
}

// Passe au produit suivant
function nextProduct() {
    currentProductIndex++;
    
    if (currentProductIndex < inventoryProducts.length) {
        showCountModal(inventoryProducts[currentProductIndex]);
    } else {
        // Inventaire terminé
        completeInventory();
    }
}

// Valide le comptage d'un produit
function validateCount() {
    const quantity = parseInt(document.getElementById('count-quantity').value);
    const notes = document.getElementById('count-notes').value;
    
    if (isNaN(quantity)) {
        alert('Veuillez saisir une quantité valide');
        return;
    }
    
    const product = inventoryProducts[currentProductIndex];
    product.stockCompte = quantity;
    product.notes = notes;
    product.ecart = quantity - product.stockTheorique;
    
    // Met à jour les statistiques de l'inventaire
    currentInventory.produitsComptes++;
    if (product.ecart !== 0) {
        currentInventory.ecarts++;
        currentInventory.valeurEcarts += product.ecart * product.prixAchat;
    }
    
    document.getElementById('count-modal').style.display = 'none';
    nextProduct();
}

// Termine l'inventaire
function completeInventory() {
    currentInventory.dateFin = new Date().toLocaleString('fr-FR');
    currentInventory.statut = 'completed';
    
    // Met à jour les stocks réels (simulation)
    inventoryProducts.forEach(prod => {
        if (prod.stockCompte !== null) {
            // Dans la réalité, on mettrait à jour la base de données
            prod.stocks.principal = prod.stockCompte;
        }
    });
    
    alert(`Inventaire ${currentInventory.reference} terminé !\n${currentInventory.ecarts} écarts détectés.`);
    displayInventoryList();
}

// Affiche le rapport d'un inventaire
function viewInventoryReport(inventoryId) {
    const inventory = inventaires.find(inv => inv.id === inventoryId);
    if (inventory) {
        alert(`Rapport d'inventaire ${inventory.reference}\n\n` +
              `Produits: ${inventory.produitsComptes}/${inventory.produitsTotal}\n` +
              `Écarts: ${inventory.ecarts}\n` +
              `Valeur des écarts: ${inventory.valeurEcarts.toFixed(2)} €\n` +
              `Opérateur: ${inventory.operateur}`);
    }
}

// Supprime un inventaire
function deleteInventory(inventoryId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet inventaire ?')) return;
    
    inventaires = inventaires.filter(inv => inv.id !== inventoryId);
    displayInventoryList();
    alert('Inventaire supprimé avec succès');
}

// ==========================================
// FONCTIONS UTILITAIRES
// ==========================================

function getEntrepotName(code) {
    const entrepots = {
        'entrepot-principal': 'Entrepôt Principal',
        'entrepot-est': 'Entrepôt Est',
        'entrepot-ouest': 'Entrepôt Ouest'
    };
    return entrepots[code] || code;
}

function getStatusClass(statut) {
    const classes = {
        'planned': 'status-planned',
        'in-progress': 'status-progress',
        'completed': 'status-completed'
    };
    return classes[statut] || '';
}

function getStatusText(statut) {
    const texts = {
        'planned': 'Planifié',
        'in-progress': 'En Cours',
        'completed': 'Terminé'
    };
    return texts[statut] || statut;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function closeModal() {
    document.getElementById('new-inventory-modal').style.display = 'none';
    document.getElementById('count-modal').style.display = 'none';
}

// ==========================================
// GESTION DES ÉVÉNEMENTS
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation
    displayInventoryList();
    
    // Bouton nouvel inventaire
    document.getElementById('btn-nouvel-inventaire').addEventListener('click', function() {
        document.getElementById('new-inventory-modal').style.display = 'block';
    });
    
    // Filtre des statuts
    document.getElementById('filter-status').addEventListener('change', displayInventoryList);
    
    // Modal nouvel inventaire
    document.getElementById('btn-cancel-inventory').addEventListener('click', closeModal);
    document.getElementById('btn-start-inventory').addEventListener('click', startNewInventory);
    
    // Modal de comptage
    document.getElementById('count-quantity').addEventListener('input', updateCountDifference);
    document.getElementById('btn-confirm-count').addEventListener('click', validateCount);
    document.getElementById('btn-skip').addEventListener('click', nextProduct);
    
    // Fermeture des modals
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal();
        }
    });
});