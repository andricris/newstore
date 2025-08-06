// --- Konfigurasi & Inisialisasi ---
const { createClient } = supabase;
const supabaseUrl = 'https://viresxwhyqcflmfoyxsf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpcmVzeHdoeXFjZmxtZm95eHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDU1MDMsImV4cCI6MjA2OTk4MTUwM30.MuR0PKP1Og3cF9wOjYbWGFQfo6rtsWvcoODgD1_boUQ';
const sb = createClient(supabaseUrl, supabaseAnonKey);

// --- State Aplikasi (Pusat Data) ---
let state = {
    view: 'home',
    products: [],
    vouchers: [],
    searchQuery: '',
    sortBy: 'terbaru',
    cart: {},
    appliedVoucher: null,
    settings: { qrisImageUrl: '', whatsappNumber: '' },
    user: null,
    isReady: false
};

// --- Elemen DOM Utama ---
const mainContent = document.getElementById('main-content');
const cartBtn = document.getElementById('cart-btn');
const cartCountEl = document.getElementById('cart-count');
const floatingCartEl = document.getElementById('floating-cart');

// --- Fungsi Helper ---
const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

async function uploadImage(file, path) {
    if (!file) return null;
    const { data, error } = await sb.storage.from('images').upload(path, file, { upsert: true });
    if (error) {
        console.error('Error uploading image:', error);
        showToast(`Gagal mengunggah gambar: ${error.message}`, 'error');
        return null;
    }
    const { data: { publicUrl } } = sb.storage.from('images').getPublicUrl(path);
    return publicUrl;
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('show'); }, 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => { container.removeChild(toast); }, 300); }, 3000);
}

function setLoading(btn, isLoading, text = 'Simpan') {
    if (isLoading) {
        btn.disabled = true;
        btn.innerHTML = `<div class="spinner mr-2"></div> ${text}...`;
    } else {
        btn.disabled = false;
        btn.innerHTML = text;
    }
}

// --- Fungsi Render Utama ---
function render() {
    if (!state.isReady) {
        mainContent.innerHTML = `<div class="flex justify-center items-center h-64"><div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-slate-800"></div></div>`;
        return;
    }

    const totalItems = Object.values(state.cart).reduce((sum, qty) => sum + qty, 0);
    cartCountEl.textContent = totalItems;
    cartCountEl.classList.toggle('hidden', totalItems === 0);
    cartCountEl.classList.toggle('flex', totalItems > 0);

    switch (state.view) {
        case 'home': renderProductGrid(); break;
        case 'admin': state.user ? renderAdminPanel() : renderLoginPage(); break;
        case 'login': renderLoginPage(); break;
        case 'checkout': renderCheckoutPage(); break;
    }
}

// --- Render Tampilan Spesifik ---
function renderProductGrid() {
    let displayedProducts = [...state.products].filter(p => p.name.toLowerCase().includes(state.searchQuery.toLowerCase()));

    if (state.sortBy === 'termurah') {
        displayedProducts.sort((a, b) => a.price - b.price);
    } else if (state.sortBy === 'termahal') {
        displayedProducts.sort((a, b) => b.price - a.price);
    }

    let content = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-3xl font-bold">Produk Kami</h2>
            <div class="flex items-center gap-2">
                <label for="sort-by" class="text-sm font-medium">Urutkan:</label>
                <select id="sort-by" class="p-2 border rounded-lg text-sm">
                    <option value="terbaru" ${state.sortBy === 'terbaru' ? 'selected' : ''}>Terbaru</option>
                    <option value="termurah" ${state.sortBy === 'termurah' ? 'selected' : ''}>Harga Terendah</option>
                    <option value="termahal" ${state.sortBy === 'termahal' ? 'selected' : ''}>Harga Tertinggi</option>
                </select>
            </div>
        </div>
    `;
    if (displayedProducts.length === 0) {
        content += `<p class="text-center text-slate-500">Tidak ada produk yang cocok.</p>`;
    } else {
        content += `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">${displayedProducts.map(p => `
            <div class="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 flex flex-col relative">
                ${!p.is_available ? `<div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10"><span class="text-white text-2xl font-bold transform -rotate-12 border-4 border-white p-2">STOK HABIS</span></div>` : ''}
                <img src="${p.image_url || 'https://placehold.co/600x400'}" alt="${p.name}" class="w-full h-64 object-cover ${!p.is_available ? 'opacity-60' : ''}">
                <div class="p-4 flex flex-col flex-grow">
                    <h3 class="text-lg font-bold truncate">${p.name}</h3>
                    <p class="text-slate-500 text-sm mt-1 flex-grow">${p.description}</p>
                    <div class="mt-4 flex justify-between items-center">
                        <span class="text-xl font-bold text-slate-800">${formatCurrency(p.price)}</span>
                        <button data-product-id="${p.id}" class="add-to-cart-btn bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed" ${!p.is_available ? 'disabled' : ''}>Beli</button>
                    </div>
                </div>
            </div>`).join('')}</div>`;
    }
    mainContent.innerHTML = content;
}

function renderLoginPage() {
    mainContent.innerHTML = `<div class="flex items-center justify-center py-12"><div class="w-full max-w-md bg-white p-8 rounded-xl shadow-lg"><h2 class="text-2xl font-bold text-center mb-6">Admin Login</h2><form id="login-form" class="space-y-6"><div><label for="email" class="block text-sm">Email</label><input type="email" id="email" class="mt-1 w-full p-3 border rounded-lg" required /></div><div><label for="password" class="block text-sm">Password</label><input type="password" id="password" class="mt-1 w-full p-3 border rounded-lg" required /></div><p id="login-error" class="text-red-500 text-sm text-center hidden"></p><div><button type="submit" id="login-submit-btn" class="w-full bg-slate-800 text-white py-3 rounded-lg hover:bg-slate-700 disabled:bg-slate-400 flex items-center justify-center gap-2">Login</button></div></form></div></div>`;
}

function renderAdminPanel() {
     mainContent.innerHTML = `<div class="max-w-6xl mx-auto"><div class="flex flex-wrap justify-between items-center gap-4 mb-6"><h2 class="text-3xl font-bold">Panel Admin</h2><div class="flex items-center gap-4"><button id="logout-btn" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Logout</button></div></div><div id="product-form-container" class="hidden bg-white p-6 rounded-xl shadow-lg mb-8"></div><div class="grid md:grid-cols-2 gap-8 mb-8"><div class="bg-white p-6 rounded-xl shadow-lg"><h3 class="text-xl font-semibold mb-4">Pengaturan Toko</h3><div class="space-y-4"><div><label class="block text-sm mb-1">Upload Gambar QRIS</label><input type="file" id="qris-file-input" accept="image/*" class="w-full text-sm"/></div><div id="qris-preview-container" class="mt-2"><p class="text-xs">QRIS Saat Ini:</p><img src="${state.settings.qrisImageUrl || 'https://placehold.co/300x300?text=Belum+Ada+QRIS'}" class="mt-1 max-w-xs rounded-lg"/></div><button id="qris-save-btn" class="w-full bg-slate-800 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2">Simpan QRIS</button></div><div class="mt-4 space-y-4"><div><label class="block text-sm mb-1">Nomor WhatsApp</label><input type="tel" id="whatsapp-input" value="${state.settings.whatsappNumber || ''}" class="w-full p-2 border rounded-lg" placeholder="6281234567890"><p class="text-xs text-slate-500 mt-1">Gunakan format 62.</p></div><button id="whatsapp-save-btn" class="w-full bg-slate-800 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2">Simpan Nomor WA</button></div></div><div class="bg-white p-6 rounded-xl shadow-lg"><h3 class="text-xl font-semibold mb-4">Manajemen Voucher</h3><form id="voucher-form" class="space-y-4"><h4 class="font-medium">Buat Voucher Baru</h4><div><label class="block text-sm">Kode Voucher</label><input type="text" id="voucher-code" class="mt-1 w-full p-2 border rounded-lg uppercase" placeholder="CONTOH: DISKON10K" required></div><div><label class="block text-sm">Potongan Harga (Rp)</label><input type="number" id="voucher-discount" class="mt-1 w-full p-2 border rounded-lg" placeholder="10000" required></div><button type="submit" class="w-full bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2">Buat Voucher</button></form><div class="mt-6"><h4 class="font-medium mb-2">Voucher Aktif</h4><div id="voucher-list" class="space-y-2">${state.vouchers.map(v => `<div class="flex justify-between items-center p-2 rounded-lg ${v.is_active ? 'bg-green-100' : 'bg-slate-100'}"><div class="font-mono text-sm"><strong>${v.code}</strong> - ${formatCurrency(v.discount_amount)}</div><div class="flex items-center gap-2"><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" class="sr-only peer voucher-status-switch" data-voucher-id="${v.id}" ${v.is_active ? 'checked' : ''}><div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div></label><button class="delete-voucher-btn text-red-500 hover:text-red-700" data-voucher-id="${v.id}">✕</button></div></div>`).join('') || '<p class="text-sm text-slate-500">Belum ada voucher.</p>'}</div></div></div>
    </div>
    <div class="bg-white p-6 rounded-xl shadow-lg"><div class="flex justify-between items-center mb-4"><h3 class="text-xl font-semibold">Daftar Produk</h3><button id="add-product-btn" class="bg-slate-800 text-white px-4 py-2 rounded-lg">Tambah Produk</button></div><div class="overflow-x-auto"><table class="w-full text-left"><thead class="bg-slate-100"><tr><th class="p-3">Gambar</th><th class="p-3">Nama</th><th class="p-3">Harga</th><th class="p-3">Stok</th><th class="p-3">Aksi</th></tr></thead><tbody id="product-list-body">${state.products.map(p => `
    <tr class="border-b"><td class="p-3"><img src="${p.image_url}" class="w-16 h-16 rounded-md object-cover"/></td><td class="p-3 font-medium">${p.name}</td><td class="p-3">${formatCurrency(p.price)}</td><td class="p-3"><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" value="" class="sr-only peer stock-switch" data-product-id="${p.id}" ${p.is_available ? 'checked' : ''}><div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div></label></td><td class="p-3"><button data-product-id="${p.id}" class="edit-product-btn text-blue-600">Edit</button><button data-product-id="${p.id}" class="delete-product-btn text-red-600 ml-2">Hapus</button></td></tr>`).join('')}</tbody></table></div></div></div>`;
}

function renderProductForm(product = null) {
    const container = document.getElementById('product-form-container');
    container.innerHTML = `<h3 class="text-2xl font-bold mb-6">${product ? 'Edit Produk' : 'Tambah Produk'}</h3><form id="product-form" class="space-y-4"><input type="hidden" id="product-id" value="${product?.id || ''}"><div><label class="block text-sm">Nama</label><input type="text" id="product-name" class="mt-1 w-full p-2 border rounded" value="${product?.name || ''}" required></div><div><label class="block text-sm">Deskripsi</label><textarea id="product-description" rows="3" class="mt-1 w-full p-2 border rounded">${product?.description || ''}</textarea></div><div><label class="block text-sm">Harga (IDR)</label><input type="number" id="product-price" class="mt-1 w-full p-2 border rounded" value="${product?.price || ''}" required></div><div><label class="block text-sm">Gambar</label><input type="file" id="product-image-file" accept="image/*" class="mt-1 w-full text-sm"></div><div id="product-preview-container" class="mt-2">${product?.image_url ? `<p class="text-xs">Gambar saat ini:</p><img src="${product.image_url}" class="h-20 w-20 rounded-md object-cover mt-1">` : ''}</div><div class="flex justify-end space-x-4 pt-4"><button type="button" id="cancel-form-btn" class="bg-slate-200 px-6 py-2 rounded-lg">Batal</button><button type="submit" id="save-form-btn" class="bg-slate-800 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2">Simpan</button></div></form>`;
    container.classList.remove('hidden');
}

function renderCheckoutPage() {
    const cartItems = Object.keys(state.cart).map(id => ({...state.products.find(p => p.id == id), quantity: state.cart[id]})).filter(Boolean);
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let whatsappButtonHtml = '';
    if (state.settings.whatsappNumber) {
        whatsappButtonHtml = `<div class="text-center mt-6"><button id="whatsapp-contact-btn" class="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 w-full md:w-auto text-lg">✅ Sudah bayar? Klik di sini</button></div>`;
    }
    mainContent.innerHTML = `<div class="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg"><h2 class="text-3xl font-bold mb-6 text-center">Checkout</h2><div class="grid md:grid-cols-2 gap-8"><div><h3 class="text-xl font-semibold mb-4 border-b pb-2">Ringkasan Pesanan</h3><div class="space-y-3 mb-4">${cartItems.map(item => `<div class="flex justify-between items-center text-sm"><span>${item.name} <span class="text-slate-500">x${item.quantity}</span></span><span class="font-medium">${formatCurrency(item.price * item.quantity)}</span></div>`).join('')}</div><div class="flex justify-between font-bold text-lg border-t pt-3"><span>Total Pembayaran</span><span>${formatCurrency(total)}</span></div></div><div><h3 class="text-xl font-semibold mb-4 border-b pb-2">Cara Pembayaran</h3><div class="bg-slate-50 p-4 rounded-lg text-sm mb-4"><ol class="list-decimal list-inside space-y-2 text-slate-700"><li>Buka aplikasi pembayaran Anda (GoPay, OVO, Dana, M-Banking).</li><li>Gunakan fitur <strong>Scan/Pindai QR</strong>.</li><li>Arahkan kamera ke kode QR di bawah ini.</li><li>Pastikan total tagihan sudah sesuai, lalu bayar.</li></ol></div>${state.settings.qrisImageUrl ? `<div class="text-center"><img src="${state.settings.qrisImageUrl}" class="mx-auto rounded-lg shadow-md max-w-xs w-full"/>${whatsappButtonHtml}</div>` : `<div class="text-center p-8 bg-slate-100 rounded-lg"><p class="text-slate-500">QRIS belum diatur oleh admin.</p></div>`}</div></div><div class="text-center mt-8"><button id="back-to-home-btn" class="bg-slate-800 text-white px-8 py-3 rounded-lg">Kembali ke Toko</button></div></div>`;
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const summaryEl = document.getElementById('cart-summary');
    const checkoutBtn = document.getElementById('checkout-btn');
    const cartItems = Object.keys(state.cart).map(id => ({ ...state.products.find(p => p.id == id), quantity: state.cart[id] })).filter(Boolean);
    if (cartItems.length === 0) {
        container.innerHTML = `<p class="text-slate-500 text-center">Keranjang kosong.</p>`;
        checkoutBtn.disabled = true;
        summaryEl.innerHTML = '';
    } else {
        container.innerHTML = cartItems.map(item => `<div class="flex items-center justify-between mb-4"><img src="${item.image_url}" class="w-16 h-16 rounded-md object-cover"/><div class="flex-grow mx-3"><p class="font-bold">${item.name}</p><p class="text-sm">${formatCurrency(item.price)}</p></div><div class="flex items-center border rounded-lg"><button data-product-id="${item.id}" class="cart-update-btn p-2" data-amount="-1">-</button><span class="px-3">${item.quantity}</span><button data-product-id="${item.id}" class="cart-update-btn p-2" data-amount="1">+</button></div></div>`).join('');
        checkoutBtn.disabled = false;
    }
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = state.appliedVoucher ? state.appliedVoucher.discount_amount : 0;
    const total = Math.max(0, subtotal - discount);

    summaryEl.innerHTML = `
        <div class="flex justify-between text-slate-600"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
        ${state.appliedVoucher ? `<div class="flex justify-between text-green-600"><span>Diskon (${state.appliedVoucher.code})</span><span>-${formatCurrency(discount)}</span></div>` : ''}
        <div class="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total</span><span>${formatCurrency(total)}</span></div>
    `;
}

// --- Event Handlers ---
async function handleSaveQris(e) {
    const btn = e.target;
    setLoading(btn, true, 'Menyimpan');
    const file = document.getElementById('qris-file-input').files[0];
    if (!file) { showToast('Pilih file QRIS terlebih dahulu.', 'error'); setLoading(btn, false, 'Simpan QRIS'); return; }
    const path = `qris/${Date.now()}-${file.name}`;
    const url = await uploadImage(file, path);
    if (url) {
        const { error } = await sb.from('settings').upsert({ id: 1, qris_image_url: url });
        if (error) { showToast(`Gagal menyimpan QRIS: ${error.message}`, 'error'); }
        else {
            state.settings.qrisImageUrl = url;
            showToast('QRIS berhasil diupdate!');
            render();
        }
    }
    setLoading(btn, false, 'Simpan QRIS');
}

async function handleSaveWhatsapp(e) {
    const btn = e.target;
    setLoading(btn, true, 'Menyimpan');
    const number = document.getElementById('whatsapp-input').value.replace(/\D/g, '');
    const { error } = await sb.from('settings').upsert({ id: 1, whatsapp_number: number });
    if (error) { showToast(`Gagal menyimpan nomor: ${error.message}`, 'error'); }
    else {
        state.settings.whatsappNumber = number;
        showToast('Nomor WhatsApp berhasil disimpan.');
    }
    setLoading(btn, false, 'Simpan Nomor WA');
}

async function handleSaveProduct(e) {
    e.preventDefault();
    const btn = e.target.querySelector('#save-form-btn');
    setLoading(btn, true, 'Menyimpan');
    const id = e.target['product-id'].value;
    const file = e.target['product-image-file'].files[0];
    let imageUrl = state.products.find(p => p.id == id)?.image_url;
    if (file) imageUrl = await uploadImage(file, `products/${Date.now()}-${file.name}`);
    if (!imageUrl && !id) {
        showToast('Gambar produk wajib diunggah untuk produk baru.', 'error');
        setLoading(btn, false, 'Simpan');
        return;
    }
    const dataToSave = { name: e.target['product-name'].value, description: e.target['product-description'].value, price: Number(e.target['product-price'].value), image_url: imageUrl };
    const { error } = id ? await sb.from('products').update(dataToSave).match({ id }) : await sb.from('products').insert([dataToSave]);
    if (error) { showToast(`Gagal menyimpan produk: ${error.message}`, 'error'); }
    else { document.getElementById('product-form-container').classList.add('hidden'); showToast('Produk berhasil disimpan!'); }
    setLoading(btn, false, 'Simpan');
}

// --- Inisialisasi Event Listeners & Aplikasi ---
document.addEventListener('click', async (e) => {
    if (e.target.matches('#home-btn, #nav-home-btn, #footer-home-btn')) { state.view = 'home'; render(); }
    if (e.target.matches('#nav-admin-btn, #footer-admin-btn')) { state.view = 'admin'; render(); }
    if (e.target.matches('#back-to-home-btn')) { state.view = 'home'; render(); }
    if (e.target.matches('#cart-btn, #cart-btn *')) { floatingCartEl.classList.remove('hidden'); floatingCartEl.classList.add('flex'); renderCart(); }
    if (e.target.matches('#close-cart-btn, #close-cart-btn *')) { floatingCartEl.classList.add('hidden'); }
    if (e.target.matches('#checkout-btn')) { state.view = 'checkout'; render(); floatingCartEl.classList.add('hidden'); }
    if (e.target.matches('.add-to-cart-btn')) {
        const id = parseInt(e.target.dataset.productId);
        state.cart[id] = (state.cart[id] || 0) + 1;
        cartBtn.classList.add('cart-icon-animate');
        setTimeout(() => cartBtn.classList.remove('cart-icon-animate'), 600);
        render();
        showToast('Produk ditambahkan ke keranjang!');
    }
    if (e.target.matches('.cart-update-btn')) {
        const id = parseInt(e.target.dataset.productId);
        const amount = parseInt(e.target.dataset.amount);
        state.cart[id] = (state.cart[id] || 0) + amount;
        if (state.cart[id] <= 0) delete state.cart[id];
        renderCart(); render();
    }
    if (e.target.matches('#logout-btn')) { await sb.auth.signOut(); }
    if (e.target.matches('#add-product-btn')) { renderProductForm(); }
    if (e.target.matches('#cancel-form-btn')) { document.getElementById('product-form-container').classList.add('hidden'); }
    if (e.target.matches('.edit-product-btn')) { renderProductForm(state.products.find(p => p.id == e.target.dataset.productId)); }
    if (e.target.matches('.delete-product-btn')) { showToast('Produk dihapus.'); await sb.from('products').delete().match({ id: e.target.dataset.productId }); }
    if (e.target.matches('.delete-voucher-btn')) { showToast('Voucher dihapus.', 'error'); await sb.from('vouchers').delete().match({ id: e.target.dataset.voucherId }); }
    if (e.target.matches('#qris-save-btn')) { handleSaveQris(e); }
    if (e.target.matches('#whatsapp-save-btn')) { handleSaveWhatsapp(e); }
    if (e.target.matches('#apply-voucher-btn')) {
        const btn = e.target;
        setLoading(btn, true, 'Terapkan');
        const code = document.getElementById('voucher-input').value.toUpperCase();
        const { data, error } = await sb.from('vouchers').select('*').eq('code', code).single();
        if (data && data.is_active) {
            state.appliedVoucher = data;
            showToast(`Voucher ${data.code} berhasil diterapkan!`);
        } else {
            state.appliedVoucher = null;
            showToast('Kode voucher tidak valid atau sudah tidak aktif.', 'error');
        }
        renderCart();
        setLoading(btn, false, 'Terapkan');
    }
    if (e.target.matches('#whatsapp-contact-btn')) {
        const cartItems = Object.keys(state.cart).map(id => ({...state.products.find(p => p.id == id), quantity: state.cart[id]})).filter(Boolean);
        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let message = `Halo, saya ingin konfirmasi pembayaran untuk pesanan:\n\n${cartItems.map(item => `- ${item.name} (x${item.quantity})`).join('\n')}\n\nTotal: *${formatCurrency(total)}*`;
        window.open(`https://wa.me/${state.settings.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
        state.cart = {};
        showToast('Konfirmasi terkirim, keranjang dikosongkan.');
    }
});

document.addEventListener('submit', async (e) => {
    if (e.target.matches('#login-form')) {
        e.preventDefault();
        const btn = e.target.querySelector('#login-submit-btn');
        setLoading(btn, true, 'Login');
        const { error } = await sb.auth.signInWithPassword({ email: e.target.email.value, password: e.target.password.value });
        if (error) {
            e.target.querySelector('#login-error').textContent = error.message;
            e.target.querySelector('#login-error').classList.remove('hidden');
        }
        setLoading(btn, false, 'Login');
    }
    if (e.target.matches('#product-form')) { handleSaveProduct(e); }
    if (e.target.matches('#voucher-form')) {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        setLoading(btn, true, 'Membuat');
        const code = e.target['voucher-code'].value.toUpperCase();
        const discount = e.target['voucher-discount'].value;
        const { error } = await sb.from('vouchers').insert({ code, discount_amount: discount });
        if (error) { showToast(`Gagal membuat voucher: ${error.message}`, 'error'); }
        else { showToast(`Voucher ${code} berhasil dibuat!`); e.target.reset(); }
        setLoading(btn, false, 'Buat Voucher');
    }
});

document.addEventListener('change', async (e) => {
     if (e.target.type === 'file' && (e.target.id === 'qris-file-input' || e.target.id === 'product-image-file')) {
        const file = e.target.files?.[0];
        const containerId = e.target.id === 'qris-file-input' ? 'qris-preview-container' : 'product-preview-container';
        const container = document.getElementById(containerId);
        if (container) {
            if (file) {
                const text = e.target.id === 'qris-file-input' ? 'Pratinjau QRIS baru:' : 'Pratinjau gambar baru:';
                const imgClass = e.target.id === 'qris-file-input' ? 'mt-1 max-w-xs rounded-lg' : 'h-20 w-20 rounded-md object-cover mt-1';
                container.innerHTML = `<p class="text-xs">${text}</p><img src="${URL.createObjectURL(file)}" class="${imgClass}"/>`;
            } else { container.innerHTML = ''; }
        }
    }
    if(e.target.matches('.stock-switch')) {
        const id = e.target.dataset.productId;
        const is_available = e.target.checked;
        await sb.from('products').update({ is_available }).match({ id });
        showToast(`Stok produk berhasil diubah.`);
    }
    if(e.target.matches('.voucher-status-switch')) {
        const id = e.target.dataset.voucherId;
        const is_active = e.target.checked;
        await sb.from('vouchers').update({ is_active }).match({ id });
        showToast(`Status voucher diubah.`);
    }
    if(e.target.matches('#sort-by')) {
        state.sortBy = e.target.value;
        render();
    }
});

document.getElementById('search-input').addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    render();
});

async function init() {
    const { count } = await sb.from('products').select('*', { count: 'exact', head: true });
    if (count === 0) {
        console.log("Seeding database...");
        const sampleProducts = [
            { name: 'Kemeja Flanel Kotak', description: 'Bahan katun lembut, motif klasik.', price: 250000, image_url: 'https://placehold.co/600x400/3b82f6/ffffff?text=Kemeja' },
            { name: 'Celana Chino Slim-Fit', description: 'Potongan modern slim-fit, bahan stretch.', price: 320000, image_url: 'https://placehold.co/600x400/10b981/ffffff?text=Celana+Chino' },
            { name: 'T-Shirt Grafis Abstrak', description: 'Kaos katun premium dengan sablon eksklusif.', price: 180000, image_url: 'https://placehold.co/600x400/8b5cf6/ffffff?text=T-Shirt' },
            { name: 'Sepatu Sneakers Kanvas', description: 'Desain timeless, sol karet anti-slip.', price: 450000, image_url: 'https://placehold.co/600x400/ef4444/ffffff?text=Sneakers' },
            { name: 'Jaket Denim Klasik', description: 'Jaket denim tebal dengan kancing logam.', price: 550000, image_url: 'https://placehold.co/600x400/f97316/ffffff?text=Jaket+Denim' },
        ];
        await sb.from('products').insert(sampleProducts);
    }

    const { data: { session } } = await sb.auth.getSession();
    state.user = session?.user;
    document.getElementById('user-id-footer').textContent = `User ID: ${state.user?.id || 'Not logged in'}`;

    const fetchAllData = async () => {
        const { data: productsData } = await sb.from('products').select('*').order('created_at', { ascending: false });
        state.products = productsData || [];
        const { data: settingsData } = await sb.from('settings').select('qris_image_url, whatsapp_number').eq('id', 1).single();
        if (settingsData) {
            state.settings.qrisImageUrl = settingsData.qris_image_url;
            state.settings.whatsappNumber = settingsData.whatsapp_number;
        }
        const { data: vouchersData } = await sb.from('vouchers').select('*').order('created_at', { ascending: false });
        state.vouchers = vouchersData || [];
        state.isReady = true;
        render();
    };
    
    await fetchAllData();

    sb.auth.onAuthStateChange((_event, session) => {
        state.user = session?.user;
        document.getElementById('user-id-footer').textContent = `User ID: ${state.user?.id || 'Not logged in'}`;
        fetchAllData();
    });

    sb.channel('public-changes').on('postgres_changes', { event: '*', schema: 'public' }, fetchAllData).subscribe();
}

init();
</script>
</body>
</html>
