// =====================================
// IMPROVED EMERGENCY APP.JS
// Emergency version + essential features
// =====================================

console.log("🚀 IMPROVED EMERGENCY VERSION - Starting...");

// Global state
let appState = {
    products: [],
    cart: {},
    user: null,
    vouchers: [],
    settings: {}
};

// Supabase client
let supabaseClient = null;

// Check Supabase availability
if (typeof supabase === 'undefined') {
    alert("ERROR: Supabase library tidak ditemukan!");
    showError("Supabase library missing");
} else {
    console.log("✅ Supabase library found");
    initImprovedApp();
}

async function initImprovedApp() {
    console.log("🔧 Initializing improved app...");
    
    try {
        // Initialize Supabase
        const { createClient } = supabase;
        supabaseClient = createClient(
            'https://viresxwhyqcflmfoyxsf.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpcmVzeHdoeXFjZmxtZm95eHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDU1MDMsImV4cCI6MjA2OTk4MTUwM30.MuR0PKP1Og3cF9wOjYbWGFQfo6rtsWvcoODgD1_boUQ'
        );
        console.log("✅ Supabase client created");
        
        // Load data
        await loadAllData();
        
        // Show products
        showProducts();
        
        // Setup auth listener
        supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('🔄 Auth changed:', event);
            appState.user = session?.user || null;
            
            if (event === 'SIGNED_IN') {
                showToast('Login successful!', 'success');
                setTimeout(() => showAdminPanel(), 1000);
            } else if (event === 'SIGNED_OUT') {
                showToast('Logged out successfully', 'info');
                showProducts();
            }
        });
        
    } catch (error) {
        console.error("❌ Initialization error:", error);
        showError(error.message);
    }
}

async function loadAllData() {
    console.log("📦 Loading all data...");
    
    try {
        // Load products
        const { data: products, error: productsError } = await supabaseClient
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (productsError) throw productsError;
        appState.products = products || [];
        console.log("✅ Products loaded:", appState.products.length);
        
        // Load settings
        const { data: settings, error: settingsError } = await supabaseClient
            .from('settings')
            .select('*')
            .eq('id', 1)
            .single();
            
        if (settingsError && settingsError.code !== 'PGRST116') {
            console.warn("⚠️ Settings error:", settingsError);
        } else {
            appState.settings = settings || {};
            console.log("✅ Settings loaded");
        }
        
        // Load vouchers
        const { data: vouchers, error: vouchersError } = await supabaseClient
            .from('vouchers')
            .select('*')
            .eq('is_active', true);
            
        if (vouchersError) {
            console.warn("⚠️ Vouchers error:", vouchersError);
        } else {
            appState.vouchers = vouchers || [];
            console.log("✅ Vouchers loaded:", appState.vouchers.length);
        }
        
    } catch (error) {
        console.error("❌ Data loading error:", error);
        throw error;
    }
}

function showProducts() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    const cartCount = Object.values(appState.cart).reduce((sum, qty) => sum + qty, 0);
    
    const html = `
        <div style="max-width: 1200px; margin: 0 auto; padding: 20px;">
            <!-- Header -->
            <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); margin-bottom: 30px; text-align: center;">
                <h1 style="font-size: 3rem; margin-bottom: 10px; color: #1e293b; display: flex; align-items: center; justify-content: center; gap: 15px;">
                    🛍️ TokoProfesional
                </h1>
                <p style="color: #64748b; font-size: 1.2rem; margin-bottom: 25px;">Found ${appState.products.length} products</p>
                
                <!-- Search & Controls -->
                <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 15px; margin-bottom: 20px;">
                    <input type="text" 
                           id="search-input" 
                           placeholder="🔍 Search products..." 
                           style="padding: 12px 20px; border: 2px solid #e2e8f0; border-radius: 25px; width: 300px; font-size: 14px; outline: none;"
                           onkeyup="filterProducts()">
                    
                    <select id="sort-select" 
                            style="padding: 12px 20px; border: 2px solid #e2e8f0; border-radius: 25px; font-size: 14px; outline: none;"
                            onchange="sortProducts()">
                        <option value="newest">🆕 Newest</option>
                        <option value="price_low">💰 Price: Low to High</option>
                        <option value="price_high">💸 Price: High to Low</option>
                        <option value="name">🔤 Name A-Z</option>
                    </select>
                </div>
                
                <!-- Action Buttons -->
                <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;">
                    <button onclick="openCart()" 
                            style="background: #1e293b; color: white; padding: 12px 24px; border: none; border-radius: 25px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px; position: relative;">
                        🛒 Cart
                        ${cartCount > 0 ? `<span style="background: #ef4444; color: white; font-size: 12px; padding: 2px 8px; border-radius: 50px; position: absolute; top: -5px; right: -5px;">${cartCount}</span>` : ''}
                    </button>
                    
                    <button onclick="showAdminLogin()" 
                            style="background: #8b5cf6; color: white; padding: 12px 24px; border: none; border-radius: 25px; cursor: pointer; font-weight: bold;">
                        🔐 Admin
                    </button>
                    
                    ${appState.user ? `
                        <button onclick="logout()" 
                                style="background: #ef4444; color: white; padding: 12px 24px; border: none; border-radius: 25px; cursor: pointer; font-weight: bold;">
                            🚪 Logout
                        </button>
                    ` : ''}
                    
                    <button onclick="showDebugInfo()" 
                            style="background: #10b981; color: white; padding: 12px 24px; border: none; border-radius: 25px; cursor: pointer; font-weight: bold;">
                        🔧 Debug
                    </button>
                </div>
            </div>
            
            <!-- Products Grid -->
            <div id="products-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 25px;">
                ${renderProductsGrid()}
            </div>
            
            <!-- Footer Info -->
            <div style="margin-top: 40px; padding: 25px; background: #f8fafc; border-radius: 15px; text-align: center;">
                <h3 style="color: #1e293b; margin-bottom: 15px;">🎯 TokoProfesional Features</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px;">
                    <div style="background: white; padding: 15px; border-radius: 10px;">
                        <strong>🛒 Smart Cart</strong><br>
                        <small>Real-time cart management</small>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 10px;">
                        <strong>🔍 Live Search</strong><br>
                        <small>Instant product filtering</small>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 10px;">
                        <strong>🔐 Admin Panel</strong><br>
                        <small>Complete management system</small>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 10px;">
                        <strong>📱 Mobile Ready</strong><br>
                        <small>Responsive design</small>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Cart Sidebar -->
        <div id="cart-sidebar" style="display: none; position: fixed; top: 0; right: 0; width: 400px; height: 100vh; background: white; box-shadow: -5px 0 20px rgba(0,0,0,0.2); z-index: 1000; overflow-y: auto;">
            <div style="padding: 20px; border-bottom: 2px solid #e2e8f0; display: flex; justify-content: between; align-items: center;">
                <h3 style="margin: 0; color: #1e293b;">🛒 Shopping Cart</h3>
                <button onclick="closeCart()" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; margin-left: auto;">✕</button>
            </div>
            <div id="cart-items" style="padding: 20px;">
                ${renderCartItems()}
            </div>
        </div>
        
        <!-- Overlay -->
        <div id="cart-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 999;" onclick="closeCart()"></div>
    `;
    
    mainContent.innerHTML = html;
}

function renderProductsGrid() {
    return appState.products.map(product => `
        <div style="background: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; transition: transform 0.3s ease; position: relative;" 
             onmouseover="this.style.transform='translateY(-5px)'" 
             onmouseout="this.style.transform='translateY(0)'">
            
            ${!product.is_available ? `
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 2; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-weight: bold; font-size: 1.5rem; transform: rotate(-15deg); border: 3px solid white; padding: 15px; background: rgba(255,0,0,0.8);">
                        SOLD OUT
                    </span>
                </div>
            ` : ''}
            
            <img src="${product.image_url || 'https://placehold.co/350x220?text=No+Image'}" 
                 alt="${product.name}" 
                 style="width: 100%; height: 220px; object-fit: cover;"
                 onerror="this.src='https://placehold.co/350x220?text=Image+Error'">
            
            <div style="padding: 25px;">
                <h3 style="font-size: 1.4rem; font-weight: bold; margin-bottom: 12px; color: #1e293b; line-height: 1.3;">${product.name}</h3>
                <p style="color: #64748b; margin-bottom: 18px; line-height: 1.6; height: 48px; overflow: hidden;">${product.description || 'No description available'}</p>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
                    <span style="font-size: 1.6rem; font-weight: bold; color: #059669;">${formatPrice(product.price)}</span>
                    <span style="padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 500; ${product.is_available ? 'background: #dcfce7; color: #166534;' : 'background: #fee2e2; color: #dc2626;'}">
                        ${product.is_available ? '✅ Available' : '❌ Sold Out'}
                    </span>
                </div>
                
                <button onclick="addToCart(${product.id}, '${product.name}')" 
                        style="width: 100%; background: ${product.is_available ? '#1e293b' : '#9ca3af'}; color: white; padding: 14px; border: none; border-radius: 10px; cursor: ${product.is_available ? 'pointer' : 'not-allowed'}; font-weight: bold; font-size: 1rem; transition: all 0.3s ease;"
                        ${!product.is_available ? 'disabled' : ''}
                        onmouseover="if(this.style.background!=='#9ca3af') this.style.background='#0f172a'"
                        onmouseout="if(this.style.background!=='#9ca3af') this.style.background='#1e293b'">
                    ${product.is_available ? '🛒 Add to Cart' : '❌ Out of Stock'}
                </button>
            </div>
        </div>
    `).join('');
}

function renderCartItems() {
    const cartProducts = Object.keys(appState.cart).map(productId => {
        const product = appState.products.find(p => p.id == productId);
        return product ? { ...product, quantity: appState.cart[productId] } : null;
    }).filter(Boolean);
    
    if (cartProducts.length === 0) {
        return `
            <div style="text-align: center; padding: 40px 20px; color: #64748b;">
                <div style="font-size: 4rem; margin-bottom: 15px;">🛒</div>
                <h4>Your cart is empty</h4>
                <p>Add some amazing products to get started!</p>
            </div>
        `;
    }
    
    const subtotal = cartProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return `
        <div style="space-y: 15px;">
            ${cartProducts.map(item => `
                <div style="display: flex; align-items: center; padding: 15px; background: #f8fafc; border-radius: 10px; margin-bottom: 15px;">
                    <img src="${item.image_url}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px;">
                    <div style="flex: 1;">
                        <h5 style="margin: 0 0 5px 0; font-weight: bold; color: #1e293b;">${item.name}</h5>
                        <p style="margin: 0; color: #059669; font-weight: 500;">${formatPrice(item.price)}</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button onclick="updateCart(${item.id}, -1)" style="background: #ef4444; color: white; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-weight: bold;">-</button>
                        <span style="font-weight: bold; min-width: 20px; text-align: center;">${item.quantity}</span>
                        <button onclick="updateCart(${item.id}, 1)" style="background: #10b981; color: white; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-weight: bold;">+</button>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div style="border-top: 2px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
            <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 20px;">
                <strong style="font-size: 1.3rem; color: #1e293b;">Total: ${formatPrice(subtotal)}</strong>
            </div>
            <button onclick="checkout()" style="width: 100%; background: #059669; color: white; padding: 15px; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 1.1rem;">
                💳 Proceed to Checkout
            </button>
        </div>
    `;
}

// Utility Functions
function formatPrice(price) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(price);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 2000;
        padding: 15px 25px; border-radius: 10px; color: white; font-weight: bold;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        transform: translateX(100%); transition: transform 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

function showError(message) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div style="max-width: 600px; margin: 50px auto; padding: 40px; text-align: center; background: white; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <div style="font-size: 5rem; margin-bottom: 20px;">❌</div>
            <h2 style="color: #dc2626; margin-bottom: 15px; font-size: 2rem;">Application Error</h2>
            <p style="color: #64748b; margin-bottom: 30px; line-height: 1.8; font-size: 1.1rem;">${message}</p>
            <button onclick="location.reload()" style="background: #3b82f6; color: white; padding: 15px 30px; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 1.1rem;">
                🔄 Reload Page
            </button>
        </div>
    `;
}

// Feature Functions
function filterProducts() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const products = document.querySelectorAll('#products-grid > div');
    
    products.forEach(productEl => {
        const name = productEl.querySelector('h3').textContent.toLowerCase();
        const description = productEl.querySelector('p').textContent.toLowerCase();
        const matches = name.includes(query) || description.includes(query);
        productEl.style.display = matches ? 'block' : 'none';
    });
}

function sortProducts() {
    const sortBy = document.getElementById('sort-select').value;
    let sortedProducts = [...appState.products];
    
    switch(sortBy) {
        case 'price_low':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price_high':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default: // newest
            sortedProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    appState.products = sortedProducts;
    document.getElementById('products-grid').innerHTML = renderProductsGrid();
}

function addToCart(productId, productName) {
    appState.cart[productId] = (appState.cart[productId] || 0) + 1;
    showToast(`${productName} added to cart!`, 'success');
    
    // Update cart count in header
    const cartBtn = document.querySelector('button[onclick="openCart()"]');
    if (cartBtn) {
        const count = Object.values(appState.cart).reduce((sum, qty) => sum + qty, 0);
        const existingBadge = cartBtn.querySelector('span');
        if (existingBadge) existingBadge.remove();
        
        if (count > 0) {
            const badge = document.createElement('span');
            badge.style.cssText = 'background: #ef4444; color: white; font-size: 12px; padding: 2px 8px; border-radius: 50px; position: absolute; top: -5px; right: -5px;';
            badge.textContent = count;
            cartBtn.appendChild(badge);
        }
    }
}

function updateCart(productId, change) {
    if (!appState.cart[productId]) return;
    
    appState.cart[productId] += change;
    if (appState.cart[productId] <= 0) {
        delete appState.cart[productId];
    }
    
    document.getElementById('cart-items').innerHTML = renderCartItems();
    
    // Update header cart count
    const count = Object.values(appState.cart).reduce((sum, qty) => sum + qty, 0);
    const cartBtn = document.querySelector('button[onclick="openCart()"]');
    if (cartBtn) {
        const badge = cartBtn.querySelector('span');
        if (badge) badge.remove();
        
        if (count > 0) {
            const newBadge = document.createElement('span');
            newBadge.style.cssText = 'background: #ef4444; color: white; font-size: 12px; padding: 2px 8px; border-radius: 50px; position: absolute; top: -5px; right: -5px;';
            newBadge.textContent = count;
            cartBtn.appendChild(newBadge);
        }
    }
}

function openCart() {
    document.getElementById('cart-sidebar').style.display = 'block';
    document.getElementById('cart-overlay').style.display = 'block';
    document.getElementById('cart-items').innerHTML = renderCartItems();
}

function closeCart() {
    document.getElementById('cart-sidebar').style.display = 'none';
    document.getElementById('cart-overlay').style.display = 'none';
}

function checkout() {
    const items = Object.keys(appState.cart).length;
    if (items === 0) {
        showToast('Cart is empty!', 'error');
        return;
    }
    
    showToast(`Checkout ${items} items - Feature coming soon!`, 'info');
}

// Admin Functions
function showAdminLogin() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div style="max-width: 500px; margin: 50px auto; padding: 40px; background: white; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <h2 style="text-align: center; margin-bottom: 10px; color: #1e293b; font-size: 2rem;">🔐 Admin Login</h2>
            <p style="text-align: center; color: #64748b; margin-bottom: 30px;">Enter your Supabase credentials</p>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 500;">Email:</label>
                <input type="email" id="admin-email" style="width: 100%; padding: 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 16px;" placeholder="Enter admin email">
            </div>
            
            <div style="margin-bottom: 25px;">
                <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 500;">Password:</label>
                <input type="password" id="admin-password" style="width: 100%; padding: 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 16px;" placeholder="Enter password">
            </div>
            
            <div id="login-error" style="display: none; background: #fee2e2; color: #dc2626; padding: 10px; border-radius: 8px; margin-bottom: 20px; font-size: 14px;"></div>
            
            <button onclick="attemptLogin()" id="login-btn" style="width: 100%; background: #1e293b; color: white; padding: 18px; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 1.1rem; margin-bottom: 15px;">
                🔓 Login to Admin Panel
            </button>
            
            <button onclick="showProducts()" style="width: 100%; background: #6b7280; color: white; padding: 15px; border: none; border-radius: 10px; cursor: pointer; font-weight: bold;">
                ← Back to Store
            </button>
        </div>
    `;
}

async function attemptLogin() {
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;
    const errorDiv = document.getElementById('login-error');
    const loginBtn = document.getElementById('login-btn');
    
    if (!email || !password) {
        errorDiv.textContent = 'Please enter both email and password';
        errorDiv.style.display = 'block';
        return;
    }
    
    loginBtn.textContent = '🔄 Logging in...';
    loginBtn.disabled = true;
    errorDiv.style.display = 'none';
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
        } else {
            appState.user = data.user;
            showToast('Login successful!', 'success');
            // Auth state change listener will handle the redirect
        }
    } catch (error) {
        errorDiv.textContent = 'Login failed: ' + error.message;
        errorDiv.style.display = 'block';
    }
    
    loginBtn.textContent = '🔓 Login to Admin Panel';
    loginBtn.disabled = false;
}

function showAdminPanel() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div style="max-width: 1200px; margin: 0 auto; padding: 20px;">
            <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); margin-bottom: 30px;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                    <div>
                        <h1 style="font-size: 2.5rem; margin-bottom: 5px; color: #1e293b;">⚙️ Admin Panel</h1>
                        <p style="color: #64748b; font-size: 1.1rem;">Welcome, ${appState.user?.email || 'Admin'}</p>
                    </div>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button onclick="showProducts()" style="background: #3b82f6; color: white; padding: 12px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
                            🏠 Back to Store
                        </button>
                        <button onclick="logout()" style="background: #ef4444; color: white; padding: 12px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
                            🚪 Logout
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Stats Cards -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 25px; border-radius: 15px; text-align: center;">
                    <div style="font-size: 2.5rem; margin-bottom: 10px;">📦</div>
                    <h3 style="font-size: 2rem; margin: 0;">${appState.products.length}</h3>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">Total Products</p>
                </div>
                
                <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 25px; border-radius: 15px; text-align: center;">
                    <div style="font-size: 2.5rem; margin-bottom: 10px;">✅</div>
                    <h3 style="font-size: 2rem; margin: 0;">${appState.products.filter(p => p.is_available).length}</h3>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">Available</p>
                </div>
                
                <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 25px; border-radius: 15px; text-align: center;">
                    <div style="font-size: 2.5rem; margin-bottom: 10px;">❌</div>
                    <h3 style="font-size: 2rem; margin: 0;">${appState.products.filter(p => !p.is_available).length}</h3>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">Out of Stock</p>
                </div>
                
                <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 25px; border-radius: 15px; text-align: center;">
                    <div style="font-size: 2.5rem; margin-bottom: 10px;">🎟️</div>
                    <h3 style="font-size: 2rem; margin: 0;">${appState.vouchers.length}</h3>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">Active Vouchers</p>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); margin-bottom: 30px;">
                <h2 style="color: #1e293b; margin-bottom: 20px; font-size: 1.5rem;">🚀 Quick Actions</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <button onclick="showToast('Add product feature coming soon!', 'info')" style="background: #10b981; color: white; padding: 20px; border: none; border-radius: 10px; cursor: pointer; text-align: left; transition: transform 0.2s;">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">➕</div>
                        <div style="font-weight: bold;">Add Product</div>
                        <div style="font-size: 0.9rem; opacity: 0.9;">Create new product</div>
                    </button>
                    
                    <button onclick="showToast('Voucher management coming soon!', 'info')" style="background: #8b5cf6; color: white; padding: 20px; border: none; border-radius: 10px; cursor: pointer; text-align: left;">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">🎟️</div>
                        <div style="font-weight: bold;">Manage Vouchers</div>
                        <div style="font-size: 0.9rem; opacity: 0.9;">Create discount codes</div>
                    </button>
                    
                    <button onclick="showToast('Settings panel coming soon!', 'info')" style="background: #f59e0b; color: white; padding: 20px; border: none; border-radius: 10px; cursor: pointer; text-align: left;">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">⚙️</div>
                        <div style="font-weight: bold;">Store Settings</div>
                        <div style="font-size: 0.9rem; opacity: 0.9;">QRIS, WhatsApp, etc.</div>
                    </button>
                    
                    <button onclick="reloadData()" style="background: #3b82f6; color: white; padding: 20px; border: none; border-radius: 10px; cursor: pointer; text-align: left;">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">🔄</div>
                        <div style="font-weight: bold;">Reload Data</div>
                        <div style="font-size: 0.9rem; opacity: 0.9;">Refresh all data</div>
                    </button>
                </div>
            </div>
            
            <!-- Products Management -->
            <div style="background: white; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">
                <div style="padding: 25px; border-bottom: 2px solid #e2e8f0;">
                    <h2 style="color: #1e293b; margin: 0; font-size: 1.5rem;">📦 Product Management</h2>
                </div>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: #f8fafc;">
                            <tr>
                                <th style="padding: 15px; text-align: left; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Product</th>
                                <th style="padding: 15px; text-align: left; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Price</th>
                                <th style="padding: 15px; text-align: left; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Status</th>
                                <th style="padding: 15px; text-align: left; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${appState.products.map(product => `
                                <tr style="border-bottom: 1px solid #f3f4f6;">
                                    <td style="padding: 15px;">
                                        <div style="display: flex; align-items: center;">
                                            <img src="${product.image_url || 'https://placehold.co/50x50'}" 
                                                 style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover; margin-right: 15px;">
                                            <div>
                                                <div style="font-weight: 600; color: #1f2937;">${product.name}</div>
                                                <div style="font-size: 0.875rem; color: #6b7280;">${product.category || 'No category'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style="padding: 15px;">
                                        <div style="font-weight: 600; color: #1f2937;">${formatPrice(product.price)}</div>
                                        ${product.discount_percentage > 0 ? `<div style="font-size: 0.875rem; color: #ef4444;">-${product.discount_percentage}% off</div>` : ''}
                                    </td>
                                    <td style="padding: 15px;">
                                        <label style="relative inline-flex items-center cursor-pointer;">
                                            <input type="checkbox" 
                                                   style="sr-only peer" 
                                                   ${product.is_available ? 'checked' : ''}
                                                   onchange="toggleProductStatus(${product.id})">
                                            <div style="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600; position: relative; width: 44px; height: 24px; background: ${product.is_available ? '#10b981' : '#d1d5db'}; border-radius: 12px; transition: background 0.3s;">
                                                <div style="position: absolute; top: 2px; left: ${product.is_available ? '22px' : '2px'}; width: 20px; height: 20px; background: white; border-radius: 50%; transition: left 0.3s;"></div>
                                            </div>
                                        </label>
                                        <span style="margin-left: 10px; font-size: 0.875rem; color: ${product.is_available ? '#059669' : '#dc2626'};">
                                            ${product.is_available ? 'Available' : 'Sold Out'}
                                        </span>
                                    </td>
                                    <td style="padding: 15px;">
                                        <button onclick="showToast('Edit feature coming soon!', 'info')" style="color: #3b82f6; background: none; border: none; cursor: pointer; margin-right: 15px; font-weight: 500;">Edit</button>
                                        <button onclick="deleteProduct(${product.id}, '${product.name}')" style="color: #ef4444; background: none; border: none; cursor: pointer; font-weight: 500;">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

async function toggleProductStatus(productId) {
    const product = appState.products.find(p => p.id === productId);
    if (!product) return;
    
    try {
        const newStatus = !product.is_available;
        const { error } = await supabaseClient
            .from('products')
            .update({ is_available: newStatus })
            .eq('id', productId);
            
        if (error) throw error;
        
        product.is_available = newStatus;
        showToast(`Product ${newStatus ? 'enabled' : 'disabled'} successfully!`, 'success');
        
    } catch (error) {
        console.error('❌ Toggle status error:', error);
        showToast('Failed to update product status', 'error');
        setTimeout(() => showAdminPanel(), 100);
    }
}

async function deleteProduct(productId, productName) {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;
    
    try {
        const { error } = await supabaseClient
            .from('products')
            .delete()
            .eq('id', productId);
            
        if (error) throw error;
        
        appState.products = appState.products.filter(p => p.id !== productId);
        showToast('Product deleted successfully!', 'success');
        showAdminPanel();
        
    } catch (error) {
        console.error('❌ Delete error:', error);
        showToast('Failed to delete product', 'error');
    }
}

async function logout() {
    try {
        await supabaseClient.auth.signOut();
        appState.user = null;
        showToast('Logged out successfully', 'info');
        showProducts();
    } catch (error) {
        console.error('❌ Logout error:', error);
        showToast('Logout failed', 'error');
    }
}

async function reloadData() {
    showToast('Reloading data...', 'info');
    try {
        await loadAllData();
        showAdminPanel();
        showToast('Data reloaded successfully!', 'success');
    } catch (error) {
        showToast('Failed to reload data', 'error');
    }
}

// Debug function
function showDebugInfo() {
    const info = `
🔧 DEBUG INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━

📍 URL: ${window.location.href}
🗂️ Products: ${appState.products.length}
🛒 Cart Items: ${Object.keys(appState.cart).length}
👤 User: ${appState.user ? appState.user.email : 'Not logged in'}
🎟️ Vouchers: ${appState.vouchers.length}
📱 Screen: ${window.innerWidth} x ${window.innerHeight}
🌐 Online: ${navigator.onLine ? 'Yes' : 'No'}
⏰ Time: ${new Date().toLocaleString()}

🔗 Database: Connected
📊 State: ${JSON.stringify(appState, null, 2).substring(0, 200)}...

━━━━━━━━━━━━━━━━━━━━━━━━
    `;
    
    alert(info);
    console.log("🔧 Debug Info:", appState);
}

// Expose global functions
window.addToCart = addToCart;
window.updateCart = updateCart;
window.openCart = openCart;
window.closeCart = closeCart;
window.checkout = checkout;
window.showAdminLogin = showAdminLogin;
window.attemptLogin = attemptLogin;
window.showAdminPanel = showAdminPanel;
window.toggleProductStatus = toggleProductStatus;
window.deleteProduct = deleteProduct;
window.logout = logout;
window.reloadData = reloadData;
window.showProducts = showProducts;
window.filterProducts = filterProducts;
window.sortProducts = sortProducts;
window.showDebugInfo = showDebugInfo;

console.log("✅ Improved Emergency App loaded successfully!");
console.log("🎯 Available features: Search, Sort, Cart, Admin Panel, Product Management");
