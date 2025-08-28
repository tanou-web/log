
let produitsStock = [
    {
        id: 1,
        reference: 'PROD-001',
        nom: 'Sacs de Maïs (100kg)',
        categorie: 'céréales',
        prixAchat: 18000.00,  // Prix en F CFA
        prixVente: 22000.00,
        stockSecurite: 10,
        stocks: {
            principal: 25,
            est: 12,
            ouest: 8
        }
    },
    {
        id: 2,
        reference: 'PROD-002',
        nom: 'Sacs de Riz (50kg)',
        categorie: 'céréales',
        prixAchat: 14000.00,
        prixVente: 17000.00,
        stockSecurite: 15,
        stocks: {
            principal: 30,
            est: 20,
            ouest: 5
        }
    },
    {
        id: 3,
        reference: 'PROD-003',
        nom: 'Sacs de Sorgho (100kg)',
        categorie: 'céréales',
        prixAchat: 1600000,
        prixVente: 1950000,
        stockSecurite: 12,
        stocks: {
            principal: 15,
            est: 10,
            ouest: 6
        }
    },
    {
        id: 4,
        reference: 'PROD-004',
        nom: 'Bidons d’Huile (20L)',
        categorie: 'alimentaire',
        prixAchat: 17000.00,
        prixVente: 20000.00,
        stockSecurite: 8,
        stocks: {
            principal: 12,
            est: 6,
            ouest: 3
        }
    },
    {
        id: 5,
        reference: 'PROD-005',
        nom: 'Sacs de Sucre (50kg)',
        categorie: 'alimentaire',
        prixAchat: 16000.00,
        prixVente: 18500.00,
        stockSecurite: 10,
        stocks: {
            principal: 18,
            est: 9,
            ouest: 5
        }
    },
    {
        id: 6,
        reference: 'PROD-006',
        nom: 'Sacs de Ciment (50kg)',
        categorie: 'construction',
        prixAchat: 5500.00,
        prixVente: 6500.00,
        stockSecurite: 30,
        stocks: {
            principal: 50,
            est: 25,
            ouest: 10
        }
    },
    {
        id: 7,
        reference: 'PROD-007',
        nom: 'Cartons de Savon (72pcs)',
        categorie: 'hygiène',
        prixAchat: 8000.00,
        prixVente: 9500.00,
        stockSecurite: 20,
        stocks: {
            principal: 40,
            est: 22,
            ouest: 12
        }
    }
];

// ==========================================
// FONCTIONS D'AFFICHAGE
// ==========================================

// Calcule le statut du stock
function getStockStatus(product) {
    const totalStock = product.stocks.principal + product.stocks.est + product.stocks.ouest;
    
    if (totalStock === 0) {
        return { status: 'out', text: 'Rupture', class: 'status-out' };
    }
    if (totalStock <= product.stockSecurite) {
        return { status: 'critical', text: 'Critique', class: 'status-critical' };
    }
    if (totalStock <= product.stockSecurite * 2) {
        return { status: 'low', text: 'Faible', class: 'status-low' };
    }
    return { status: 'ok', text: 'OK', class: 'status-ok' };
}

// Affiche le tableau des stocks
function displayStockTable() {
    const tbody = document.getElementById('stock-table-body');
    const entrepotFilter = document.getElementById('select-entrepot').value;
    const searchTerm = document.getElementById('search-stock').value.toLowerCase();
    const categoryFilter = document.getElementById('filter-category').value;
    const stockFilter = document.getElementById('filter-stock').value;
    
    let filteredProducts = produitsStock;
    
    // Application des filtres
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(prod =>
            prod.nom.toLowerCase().includes(searchTerm) ||
            prod.reference.toLowerCase().includes(searchTerm)
        );
    }
    
    if (categoryFilter !== 'all') {
        filteredProducts = filteredProducts.filter(prod => prod.categorie === categoryFilter);
    }
    
    if (stockFilter !== 'all') {
        filteredProducts = filteredProducts.filter(prod => {
            const status = getStockStatus(prod).status;
            return status === stockFilter;
        });
    }
    
    tbody.innerHTML = '';
    
    filteredProducts.forEach(product => {
        const status = getStockStatus(product);
        const totalStock = product.stocks.principal + product.stocks.est + product.stocks.ouest;
        const marge = product.prixVente - product.prixAchat;
        const margePercent = ((marge / product.prixAchat) * 100).toFixed(1);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${product.reference}</strong></td>
            <td>${product.nom}</td>
            <td>${product.categorie}</td>
            <td>${product.prixAchat.toFixed(2)} F</td>
            <td>
                ${product.prixVente.toFixed(2)} F
                <div class="marge-indicator">+${margePercent}%</div>
            </td>
            <td><strong>${totalStock}</strong></td>
            <td>${product.stocks.principal}</td>
            <td>${product.stocks.est}</td>
            <td>
                <span class="status-badge ${status.class}">${status.text}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="editProduct(${product.id})" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="adjustStock(${product.id})" title="Ajuster stock">
                        <i class="fas fa-boxes"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="deleteProduct(${product.id})" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    updateSummaryStats(filteredProducts);
}

// Met à jour les statistiques du résumé
function updateSummaryStats(products) {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, prod) => {
        const totalStock = prod.stocks.principal + prod.stocks.est + prod.stocks.ouest;
        return sum + (totalStock * prod.prixAchat);
    }, 0);
    
    const alertProducts = products.filter(prod => {
        const status = getStockStatus(prod).status;
        return status === 'critical' || status === 'out';
    }).length;
    
    document.getElementById('total-products').textContent = totalProducts;
    document.getElementById('total-value').textContent = totalValue.toFixed(2) + ' F';
    document.getElementById('alert-products').textContent = alertProducts;
}

// ==========================================
// GESTION DES PRODUITS (CRUD)
// ==========================================

let currentEditId = null;

// Ouvre le modal pour ajouter un produit
function openAddModal() {
    currentEditId = null;
    document.getElementById('modal-title').textContent = 'Nouveau Produit';
    document.getElementById('product-form').reset();
    document.getElementById('product-modal').style.display = 'block';
}

// Ouvre le modal pour modifier un produit
function editProduct(id) {
    const product = produitsStock.find(p => p.id === id);
    if (!product) return;
    
    currentEditId = id;
    document.getElementById('modal-title').textContent = 'Modifier Produit';
    
    // Remplit le formulaire
    document.getElementById('product-ref').value = product.reference;
    document.getElementById('product-name').value = product.nom;
    document.getElementById('product-category').value = product.categorie;
    document.getElementById('product-safety-stock').value = product.stockSecurite;
    document.getElementById('product-buy-price').value = product.prixAchat;
    document.getElementById('product-sell-price').value = product.prixVente;
    document.getElementById('product-stock-main').value = product.stocks.principal;
    document.getElementById('product-stock-east').value = product.stocks.est;
    
    document.getElementById('product-modal').style.display = 'block';
}

// Sauvegarde le produit
function saveProduct() {
    const formData = {
        reference: document.getElementById('product-ref').value,
        nom: document.getElementById('product-name').value,
        categorie: document.getElementById('product-category').value,
        stockSecurite: parseInt(document.getElementById('product-safety-stock').value),
        prixAchat: parseFloat(document.getElementById('product-buy-price').value),
        prixVente: parseFloat(document.getElementById('product-sell-price').value),
        stocks: {
            principal: parseInt(document.getElementById('product-stock-main').value),
            est: parseInt(document.getElementById('product-stock-east').value),
            ouest: 0
        }
    };
    
    if (currentEditId === null) {
        // Ajout nouveau produit
        const newId = Math.max(...produitsStock.map(p => p.id), 0) + 1;
        produitsStock.push({
            id: newId,
            ...formData
        });
    } else {
        // Modification produit existant
        const index = produitsStock.findIndex(p => p.id === currentEditId);
        if (index !== -1) {
            produitsStock[index] = {
                id: currentEditId,
                ...formData
            };
        }
    }
    
    closeModal();
    displayStockTable();
    alert('Produit enregistré avec succès !');
}

// Ajuste le stock d'un produit
function adjustStock(id) {
    const product = produitsStock.find(p => p.id === id);
    if (!product) return;
    
    const newStock = prompt(`Ajustement du stock pour ${product.reference}\nNouvelle quantité (Entrepôt Principal):`, product.stocks.principal);
    
    if (newStock !== null && !isNaN(newStock)) {
        product.stocks.principal = parseInt(newStock);
        displayStockTable();
        alert('Stock ajusté avec succès !');
    }
}

// Supprime un produit
function deleteProduct(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    
    produitsStock = produitsStock.filter(p => p.id !== id);
    displayStockTable();
    alert('Produit supprimé avec succès !');
}

// Ferme le modal
function closeModal() {
    document.getElementById('product-modal').style.display = 'none';
    currentEditId = null;
}

// ==========================================
// GESTION DES ÉVÉNEMENTS
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation
    displayStockTable();
    
    // Événements des filtres
    document.getElementById('select-entrepot').addEventListener('change', displayStockTable);
    document.getElementById('search-stock').addEventListener('input', displayStockTable);
    document.getElementById('filter-category').addEventListener('change', displayStockTable);
    document.getElementById('filter-stock').addEventListener('change', displayStockTable);
    
    // Bouton nouveau produit
    document.getElementById('btn-ajouter-produit').addEventListener('click', openAddModal);
    
    // Modal events
    document.getElementById('btn-cancel').addEventListener('click', closeModal);
    document.getElementById('btn-save-product').addEventListener('click', saveProduct);
    document.querySelector('.close').addEventListener('click', closeModal);
    
    // Fermer le modal en cliquant à l'extérieur
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('product-modal');
        if (event.target === modal) {
            closeModal();
        }
    });
});