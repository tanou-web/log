const produits = [
    { id: 1, code: 'PROD-001', nom: 'Maïs (Sac 50kg)', prix: 25000, stock: 120, categorie: 'cereales' }, 
    { id: 2, code: 'PROD-002', nom: 'Riz local (Sac 25kg)', prix: 15000, stock: 80, categorie: 'cereales' },
    { id: 3, code: 'PROD-003', nom: 'Sorgho (Sac 50kg)', prix: 22000, stock: 60, categorie: 'cereales' },
    { id: 4, code: 'PROD-004', nom: 'Huile végétale (Carton 12L)', prix: 28000, stock: 35, categorie: 'alimentaire' },
    { id: 5, code: 'PROD-005', nom: 'Sucre importé (Sac 50kg)', prix: 27000, stock: 50, categorie: 'alimentaire' },
    { id: 6, code: 'PROD-006', nom: 'Ciment CIMAF (Sac 50kg)', prix: 6000, stock: 200, categorie: 'construction' },
    { id: 7, code: 'PROD-007', nom: 'Savon en carton (30 pièces)', prix: 12000, stock: 15, categorie: 'hygiene' }
];


// Simule une base de données de clients/fournisseurs
const clients = [
    { id: 1, code: 'CLT-001', nom: 'Boutique Awa – Marché Rood Woko', contact: 'Mme Awa Ouédraogo' },
    { id: 2, code: 'CLT-002', nom: 'Alimentation Issouf – Bobo Dioulasso', contact: 'M. Issouf Traoré' },
    { id: 3, code: 'CLT-003', nom: 'Grossiste Soma – Ouagadougou', contact: 'M. Soma Sawadogo' },
    { id: 4, code: 'CLT-004', nom: 'Epicerie Tinga – Koudougou', contact: 'Mme Tinga Kaboré' }
];


// ==========================================
// ÉTAT GLOBAL DE LA CAISSE
// ==========================================
let state = {
    ticketItems: [],       // Articles dans le ticket
    currentClient: null,   // Client sélectionné
    remise: 0              // Remise en euros
};

// ==========================================
// FONCTIONS D'AFFICHAGE
// ==========================================

// Affiche les résultats de recherche produits
function displaySearchResults(query) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';
    
    if (!query || query.length < 2) {
        resultsContainer.style.display = 'none';
        return;
    }
    
    const filteredProducts = produits.filter(prod =>
        prod.nom.toLowerCase().includes(query.toLowerCase()) ||
        prod.code.toLowerCase().includes(query.toLowerCase())
    );
    
    if (filteredProducts.length === 0) {
        resultsContainer.innerHTML = '<div class="search-result-item">Aucun produit trouvé</div>';
    } else {
        filteredProducts.forEach(prod => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.innerHTML = `
                <div>
                    <strong>${prod.nom}</strong>
                    <div class="product-code">${prod.code} • ${prod.prix.toFixed(2)} F</div>
                </div>
                <div>Stock: ${prod.stock}</div>
            `;
            item.addEventListener('click', () => addToTicket(prod));
            resultsContainer.appendChild(item);
        });
    }
    
    resultsContainer.style.display = 'block';
}

// Ajoute un produit au ticket
function addToTicket(product) {
    // Vérifie si le produit est déjà dans le ticket
    const existingItem = state.ticketItems.find(item => item.product.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        state.ticketItems.push({
            product: product,
            quantity: 1,
            total: product.prix
        });
    }
    
    // Réinitialise la recherche
    document.getElementById('search-input').value = '';
    document.getElementById('search-results').style.display = 'none';
    
    // Met à jour l'affichage
    updateTicketDisplay();
    updateTotals();
}

// Met à jour l'affichage du ticket
function updateTicketDisplay() {
    const ticketBody = document.getElementById('ticket-items');
    
    if (state.ticketItems.length === 0) {
        ticketBody.innerHTML = '<tr class="empty-ticket"><td colspan="5">Aucun produit ajouté. Scannez ou recherchez un produit.</td></tr>';
        return;
    }
    
    ticketBody.innerHTML = '';
    
    state.ticketItems.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <strong>${item.product.nom}</strong>
                <div class="product-code">${item.product.code}</div>
            </td>
            <td>${item.product.prix.toFixed(2)} F</td>
            <td>
                <div class="quantity-controls">
                    <button class="qty-btn" onclick="changeQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="changeQuantity(${index}, 1)">+</button>
                </div>
            </td>
            <td>${(item.product.prix * item.quantity).toFixed(2)} F</td>
            <td>
                <button class="delete-btn" onclick="removeFromTicket(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        ticketBody.appendChild(row);
    });
}

// Modifie la quantité d'un article
function changeQuantity(index, delta) {
    const item = state.ticketItems[index];
    const newQuantity = item.quantity + delta;
    
    if (newQuantity < 1) {
        removeFromTicket(index);
    } else {
        item.quantity = newQuantity;
        item.total = item.product.prix * newQuantity;
        updateTicketDisplay();
        updateTotals();
    }
}

// Supprime un article du ticket
function removeFromTicket(index) {
    state.ticketItems.splice(index, 1);
    updateTicketDisplay();
    updateTotals();
}

// Met à jour les totaux
function updateTotals() {
    const subtotal = state.ticketItems.reduce((sum, item) => sum + (item.product.prix * item.quantity), 0);
    const total = subtotal - state.remise;
    
    document.getElementById('subtotal').textContent = subtotal.toFixed(2) + ' F';
    document.getElementById('discount').textContent = '-' + state.remise.toFixed(2) + ' F';
    document.getElementById('total-amount').textContent = total.toFixed(2) + ' F';
}

// Applique une remise
function applyDiscount() {
    const discountAmount = parseFloat(prompt('Montant de la remise (F):', '0'));
    
    if (!isNaN(discountAmount) && discountAmount >= 0) {
        state.remise = discountAmount;
        updateTotals();
        
        // Affiche un message de confirmation
        alert(`Remise de ${discountAmount.toFixed(2)} F appliquée`);
    }
}

// Traite le paiement
function processPayment(method) {
    if (state.ticketItems.length === 0) {
        alert('Le ticket est vide !');
        return;
    }
    
    const total = state.ticketItems.reduce((sum, item) => sum + (item.product.prix * item.quantity), 0) - state.remise;
    
    switch (method) {
        case 'cash':
            const cashAmount = parseFloat(prompt(`Total à payer: ${total.toFixed(2)} F\nMontant reçu:`, total.toFixed(2)));
            if (cashAmount >= total) {
                const change = cashAmount - total;
                alert(`Paiement accepté !\nMonnaie à rendre: ${change.toFixed(2)} F`);
                resetTicket();
            } else {
                alert('Montant insuffisant !');
            }
            break;
            
        case 'card':
            alert(`Paiement par carte accepté !\nMontant: ${total.toFixed(2)} €`);
            resetTicket();
            break;
            
        case 'transfer':
            alert(`Paiement par virement enregistré !\nMontant: ${total.toFixed(2)} F\nUn bon de commande sera émis.`);
            resetTicket();
            break;
    }
}

// Réinitialise le ticket
function resetTicket() {
    state.ticketItems = [];
    state.remise = 0;
    updateTicketDisplay();
    updateTotals();
    alert('Ticket réinitialisé !');
}

// ==========================================
// INITIALISATION
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    // Gestion de la recherche
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            displaySearchResults(e.target.value);
        });
        
        // Cache les résultats quand on clique ailleurs
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-input-wrapper')) {
                document.getElementById('search-results').style.display = 'none';
            }
        });
    }
    
    // Bouton Nouveau Ticket
    const newTicketBtn = document.getElementById('btn-nouveau-ticket');
    if (newTicketBtn) {
        newTicketBtn.addEventListener('click', resetTicket);
    }
    
    // Boutons de paiement
    document.querySelectorAll('.pay-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const method = e.currentTarget.getAttribute('data-method');
            processPayment(method);
        });
    });
    
    // Initialise l'affichage
    updateTicketDisplay();
    updateTotals();
});

// ==========================================
// STYLES ADDITIONNELS POUR LES INTERACTIONS
// ==========================================
const additionalStyles = `
.quantity-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.qty-btn {
    width: 25px;
    height: 25px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 3px;
    cursor: pointer;
}
.qty-btn:hover {
    background: #f8f9fa;
}
.delete-btn {
    background: none;
    border: none;
    color: #e74c3c;
    cursor: pointer;
    padding: 0.25rem;
}
.delete-btn:hover {
    color: #c0392b;
}
.product-code {
    font-size: 0.8rem;
    color: #7f8c8d;
    margin-top: 0.25rem;
}
`;

// Injecte les styles supplémentaires
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);