// =====================================
// SUPER SIMPLE APP.JS - EMERGENCY VERSION
// Minimal code untuk emergency fix
// =====================================

console.log("🚀 EMERGENCY VERSION - Starting...");

// STEP 1: Cek apakah Supabase tersedia
if (typeof supabase === 'undefined') {
    alert("ERROR: Supabase library tidak ditemukan! Pastikan script tag Supabase ada di HTML.");
    document.getElementById('main-content').innerHTML = `
        <div style="text-align: center; padding: 50px;">
            <h1 style="color: red;">❌ Supabase Library Missing</h1>
            <p>Pastikan script tag Supabase ada sebelum app.js</p>
        </div>
    `;
} else {
    console.log("✅ Supabase library found");
    initApp();
}

async function initApp() {
    console.log("🔧 Initializing emergency app...");
    
    // Kredensial Supabase
    const supabaseUrl = 'https://viresxwhyqcflmfoyxsf.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpcmVzeHdoeXFjZmxtZm95eHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDU1MDMsImV4cCI6MjA2OTk4MTUwM30.MuR0PKP1Og3cF9wOjYbWGFQfo6rtsWvcoODgD1_boUQ';
    
    try {
        // Buat Supabase client
        const { createClient } = supabase;
        const sb = createClient(supabaseUrl, supabaseAnonKey);
        console.log("✅ Supabase client created");
        
        // Test database
        console.log("📡 Testing database...");
        const { data, error } = await sb.from('products').select('*');
        
        if (error) {
            throw new Error('Database error: ' + error.message);
        }
        
        console.log("✅ Database connected, found", data.length, "products");
        
        // Show products
        showProducts(data);
        
    } catch (err) {
        console.error("❌ Error:", err);
        showError(err.message);
    }
}

function showProducts(products) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) {
        alert("ERROR: Element 'main-content' tidak ditemukan!");
        return;
    }
    
    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };
    
    const html = `
        <div style="max-width: 1200px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 40px; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h1 style="font-size: 3rem; margin-bottom: 10px; color: #1e293b;">🛍️ TokoProfesional</h1>
                <p style="color: #64748b; font-size: 1.2rem;">Emergency Mode - Found ${products.length} products</p>
                <div style="margin-top: 20px;">
                    <button onclick="location.reload()" style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                        🔄 Reload
                    </button>
                    <button onclick="showAdminLogin()" style="background: #8b5cf6; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
                        🔐 Admin
                    </button>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                ${products.map(product => `
                    <div style="background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; transition: transform 0.2s;">
                        <img src="${product.image_url || 'https://placehold.co/300x200?text=No+Image'}" 
                             alt="${product.name}" 
                             style="width: 100%; height: 200px; object-fit: cover;"
                             onerror="this.src='https://placehold.co/300x200?text=Image+Error'">
                        <div style="padding: 20px;">
                            <h3 style="font-size: 1.3rem; font-weight: bold; margin-bottom: 10px; color: #1e293b;">${product.name}</h3>
                            <p style="color: #64748b; margin-bottom: 15px; line-height: 1.5;">${product.description || 'No description available'}</p>
                            <div style="display: flex; justify-between; align-items: center; margin-bottom: 15px;">
                                <span style="font-size: 1.5rem; font-weight: bold; color: #059669;">${formatPrice(product.price)}</span>
                                <span style="padding: 5px 10px; border-radius: 15px; font-size: 0.8rem; ${product.is_available ? 'background: #dcfce7; color: #166534;' : 'background: #fee2e2; color: #dc2626;'}">
                                    ${product.is_available ? '✅ Available' : '❌ Sold Out'}
                                </span>
                            </div>
                            <button onclick="addToCart('${product.name}')" 
                                    style="width: 100%; background: ${product.is_available ? '#1e293b' : '#9ca3af'}; color: white; padding: 12px; border: none; border-radius: 5px; cursor: ${product.is_available ? 'pointer' : 'not-allowed'}; font-weight: bold;"
                                    ${!product.is_available ? 'disabled' : ''}>
                                ${product.is_available ? '🛒 Add to Cart' : '❌ Out of Stock'}
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding: 30px; background: #f8fafc; border-radius: 10px;">
                <h3 style="color: #1e293b; margin-bottom: 15px;">🔧 Emergency Mode Active</h3>
                <p style="color: #64748b; margin-bottom: 20px;">Basic functionality only. Some features may be limited.</p>
                <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                    <button onclick="testDatabase()" style="background: #10b981; color: white; padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer;">
                        🧪 Test Database
                    </button>
                    <button onclick="showDebugInfo()" style="background: #f59e0b; color: white; padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer;">
                        📊 Debug Info
                    </button>
                    <button onclick="clearCache()" style="background: #ef4444; color: white; padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer;">
                        🗑️ Clear Cache
                    </button>
                </div>
            </div>
        </div>
    `;
    
    mainContent.innerHTML = html;
    console.log("✅ Products displayed successfully");
}

function showError(message) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div style="max-width: 600px; margin: 50px auto; padding: 30px; text-align: center; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="font-size: 4rem; margin-bottom: 20px;">❌</div>
            <h2 style="color: #dc2626; margin-bottom: 15px; font-size: 1.8rem;">Application Error</h2>
            <p style="color: #64748b; margin-bottom: 25px; line-height: 1.6;">${message}</p>
            <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                <button onclick="location.reload()" style="background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
                    🔄 Reload Page
                </button>
                <button onclick="showDebugInfo()" style="background: #f59e0b; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
                    📊 Debug Info
                </button>
            </div>
            <div style="margin-top: 25px; padding: 15px; background: #fee2e2; border-radius: 5px; text-align: left;">
                <strong style="color: #dc2626;">Troubleshooting Steps:</strong>
                <ol style="margin: 10px 0; padding-left: 20px; color: #7f1d1d;">
                    <li>Check browser console (F12) for detailed errors</li>
                    <li>Verify Supabase credentials are correct</li>
                    <li>Ensure database tables exist</li>
                    <li>Check internet connection</li>
                    <li>Try in incognito/private browser mode</li>
                </ol>
            </div>
        </div>
    `;
}

// Utility Functions
function addToCart(productName) {
    alert(`${productName} added to cart! (Cart functionality not available in emergency mode)`);
}

function showAdminLogin() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div style="max-width: 400px; margin: 50px auto; padding: 30px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="text-align: center; margin-bottom: 20px; color: #1e293b;">🔐 Admin Login</h2>
            <p style="text-align: center; color: #64748b; margin-bottom: 25px;">Emergency mode - Limited functionality</p>
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; color: #374151;">Email:</label>
                <input type="email" id="admin-email" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 5px;" placeholder="Enter admin email">
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; color: #374151;">Password:</label>
                <input type="password" id="admin-password" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 5px;" placeholder="Enter password">
            </div>
            <button onclick="attemptLogin()" style="width: 100%; background: #1e293b; color: white; padding: 12px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; margin-bottom: 15px;">
                🔓 Login
            </button>
            <button onclick="location.reload()" style="width: 100%; background: #6b7280; color: white; padding: 10px; border: none; border-radius: 5px; cursor: pointer;">
                ← Back to Home
            </button>
        </div>
    `;
}

function attemptLogin() {
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    alert('Login functionality not available in emergency mode. Please check your app.js file and reload.');
}

function testDatabase() {
    console.log('🧪 Running database test...');
    initApp(); // Re-run the database test
}

function showDebugInfo() {
    const info = `
🔧 DEBUG INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━

📍 Current URL: ${window.location.href}
🌐 User Agent: ${navigator.userAgent}
📅 Current Time: ${new Date().toLocaleString()}
🔧 Supabase Available: ${typeof supabase !== 'undefined' ? '✅ Yes' : '❌ No'}
📱 Screen Size: ${window.innerWidth} x ${window.innerHeight}
🔄 Connection: ${navigator.onLine ? '✅ Online' : '❌ Offline'}

🧠 Memory Usage: ${navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'Unknown'}
💾 Storage: ${navigator.storage ? '✅ Available' : '❌ Not Available'}

━━━━━━━━━━━━━━━━━━━━━━━━

💡 TROUBLESHOOTING TIPS:
1. Check browser console (F12)
2. Verify file locations
3. Check network connectivity
4. Try incognito mode
5. Clear browser cache
    `;
    
    alert(info);
    console.log(info);
}

function clearCache() {
    if (confirm('Clear browser cache and reload? This will refresh the page.')) {
        // Clear localStorage
        localStorage.clear();
        
        // Clear sessionStorage
        sessionStorage.clear();
        
        // Reload with cache bypass
        window.location.reload(true);
    }
}

// Global error handler
window.addEventListener('error', function(event) {
    console.error('💥 Global error caught:', event.error);
    console.error('Error details:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
    
    // Show error on page if main content is stuck
    const mainContent = document.getElementById('main-content');
    if (mainContent && mainContent.innerHTML.includes('Initializing')) {
        showError('JavaScript Error: ' + event.message + ' (Line: ' + event.lineno + ')');
    }
});

// Auto-fix stuck loading
setTimeout(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent && mainContent.innerHTML.includes('Initializing')) {
        console.warn('⚠️ App seems stuck, running emergency recovery...');
        showError('Application timeout - Emergency mode activated');
    }
}, 10000); // 10 second timeout

console.log("✅ Emergency app.js loaded successfully!");

// Expose functions globally for testing
window.testDatabase = testDatabase;
window.showDebugInfo = showDebugInfo;
window.clearCache = clearCache;
window.addToCart = addToCart;
window.showAdminLogin = showAdminLogin;
window.attemptLogin = attemptLogin;
