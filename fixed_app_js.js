// =====================================
// TOKOPROFESIONAL - STABLE VERSION
// Fixed loading issues and working toggles
// =====================================

console.log("🚀 STABLE TOKOPROFESIONAL - Starting...");

// Global Application State
let appState = {
    products: [],
    cart: {},
    user: null,
    vouchers: [],
    settings: {
        qrisImageUrl: '',
        whatsappNumber: '',
        promo_media_url: '',
        promo_media_type: '',
        store_name: 'TokoProfesional'
    },
    view: 'home',
    selectedProductId: null,
    appliedVoucher: null,
    isReady: false
};

// Supabase client initialization
let supabaseClient = null;

// Check Supabase availability and initialize
if (typeof supabase === 'undefined') {
    console.error("❌ Supabase library not found!");
    showError("Supabase library missing. Please check your internet connection.");
} else {
    console.log("✅ Supabase library found");
    initializeApp();
}

async function initializeApp() {
    console.log("🔧 Initializing TokoProfesional...");
    
    try {
        // Initialize Supabase client
        const { createClient } = supabase;
        supabaseClient = createClient(
            'https://viresxwhyqcflmfoyxsf.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpcmVzeHdoeXFjZmxtZm95eHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDU1MDMsImV4cCI6MjA2OTk4MTUwM30.MuR0PKP1Og3cF9wOjYbWGFQfo6rtsWvcoODgD1_boUQ'
        );
        console.log("✅ Supabase client initialized");
        
        // Test connection
        const { data: connectionTest } = await supabaseClient.from('products').select('count', { count: 'exact', head: true });
        console.log("✅ Database connection successful");
        
        // Load all application data
        await loadAllData();
        
        // Setup authentication listener
        setupAuthListener();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initial render
        renderCurrentView();
        
        console.log("🎉 TokoProfesional initialized successfully!");
        
    } catch (error) {
        console.error("💥 Initialization failed:", error);
        showError(`Initialization failed: ${error.message}`);
    }
}

// =====================================
// DATA LOADING FUNCTIONS
// =====================================

async function loadAllData() {
    console.log("📦 Loading all application data...");
    
    try {
        // Load products
        const { data: products, error: productsError } = await supabaseClient
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (productsError) throw productsError;
        appState.products = products || [];
        console.log(`✅ Loaded ${appState.products.length} products`);
        
        // Load settings
        const { data: settings, error: settingsError } = await supabaseClient
            .from('settings')
            .select('*')
            .eq('id', 1)
            .single();
            
        if (settingsError && settingsError.code !== 'PGRST116') {
            console.warn("⚠️ Settings load error:", settingsError);
        } else if (settings) {
            appState.settings = {
                ...appState.settings,
                ...settings
            };
            console.log("✅ Settings loaded");
        }
        
        // Load vouchers
        const { data: vouchers, error: vouchersError } = await supabaseClient
            .from('vouchers')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (vouchersError) {
            console.warn("⚠️ Vouchers load error:", vouchersError);
        } else {
            appState.vouchers = vouchers || [];
            console.log(`✅ Loaded ${appState.vouchers.length} vouchers`);
        }
        
        appState.isReady = true;
        
    } catch (error) {
        console.error("❌ Data loading error:", error);
        throw error;
    }
}

// =====================================
// AUTHENTICATION
// =====================================

function setupAuthListener() {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('🔄 Auth state changed:', event);
        appState.user = session?.user || null;
        
        if (event === 'SIGNED_IN') {
            showToast('Login berhasil!', 'success');
            appState.view = 'admin';
            renderCurrentView();
        } else if (event === 'SIGNED_OUT') {
            showToast('Logout berhasil', 'info');
            appState.view = 'home';
            renderCurrentView();
        }
    });
}

async function attemptLogin(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        return { success: true };
        
    } catch (error) {
        console.error("❌ Login error:", error);
        return { success: false, error: error.message };
    }
}

async function logout() {
    try {
        await supabaseClient.auth.signOut();
    } catch (error) {
        console.error("❌ Logout error:", error);
        showToast('Logout gagal', 'error');
    }
}

// =====================================
// UTILITY FUNCTIONS
// =====================================

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function showToast(message, type = 'success') {
    console.log(`🍞 Toast: [${type.toUpperCase()}] ${message}`);
    
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

function showError(message) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-[400px] text-center animate-fade-in">
            <div class="text-6xl mb-6">❌</div>
            <h2 class="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p class="text-slate-600 mb-6 max-w-md">${message}</p>
            <button onclick="location.reload()" class="bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition-colors">
                🔄 Reload Page
            </button>
        </div>
    `;
}

// =====================================
// CART MANAGEMENT
// =====================================

function addToCart(productId) {
    const product = appState.products.find(p => p.id === productId);
    if (!product || !product.is_available) {
        showToast('Produk tidak tersedia', 'error');
        return;
    }
    
    appState.cart[productId] = (appState.cart[productId] || 0) + 1;
    updateCartUI();
    showToast(`${product.name} ditambahkan ke keranjang!`, 'success');
    
    // Add cart animation
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.classList.add('cart-icon-animate');
        setTimeout(() => cartBtn.classList.remove('cart-icon-animate'), 600);
    }
}

function updateCartUI() {
    const cartCount = Object.values(appState.cart).reduce((sum, qty) => sum + qty, 0);
    const cartCountEl = document.getElementById('cart-count');
    
    if (cartCountEl) {
        cartCountEl.textContent = cartCount;
        cartCountEl.classList.toggle('hidden', cartCount === 0);
        cartCountEl.classList.toggle('flex', cartCount > 0);
    }
}

// =====================================
// VIEW RENDERING
// =====================================

function renderCurrentView() {
    if (!appState.isReady) {
        showLoadingState();
        return;
    }
    
    updateCartUI();
    
    switch (appState.view) {
        case 'home':
            renderHomeView();
            break;
        case 'admin':
            appState.user ? renderAdminView() : renderLoginView();
            break;
        default:
            renderHomeView();
    }
}

function showLoadingState() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
            <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-slate-800 mb-4"></div>
            <h3 class="text-lg font-medium text-slate-800 mb-2">Memuat TokoProfesional</h3>
            <p class="text-slate-600 text-center">Menyiapkan produk terbaik untuk Anda...</p>
        </div>
    `;
}

function renderHomeView() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="animate-fade-in">
            <!-- Hero Section -->
            <div class="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl p-8 mb-8">
                <div class="text-center">
                    <h2 class="text-3xl md:text-4xl font-bold mb-4">Selamat Datang di TokoProfesional</h2>
                    <p class="text-xl text-slate-300 mb-6">Destinasi fashion terpercaya untuk gaya hidup modern</p>
                    <div class="flex flex-wrap justify-center gap-4 text-sm">
                        <div class="bg-white/10 px-4 py-2 rounded-full">✅ Kualitas Premium</div>
                        <div class="bg-white/10 px-4 py-2 rounded-full">🚚 Pengiriman Cepat</div>
                        <div class="bg-white/10 px-4 py-2 rounded-full">💳 Pembayaran Mudah</div>
                    </div>
                </div>
            </div>
            
            <!-- Products Grid -->
            <div class="mb-6">
                <h3 class="text-2xl font-bold text-slate-800 mb-4">Produk Kami</h3>
                <p class="text-slate-600 mb-6">Ditemukan ${appState.products.length} produk</p>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                ${appState.products.map(renderProductCard).join('')}
            </div>
            
            ${appState.products.length === 0 ? `
                <div class="text-center py-12">
                    <div class="text-6xl mb-4">🔍</div>
                    <h3 class="text-xl font-semibold text-slate-800 mb-2">Produk tidak ditemukan</h3>
                    <p class="text-slate-600">Silakan reload halaman atau hubungi admin</p>
                </div>
            ` : ''}
        </div>
    `;
}

function renderProductCard(product) {
    return `
        <div class="product-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${!product.is_available ? 'relative' : ''}">
            ${!product.is_available ? `
                <div class="absolute inset-0 bg-black/60 z-10 flex items-center justify-center">
                    <span class="text-white text-lg font-bold px-4 py-2 border-2 border-white rounded-lg transform -rotate-12">
                        STOK HABIS
                    </span>
                </div>
            ` : ''}
            
            <img src="${product.image_url || 'https://placehold.co/300x300?text=No+Image'}" 
                 alt="${product.name}" 
                 class="w-full h-48 object-cover"
                 onerror="this.src='https://placehold.co/300x300?text=Image+Error'">
            
            <div class="p-4">
                <h4 class="font-semibold text-slate-800 mb-2 line-clamp-2">${product.name}</h4>
                <p class="text-sm text-slate-600 mb-3 line-clamp-2">${product.description || 'Tidak ada deskripsi'}</p>
                
                <div class="flex items-center justify-between mb-3">
                    <span class="text-lg font-bold text-slate-800">${formatCurrency(product.price)}</span>
                    <span class="text-xs px-2 py-1 rounded-full ${product.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${product.is_available ? '✅ Tersedia' : '❌ Habis'}
                    </span>
                </div>
                
                <button onclick="addToCart(${product.id})" 
                        ${!product.is_available ? 'disabled' : ''}
                        class="w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
                            product.is_available 
                                ? 'bg-slate-800 text-white hover:bg-slate-700 hover:shadow-lg' 
                                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        }">
                    ${product.is_available ? '🛒 Tambah ke Keranjang' : '❌ Stok Habis'}
                </button>
            </div>
        </div>
    `;
}

function renderLoginView() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="max-w-md mx-auto mt-8 animate-fade-in">
            <div class="bg-white rounded-xl shadow-lg p-8">
                <div class="text-center mb-8">
                    <div class="bg-slate-800 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                    </div>
                    <h2 class="text-2xl font-bold text-slate-800">Admin Login</h2>
                    <p class="text-slate-600">Masuk ke panel admin TokoProfesional</p>
                </div>
                
                <form id="login-form" class="space-y-6">
                    <div>
                        <label for="email" class="block text-sm font-medium text-slate-700 mb-2">Email</label>
                        <input type="email" id="email" required
                               class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent">
                    </div>
                    
                    <div>
                        <label for="password" class="block text-sm font-medium text-slate-700 mb-2">Password</label>
                        <input type="password" id="password" required
                               class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent">
                    </div>
                    
                    <div id="login-error" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"></div>
                    
                    <button type="submit" id="login-btn" 
                            class="w-full bg-slate-800 text-white py-3 rounded-lg hover:bg-slate-700 transition-colors font-medium">
                        Masuk ke Admin Panel
                    </button>
                </form>
                
                <div class="mt-6 text-center">
                    <button onclick="switchToHome()" class="text-slate-600 hover:text-slate-800 text-sm">
                        ← Kembali ke Toko
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderAdminView() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    const totalProducts = appState.products.length;
    const availableProducts = appState.products.filter(p => p.is_available).length;
    const outOfStockProducts = totalProducts - availableProducts;
    const activeVouchers = appState.vouchers.filter(v => v.is_active).length;
    
    mainContent.innerHTML = `
        <div class="animate-fade-in">
            <!-- Admin Header -->
            <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 class="text-3xl font-bold text-slate-800 mb-2">Panel Admin</h2>
                        <p class="text-slate-600">Selamat datang, ${appState.user?.email || 'Admin'}</p>
                    </div>
                    <div class="flex gap-3">
                        <button onclick="switchToHome()" class="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                            🏠 Lihat Toko
                        </button>
                        <button onclick="logout()" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                            🚪 Logout
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Statistics Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100 text-sm">Total Produk</p>
                            <p class="text-3xl font-bold">${totalProducts}</p>
                        </div>
                        <div class="text-4xl opacity-80">📦</div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100 text-sm">Tersedia</p>
                            <p class="text-3xl font-bold">${availableProducts}</p>
                        </div>
                        <div class="text-4xl opacity-80">✅</div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-red-100 text-sm">Stok Habis</p>
                            <p class="text-3xl font-bold">${outOfStockProducts}</p>
                        </div>
                        <div class="text-4xl opacity-80">❌</div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-purple-100 text-sm">Voucher Aktif</p>
                            <p class="text-3xl font-bold">${activeVouchers}</p>
                        </div>
                        <div class="text-4xl opacity-80">🎟️</div>
                    </div>
                </div>
            </div>
            
            <!-- Products Management -->
            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                <div class="border-b border-slate-200 p-6">
                    <h3 class="text-xl font-semibold text-slate-800">📦 Manajemen Produk</h3>
                </div>
                
                <div class="p-6">
                    <div class="overflow-x-auto">
                        <table class="w-full border-collapse">
                            <thead>
                                <tr class="bg-slate-50 border-b border-slate-200">
                                    <th class="text-left py-3 px-4 font-semibold text-slate-700">Produk</th>
                                    <th class="text-left py-3 px-4 font-semibold text-slate-700">Harga</th>
                                    <th class="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                                    <th class="text-left py-3 px-4 font-semibold text-slate-700">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${appState.products.map(renderProductRow).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderProductRow(product) {
    return `
        <tr class="border-b border-slate-100 hover:bg-slate-50">
            <td class="py-4 px-4">
                <div class="flex items-center">
                    <img src="${product.image_url || 'https://placehold.co/60x60'}" 
                         alt="${product.name}" 
                         class="w-12 h-12 rounded-lg object-cover mr-3">
                    <div>
                        <p class="font-medium text-slate-800">${product.name}</p>
                        <p class="text-sm text-slate-600">${product.category || 'Tanpa kategori'}</p>
                    </div>
                </div>
            </td>
            <td class="py-4 px-4">
                <span class="font-semibold text-slate-800">${formatCurrency(product.price)}</span>
            </td>
            <td class="py-4 px-4">
                <div class="flex items-center">
                    <input type="checkbox" 
                           ${product.is_available ? 'checked' : ''} 
                           onchange="toggleProductStatus(${product.id})"
                           class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2">
                    <span class="ml-2 text-sm ${product.is_available ? 'text-green-600' : 'text-gray-500'}">
                        ${product.is_available ? 'Tersedia' : 'Habis'}
                    </span>
                </div>
            </td>
            <td class="py-4 px-4">
                <button onclick="deleteProduct(${product.id}, '${product.name.replace(/'/g, "\\'")}')" 
                        class="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors">
                    🗑️ Hapus
                </button>
            </td>
        </tr>
    `;
}

// =====================================
// TOGGLE FUNCTIONS - SIMPLIFIED
// =====================================

async function toggleProductStatus(productId) {
    console.log('🔄 Toggling product status:', productId);
    
    try {
        const product = appState.products.find(p => p.id == productId);
        if (!product) return;
        
        const newStatus = !product.is_available;
        
        const { error } = await supabaseClient
            .from('products')
            .update({ is_available: newStatus })
            .eq('id', productId);
            
        if (error) throw error;
        
        product.is_available = newStatus;
        showToast(`Produk ${newStatus ? 'diaktifkan' : 'dinonaktifkan'} berhasil!`, 'success');
        
        // Refresh admin view
        setTimeout(() => renderAdminView(), 100);
        
    } catch (error) {
        console.error('❌ Toggle error:', error);
        showToast('Gagal mengubah status produk', 'error');
        setTimeout(() => renderAdminView(), 100);
    }
}

async function deleteProduct(productId, productName) {
    if (!confirm(`Apakah Anda yakin ingin menghapus produk "${productName}"?`)) return;
    
    try {
        const { error } = await supabaseClient
            .from('products')
            .delete()
            .eq('id', productId);
            
        if (error) throw error;
        
        appState.products = appState.products.filter(p => p.id !== productId);
        showToast('Produk berhasil dihapus!', 'success');
        renderAdminView();
        
    } catch (error) {
        console.error('❌ Delete error:', error);
        showToast('Gagal menghapus produk', 'error');
    }
}

// =====================================
// NAVIGATION FUNCTIONS
// =====================================

function switchToHome() {
    appState.view = 'home';
    renderCurrentView();
}

function switchToAdmin() {
    appState.view = 'admin';
    renderCurrentView();
}

// =====================================
// EVENT LISTENERS SETUP
// =====================================

function setupEventListeners() {
    // Navigation buttons
    const homeBtn = document.getElementById('home-btn');
    if (homeBtn) {
        homeBtn.addEventListener('click', switchToHome);
    }
    
    const navHomeBtn = document.getElementById('nav-home-btn');
    if (navHomeBtn) {
        navHomeBtn.addEventListener('click', switchToHome);
    }
    
    const navAdminBtn = document.getElementById('nav-admin-btn');
    if (navAdminBtn) {
        navAdminBtn.addEventListener('click', switchToAdmin);
    }
    
    // Document click handlers
    document.addEventListener('submit', handleFormSubmit);
}

function handleFormSubmit(event) {
    const form = event.target;
    
    if (form.id === 'login-form') {
        event.preventDefault();
        handleLoginSubmit(form);
    }
}

async function handleLoginSubmit(form) {
    const btn = document.getElementById('login-btn');
    const errorDiv = document.getElementById('login-error');
    const email = form.email.value.trim();
    const password = form.password.value;
    
    const originalText = btn.textContent;
    btn.textContent = 'Masuk...';
    btn.disabled = true;
    errorDiv.classList.add('hidden');
    
    const result = await attemptLogin(email, password);
    
    if (!result.success) {
        errorDiv.textContent = result.error;
        errorDiv.classList.remove('hidden');
    }
    
    btn.textContent = originalText;
    btn.disabled = false;
}

// =====================================
// GLOBAL FUNCTION EXPORTS
// =====================================

// Make functions available globally for onclick handlers
window.addToCart = addToCart;
window.switchToHome = switchToHome;
window.switchToAdmin = switchToAdmin;
window.logout = logout;
window.toggleProductStatus = toggleProductStatus;
window.deleteProduct = deleteProduct;

console.log("✅ STABLE TokoProfesional loaded successfully!");
console.log("🎯 Features: Home, Products, Admin Panel, Authentication ready!");