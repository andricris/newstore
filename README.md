# 🛍️ H3Store - Solusi Kebutuhan Akun Premium Digital

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-site-id/deploy-status)](https://app.netlify.com/sites/newh3store/deploys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com)

> Platform modern untuk menjual akun premium digital yang dibangun dengan teknologi terdepan untuk memberikan pengalaman pembelian layanan digital yang luar biasa.

## 🌟 Demo Live

- **Website**: [https://newh3store.netlify.app](https://newh3store.netlify.app)
- **Admin Panel**: Klik tombol "Admin" → Login dengan akun Supabase Anda
- **Fitur QRIS**: Pembayaran terintegrasi dengan sistem QRIS Indonesia

## 🎯 Tentang H3Store

H3Store adalah solusi digital untuk menyediakan berbagai akun premium resmi seperti layanan streaming, aplikasi produktivitas, musik, dan game dengan harga terjangkau. Kami memastikan setiap akun dikirim cepat, aman, dan berkualitas sehingga Anda bisa menikmati layanan digital tanpa batasan.

### ✨ Keunggulan Kami
- 🎬🎧🎮 **Akun Premium Lengkap** - Netflix, Spotify, Steam, Office 365, dan lainnya
- 🚀 **Pengiriman Cepat** - Akun langsung aktif setelah pembayaran dikonfirmasi
- 🔒 **100% Legal & Aman** - Semua akun resmi dan bergaransi
- 💰 **Harga Terjangkau** - Lebih murah dari berlangganan langsung
- 🎉 **Support 24/7** - Tim customer service siap membantu kapan saja

## 🚀 Fitur Utama

### 🛒 **Untuk Pelanggan**
- **🖼️ Galeri Produk Dinamis** - Tampilan produk menarik dengan gambar berkualitas tinggi
- **🔍 Pencarian Real-time** - Cari produk instant berdasarkan nama atau kategori
- **🔄 Sorting & Filtering** - Urutkan berdasarkan harga, popularitas, atau yang terbaru
- **🛍️ Floating Cart** - Keranjang belanja mudah diakses dari mana saja
- **🎟️ Sistem Voucher** - Dukungan kode diskon dengan berbagai jenis (persentase/nominal)
- **📱 Responsive Design** - Tampilan optimal di desktop, tablet, dan mobile
- **⚡ Loading Cepat** - Optimasi performa dengan lazy loading dan caching
- **♿ Accessibility** - Dukungan penuh untuk screen readers dan keyboard navigation

### 🔧 **Untuk Admin**
- **🔐 Panel Admin Aman** - Sistem login terintegrasi dengan Supabase Auth
- **📊 Dashboard Analytics** - Statistik penjualan dan performa produk
- **📦 Manajemen Produk CRUD** - Tambah, edit, hapus produk dengan mudah
- **📸 Upload Gambar** - Sistem upload terintegrasi dengan Supabase Storage
- **🏪 Pengaturan Toko Lengkap**:
  - Upload gambar QRIS untuk pembayaran
  - Atur nomor WhatsApp untuk konfirmasi pesanan
  - Upload media promosi (gambar/video) untuk popup
  - Konfigurasi informasi toko (nama, email, alamat, nomor telepon)
- **🎫 Manajemen Voucher** - Buat, aktifkan/nonaktifkan kode voucher
- **📊 Realtime Updates** - Perubahan data langsung tersinkronisasi

### 💳 **Sistem Pembayaran**
- **📱 QRIS Payment** - Pembayaran menggunakan QRIS (GoPay, OVO, Dana, ShopeePay, dll)
- **💬 WhatsApp Integration** - Konfirmasi otomatis melalui WhatsApp
- **🧾 Order Tracking** - Sistem pelacakan pesanan yang komprehensif

## 🛠️ Teknologi yang Digunakan

### Frontend
- **HTML5** - Struktur semantic yang modern
- **Tailwind CSS** - Utility-first CSS framework untuk styling cepat
- **Vanilla JavaScript (ES6+)** - Logic aplikasi tanpa framework yang berat
- **Web APIs** - Memanfaatkan browser APIs untuk performa optimal

### Backend & Database
- **Supabase** - Backend-as-a-Service yang powerful
- **PostgreSQL Database** - Database relational yang robust
- **Supabase Auth** - Sistem autentikasi yang aman
- **Supabase Storage** - Penyimpanan file yang scalable
- **Realtime Subscriptions** - Update data secara real-time
- **Row Level Security** - Keamanan data tingkat row

### Deployment & DevOps
- **Netlify** - Hosting static website dengan CI/CD
- **GitHub** - Version control dan collaboration
- **CDN** - Content delivery untuk performa global

## 📁 Struktur Project

```
h3store/
├── 📄 index.html              # Halaman utama dengan struktur HTML
├── 🎨 style.css              # Custom styles dan animations
├── ⚡ app.js                  # Logic aplikasi dan integrasi Supabase
├── 🗄️ database_setup.sql     # Script setup database lengkap
├── 📚 README.md              # Dokumentasi project (file ini)
├── 📋 .gitignore             # File yang diabaikan Git
└── 📝 netlify.toml           # Konfigurasi deployment Netlify
```

## 🛠️ Panduan Setup & Instalasi

### Prerequisites
- Akun [Supabase](https://supabase.com) (gratis)
- Akun [GitHub](https://github.com) (gratis)
- Akun [Netlify](https://netlify.com) (gratis)
- Browser modern (Chrome, Firefox, Safari, Edge)

### 1. Setup Supabase Database

#### a) Buat Project Supabase
1. Buka [Supabase](https://supabase.com) dan login/register
2. Klik "New Project"
3. Isi detail project:
   - **Name**: `h3store`
   - **Database Password**: Buat password yang kuat
   - **Region**: Pilih yang terdekat (Singapore untuk Indonesia)
4. Tunggu project selesai dibuat (~2 menit)

#### b) Setup Database Schema
1. Buka project Supabase Anda
2. Pergi ke **SQL Editor** di sidebar
3. Copy seluruh isi file `database_setup.sql`
4. Paste di SQL Editor dan klik **"RUN"**
5. Tunggu hingga selesai - Anda akan melihat pesan "✅ All tables created successfully!"

#### c) Dapatkan API Keys
1. Pergi ke **Settings → API**
2. Copy nilai berikut:
   - **Project URL** (contoh: `https://xxx.supabase.co`)
   - **Project API Keys → anon public** (contoh: `eyJhbG...`)

#### d) Buat User Admin
1. Pergi ke **Authentication → Users**
2. Klik **"Add user"** → **"Create new user"**
3. Isi email dan password yang akan Anda gunakan untuk login admin
4. Klik **"Create user"**

### 2. Konfigurasi Code

#### a) Clone/Download Repository
```bash
# Clone repository
git clone https://github.com/username/h3store.git
cd h3store

# Atau download ZIP dan extract
```

#### b) Update Konfigurasi Supabase
1. Buka file `app.js`
2. Cari baris berikut di bagian atas:
```javascript
const supabaseUrl = 'https://viresxwhyqcflmfoyxsf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```
3. Ganti dengan URL dan API Key Supabase Anda:
```javascript
const supabaseUrl = 'https://YOUR-PROJECT-ID.supabase.co';
const supabaseAnonKey = 'YOUR-ANON-KEY';
```

### 3. Deploy ke Netlify

#### a) Deploy dari GitHub (Recommended)
1. Push code ke GitHub repository
2. Login ke [Netlify](https://netlify.com)
3. Klik **"Add new site"** → **"Import from Git"**
4. Pilih GitHub dan repository Anda
5. Konfigurasi build:
   - **Build command**: (kosongkan)
   - **Publish directory**: (kosongkan atau isi dengan `/`)
6. Klik **"Deploy site"**
7. Tunggu deployment selesai (~1-2 menit)

#### b) Deploy Manual (Drag & Drop)
1. Login ke Netlify
2. Drag & drop folder project ke area deploy
3. Tunggu upload selesai

#### c) Konfigurasi Domain (Opsional)
1. Di dashboard Netlify, klik **"Domain settings"**
2. Klik **"Options"** → **"Edit site name"**
3. Ganti dengan nama yang diinginkan (contoh: `h3store-anda`)

### 4. Konfigurasi Supabase untuk Production

#### a) Update Site URL
1. Kembali ke dashboard Supabase
2. Pergi ke **Authentication → URL Configuration**
3. Tambahkan URL Netlify Anda di **Site URL**:
```
https://your-site-name.netlify.app
```
4. Tambahkan juga di **Redirect URLs**

#### b) Verifikasi Storage
1. Pergi ke **Storage** di Supabase
2. Pastikan bucket `images` sudah ada dengan status **Public**
3. Jika belum ada, jalankan ulang script `database_setup.sql`

## 🎯 Cara Penggunaan

### Untuk Admin

#### 1. Login ke Admin Panel
1. Buka website Anda
2. Klik tombol **"Admin"** di header
3. Login dengan email dan password yang dibuat di Supabase

#### 2. Mengelola Produk
- **Tambah Produk**: Klik "Tambah Produk" → Isi form → Upload gambar → Simpan
- **Edit Produk**: Klik "Edit" di tabel produk → Ubah data → Simpan  
- **Hapus Produk**: Klik "Hapus" di tabel produk
- **Toggle Stok**: Gunakan switch di kolom "Stok" untuk menandai produk habis

#### 3. Pengaturan Toko
- **Upload QRIS**: Upload gambar QR Code untuk pembayaran
- **WhatsApp**: Masukkan nomor dengan format `62xxx` (tanpa +)
- **Media Promosi**: Upload gambar/video untuk popup promosi

#### 4. Mengelola Voucher
- **Buat Voucher**: Isi kode dan nominal diskon → Simpan
- **Aktifkan/Nonaktifkan**: Gunakan switch di daftar voucher
- **Hapus Voucher**: Klik tombol ✕ merah

### Untuk Pelanggan

#### 1. Berbelanja
1. Browse produk di halaman utama
2. Gunakan search box untuk mencari produk spesifik
3. Klik produk untuk melihat detail lengkap
4. Klik "Beli" atau "Tambah ke Keranjang"

#### 2. Checkout
1. Klik ikon keranjang di header
2. Review items di keranjang
3. Masukkan kode voucher (jika ada)
4. Klik "Lanjut ke Pembayaran"
5. Scan QR Code dengan aplikasi e-wallet
6. Klik "Sudah bayar? Klik di sini" untuk konfirmasi via WhatsApp

## 🔧 Kustomisasi

### Mengubah Tema Warna
Edit file `style.css` dan ubah custom properties di bagian `:root`:
```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #1e293b;
  --accent-color: #10b981;
}
```

### Mengubah Font
Edit file `style.css` di bagian `body`:
```css
body {
  font-family: 'Poppins', 'Inter', sans-serif;
}
```

### Mengubah Teks Hero & Footer
Nama toko dan detail kontak yang Anda atur melalui menu **Pengaturan Toko** akan digunakan secara otomatis pada halaman utama. Aplikasi memanfaatkan fungsi `updateFooter()` di `app.js` untuk menulis nilai ke elemen footer.

## 📊 Fitur Analytics (Coming Soon)
- Dashboard penjualan dengan grafik
- Laporan produk terlaris  
- Analytics traffic website
- Export data ke Excel/CSV

## 🔐 Keamanan

### Implementasi Keamanan
✅ **Row Level Security (RLS)** - Data protection di level database  
✅ **Input Sanitization** - Validasi semua input user  
✅ **SQL Injection Prevention** - Menggunakan prepared statements  
✅ **XSS Protection** - Escape HTML output  
✅ **CSRF Protection** - Token validation untuk actions  
✅ **Secure File Upload** - Validasi file type dan size  
✅ **Authentication** - Session-based auth dengan JWT  

### Best Practices
- Selalu gunakan HTTPS di production
- Backup database secara berkala
- Monitor logs untuk aktivitas mencurigakan
- Update dependencies secara rutin
- Gunakan environment variables untuk API keys

## 🐛 Troubleshooting

### Website Tidak Load
1. **Cek Console Browser** (F12 → Console)
   - Error koneksi Supabase → Periksa URL dan API key
   - CORS error → Update Site URL di Supabase
2. **Cek Network Tab** (F12 → Network)
   - Request gagal → Periksa endpoint dan authentication

### Database Error  
1. Jalankan ulang `database_setup.sql`
2. Periksa RLS policies di Supabase → Authentication → Policies
3. Cek Storage bucket di Supabase → Storage

### Upload File Gagal
1. Periksa Storage policies di Supabase
2. Cek file size (maksimal 10MB)
3. Verifikasi file type (jpg, png, webp, mp4)

### Login Admin Gagal
1. Periksa user di Supabase → Authentication → Users
2. Cek email confirmation status
3. Reset password jika perlu

## 🚀 Performance Optimization

### Yang Sudah Diimplementasi
✅ Lazy loading images  
✅ CSS minification via Tailwind  
✅ JavaScript ES6+ modern syntax  
✅ CDN untuk static assets  
✅ Gzip compression (Netlify)  
✅ Browser caching  
✅ Optimized images dengan WebP  

### Rekomendasi Tambahan
- Implementasi Service Worker untuk offline support
- Image optimization dengan next-gen formats
- Code splitting untuk JavaScript  
- Database query optimization
- Redis caching untuk data yang sering diakses

## 🤝 Contributing

Kami menerima kontribusi! Silakan:
1. Fork repository ini
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

### Development Guidelines
- Gunakan conventional commits
- Tulis kode yang readable dan documented
- Test semua fitur sebelum PR
- Update README jika menambah fitur

## 📝 Changelog

### v3.1 (Latest)
✨ **Fixed Auto Refresh & Removed Categories**
- 🔧 Fixed auto refresh issue during editing
- 🎨 Removed product categories display
- ⚡ Enhanced UI/UX improvements
- 🐛 Bug fixes and performance optimizations

### v3.0
✨ **Complete database schema dengan orders tracking**  
🎨 **Enhanced UI dengan modern design**  
🔧 **Improved error handling dan debugging**  
📱 **Better mobile responsiveness**  
♿ **Enhanced accessibility features**  
🚀 **Performance optimizations**  

### v2.0
🎉 **Enhanced features**
- 🎟️ Advanced voucher system
- ⚙️ Complete store settings
- 🎬 Promo media support
- 📊 Admin dashboard improvements

### v1.0
🎉 **Initial release**  
✅ **Basic CRUD operations**  
💳 **QRIS payment integration**  
🛒 **Shopping cart functionality**  

## 📞 Support

Butuh bantuan? Hubungi kami melalui:
- **Email**: support@h3store.com
- **GitHub Issues**: [Create Issue](https://github.com/username/h3store/issues)
- **Documentation**: [Wiki](https://github.com/username/h3store/wiki)

## 📄 License

Project ini menggunakan MIT License. Lihat file [LICENSE](LICENSE) untuk detail lengkap.

```
MIT License

Copyright (c) 2025 H3Store

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🌟 Credits

Dibuat dengan ❤️ menggunakan:
- [Supabase](https://supabase.com) - The Open Source Firebase Alternative
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework  
- [Netlify](https://netlify.com) - Deploy modern static websites
- [Heroicons](https://heroicons.com) - Beautiful hand-crafted SVG icons

---

<div align="center">

⭐ **Jika project ini bermanfaat, berikan star di GitHub!**

🔗 [Live Demo](https://newh3store.netlify.app) • 📚 [Documentation](https://github.com/username/h3store/wiki) • 🐛 [Report Bug](https://github.com/username/h3store/issues)

**Made with ❤️ for Indonesian Digital Commerce**

</div>