// =====================================
// MINIMAL APP.JS - TROUBLESHOOTING VERSION
// Ganti app.js dengan file ini untuk debug
// =====================================

console.log("🚀 STEP 1: JavaScript file loaded successfully");

// STEP 2: Check if Supabase is available
if (typeof supabase === 'undefined') {
    console.error("❌ STEP 2 FAILED: Supabase library not found!");
    alert("ERROR: Supabase library tidak ditemukan. Pastikan script tag sudah benar di HTML.");
} else {
    console.log("✅ STEP 2 PASSED: Supabase library found");
}

// STEP 3: Initialize Supabase (gunakan kredensial yang SUDAH TERBUKTI WORK dari test)
console.log("🔧 STEP 3: Initializing Supabase...");

const supabaseUrl = 'https://viresxwhyqcflmfoyxsf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpcmVzeHdoeXFjZmxtZm95eHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDU1MDMsImV4cCI6MjA2OTk4MTUwM30.MuR0PKP1Og3cF9wOjYbWGFQfo6rtsWvcoODgD1_boUQ';

let sb;
try {
    const { createClient } = supabase;
    sb = createClient(supabaseUrl, supabaseAnonKey);
    console.log("✅ STEP 3 PASSED: Supabase client created");
} catch (error) {
    console.error("❌ STEP 3 FAILED: Cannot create Supabase client:", error);
    alert("ERROR: Tidak bisa membuat Supabase client - " + error.message);
}

// STEP 4: Test database connection
async function testAndDisplayProducts() {
    console.log("📡 STEP 4: Testing database connection...");
    
    try {
        const { data, error } = await sb.from('products').select('*');
        
        if (error) {
            console.error("❌ STEP 4 FAILED: Database query error:", error);
            showError("Database Error: " + error.message);
            return;
        }
        
        if (!data || data.length === 0) {
            console.warn("⚠️ STEP 4 WARNING: No products found");
            showMessage("Database connected but no products found. Run database setup SQL.");
            return;
        }
        
        console.log("✅ STEP 4 PASSED: Products loaded:", data.length);
        console.log("📦 Sample product:", data[0]);
        
        // STEP 5: Display products
        displayProducts(data);
        
    } catch (exception) {
        console.error("❌ STEP 4 EXCEPTION:", exception);
        showError("Connection Exception: " + exception.message);
    }
}

// STEP 5: Simple display function
function displayProducts(products) {
    console.log("🎨 STEP 5: Displaying products...");
    
    const mainContent = document.getElementById('main-content');
    if (!mainContent) {
        console.error("❌ STEP 5 FAILED: main-content element not found!");
        alert("ERROR: Element 'main-content' tidak ditemukan di HTML!");
        return;
    }
    
    console.log("✅ STEP 5: main-content element found");
    
    // Create simple product grid
    const html = `
        <div class="container mx-auto p-4">
            <div class="text-center mb-8">
                <h1 class="text-4xl font-bold text-slate-800 mb-2">✅ TokoProfesional</h1>
                <p class="text-slate-600">Database connected successfully! Found ${products.length} products</p>
                <div class="mt-4 space-x-4">
                    <button onclick="location.reload()" class="bg-blue-500 text-white px-4 py-2 rounded">🔄 Reload</button>
                    <button onclick="testAndDisplayProducts()" class="bg-green-500 text-white px-4 py-2 rounded">🔄 Refresh Products</button>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${products.map(product => `
                    <div class="bg-white rounded-lg shadow-md p-6 border hover:shadow-lg transition-shadow">
                        <div class="mb-4">
                            <img src="${product.image_url || 'https://placehold.co/300x200?text=No+Image'}" 
                                 alt="${product.name}" 
                                 class="w-full h-48 object-cover rounded-md"
                                 onerror="this.src='https://placehold.co/300x200?text=Image+Error'">
                        </div>
                        <h3 class="text-xl font-semibold mb-2 text-slate-800">${product.name}</h3>
                        <p class="text-slate-600 text-sm mb-3 line-clamp-2">${product.description || 'No description'}</p>
                        <div class="flex justify-between items-center">
                            <span class="text-2xl font-bold text-green-600">
                                Rp ${(product.price || 0).toLocaleString('id-ID')}
                            </span>
                            <div class="text-sm">
                                ${product.is_available ? 
                                    '<span class="bg-green-100 text-green-800 px-2 py-1 rounded">✅ Available</span>' : 
                                    '<span class="bg-red-100 text-red-800 px-2 py-1 rounded">❌ Sold Out</span>'
                                }
                            </div>
                        </div>
                        <button class="w-full mt-4 bg-slate-800 text-white py-2 rounded hover:bg-slate-700 transition-colors ${!product.is_available ? 'opacity-50 cursor-not-allowed' : ''}" 
                                ${!product.is_available ? 'disabled' : ''}>
                            ${product.is_available ? '🛒 Add to Cart' : '❌ Out of Stock'}
                        </button>
                    </div>
                `).join('')}
            </div>
            
            <div class="mt-12 text-center">
                <div class="bg-slate-100 p-6 rounded-lg max-w-2xl mx-auto">
                    <h3 class="text-lg font-semibold mb-3">🔧 Debug Information</h3>
                    <div class="text-sm text-left space-y-1">
                        <p><strong>Database URL:</strong> ${supabaseUrl}</p>
                        <p><strong>Products Found:</strong> ${products.length}</p>
                        <p><strong>Available Products:</strong> ${products.filter(p => p.is_available).length}</p>
                        <p><strong>Categories:</strong> ${[...new Set(products.map(p => p.category))].join(', ')}</p>
                        <p><strong>Last Updated:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    mainContent.innerHTML = html;
    console.log("✅ STEP 5 COMPLETED: Products displayed successfully!");
}

// Helper functions
function showError(message) {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="flex flex-col items-center justify-center min-h-screen text-center p-4">
                <div class="text-red-500 text-6xl mb-4">❌</div>
                <h2 class="text-3xl font-bold text-red-600 mb-4">Error</h2>
                <p class="text-gray-600 mb-6 max-w-md">${message}</p>
                <div class="space-x-4">
                    <button onclick="location.reload()" class="bg-blue-500 text-white px-6 py-3 rounded-lg">
                        🔄 Reload Page
                    </button>
                    <button onclick="testAndDisplayProducts()" class="bg-green-500 text-white px-6 py-3 rounded-lg">
                        🔄 Retry Connection
                    </button>
                </div>
                <div class="mt-6 text-sm text-gray-500">
                    <p>Check browser console (F12) for detailed error information</p>
                </div>
            </div>
        `;
    }
}

function showMessage(message) {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="flex flex-col items-center justify-center min-h-screen text-center p-4">
                <div class="text-yellow-500 text-6xl mb-4">⚠️</div>
                <h2 class="text-3xl font-bold text-yellow-600 mb-4">Notice</h2>
                <p class="text-gray-600 mb-6 max-w-md">${message}</p>
                <button onclick="location.reload()" class="bg-blue-500 text-white px-6 py-3 rounded-lg">
                    🔄 Reload Page
                </button>
            </div>
        `;
    }
}

// STEP 6: Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 STEP 6: DOM loaded, checking elements...");
    
    // Check critical elements
    const mainContent = document.getElementById('main-content');
    if (!mainContent) {
        console.error("❌ STEP 6 FAILED: main-content not found!");
        alert("CRITICAL ERROR: Element 'main-content' tidak ditemukan di HTML!");
        return;
    }
    
    console.log("✅ STEP 6 PASSED: Critical elements found");
    
    // Show loading state
    mainContent.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-screen">
            <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-800 mb-4"></div>
            <h2 class="text-2xl font-bold text-slate-800 mb-2">Loading TokoProfesional...</h2>
            <p class="text-slate-600">Connecting to database...</p>
        </div>
    `;
    
    // Test database after a short delay
    setTimeout(() => {
        console.log("🚀 STEP 7: Starting database test...");
        testAndDisplayProducts();
    }, 1000);
});

// STEP 8: Handle page load
window.addEventListener('load', function() {
    console.log("✅ STEP 8: Page fully loaded");
});

// STEP 9: Global error handling
window.addEventListener('error', function(event) {
    console.error("💥 GLOBAL ERROR:", event.error);
    console.error("Error details:", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});

// STEP 10: Expose test function globally for manual testing
window.testDatabase = testAndDisplayProducts;
window.debugInfo = {
    supabaseUrl,
    productsFound: 0,
    lastTest: null
};

console.log(`
🛠️ MANUAL TEST COMMANDS:
- testDatabase() - Test database connection
- location.reload() - Reload page
- console.clear() - Clear console
`);

console.log("🎉 MINIMAL APP.JS LOADED - Ready for testing!");
