// =====================================
// TOKOPROFESIONAL - FIXED VERSION
// Perbaikan untuk login admin dan cart functionality
// =====================================

console.log("🚀 TokoProfesional Fixed - Starting...");

// Initialize Supabase
const supabaseUrl = 'https://viresxwhyqcflmfoyxsf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpcmVzeHdoeXFjZmxtZm95eHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDU1MDMsImV4cCI6MjA2OTk4MTUwM30.MuR0PKP1Og3cF9wOjYbWGFQfo6rtsWvcoODgD1_boUQ';

const { createClient } = supabase;
const sb = createClient(supabaseUrl, supabaseAnonKey);

// Application State
let state = {
    products: [],
    cart: {},
    searchQuery: '',
    sortBy: 'newest',
    currentView: 'home', // 'home', 'admin-login', 'admin-panel'
    user: null,
    settings: {},
    vouchers: [],
    appliedVoucher: null
};

// Helper Functions
const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
}).format(amount);

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast fixed top-4 right-4 z-50 p-4 rounded-lg text-white max-w-sm shadow-lg`;
    
    // Set background color based on type
    if (type === 'success') toast.style.backgroundColor = '#10b981';
    if (type === 'error') toast.style.backgroundColor = '#ef4444';
    if (type === 'info') toast.style.backgroundColor = '#3b82f6';
    
    toast.textContent = message;
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Animate out and remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 right-4 z-50 space-y-2';
    document.body.appendChild(container);
    return container;
}

// Data Loading Functions
async function loadProducts() {
    try {
        const { data, error } = await sb.from('products').select('*').order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error loading products:', error);
            showToast('Error loading products: ' + error.message, 'error');
            return [];
        }
        
        console.log('✅ Products loaded:', data.length);
        return data || [];
    } catch (exception) {
        console.error('Exception loading products:', exception);
        showToast('Failed to load products', 'error');
        return [];
    }
}

async function loadSettings() {
    try {
        const { data, error } = await sb.from('settings').select('*').eq('id', 1).single();
        
        if (error && error.code !== 'PGRST116') {
            console.error('Error loading settings:', error);
            return {};
        }
        
        return data || {};
    } catch (exception) {
        console.error('Exception loading settings:', exception);
        return {};
    }
}

async function loadVouchers() {
    try {
        const { data, error } = await sb.from('vouchers').select('*').eq('is_active', true);
        
        if (error) {
            console.error('Error loading vouchers:', error);
            return [];
        }
        
        return data || [];
    } catch (exception) {
        console.error('Exception loading vouchers:', exception);
        return [];
    }
}

// Render Functions
function renderProducts() {
    console.log('🎨 Rendering products view');
    
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    let displayProducts = [...state.products];
    
    // Apply search filter
    if (state.searchQuery) {
        displayProducts = displayProducts.filter(p => 
            p.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(state.searchQuery.toLowerCase()))
        );
    }
    
    // Apply sorting
    if (state.sortBy === 'price_low') {
        displayProducts.sort((a, b) => a.price - b.price);
    } else if (state.sortBy === 'price_high') {
        displayProducts.sort((a, b) => b.price - a.price);
    } else if (state.sortBy === 'name') {
        displayProducts.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    const cartItems = Object.values(state.cart).reduce((sum, qty) => sum + qty, 0);
    
    const html = `
        <div class="container mx-auto p-4">
            <!-- Header Section -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 class="text-4xl font-bold text-slate-800 mb-2">🛍️ TokoProfesional</h1>
                        <p class="text-slate-600">Found ${displayProducts.length} products</p>
                    </div>
                    <div class="flex items-center gap-4">
                        <!-- Search -->
                        <div class="relative">
                            <input type="text" 
                                   id="search-input" 
                                   placeholder="Search products..." 
                                   value="${state.searchQuery}"
                                   class="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                        
                        <!-- Sort -->
                        <select id="sort-select" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="newest" ${state.sortBy === 'newest' ? 'selected' : ''}>Newest</option>
                            <option value="price_low" ${state.sortBy === 'price_low' ? 'selected' : ''}>Price: Low to High</option>
                            <option value="price_high" ${state.sortBy === 'price_high' ? 'selected' : ''}>Price: High to Low</option>
                            <option value="name" ${state.sortBy === 'name' ? 'selected' : ''}>Name A-Z</option>
                        </select>
                        
                        <!-- Cart Button -->
                        <button onclick="openCart()" class="relative bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                            🛒 Cart
                            ${cartItems > 0 ? `<span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">${cartItems}</span>` : ''}
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Products Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                ${displayProducts.map(product => `
                    <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <div class="relative">
                            <img src="${product.image_url || 'https://placehold.co/300x200?text=No+Image'}" 
                                 alt="${product.name}" 
                                 class="w-full h-48 object-cover"
                                 onerror="this.src='https://placehold.co/300x200?text=Image+Error'">
                            ${!product.is_available ? `
                                <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <span class="text-white font-bold text-lg transform -rotate-12 border-2 border-white px-4 py-2">
                                        SOLD OUT
                                    </span>
                                </div>
                            ` : ''}
                            ${product.discount_percentage > 0 ? `
                                <div class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                                    -${product.discount_percentage}%
                                </div>
                            ` : ''}
                        </div>
                        <div class="p-4">
                            <h3 class="text-lg font-semibold mb-2 text-slate-800 line-clamp-2">${product.name}</h3>
                            <p class="text-slate-600 text-sm mb-3 line-clamp-2">${product.description || 'No description'}</p>
                            <div class="flex justify-between items-center mb-3">
                                <div>
                                    <span class="text-2xl font-bold text-green-600">
                                        ${formatCurrency(product.price)}
                                    </span>
                                    ${product.discount_percentage > 0 ? `
                                        <div class="text-sm text-gray-500 line-through">
                                            ${formatCurrency(Math.round(product.price / (1 - product.discount_percentage / 100)))}
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="text-sm">
                                    ${product.is_available ? 
                                        '<span class="bg-green-100 text-green-800 px-2 py-1 rounded">✅ Available</span>' : 
                                        '<span class="bg-red-100 text-red-800 px-2 py-1 rounded">❌ Sold Out</span>'
                                    }
                                </div>
                            </div>
                            <button onclick="addToCart(${product.id})" 
                                    class="w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-700 transition-colors ${!product.is_available ? 'opacity-50 cursor-not-allowed' : ''}" 
                                    ${!product.is_available ? 'disabled' : ''}>
                                ${product.is_available ? '🛒 Add to Cart' : '❌ Out of Stock'}
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            ${displayProducts.length === 0 ? `
                <div class="text-center py-12">
                    <div class="text-6xl mb-4">🔍</div>
                    <h3 class="text-2xl font-bold text-slate-600 mb-2">No products found</h3>
                    <p class="text-slate-500">Try adjusting your search or filters</p>
                </div>
            ` : ''}
            
            <!-- Navigation Buttons -->
            <div class="mt-12 flex justify-center space-x-4">
                <button onclick="switchToAdmin()" class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
                    ⚙️ Admin Panel
                </button>
                ${state.user ? `
                    <button onclick="logout()" class="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors">
                        🚪 Logout
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    mainContent.innerHTML = html;
    attachEventListeners();
}

function renderAdminLogin() {
    console.log('🔐 Rendering admin login');
    
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    const html = `
        <div class="container mx-auto p-4 max-w-md">
            <div class="bg-white rounded-lg shadow-md p-8">
                <div class="text-center mb-6">
                    <h2 class="text-3xl font-bold text-slate-800">🔐 Admin Login</h2>
                    <p class="text-slate-600 mt-2">Enter your credentials to access admin panel</p>
                </div>
                
                <form id="login-form" class="space-y-4" data-handled="true">
                    <div>
                        <label for="email" class="block text-sm font-medium text-slate-700 mb-2">Email</label>
                        <input type="email" 
                               id="email" 
                               required 
                               autocomplete="email"
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <div>
                        <label for="password" class="block text-sm font-medium text-slate-700 mb-2">Password</label>
                        <input type="password" 
                               id="password" 
                               required 
                               autocomplete="current-password"
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <div id="login-error" class="hidden text-red-600 text-sm text-center bg-red-50 p-3 rounded"></div>
                    
                    <button type="submit" 
                            id="login-btn"
                            class="w-full bg-slate-800 text-white py-3 rounded-lg hover:bg-slate-700 transition-colors font-medium">
                        🔓 Login to Admin Panel
                    </button>
                </form>
                
                <div class="mt-6 text-center">
                    <button onclick="switchToHome()" class="text-blue-500 hover:text-blue-600 text-sm font-medium">
                        ← Back to Home
                    </button>
                </div>
                
                <div class="mt-6 bg-blue-50 p-4 rounded-lg text-sm">
                    <p class="text-blue-800"><strong>Note:</strong> Use the email and password you created in Supabase Authentication.</p>
                </div>
            </div>
        </div>
    `;
    
    mainContent.innerHTML = html;
    
    // Attach login form listener
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

function renderAdminPanel() {
    console.log('👨‍💼 Rendering admin panel');
    
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    const html = `
        <div class="container mx-auto p-4 max-w-6xl">
            <!-- Admin Header -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <div class="flex justify-between items-center">
                    <div>
                        <h1 class="text-3xl font-bold text-slate-800">⚙️ Admin Panel</h1>
                        <p class="text-slate-600">Welcome, ${state.user?.email || 'Admin'}</p>
                    </div>
                    <div class="flex space-x-3">
                        <button onclick="switchToHome()" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                            🏠 Back to Store
                        </button>
                        <button onclick="logout()" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                            🚪 Logout
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <div class="flex items-center">
                        <div class="bg-blue-100 p-3 rounded-lg">
                            <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-lg font-semibold text-slate-800">${state.products.length}</h3>
                            <p class="text-slate-600 text-sm">Total Products</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <div class="flex items-center">
                        <div class="bg-green-100 p-3 rounded-lg">
                            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-lg font-semibold text-slate-800">${state.products.filter(p => p.is_available).length}</h3>
                            <p class="text-slate-600 text-sm">Available</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <div class="flex items-center">
                        <div class="bg-red-100 p-3 rounded-lg">
                            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-lg font-semibold text-slate-800">${state.products.filter(p => !p.is_available).length}</h3>
                            <p class="text-slate-600 text-sm">Out of Stock</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <div class="flex items-center">
                        <div class="bg-purple-100 p-3 rounded-lg">
                            <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-lg font-semibold text-slate-800">${state.vouchers.length}</h3>
                            <p class="text-slate-600 text-sm">Active Vouchers</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 class="text-xl font-semibold text-slate-800 mb-4">Quick Actions</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onclick="addNewProduct()" class="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors text-left">
                        <div class="flex items-center">
                            <svg class="h-6 w-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            <div>
                                <h3 class="font-medium">Add New Product</h3>
                                <p class="text-sm opacity-90">Create a new product listing</p>
                            </div>
                        </div>
                    </button>
                    
                    <button onclick="manageVouchers()" class="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition-colors text-left">
                        <div class="flex items-center">
                            <svg class="h-6 w-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                            </svg>
                            <div>
                                <h3 class="font-medium">Manage Vouchers</h3>
                                <p class="text-sm opacity-90">Create and edit discount codes</p>
                            </div>
                        </div>
                    </button>
                    
                    <button onclick="viewSettings()" class="bg-slate-500 text-white p-4 rounded-lg hover:bg-slate-600 transition-colors text-left">
                        <div class="flex items-center">
                            <svg class="h-6 w-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <div>
                                <h3 class="font-medium">Store Settings</h3>
                                <p class="text-sm opacity-90">Configure QRIS, WhatsApp, etc.</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
            
            <!-- Products Table -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="p-6 border-b">
                    <h2 class="text-xl font-semibold text-slate-800">Product Management</h2>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-slate-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-slate-200">
                            ${state.products.map(product => `
                                <tr class="hover:bg-slate-50">
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="flex items-center">
                                            <img src="${product.image_url || 'https://placehold.co/50x50'}" 
                                                 alt="${product.name}" 
                                                 class="h-10 w-10 rounded-lg object-cover mr-4">
                                            <div>
                                                <div class="text-sm font-medium text-slate-900">${product.name}</div>
                                                <div class="text-sm text-slate-500">${product.category || 'No category'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm font-medium text-slate-900">${formatCurrency(product.price)}</div>
                                        ${product.discount_percentage > 0 ? `
                                            <div class="text-sm text-red-500">-${product.discount_percentage}% off</div>
                                        ` : ''}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <label class="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" 
                                                   class="sr-only peer" 
                                                   ${product.is_available ? 'checked' : ''}
                                                   onchange="toggleProductStatus(${product.id})">
                                            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                        <span class="ml-2 text-sm ${product.is_available ? 'text-green-600' : 'text-red-600'}">
                                            ${product.is_available ? 'Available' : 'Sold Out'}
                                
