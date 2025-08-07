// =====================================
// TOKOPROFESIONAL - ENHANCED VERSION
// Based on working minimal version + additional features
// =====================================

console.log("🚀 TokoProfesional Enhanced - Starting...");

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
    currentView: 'home',
    user: null,
    settings: {},
    vouchers: []
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
    toast.className = `toast ${type} fixed top-4 right-4 z-50 p-4 rounded-lg text-white max-w-sm`;
    
    if (type === 'success') toast.style.backgroundColor = '#10b981';
    if (type === 'error') toast.style.backgroundColor = '#ef4444';
    if (type === 'info') toast.style.backgroundColor = '#3b82f6';
    
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => container.removeChild(toast), 300);
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
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    let displayProducts = [...state.products];
    
    // Apply search filter
    if (state.searchQuery) {
        displayProducts = displayProducts.filter(p => 
            p.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(state.searchQuery.toLowerCase())
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
                        <button id="cart-btn" class="relative bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition-colors">
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
                                            ${formatCurrency(product.price / (1 - product.discount_percentage / 100))}
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
            
            <!-- Admin Panel Link -->
            <div class="mt-12 text-center">
                <button onclick="switchToAdmin()" class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
                    ⚙️ Admin Panel
                </button>
            </div>
        </div>
    `;
    
    mainContent.innerHTML = html;
    
    // Attach event listeners
    attachEventListeners();
}

function renderAdminLogin() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    const html = `
        <div class="container mx-auto p-4 max-w-md">
            <div class="bg-white rounded-lg shadow-md p-8">
                <div class="text-center mb-6">
                    <h2 class="text-3xl font-bold text-slate-800">🔐 Admin Login</h2>
                    <p class="text-slate-600 mt-2">Enter your credentials to access admin panel</p>
                </div>
                
                <form id="login-form" class="space-y-4">
                    <div>
                        <label for="email" class="block text-sm font-medium text-slate-700 mb-2">Email</label>
                        <input type="email" 
                               id="email" 
                               required 
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <div>
                        <label for="password" class="block text-sm font-medium text-slate-700 mb-2">Password</label>
                        <input type="password" 
                               id="password" 
                               required 
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <div id="login-error" class="hidden text-red-600 text-sm text-center"></div>
                    
                    <button type="submit" 
                            id="login-btn"
                            class="w-full bg-slate-800 text-white py-3 rounded-lg hover:bg-slate-700 transition-colors">
                        🔓 Login
                    </button>
                </form>
                
                <div class="mt-6 text-center">
                    <button onclick="switchToHome()" class="text-blue-500 hover:text-blue-600 text-sm">
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    `;
    
    mainContent.innerHTML = html;
    
    // Attach login form listener
    document.getElementById('login-form').addEventListener('submit', handleLogin);
}

// Event Handlers
function attachEventListeners() {
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            renderProducts();
        });
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            state.sortBy = e.target.value;
            renderProducts();
        });
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    const loginBtn = document.getElementById('login-btn');
    
    loginBtn.textContent = '🔄 Logging in...';
    loginBtn.disabled = true;
    
    try {
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        
        if (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        } else {
            state.user = data.user;
            showToast('Login successful!', 'success');
            // Redirect to admin panel
            switchToHome(); // For now, just go back to home
        }
    } catch (exception) {
        errorDiv.textContent = 'Login failed: ' + exception.message;
        errorDiv.classList.remove('hidden');
    }
    
    loginBtn.textContent = '🔓 Login';
    loginBtn.disabled = false;
}

function addToCart(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product || !product.is_available) return;
    
    state.cart[productId] = (state.cart[productId] || 0) + 1;
    showToast(`${product.name} added to cart!`, 'success');
    renderProducts(); // Re-render to update cart count
}

function switchToAdmin() {
    state.currentView = 'admin-login';
    renderAdminLogin();
}

function switchToHome() {
    state.currentView = 'home';
    renderProducts();
}

// Initialization
async function init() {
    console.log('🚀 Initializing TokoProfesional...');
    
    const mainContent = document.getElementById('main-content');
    if (!mainContent) {
        console.error('❌ main-content element not found!');
        return;
    }
    
    // Show loading state
    mainContent.innerHTML = `
        <div class="flex items-center justify-center min-h-screen">
            <div class="text-center">
                <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-800 mx-auto mb-4"></div>
                <h2 class="text-2xl font-bold text-slate-800 mb-2">Loading TokoProfesional...</h2>
                <p class="text-slate-600">Connecting to database...</p>
            </div>
        </div>
    `;
    
    try {
        // Load all data
        console.log('📦 Loading products...');
        state.products = await loadProducts();
        
        console.log('⚙️ Loading settings...');
        state.settings = await loadSettings();
        
        console.log('🎟️ Loading vouchers...');
        state.vouchers = await loadVouchers();
        
        console.log('✅ All data loaded successfully!');
        
        // Render the application
        renderProducts();
        
        // Set up auth listener
        sb.auth.onAuthStateChange((event, session) => {
            console.log('🔄 Auth state changed:', event);
            state.user = session?.user || null;
        });
        
    } catch (error) {
        console.error('💥 Initialization failed:', error);
        mainContent.innerHTML = `
            <div class="flex flex-col items-center justify-center min-h-screen text-center p-4">
                <div class="text-red-500 text-6xl mb-4">❌</div>
                <h2 class="text-3xl font-bold text-red-600 mb-4">Initialization Failed</h2>
                <p class="text-gray-600 mb-6">${error.message}</p>
                <button onclick="location.reload()" class="bg-blue-500 text-white px-6 py-3 rounded-lg">
                    🔄 Reload Page
                </button>
            </div>
        `;
    }
}

// Global functions
window.addToCart = addToCart;
window.switchToAdmin = switchToAdmin;
window.switchToHome = switchToHome;

// Start the application
document.addEventListener('DOMContentLoaded', init);

console.log('✅ TokoProfesional Enhanced loaded successfully!');
