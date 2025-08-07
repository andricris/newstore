// =====================================
// TOKOPROFESIONAL - ENHANCED APP.JS
// Complete e-commerce with working checkout & admin features
// Version: 3.1 - Fixed Auto Refresh & Removed Categories
// =====================================

console.log("🚀 ENHANCED TOKOPROFESIONAL - Starting...");

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
    isReady: false,
    isEditing: false,
    currentEditingId: null,
    preventAutoRefresh: false
};

// Supabase client initialization
let supabaseClient = null;
let currentAdminTab = 'products';

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
        
        // Show promo popup if available
        showPromoPopup();
        
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
            appState.isEditing = false;
            appState.preventAutoRefresh = false;
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

async function uploadFile(file, path) {
    if (!file) return null;
    
    try {
        const { data, error } = await supabaseClient.storage
            .from('images')
            .upload(path, file, { upsert: true });
            
        if (error) throw error;
        
        const { data: { publicUrl } } = supabaseClient.storage
            .from('images')
            .getPublicUrl(path);
            
        return publicUrl;
        
    } catch (error) {
        console.error("❌ Upload error:", error);
        showToast(`Upload gagal: ${error.message}`, 'error');
        return null;
    }
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

function updateCartQuantity(productId, change) {
    if (!appState.cart[productId]) return;
    
    appState.cart[productId] += change;
    if (appState.cart[productId] <= 0) {
        delete appState.cart[productId];
    }
    
    updateCartUI();
    renderCartContents();
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

function openCart() {
    const cartSidebar = document.getElementById('floating-cart');
    if (cartSidebar) {
        cartSidebar.classList.remove('hidden');
        cartSidebar.classList.add('flex');
        renderCartContents();
    }
}

function closeCart() {
    const cartSidebar = document.getElementById('floating-cart');
    if (cartSidebar) {
        cartSidebar.classList.add('hidden');
        cartSidebar.classList.remove('flex');
    }
}

function renderCartContents() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartSummary = document.getElementById('cart-summary');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (!cartItemsContainer || !cartSummary || !checkoutBtn) return;
    
    const cartItems = Object.keys(appState.cart).map(productId => {
        const product = appState.products.find(p => p.id == productId);
        return product ? { ...product, quantity: appState.cart[productId] } : null;
    }).filter(Boolean);
    
    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p class="text-slate-500">Keranjang Anda kosong</p>
                <p class="text-sm text-slate-400 mt-1">Mulai berbelanja untuk menambahkan produk</p>
            </div>
        `;
        checkoutBtn.disabled = true;
        cartSummary.innerHTML = '';
        return;
    }
    
    // Render cart items
    cartItemsContainer.innerHTML = cartItems.map(item => `
        <div class="cart-item flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 mb-3">
            <div class="flex items-center flex-1">
                <img src="${item.image_url || 'https://placehold.co/60x60'}" 
                     alt="${item.name}" 
                     class="w-16 h-16 rounded-lg object-cover mr-4">
                <div class="flex-1">
                    <h4 class="font-semibold text-slate-800">${item.name}</h4>
                    <p class="text-sm text-slate-600">${formatCurrency(item.price)}</p>
                </div>
            </div>
            <div class="flex items-center space-x-3">
                <button onclick="updateCartQuantity(${item.id}, -1)" 
                        class="quantity-control w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-800 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                    </svg>
                </button>
                <span class="font-semibold text-slate-800 min-w-[2rem] text-center">${item.quantity}</span>
                <button onclick="updateCartQuantity(${item.id}, 1)" 
                        class="quantity-control w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-800 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
    
    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = appState.appliedVoucher ? 
        (appState.appliedVoucher.discount_type === 'percentage' ? 
            Math.min(subtotal * appState.appliedVoucher.discount_amount / 100, appState.appliedVoucher.maximum_discount || subtotal) :
            appState.appliedVoucher.discount_amount) : 0;
    const total = Math.max(0, subtotal - discount);
    
    // Render cart summary
    cartSummary.innerHTML = `
        <div class="space-y-2 text-sm">
            <div class="flex justify-between">
                <span class="text-slate-600">Subtotal (${cartItems.length} item${cartItems.length > 1 ? 's' : ''})</span>
                <span class="font-semibold">${formatCurrency(subtotal)}</span>
            </div>
            ${appState.appliedVoucher ? `
                <div class="flex justify-between text-green-600">
                    <span>Diskon (${appState.appliedVoucher.code})</span>
                    <span>-${formatCurrency(discount)}</span>
                </div>
            ` : ''}
            <div class="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span class="text-slate-800">${formatCurrency(total)}</span>
            </div>
        </div>
    `;
    
    checkoutBtn.disabled = false;
}

async function applyVoucher() {
    const voucherInput = document.getElementById('voucher-input');
    const code = voucherInput.value.trim().toUpperCase();
    
    if (!code) {
        showToast('Masukkan kode voucher', 'error');
        return;
    }
    
    try {
        const { data: voucher, error } = await supabaseClient
            .from('vouchers')
            .select('*')
            .eq('code', code)
            .eq('is_active', true)
            .single();
            
        if (error || !voucher) {
            showToast('Kode voucher tidak valid atau sudah tidak aktif', 'error');
            appState.appliedVoucher = null;
            renderCartContents();
            return;
        }
        
        // Check voucher validity
        const now = new Date();
        if (voucher.valid_until && new Date(voucher.valid_until) < now) {
            showToast('Voucher sudah kedaluwarsa', 'error');
            return;
        }
        
        if (voucher.valid_from && new Date(voucher.valid_from) > now) {
            showToast('Voucher belum berlaku', 'error');
            return;
        }
        
        // Check minimum purchase
        const subtotal = Object.keys(appState.cart).reduce((sum, productId) => {
            const product = appState.products.find(p => p.id == productId);
            return sum + (product ? product.price * appState.cart[productId] : 0);
        }, 0);
        
        if (voucher.minimum_purchase && subtotal < voucher.minimum_purchase) {
            showToast(`Minimum pembelian ${formatCurrency(voucher.minimum_purchase)} untuk voucher ini`, 'error');
            return;
        }
        
        // Check usage limit
        if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
            showToast('Voucher sudah mencapai batas penggunaan', 'error');
            return;
        }
        
        appState.appliedVoucher = voucher;
        showToast(`Voucher ${code} berhasil diterapkan!`, 'success');
        renderCartContents();
        
    } catch (error) {
        console.error("❌ Voucher apply error:", error);
        showToast('Gagal menerapkan voucher', 'error');
    }
}

function proceedToCheckout() {
    if (Object.keys(appState.cart).length === 0) {
        showToast('Keranjang masih kosong', 'error');
        return;
    }
    
    appState.view = 'checkout';
    renderCurrentView();
    closeCart();
}

// =====================================
// VIEW RENDERING
// =====================================

function renderCurrentView() {
    // Prevent render if editing and in admin view
    if (appState.preventAutoRefresh && appState.view === 'admin') {
        console.log('Auto refresh disabled during editing');
        return;
    }
    
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
        case 'checkout':
            renderCheckoutView();
            break;
        case 'product-detail':
            renderProductDetailView();
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
    
    const displayedProducts = appState.products.filter(product => 
        product.name.toLowerCase().includes(getSearchQuery().toLowerCase())
    );
    
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
            
            <!-- Products Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h3 class="text-2xl font-bold text-slate-800">Produk Kami</h3>
                    <p class="text-slate-600">Ditemukan ${displayedProducts.length} produk</p>
                </div>
                <div class="flex items-center gap-3">
                    <label for="sort-select" class="text-sm font-medium text-slate-700">Urutkan:</label>
                    <select id="sort-select" onchange="handleSortChange()" class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500">
                        <option value="newest">Terbaru</option>
                        <option value="price-low">Harga: Rendah ke Tinggi</option>
                        <option value="price-high">Harga: Tinggi ke Rendah</option>
                        <option value="name">Nama A-Z</option>
                    </select>
                </div>
            </div>
            
            <!-- Products Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                ${displayedProducts.map(renderProductCard).join('')}
            </div>
            
            ${displayedProducts.length === 0 ? `
                <div class="text-center py-12">
                    <div class="text-6xl mb-4">🔍</div>
                    <h3 class="text-xl font-semibold text-slate-800 mb-2">Produk tidak ditemukan</h3>
                    <p class="text-slate-600">Coba kata kunci lain atau lihat semua produk</p>
                </div>
            ` : ''}
        </div>
    `;
}

function renderProductCard(product) {
    return `
        <div class="product-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${!product.is_available ? 'relative' : ''}">
            ${!product.is_available ? `
                <div class="product-card-overlay absolute inset-0 bg-black/60 z-10 flex items-center justify-center">
                    <span class="text-white text-lg font-bold px-4 py-2 border-2 border-white rounded-lg transform -rotate-12">
                        STOK HABIS
                    </span>
                </div>
            ` : ''}
            
            <div class="aspect-w-1 aspect-h-1">
                <img src="${product.image_url || 'https://placehold.co/300x300?text=No+Image'}" 
                     alt="${product.name}" 
                     class="w-full h-48 object-cover cursor-pointer"
                     onclick="viewProductDetail(${product.id})"
                     onerror="this.src='https://placehold.co/300x300?text=Image+Error'">
            </div>
            
            <div class="p-4">
                <h4 class="font-semibold text-slate-800 mb-2 line-clamp-2 cursor-pointer hover:text-slate-600" 
                    onclick="viewProductDetail(${product.id})">${product.name}</h4>
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
            
            <!-- Admin Tabs -->
            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                <div class="border-b border-slate-200">
                    <nav class="flex">
                        <button onclick="switchAdminTab('products')" id="tab-products" 
                                class="admin-tab px-6 py-4 font-medium text-slate-600 hover:text-slate-800 border-b-2 border-transparent hover:border-slate-300 transition-colors active">
                            📦 Kelola Produk
                        </button>
                        <button onclick="switchAdminTab('vouchers')" id="tab-vouchers" 
                                class="admin-tab px-6 py-4 font-medium text-slate-600 hover:text-slate-800 border-b-2 border-transparent hover:border-slate-300 transition-colors">
                            🎟️ Kelola Voucher
                        </button>
                        <button onclick="switchAdminTab('settings')" id="tab-settings" 
                                class="admin-tab px-6 py-4 font-medium text-slate-600 hover:text-slate-800 border-b-2 border-transparent hover:border-slate-300 transition-colors">
                            ⚙️ Pengaturan Toko
                        </button>
                    </nav>
                </div>
                
                <div id="admin-content" class="p-6">
                    ${renderProductsTab()}
                </div>
            </div>
        </div>
    `;
}

function renderProductsTab() {
    return `
        <div class="space-y-6">
            <!-- Add Product Button -->
            <div class="flex justify-between items-center">
                <h3 class="text-xl font-semibold text-slate-800">Manajemen Produk</h3>
                <button onclick="showAddProductForm()" class="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                    ➕ Tambah Produk
                </button>
            </div>
            
            <!-- Product Form (Hidden by default) -->
            <div id="product-form-container" class="hidden bg-slate-50 border border-slate-200 rounded-lg p-6">
                <h4 class="text-lg font-semibold text-slate-800 mb-4" id="form-title">Tambah Produk Baru</h4>
                <form id="product-form" class="space-y-4">
                    <input type="hidden" id="product-id" value="">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Nama Produk *</label>
                            <input type="text" id="product-name" required
                                   class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Harga (IDR) *</label>
                            <input type="number" id="product-price" required min="0"
                                   class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Deskripsi</label>
                        <textarea id="product-description" rows="3"
                                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"></textarea>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Gambar Produk</label>
                        <input type="file" id="product-image" accept="image/*"
                               class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500">
                        <div id="image-preview" class="mt-2"></div>
                    </div>
                    
                    <div class="flex justify-end space-x-3">
                        <button type="button" onclick="hideProductForm()" 
                                class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors">
                            Batal
                        </button>
                        <button type="submit" id="save-product-btn"
                                class="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
                            Simpan Produk
                        </button>
                    </div>
                </form>
            </div>
            
            <!-- Products Table -->
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
            
            ${appState.products.length === 0 ? `
                <div class="text-center py-12">
                    <div class="text-6xl mb-4">📦</div>
                    <h3 class="text-xl font-semibold text-slate-800 mb-2">Belum ada produk</h3>
                    <p class="text-slate-600 mb-4">Mulai dengan menambahkan produk pertama Anda</p>
                    <button onclick="showAddProductForm()" class="bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition-colors">
                        ➕ Tambah Produk Pertama
                    </button>
                </div>
            ` : ''}
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
                    </div>
                </div>
            </td>
            <td class="py-4 px-4">
                <span class="font-semibold text-slate-800">${formatCurrency(product.price)}</span>
            </td>
            <td class="py-4 px-4">
                <label class="flex items-center cursor-pointer">
                    <input type="checkbox" ${product.is_available ? 'checked' : ''} 
                           onchange="toggleProductStatus(${product.id})"
                           class="sr-only">
                    <div class="relative">
                        <div class="w-10 h-6 rounded-full transition-colors ${product.is_available ? 'bg-green-500' : 'bg-slate-300'}"></div>
                        <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${product.is_available ? 'translate-x-4' : 'translate-x-0'}"></div>
                    </div>
                    <span class="ml-2 text-sm ${product.is_available ? 'text-green-600' : 'text-slate-500'}">
                        ${product.is_available ? 'Tersedia' : 'Habis'}
                    </span>
                </label>
            </td>
            <td class="py-4 px-4">
                <div class="flex space-x-2">
                    <button onclick="editProduct(${product.id})" 
                            class="text-blue-600 hover:text-blue-800 p-1 rounded">
                        ✏️ Edit
                    </button>
                    <button onclick="deleteProduct(${product.id}, '${product.name}')" 
                            class="text-red-600 hover:text-red-800 p-1 rounded">
                        🗑️ Hapus
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function renderVouchersTab() {
    return `
        <div class="space-y-6">
            <!-- Add Voucher Form -->
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <h4 class="text-lg font-semibold text-slate-800 mb-4">Buat Voucher Baru</h4>
                <form id="voucher-form" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Kode Voucher *</label>
                            <input type="text" id="voucher-code" required maxlength="20"
                                   class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 uppercase"
                                   placeholder="DISKON10">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Tipe Diskon *</label>
                            <select id="voucher-type" required onchange="toggleDiscountInput()"
                                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500">
                                <option value="fixed">Nominal (Rp)</option>
                                <option value="percentage">Persentase (%)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Nilai Diskon *</label>
                            <input type="number" id="voucher-amount" required min="1"
                                   class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                   placeholder="50000">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Minimum Pembelian</label>
                            <input type="number" id="voucher-minimum" min="0"
                                   class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                   placeholder="0">
                        </div>
                        <div id="max-discount-container" class="hidden">
                            <label class="block text-sm font-medium text-slate-700 mb-2">Maksimal Diskon</label>
                            <input type="number" id="voucher-max-discount" min="0"
                                   class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                   placeholder="100000">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Batas Penggunaan</label>
                            <input type="number" id="voucher-limit" min="1"
                                   class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                   placeholder="Kosongkan untuk unlimited">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Berlaku Dari</label>
                            <input type="datetime-local" id="voucher-start"
                                   class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Berlaku Sampai</label>
                            <input type="datetime-local" id="voucher-end"
                                   class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Deskripsi</label>
                        <textarea id="voucher-description" rows="2"
                                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                  placeholder="Deskripsi voucher..."></textarea>
                    </div>
                    
                    <div class="flex justify-end">
                        <button type="submit" id="save-voucher-btn"
                                class="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
                            🎟️ Buat Voucher
                        </button>
                    </div>
                </form>
            </div>
            
            <!-- Vouchers List -->
            <div>
                <h4 class="text-lg font-semibold text-slate-800 mb-4">Daftar Voucher</h4>
                <div class="grid grid-cols-1 gap-4">
                    ${appState.vouchers.map(renderVoucherCard).join('')}
                </div>
                
                ${appState.vouchers.length === 0 ? `
                    <div class="text-center py-12 bg-slate-50 rounded-lg">
                        <div class="text-6xl mb-4">🎟️</div>
                        <h3 class="text-xl font-semibold text-slate-800 mb-2">Belum ada voucher</h3>
                        <p class="text-slate-600">Buat voucher pertama untuk memberikan diskon kepada pelanggan</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderVoucherCard(voucher) {
    const now = new Date();
    const isExpired = voucher.valid_until && new Date(voucher.valid_until) < now;
    const isNotStarted = voucher.valid_from && new Date(voucher.valid_from) > now;
    const isUsageLimitReached = voucher.usage_limit && voucher.used_count >= voucher.usage_limit;
    
    return `
        <div class="bg-white border border-slate-200 rounded-lg p-4 ${voucher.is_active && !isExpired && !isNotStarted && !isUsageLimitReached ? 'border-green-200 bg-green-50' : ''}">
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <div class="flex items-center space-x-3 mb-2">
                        <span class="text-lg font-bold text-slate-800 font-mono bg-slate-100 px-3 py-1 rounded-lg">
                            ${voucher.code}
                        </span>
                        <span class="text-sm px-2 py-1 rounded-full ${
                            voucher.is_active && !isExpired && !isNotStarted && !isUsageLimitReached
                                ? 'bg-green-100 text-green-800'
                                : 'bg-slate-100 text-slate-600'
                        }">
                            ${voucher.is_active && !isExpired && !isNotStarted && !isUsageLimitReached ? '✅ Aktif' : '❌ Nonaktif'}
                        </span>
                    </div>
                    
                    <p class="text-slate-600 mb-2">${voucher.description || 'Tidak ada deskripsi'}</p>
                    
                    <div class="text-sm text-slate-500 space-y-1">
                        <p>💰 Diskon: ${voucher.discount_type === 'percentage' ? `${voucher.discount_amount}%` : formatCurrency(voucher.discount_amount)}</p>
                        ${voucher.minimum_purchase ? `<p>🛒 Min. pembelian: ${formatCurrency(voucher.minimum_purchase)}</p>` : ''}
                        ${voucher.maximum_discount && voucher.discount_type === 'percentage' ? `<p>📊 Max. diskon: ${formatCurrency(voucher.maximum_discount)}</p>` : ''}
                        ${voucher.usage_limit ? `<p>📈 Digunakan: ${voucher.used_count}/${voucher.usage_limit}</p>` : `<p>📈 Digunakan: ${voucher.used_count} kali</p>`}
                        ${voucher.valid_until ? `<p>⏰ Berlaku sampai: ${new Date(voucher.valid_until).toLocaleDateString('id-ID')}</p>` : ''}
                    </div>
                </div>
                
                <div class="flex items-center space-x-3">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" ${voucher.is_active ? 'checked' : ''} 
                               onchange="toggleVoucherStatus(${voucher.id})"
                               class="sr-only">
                        <div class="relative">
                            <div class="w-10 h-6 rounded-full transition-colors ${voucher.is_active ? 'bg-green-500' : 'bg-slate-300'}"></div>
                            <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${voucher.is_active ? 'translate-x-4' : 'translate-x-0'}"></div>
                        </div>
                    </label>
                    
                    <button onclick="deleteVoucher(${voucher.id}, '${voucher.code}')" 
                            class="text-red-600 hover:text-red-800 p-1 rounded">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderSettingsTab() {
    return `
        <div class="space-y-8">
            <!-- QRIS Settings -->
            <div class="bg-white border border-slate-200 rounded-lg p-6">
                <h4 class="text-lg font-semibold text-slate-800 mb-4">💳 Pengaturan QRIS</h4>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Upload Gambar QRIS</label>
                        <input type="file" id="qris-upload" accept="image/*"
                               class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500">
                        <p class="text-xs text-slate-500 mt-1">Format: JPG, PNG, WEBP (Max: 5MB)</p>
                        
                        <button onclick="saveQRIS()" id="save-qris-btn"
                                class="mt-3 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
                            💾 Simpan QRIS
                        </button>
                    </div>
                    
                    <div class="text-center">
                        <p class="text-sm font-medium text-slate-700 mb-3">QRIS Saat Ini:</p>
                        <div class="border border-slate-200 rounded-lg p-4 bg-slate-50">
                            ${appState.settings.qris_image_url ? `
                                <img src="${appState.settings.qris_image_url}" 
                                     alt="QRIS Code" 
                                     class="max-w-full h-auto max-h-64 mx-auto rounded-lg">
                            ` : `
                                <div class="text-slate-400 py-8">
                                    <div class="text-4xl mb-2">📱</div>
                                    <p>Belum ada QRIS</p>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- WhatsApp Settings -->
            <div class="bg-white border border-slate-200 rounded-lg p-6">
                <h4 class="text-lg font-semibold text-slate-800 mb-4">📱 Pengaturan WhatsApp</h4>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Nomor WhatsApp</label>
                        <input type="tel" id="whatsapp-number" 
                               value="${appState.settings.whatsapp_number || ''}"
                               class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                               placeholder="62812XXXXXXXX">
                        <p class="text-xs text-slate-500 mt-1">Gunakan format internasional (62xxx)</p>
                        
                        <button onclick="saveWhatsApp()" id="save-whatsapp-btn"
                                class="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                            💾 Simpan Nomor WA
                        </button>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Template Pesan</label>
                        <textarea id="whatsapp-template" rows="4"
                                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                  placeholder="Halo, saya ingin konfirmasi pesanan...">${appState.settings.whatsapp_message_template || ''}</textarea>
                        <p class="text-xs text-slate-500 mt-1">Gunakan %ORDER_DETAILS% untuk detail pesanan otomatis</p>
                    </div>
                </div>
            </div>
            
            <!-- Store Info Settings -->
            <div class="bg-white border border-slate-200 rounded-lg p-6">
                <h4 class="text-lg font-semibold text-slate-800 mb-4">🏪 Informasi Toko</h4>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Nama Toko</label>
                        <input type="text" id="store-name" 
                               value="${appState.settings.store_name || 'TokoProfesional'}"
                               class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Email Toko</label>
                        <input type="email" id="store-email" 
                               value="${appState.settings.store_email || ''}"
                               class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                               placeholder="kontak@tokoprofesional.com">
                    </div>
                    
                    <div class="lg:col-span-2">
                        <label class="block text-sm font-medium text-slate-700 mb-2">Alamat Toko</label>
                        <textarea id="store-address" rows="3"
                                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                  placeholder="Jl. Contoh No. 123, Jakarta">${appState.settings.store_address || ''}</textarea>
                    </div>
                    
                    <div class="lg:col-span-2">
                        <button onclick="saveStoreInfo()" id="save-store-btn"
                                class="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
                            💾 Simpan Informasi Toko
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Promo Media Settings -->
            <div class="bg-white border border-slate-200 rounded-lg p-6">
                <h4 class="text-lg font-semibold text-slate-800 mb-4">🎬 Media Promosi</h4>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Upload Media Promosi</label>
                        <input type="file" id="promo-upload" accept="image/*,video/mp4,video/webm"
                               class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500">
                        <p class="text-xs text-slate-500 mt-1">Format: JPG, PNG, MP4, WEBM (Max: 10MB)</p>
                        
                        <div class="flex space-x-2 mt-3">
                            <button onclick="savePromoMedia()" id="save-promo-btn"
                                    class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                                💾 Simpan Media
                            </button>
                            <button onclick="deletePromoMedia()" id="delete-promo-btn"
                                    class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                🗑️ Hapus Media
                            </button>
                        </div>
                    </div>
                    
                    <div class="text-center">
                        <p class="text-sm font-medium text-slate-700 mb-3">Media Promosi Saat Ini:</p>
                        <div class="border border-slate-200 rounded-lg p-4 bg-slate-50">
                            ${appState.settings.promo_media_url ? `
                                ${appState.settings.promo_media_type === 'video' ? `
                                    <video src="${appState.settings.promo_media_url}" 
                                           class="max-w-full h-auto max-h-64 mx-auto rounded-lg" 
                                           controls muted>
                                        Browser Anda tidak mendukung video.
                                    </video>
                                ` : `
                                    <img src="${appState.settings.promo_media_url}" 
                                         alt="Promo Media" 
                                         class="max-w-full h-auto max-h-64 mx-auto rounded-lg">
                                `}
                            ` : `
                                <div class="text-slate-400 py-8">
                                    <div class="text-4xl mb-2">🎬</div>
                                    <p>Belum ada media promosi</p>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderCheckoutView() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    const cartItems = Object.keys(appState.cart).map(productId => {
        const product = appState.products.find(p => p.id == productId);
        return product ? { ...product, quantity: appState.cart[productId] } : null;
    }).filter(Boolean);
    
    if (cartItems.length === 0) {
        mainContent.innerHTML = `
            <div class="text-center py-12 animate-fade-in">
                <div class="text-6xl mb-4">🛒</div>
                <h2 class="text-2xl font-bold text-slate-800 mb-4">Keranjang Kosong</h2>
                <p class="text-slate-600 mb-6">Tambahkan produk ke keranjang untuk melanjutkan checkout</p>
                <button onclick="switchToHome()" class="bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition-colors">
                    🏠 Kembali Berbelanja
                </button>
            </div>
        `;
        return;
    }
    
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = appState.appliedVoucher ? 
        (appState.appliedVoucher.discount_type === 'percentage' ? 
            Math.min(subtotal * appState.appliedVoucher.discount_amount / 100, appState.appliedVoucher.maximum_discount || subtotal) :
            appState.appliedVoucher.discount_amount) : 0;
    const total = Math.max(0, subtotal - discount);
    
    mainContent.innerHTML = `
        <div class="max-w-7xl mx-auto animate-fade-in">
            <!-- Checkout Header -->
            <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-3xl font-bold text-slate-800 mb-2">💳 Checkout</h2>
                        <p class="text-slate-600">Konfirmasi pesanan dan lakukan pembayaran</p>
                    </div>
                    <button onclick="switchToHome()" class="text-slate-600 hover:text-slate-800 p-2 rounded-lg">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>
            
            <!-- Main Checkout Content -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Left Column: Order Summary & Customer Info -->
                <div class="space-y-6">
                    <!-- Order Summary -->
                    <div class="bg-white rounded-xl shadow-lg p-6">
                        <h3 class="text-xl font-semibold text-slate-800 mb-6">📋 Ringkasan Pesanan</h3>
                        
                        <div class="space-y-4 mb-6">
                            ${cartItems.map(item => `
                                <div class="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                                    <img src="${item.image_url || 'https://placehold.co/80x80'}" 
                                         alt="${item.name}" 
                                         class="w-16 h-16 rounded-lg object-cover">
                                    <div class="flex-1">
                                        <h4 class="font-semibold text-slate-800">${item.name}</h4>
                                        <p class="text-sm text-slate-600">${formatCurrency(item.price)} x ${item.quantity}</p>
                                    </div>
                                    <div class="text-right">
                                        <p class="font-semibold text-slate-800">${formatCurrency(item.price * item.quantity)}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <!-- Order Totals -->
                        <div class="border-t border-slate-200 pt-4 space-y-2">
                            <div class="flex justify-between text-slate-600">
                                <span>Subtotal (${cartItems.length} item${cartItems.length > 1 ? 's' : ''})</span>
                                <span>${formatCurrency(subtotal)}</span>
                            </div>
                            ${appState.appliedVoucher ? `
                                <div class="flex justify-between text-green-600">
                                    <span>Diskon (${appState.appliedVoucher.code})</span>
                                    <span>-${formatCurrency(discount)}</span>
                                </div>
                            ` : ''}
                            <div class="border-t border-slate-200 pt-2 flex justify-between text-lg font-bold">
                                <span>Total Pembayaran</span>
                                <span class="text-slate-800">${formatCurrency(total)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Customer Info Form -->
                    <div class="bg-white rounded-xl shadow-lg p-6">
                        <h4 class="text-xl font-semibold text-slate-800 mb-4">👤 Informasi Pelanggan</h4>
                        <form id="customer-form" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Nama Lengkap *</label>
                                <input type="text" id="customer-name" required
                                       class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500">
                            </div>
                        </form>
                    </div>
                </div>
                
                <!-- Right Column: Payment Section -->
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h3 class="text-xl font-semibold text-slate-800 mb-6">💳 Pembayaran</h3>
                    
                    <!-- Payment Instructions -->
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h4 class="font-semibold text-blue-800 mb-2 flex items-center">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                            </svg>
                            📱 Cara Pembayaran QRIS
                        </h4>
                        <ol class="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                            <li>Buka aplikasi pembayaran (GoPay, OVO, Dana, ShopeePay, dll)</li>
                            <li>Pilih menu <strong>Scan QR</strong> atau <strong>Bayar</strong></li>
                            <li>Arahkan kamera ke kode QR di bawah</li>
                            <li>Pastikan nominal sesuai dengan total pesanan</li>
                            <li>Konfirmasi pembayaran</li>
                            <li>Klik tombol konfirmasi setelah berhasil bayar</li>
                        </ol>
                    </div>
                    
                    <!-- QRIS Code -->
                    <div class="text-center mb-6">
                        ${appState.settings.qris_image_url ? `
                            <div class="inline-block bg-white p-4 rounded-xl shadow-lg border border-slate-200">
                                <img src="${appState.settings.qris_image_url}" 
                                     alt="QRIS Code" 
                                     class="w-64 h-64 mx-auto rounded-lg">
                                <p class="text-sm text-slate-600 mt-3">Scan QR Code untuk pembayaran</p>
                            </div>
                        ` : `
                            <div class="bg-slate-100 p-12 rounded-xl">
                                <div class="text-slate-400 text-center">
                                    <div class="text-6xl mb-4">📱</div>
                                    <h4 class="text-lg font-semibold mb-2">QRIS Belum Tersedia</h4>
                                    <p class="text-sm">Admin belum mengatur metode pembayaran QRIS</p>
                                </div>
                            </div>
                        `}
                    </div>
                    
                    <!-- Payment Amount Display -->
                    <div class="bg-slate-800 text-white rounded-lg p-4 text-center mb-6">
                        <p class="text-sm opacity-80 mb-1">Total yang harus dibayar:</p>
                        <p class="text-2xl font-bold">${formatCurrency(total)}</p>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="space-y-3">
                        ${appState.settings.qris_image_url ? `
                            <button onclick="confirmPayment()" id="confirm-payment-btn"
                                    class="w-full bg-green-500 text-white py-4 rounded-lg hover:bg-green-600 transition-colors font-semibold text-lg flex items-center justify-center">
                                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                ✅ Sudah Bayar? Konfirmasi Pesanan
                            </button>
                        ` : ''}
                        
                        <button onclick="switchToHome()" 
                                class="w-full bg-slate-200 text-slate-700 py-3 rounded-lg hover:bg-slate-300 transition-colors flex items-center justify-center">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                            </svg>
                            ← Kembali Berbelanja
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// =====================================
// ADMIN FUNCTIONS
// =====================================

function switchAdminTab(tab) {
    // Prevent tab switching if currently editing
    if (appState.isEditing && tab !== currentAdminTab) {
        showToast('Selesaikan editing terlebih dahulu sebelum pindah tab', 'warning');
        return;
    }
    
    currentAdminTab = tab;
    
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(btn => {
        btn.classList.remove('active', 'border-slate-800', 'text-slate-800');
        btn.classList.add('border-transparent', 'text-slate-600');
    });
    
    const activeTab = document.getElementById(`tab-${tab}`);
    if (activeTab) {
        activeTab.classList.add('active', 'border-slate-800', 'text-slate-800');
        activeTab.classList.remove('border-transparent', 'text-slate-600');
    }
    
    // Update content
    const adminContent = document.getElementById('admin-content');
    if (!adminContent) return;
    
    switch(tab) {
        case 'products':
            adminContent.innerHTML = renderProductsTab();
            break;
        case 'vouchers':
            adminContent.innerHTML = renderVouchersTab();
            break;
        case 'settings':
            adminContent.innerHTML = renderSettingsTab();
            break;
    }
}

// Product Management Functions
function showAddProductForm() {
    appState.isEditing = true;
    appState.preventAutoRefresh = true;
    
    const container = document.getElementById('product-form-container');
    const title = document.getElementById('form-title');
    const form = document.getElementById('product-form');
    
    if (container && title && form) {
        container.classList.remove('hidden');
        title.textContent = 'Tambah Produk Baru';
        form.reset();
        document.getElementById('product-id').value = '';
    }
}

function hideProductForm() {
    appState.isEditing = false;
    appState.preventAutoRefresh = false;
    appState.currentEditingId = null;
    
    const container = document.getElementById('product-form-container');
    if (container) {
        container.classList.add('hidden');
    }
}

function editProduct(productId) {
    const product = appState.products.find(p => p.id === productId);
    if (!product) return;
    
    appState.isEditing = true;
    appState.preventAutoRefresh = true;
    appState.currentEditingId = productId;
    
    const container = document.getElementById('product-form-container');
    const title = document.getElementById('form-title');
    
    if (container && title) {
        container.classList.remove('hidden');
        title.textContent = 'Edit Produk';
        
        // Fill form with product data
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-description').value = product.description || '';
        
        // Show current image
        const preview = document.getElementById('image-preview');
        if (preview && product.image_url) {
            preview.innerHTML = `
                <div class="mt-2">
                    <p class="text-sm text-slate-600 mb-2">Gambar saat ini:</p>
                    <img src="${product.image_url}" alt="Current image" class="w-24 h-24 object-cover rounded-lg">
                </div>
            `;
        }
    }
}

async function saveProduct(event) {
    event.preventDefault();
    
    const btn = document.getElementById('save-product-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Menyimpan...';
    btn.disabled = true;
    
    try {
        const productId = document.getElementById('product-id').value;
        const name = document.getElementById('product-name').value;
        const price = parseInt(document.getElementById('product-price').value);
        const description = document.getElementById('product-description').value;
        const imageFile = document.getElementById('product-image').files[0];
        
        let imageUrl = null;
        
        // Upload image if provided
        if (imageFile) {
            const imagePath = `products/${Date.now()}-${imageFile.name}`;
            imageUrl = await uploadFile(imageFile, imagePath);
            
            if (!imageUrl) {
                throw new Error('Gagal mengupload gambar');
            }
        } else if (productId) {
            // Keep existing image for edit
            const existingProduct = appState.products.find(p => p.id == productId);
            imageUrl = existingProduct?.image_url;
        }
        
        const productData = {
            name,
            price,
            description,
            ...(imageUrl && { image_url: imageUrl })
        };
        
        let result;
        if (productId) {
            // Update existing product
            result = await supabaseClient
                .from('products')
                .update(productData)
                .eq('id', productId)
                .select()
                .single();
        } else {
            // Create new product
            if (!imageUrl) {
                throw new Error('Gambar produk wajib untuk produk baru');
            }
            
            result = await supabaseClient
                .from('products')
                .insert([productData])
                .select()
                .single();
        }
        
        if (result.error) throw result.error;
        
        // Update local state
        if (productId) {
            const index = appState.products.findIndex(p => p.id == productId);
            if (index !== -1) {
                appState.products[index] = result.data;
            }
        } else {
            appState.products.unshift(result.data);
        }
        
        hideProductForm();
        switchAdminTab('products'); // Refresh products tab
        showToast(`Produk ${productId ? 'diperbarui' : 'ditambahkan'} berhasil!`, 'success');
        
    } catch (error) {
        console.error('❌ Save product error:', error);
        showToast(`Gagal menyimpan produk: ${error.message}`, 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

async function toggleProductStatus(productId) {
    try {
        const product = appState.products.find(p => p.id === productId);
        if (!product) return;
        
        const newStatus = !product.is_available;
        
        const { error } = await supabaseClient
            .from('products')
            .update({ is_available: newStatus })
            .eq('id', productId);
            
        if (error) throw error;
        
        // Update local state
        product.is_available = newStatus;
        
        showToast(`Produk ${newStatus ? 'diaktifkan' : 'dinonaktifkan'} berhasil!`, 'success');
        
    } catch (error) {
        console.error('❌ Toggle product status error:', error);
        showToast('Gagal mengubah status produk', 'error');
        
        // Revert toggle
        setTimeout(() => {
            if (!appState.preventAutoRefresh) {
                switchAdminTab('products');
            }
        }, 100);
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
        
        // Update local state
        appState.products = appState.products.filter(p => p.id !== productId);
        
        switchAdminTab('products'); // Refresh products tab
        showToast('Produk berhasil dihapus!', 'success');
        
    } catch (error) {
        console.error('❌ Delete product error:', error);
        showToast('Gagal menghapus produk', 'error');
    }
}

// Voucher Management Functions
function toggleDiscountInput() {
    const voucherType = document.getElementById('voucher-type').value;
    const maxDiscountContainer = document.getElementById('max-discount-container');
    const voucherAmount = document.getElementById('voucher-amount');
    
    if (voucherType === 'percentage') {
        maxDiscountContainer.classList.remove('hidden');
        voucherAmount.placeholder = '10';
        voucherAmount.max = '100';
    } else {
        maxDiscountContainer.classList.add('hidden');
        voucherAmount.placeholder = '50000';
        voucherAmount.removeAttribute('max');
    }
}

async function saveVoucher(event) {
    event.preventDefault();
    
    const btn = document.getElementById('save-voucher-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Membuat...';
    btn.disabled = true;
    
    try {
        const code = document.getElementById('voucher-code').value.toUpperCase();
        const discountType = document.getElementById('voucher-type').value;
        const discountAmount = parseFloat(document.getElementById('voucher-amount').value);
        const minimumPurchase = document.getElementById('voucher-minimum').value ? 
            parseFloat(document.getElementById('voucher-minimum').value) : null;
        const maximumDiscount = document.getElementById('voucher-max-discount').value ? 
            parseFloat(document.getElementById('voucher-max-discount').value) : null;
        const usageLimit = document.getElementById('voucher-limit').value ? 
            parseInt(document.getElementById('voucher-limit').value) : null;
        const validFrom = document.getElementById('voucher-start').value ? 
            new Date(document.getElementById('voucher-start').value).toISOString() : null;
        const validUntil = document.getElementById('voucher-end').value ? 
            new Date(document.getElementById('voucher-end').value).toISOString() : null;
        const description = document.getElementById('voucher-description').value;
        
        const voucherData = {
            code,
            discount_type: discountType,
            discount_amount: discountAmount,
            minimum_purchase: minimumPurchase,
            maximum_discount: maximumDiscount,
            usage_limit: usageLimit,
            valid_from: validFrom,
            valid_until: validUntil,
            description
        };
        
        const { data, error } = await supabaseClient
            .from('vouchers')
            .insert([voucherData])
            .select()
            .single();
            
        if (error) throw error;
        
        // Update local state
        appState.vouchers.unshift(data);
        
        // Reset form
        document.getElementById('voucher-form').reset();
        toggleDiscountInput(); // Reset discount input display
        
        switchAdminTab('vouchers'); // Refresh vouchers tab
        showToast(`Voucher ${code} berhasil dibuat!`, 'success');
        
    } catch (error) {
        console.error('❌ Save voucher error:', error);
        showToast(`Gagal membuat voucher: ${error.message}`, 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

async function toggleVoucherStatus(voucherId) {
    try {
        const voucher = appState.vouchers.find(v => v.id === voucherId);
        if (!voucher) return;
        
        const newStatus = !voucher.is_active;
        
        const { error } = await supabaseClient
            .from('vouchers')
            .update({ is_active: newStatus })
            .eq('id', voucherId);
            
        if (error) throw error;
        
        // Update local state
        voucher.is_active = newStatus;
        
        showToast(`Voucher ${newStatus ? 'diaktifkan' : 'dinonaktifkan'} berhasil!`, 'success');
        
    } catch (error) {
        console.error('❌ Toggle voucher status error:', error);
        showToast('Gagal mengubah status voucher', 'error');
        
        // Revert toggle
        setTimeout(() => {
            if (!appState.preventAutoRefresh) {
                switchAdminTab('vouchers');
            }
        }, 100);
    }
}

async function deleteVoucher(voucherId, voucherCode) {
    if (!confirm(`Apakah Anda yakin ingin menghapus voucher "${voucherCode}"?`)) return;
    
    try {
        const { error } = await supabaseClient
            .from('vouchers')
            .delete()
            .eq('id', voucherId);
            
        if (error) throw error;
        
        // Update local state
        appState.vouchers = appState.vouchers.filter(v => v.id !== voucherId);
        
        switchAdminTab('vouchers'); // Refresh vouchers tab
        showToast('Voucher berhasil dihapus!', 'success');
        
    } catch (error) {
        console.error('❌ Delete voucher error:', error);
        showToast('Gagal menghapus voucher', 'error');
    }
}

// Settings Management Functions
async function saveQRIS() {
    const btn = document.getElementById('save-qris-btn');
    const fileInput = document.getElementById('qris-upload');
    const file = fileInput.files[0];
    
    if (!file) {
        showToast('Pilih file QRIS terlebih dahulu', 'error');
        return;
    }
    
    const originalText = btn.textContent;
    btn.textContent = 'Mengupload...';
    btn.disabled = true;
    
    try {
        const qrisPath = `qris/${Date.now()}-${file.name}`;
        const qrisUrl = await uploadFile(file, qrisPath);
        
        if (!qrisUrl) {
            throw new Error('Gagal mengupload gambar QRIS');
        }
        
        const { error } = await supabaseClient
            .from('settings')
            .upsert({ 
                id: 1, 
                qris_image_url: qrisUrl 
            });
            
        if (error) throw error;
        
        // Update local state
        appState.settings.qris_image_url = qrisUrl;
        
        // Reset file input and refresh display
        fileInput.value = '';
        if (!appState.preventAutoRefresh) {
            switchAdminTab('settings');
        }
        
        showToast('QRIS berhasil diperbarui!', 'success');
        
    } catch (error) {
        console.error('❌ Save QRIS error:', error);
        showToast(`Gagal menyimpan QRIS: ${error.message}`, 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

async function saveWhatsApp() {
    const btn = document.getElementById('save-whatsapp-btn');
    const whatsappNumber = document.getElementById('whatsapp-number').value.trim();
    const whatsappTemplate = document.getElementById('whatsapp-template').value.trim();
    
    const originalText = btn.textContent;
    btn.textContent = 'Menyimpan...';
    btn.disabled = true;
    
    try {
        const { error } = await supabaseClient
            .from('settings')
            .upsert({ 
                id: 1, 
                whatsapp_number: whatsappNumber,
                whatsapp_message_template: whatsappTemplate || 'Halo, saya ingin konfirmasi pesanan:'
            });
            
        if (error) throw error;
        
        // Update local state
        appState.settings.whatsapp_number = whatsappNumber;
        appState.settings.whatsapp_message_template = whatsappTemplate;
        
        showToast('Pengaturan WhatsApp berhasil disimpan!', 'success');
        
    } catch (error) {
        console.error('❌ Save WhatsApp error:', error);
        showToast(`Gagal menyimpan WhatsApp: ${error.message}`, 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

async function saveStoreInfo() {
    const btn = document.getElementById('save-store-btn');
    const storeName = document.getElementById('store-name').value.trim();
    const storeEmail = document.getElementById('store-email').value.trim();
    const storeAddress = document.getElementById('store-address').value.trim();
    
    const originalText = btn.textContent;
    btn.textContent = 'Menyimpan...';
    btn.disabled = true;
    
    try {
        const { error } = await supabaseClient
            .from('settings')
            .upsert({ 
                id: 1, 
                store_name: storeName,
                store_email: storeEmail,
                store_address: storeAddress
            });
            
        if (error) throw error;
        
        // Update local state
        appState.settings.store_name = storeName;
        appState.settings.store_email = storeEmail;
        appState.settings.store_address = storeAddress;
        
        showToast('Informasi toko berhasil disimpan!', 'success');
        
    } catch (error) {
        console.error('❌ Save store info error:', error);
        showToast(`Gagal menyimpan informasi toko: ${error.message}`, 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

async function savePromoMedia() {
    const btn = document.getElementById('save-promo-btn');
    const fileInput = document.getElementById('promo-upload');
    const file = fileInput.files[0];
    
    if (!file) {
        showToast('Pilih file media promosi terlebih dahulu', 'error');
        return;
    }
    
    const originalText = btn.textContent;
    btn.textContent = 'Mengupload...';
    btn.disabled = true;
    
    try {
        const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
        const promoPath = `promo/${Date.now()}-${file.name}`;
        const promoUrl = await uploadFile(file, promoPath);
        
        if (!promoUrl) {
            throw new Error('Gagal mengupload media promosi');
        }
        
        const { error } = await supabaseClient
            .from('settings')
            .upsert({ 
                id: 1, 
                promo_media_url: promoUrl,
                promo_media_type: mediaType
            });
            
        if (error) throw error;
        
        // Update local state
        appState.settings.promo_media_url = promoUrl;
        appState.settings.promo_media_type = mediaType;
        
        // Reset file input and refresh display
        fileInput.value = '';
        if (!appState.preventAutoRefresh) {
            switchAdminTab('settings');
        }
        
        showToast('Media promosi berhasil diperbarui!', 'success');
        
    } catch (error) {
        console.error('❌ Save promo media error:', error);
        showToast(`Gagal menyimpan media promosi: ${error.message}`, 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

async function deletePromoMedia() {
    if (!confirm('Apakah Anda yakin ingin menghapus media promosi?')) return;
    
    const btn = document.getElementById('delete-promo-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Menghapus...';
    btn.disabled = true;
    
    try {
        const { error } = await supabaseClient
            .from('settings')
            .upsert({ 
                id: 1, 
                promo_media_url: null,
                promo_media_type: null
            });
            
        if (error) throw error;
        
        // Update local state
        appState.settings.promo_media_url = null;
        appState.settings.promo_media_type = null;
        
        if (!appState.preventAutoRefresh) {
            switchAdminTab('settings');
        }
        showToast('Media promosi berhasil dihapus!', 'success');
        
    } catch (error) {
        console.error('❌ Delete promo media error:', error);
        showToast('Gagal menghapus media promosi', 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// =====================================
// CHECKOUT FUNCTIONS
// =====================================

async function confirmPayment() {
    const customerName = document.getElementById('customer-name').value.trim();
    
    if (!customerName) {
        showToast('Mohon lengkapi nama', 'error');
        return;
    }
    
    try {
        const cartItems = Object.keys(appState.cart).map(productId => {
            const product = appState.products.find(p => p.id == productId);
            return product ? { ...product, quantity: appState.cart[productId] } : null;
        }).filter(Boolean);
        
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = appState.appliedVoucher ? 
            (appState.appliedVoucher.discount_type === 'percentage' ? 
                Math.min(subtotal * appState.appliedVoucher.discount_amount / 100, appState.appliedVoucher.maximum_discount || subtotal) :
                appState.appliedVoucher.discount_amount) : 0;
        const total = Math.max(0, subtotal - discount);
        
        // Create WhatsApp message
        let message = `Halo ${appState.settings.store_name || 'TokoProfesional'},\n\n`;
        message += `Saya ingin konfirmasi pembayaran untuk pesanan:\n\n`;
        message += `👤 *Detail Pelanggan:*\n`;
        message += `Nama: ${customerName}\n`;
        message += `\n📦 *Detail Pesanan:*\n`;
        
        cartItems.forEach((item, index) => {
            message += `${index + 1}. ${item.name}\n`;
            message += `   ${formatCurrency(item.price)} x ${item.quantity} = ${formatCurrency(item.price * item.quantity)}\n`;
        });
        
        message += `\n💰 *Rincian Pembayaran:*\n`;
        message += `Subtotal: ${formatCurrency(subtotal)}\n`;
        if (discount > 0) {
            message += `Diskon (${appState.appliedVoucher.code}): -${formatCurrency(discount)}\n`;
        }
        message += `*Total: ${formatCurrency(total)}*\n\n`;
        message += `Saya sudah melakukan pembayaran via QRIS. Mohon dikonfirmasi. Terima kasih! 🙏`;
        
        // Open WhatsApp
        const whatsappUrl = `https://wa.me/${appState.settings.whatsapp_number}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        
        // Update voucher usage if applied
        if (appState.appliedVoucher) {
            try {
                await supabaseClient
                    .from('vouchers')
                    .update({ used_count: appState.appliedVoucher.used_count + 1 })
                    .eq('id', appState.appliedVoucher.id);
            } catch (error) {
                console.error('❌ Error updating voucher usage:', error);
            }
        }
        
        // Clear cart and redirect
        appState.cart = {};
        appState.appliedVoucher = null;
        updateCartUI();
        
        showToast('Konfirmasi terkirim ke WhatsApp!', 'success');
        
        // Show success page
        setTimeout(() => {
            showOrderSuccess();
        }, 1500);
        
    } catch (error) {
        console.error('❌ Confirm payment error:', error);
        showToast('Gagal mengirim konfirmasi', 'error');
    }
}

function showOrderSuccess() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="max-w-md mx-auto text-center py-12 animate-fade-in">
            <div class="bg-white rounded-xl shadow-lg p-8">
                <div class="text-6xl mb-4">✅</div>
                <h2 class="text-2xl font-bold text-slate-800 mb-4">Pesanan Terkirim!</h2>
                <p class="text-slate-600 mb-6">
                    Konfirmasi pesanan Anda telah dikirim via WhatsApp. 
                    Admin akan segera memproses pesanan Anda.
                </p>
                
                <div class="space-y-3">
                    <button onclick="switchToHome()" 
                            class="w-full bg-slate-800 text-white py-3 rounded-lg hover:bg-slate-700 transition-colors">
                        🏠 Kembali Berbelanja
                    </button>
                    
                    <div class="text-sm text-slate-500">
                        <p>📱 Pantau WhatsApp Anda untuk update pesanan</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// =====================================
// SEARCH AND NAVIGATION FUNCTIONS
// =====================================

function getSearchQuery() {
    const searchInput = document.getElementById('search-input');
    return searchInput ? searchInput.value : '';
}

function handleSearch() {
    if (appState.view === 'home') {
        renderCurrentView();
    }
}

function handleSortChange() {
    const sortSelect = document.getElementById('sort-select');
    if (!sortSelect) return;
    
    const sortBy = sortSelect.value;
    let sortedProducts = [...appState.products];
    
    switch(sortBy) {
        case 'price-low':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default: // newest
            sortedProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    appState.products = sortedProducts;
    renderCurrentView();
}

function switchToHome() {
    appState.view = 'home';
    appState.isEditing = false;
    appState.preventAutoRefresh = false;
    renderCurrentView();
}

function switchToAdmin() {
    appState.view = 'admin';
    renderCurrentView();
}

function viewProductDetail(productId) {
    appState.selectedProductId = productId;
    appState.view = 'product-detail';
    renderCurrentView();
}

function renderProductDetailView() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    const product = appState.products.find(p => p.id == appState.selectedProductId);
    if (!product) {
        switchToHome();
        return;
    }
    
    mainContent.innerHTML = `
        <div class="max-w-4xl mx-auto animate-fade-in">
            <!-- Back Button -->
            <button onclick="switchToHome()" 
                    class="mb-6 flex items-center text-slate-600 hover:text-slate-800 transition-colors">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Kembali ke Produk
            </button>
            
            <!-- Product Detail -->
            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                <div class="grid grid-cols-1 lg:grid-cols-2">
                    <!-- Product Image -->
                    <div class="aspect-w-1 aspect-h-1">
                        <img src="${product.image_url || 'https://placehold.co/500x500'}" 
                             alt="${product.name}" 
                             class="w-full h-96 lg:h-full object-cover">
                    </div>
                    
                    <!-- Product Info -->
                    <div class="p-8">
                        <div class="mb-4">
                            <span class="inline-block px-3 py-1 text-xs font-medium rounded-full ${
                                product.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }">
                                ${product.is_available ? '✅ Tersedia' : '❌ Stok Habis'}
                            </span>
                        </div>
                        
                        <h1 class="text-3xl font-bold text-slate-800 mb-4">${product.name}</h1>
                        
                        <div class="text-3xl font-bold text-slate-800 mb-6">
                            ${formatCurrency(product.price)}
                        </div>
                        
                        <div class="prose prose-slate mb-8">
                            <p class="text-slate-600 leading-relaxed">
                                ${product.description || 'Tidak ada deskripsi tersedia untuk produk ini.'}
                            </p>
                        </div>
                        
                        <!-- Product Actions -->
                        <div class="space-y-4">
                            <button onclick="addToCart(${product.id})" 
                                    ${!product.is_available ? 'disabled' : ''}
                                    class="w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
                                        product.is_available 
                                            ? 'bg-slate-800 text-white hover:bg-slate-700 hover:shadow-lg' 
                                            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                    }">
                                ${product.is_available ? '🛒 Tambah ke Keranjang' : '❌ Stok Habis'}
                            </button>
                            
                            <button onclick="openCart()" 
                                    class="w-full py-3 px-6 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                                👀 Lihat Keranjang
                            </button>
                        </div>
                        
                        <!-- Product Features -->
                        <div class="mt-8 pt-8 border-t border-slate-200">
                            <h3 class="font-semibold text-slate-800 mb-4">Mengapa memilih produk kami?</h3>
                            <div class="space-y-3 text-sm text-slate-600">
                                <div class="flex items-center">
                                    <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                    </svg>
                                    Kualitas premium terjamin
                                </div>
                                <div class="flex items-center">
                                    <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                    </svg>
                                    Pengiriman cepat & aman
                                </div>
                                <div class="flex items-center">
                                    <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                    </svg>
                                    Pembayaran mudah dengan QRIS
                                </div>
                                <div class="flex items-center">
                                    <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                    </svg>
                                    Customer service responsif
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// =====================================
// PROMO POPUP FUNCTIONS
// =====================================

function showPromoPopup() {
    if (appState.settings.promo_media_url && !sessionStorage.getItem('promoShown')) {
        const promoPopup = document.getElementById('promo-popup');
        const promoContainer = document.getElementById('promo-media-container');
        
        if (promoPopup && promoContainer) {
            if (appState.settings.promo_media_type === 'video') {
                promoContainer.innerHTML = `
                    <video src="${appState.settings.promo_media_url}" 
                           class="w-full h-full object-cover rounded-lg" 
                           controls muted>
                        Browser Anda tidak mendukung video.
                    </video>
                `;
            } else {
                promoContainer.innerHTML = `
                    <img src="${appState.settings.promo_media_url}" 
                         alt="Promosi" 
                         class="w-full h-full object-cover rounded-lg">
                `;
            }
            
            promoPopup.classList.remove('hidden');
        }
    }
}

// =====================================
// EVENT LISTENERS SETUP
// =====================================

function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Cart button
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', openCart);
    }
    
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
    
    const footerHomeBtn = document.getElementById('footer-home-btn');
    if (footerHomeBtn) {
        footerHomeBtn.addEventListener('click', switchToHome);
    }
    
    const footerAdminBtn = document.getElementById('footer-admin-btn');
    if (footerAdminBtn) {
        footerAdminBtn.addEventListener('click', switchToAdmin);
    }
    
    // Close cart
    const closeCartBtn = document.getElementById('close-cart-btn');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', closeCart);
    }
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
    
    // Apply voucher button  
    const applyVoucherBtn = document.getElementById('apply-voucher-btn');
    if (applyVoucherBtn) {
        applyVoucherBtn.addEventListener('click', applyVoucher);
    }
    
    // Promo popup close
    const skipPromoBtn = document.getElementById('skip-promo-btn');
    if (skipPromoBtn) {
        skipPromoBtn.addEventListener('click', () => {
            document.getElementById('promo-popup').classList.add('hidden');
            sessionStorage.setItem('promoShown', 'true');
        });
    }
    
    // Document click handlers
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('submit', handleFormSubmit);
    document.addEventListener('change', handleInputChange);
    
    // Prevent page visibility refresh during editing
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible' && appState.isEditing) {
            console.log('Page visible but editing in progress, preventing refresh');
            // Don't auto refresh when editing
        }
    });
}

function handleDocumentClick(event) {
    // Handle dynamic button clicks
    const target = event.target;
    
    // Prevent default for non-form elements
    if (target.tagName === 'BUTTON' && target.type !== 'submit') {
        event.preventDefault();
    }
}

function handleFormSubmit(event) {
    const form = event.target;
    
    if (form.id === 'login-form') {
        event.preventDefault();
        handleLoginSubmit(form);
    } else if (form.id === 'product-form') {
        event.preventDefault();
        saveProduct(event);
    } else if (form.id === 'voucher-form') {
        event.preventDefault();
        saveVoucher(event);
    } else if (form.id === 'customer-form') {
        event.preventDefault();
        // Customer form is handled by confirm payment button
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

function handleInputChange(event) {
    const input = event.target;
    
    // Handle image preview for file inputs
    if (input.type === 'file' && input.files[0]) {
        const file = input.files[0];
        const previewContainer = document.getElementById('image-preview');
        
        if (previewContainer) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewContainer.innerHTML = `
                    <div class="mt-2">
                        <p class="text-sm text-slate-600 mb-2">Preview:</p>
                        <img src="${e.target.result}" alt="Preview" class="w-24 h-24 object-cover rounded-lg">
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        }
    }
}

// =====================================
// GLOBAL FUNCTION EXPORTS
// =====================================

// Make functions available globally for onclick handlers
window.addToCart = addToCart;
window.updateCartQuantity = updateCartQuantity;
window.openCart = openCart;
window.closeCart = closeCart;
window.applyVoucher = applyVoucher;
window.proceedToCheckout = proceedToCheckout;
window.switchToHome = switchToHome;
window.switchToAdmin = switchToAdmin;
window.viewProductDetail = viewProductDetail;
window.logout = logout;
window.handleSearch = handleSearch;
window.handleSortChange = handleSortChange;
window.confirmPayment = confirmPayment;

// Admin functions
window.switchAdminTab = switchAdminTab;
window.showAddProductForm = showAddProductForm;
window.hideProductForm = hideProductForm;
window.editProduct = editProduct;
window.toggleProductStatus = toggleProductStatus;
window.deleteProduct = deleteProduct;
window.toggleDiscountInput = toggleDiscountInput;
window.toggleVoucherStatus = toggleVoucherStatus;
window.deleteVoucher = deleteVoucher;
window.saveQRIS = saveQRIS;
window.saveWhatsApp = saveWhatsApp;
window.saveStoreInfo = saveStoreInfo;
window.savePromoMedia = savePromoMedia;
window.deletePromoMedia = deletePromoMedia;

console.log("✅ Enhanced TokoProfesional loaded successfully!");
console.log("🎯 All features: Cart, Checkout, Admin Panel, Vouchers, Settings ready!");
console.log("🔧 Fixed: Auto refresh issue and removed product categories display!");

        
    
