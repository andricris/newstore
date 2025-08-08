🛍️ H3Store - Solusi kebutuhan akun premium digital




Platform modern untuk menjual akun premium yang dibangun dengan teknologi terdepan untuk memberikan pengalaman pembelian layanan digital yang luar biasa.

🌟 Demo Live
Website: https://newh3store.netlify.app

Admin Panel: Klik tombol "Admin" → Login dengan akun Supabase Anda

Fitur QRIS: Pembayaran terintegrasi dengan sistem QRIS Indonesia

✨ Fitur Utama
🛒 Untuk Pelanggan
🖼️ Galeri Produk Dinamis - Tampilan produk yang menarik dengan gambar berkualitas tinggi

🔍 Pencarian Real-time - Cari produk secara instant berdasarkan nama atau kategori

🔄 Sorting & Filtering - Urutkan berdasarkan harga, popularitas, atau yang terbaru

🛍️ Floating Cart - Keranjang belanja yang mudah diakses dari mana saja

🎟️ Sistem Voucher - Dukungan kode diskon dengan berbagai jenis (persentase/nominal)

📱 Responsive Design - Tampilan optimal di desktop, tablet, dan mobile

⚡ Loading Cepat - Optimasi performa dengan lazy loading dan caching

♿ Accessibility - Dukungan penuh untuk screen readers dan keyboard navigation

🔧 Untuk Admin
🔐 Panel Admin Aman - Sistem login terintegrasi dengan Supabase Auth

📊 Dashboard Analytics - Statistik penjualan dan performa produk

📦 Manajemen Produk CRUD - Tambah, edit, hapus produk dengan mudah

📸 Upload Gambar - Sistem upload terintegrasi dengan Supabase Storage

🏪 Pengaturan Toko Lengkap:

Upload gambar QRIS untuk pembayaran

Atur nomor WhatsApp untuk konfirmasi pesanan

Upload media promosi (gambar/video) untuk popup

Konfigurasi informasi toko (nama, email, alamat, nomor telepon) yang otomatis ditampilkan di footer dan hero halaman utama

🎫 Manajemen Voucher - Buat, aktifkan/nonaktifkan kode voucher

📊 Realtime Updates - Perubahan data langsung tersinkronisasi

💳 Sistem Pembayaran
📱 QRIS Payment - Pembayaran menggunakan QRIS (GoPay, OVO, Dana, dll)

💬 WhatsApp Integration - Konfirmasi otomatis melalui WhatsApp

🧾 Order Tracking - Sistem pelacakan pesanan yang komprehensif

🚀 Teknologi yang Digunakan
Frontend
HTML5 - Struktur semantic yang modern

Tailwind CSS - Utility-first CSS framework untuk styling cepat

Vanilla JavaScript (ES6+) - Logic aplikasi tanpa framework yang berat

Web APIs - Memanfaatkan browser APIs untuk performa optimal

Backend & Database
Supabase - Backend-as-a-Service yang powerful

PostgreSQL Database - Database relational yang robust

Supabase Auth - Sistem autentikasi yang aman

Supabase Storage - Penyimpanan file yang scalable

Realtime Subscriptions - Update data secara real-time

Row Level Security - Keamanan data tingkat row

Deployment & DevOps
Netlify - Hosting static website dengan CI/CD

GitHub - Version control dan collaboration

CDN - Content delivery untuk performa global

📁 Struktur Project
bash
Salin
Edit
tokoprofesional/
├── 📄 index.html              # Halaman utama dengan struktur HTML
├── 🎨 style.css              # Custom styles dan animations
├── ⚡ app.js                  # Logic aplikasi dan integrasi Supabase
├── 🗄️ database_setup.sql     # Script setup database lengkap
├── 📚 README.md              # Dokumentasi project (file ini)
├── 📋 .gitignore             # File yang diabaikan Git
└── 📝 netlify.toml           # Konfigurasi deployment Netlify
🛠️ Panduan Setup & Instalasi
Prerequisites
Akun Supabase (gratis)

Akun GitHub (gratis)

Akun Netlify (gratis)

Browser modern (Chrome, Firefox, Safari, Edge)

1. Setup Supabase Database
a) Buat Project Supabase
Buka Supabase dan login/register

Klik "New Project"

Isi detail project:

Name: tokoprofesional

Database Password: Buat password yang kuat

Region: Pilih yang terdekat (Singapore untuk Indonesia)

Tunggu project selesai dibuat (~2 menit)

b) Setup Database Schema
Buka project Supabase Anda

Pergi ke SQL Editor di sidebar

Copy seluruh isi file database_setup.sql

Paste di SQL Editor dan klik "RUN"

Tunggu hingga selesai - Anda akan melihat pesan "✅ All tables created successfully!"

c) Dapatkan API Keys
Pergi ke Settings → API

Copy nilai berikut:

Project URL (contoh: https://xxx.supabase.co)

Project API Keys → anon public (contoh: eyJhbG...)

d) Buat User Admin
Pergi ke Authentication → Users

Klik "Add user" → "Create new user"

Isi email dan password yang akan Anda gunakan untuk login admin

Klik "Create user"

2. Konfigurasi Code
a) Clone/Download Repository
bash
Salin
Edit
# Clone repository
git clone https://github.com/username/tokoprofesional.git
cd tokoprofesional

# Atau download ZIP dan extract
b) Update Konfigurasi Supabase
Buka file app.js

Cari baris berikut di bagian atas:

javascript
Salin
Edit
const supabaseUrl = 'https://viresxwhyqcflmfoyxsf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
Ganti dengan URL dan API Key Supabase Anda:

javascript
Salin
Edit
const supabaseUrl = 'https://YOUR-PROJECT-ID.supabase.co';
const supabaseAnonKey = 'YOUR-ANON-KEY';
3. Deploy ke Netlify
a) Deploy dari GitHub (Recommended)
Push code ke GitHub repository

Login ke Netlify

Klik "Add new site" → "Import from Git"

Pilih GitHub dan repository Anda

Konfigurasi build:

Build command: (kosongkan)

Publish directory: (kosongkan atau isi dengan /)

Klik "Deploy site"

Tunggu deployment selesai (~1-2 menit)

b) Deploy Manual (Drag & Drop)
Login ke Netlify

Drag & drop folder project ke area deploy

Tunggu upload selesai

c) Konfigurasi Domain (Opsional)
Di dashboard Netlify, klik "Domain settings"

Klik "Options" → "Edit site name"

Ganti dengan nama yang diinginkan (contoh: tokoprofesional-anda)

4. Konfigurasi Supabase untuk Production
a) Update Site URL
Kembali ke dashboard Supabase

Pergi ke Authentication → URL Configuration

Tambahkan URL Netlify Anda di Site URL:

arduino
Salin
Edit
https://your-site-name.netlify.app
Tambahkan juga di Redirect URLs

b) Verifikasi Storage
Pergi ke Storage di Supabase

Pastikan bucket images sudah ada dengan status Public

Jika belum ada, jalankan ulang script database_setup.sql

🎯 Cara Penggunaan
Untuk Admin
1. Login ke Admin Panel
Buka website Anda

Klik tombol "Admin" di header

Login dengan email dan password yang dibuat di Supabase

2. Mengelola Produk
Tambah Produk: Klik "Tambah Produk" → Isi form → Upload gambar → Simpan

Edit Produk: Klik "Edit" di tabel produk → Ubah data → Simpan

Hapus Produk: Klik "Hapus" di tabel produk

Toggle Stok: Gunakan switch di kolom "Stok" untuk menandai produk habis

3. Pengaturan Toko
Upload QRIS: Upload gambar QR Code untuk pembayaran

WhatsApp: Masukkan nomor dengan format 62xxx (tanpa +)

Media Promosi: Upload gambar/video untuk popup promosi

4. Mengelola Voucher
Buat Voucher: Isi kode dan nominal diskon → Simpan

Aktifkan/Nonaktifkan: Gunakan switch di daftar voucher

Hapus Voucher: Klik tombol ✕ merah

Untuk Pelanggan
1. Berbelanja
Browse produk di halaman utama

Gunakan search box untuk mencari produk spesifik

Klik produk untuk melihat detail lengkap

Klik "Beli" atau "Tambah ke Keranjang"

2. Checkout
Klik ikon keranjang di header

Review items di keranjang

Masukkan kode voucher (jika ada)

Klik "Lanjut ke Pembayaran"

Scan QR Code dengan aplikasi e-wallet

Klik "Sudah bayar? Klik di sini" untuk konfirmasi via WhatsApp

🔧 Kustomisasi
Mengubah Tema Warna
Edit file style.css dan ubah custom properties di bagian :root:

css
Salin
Edit
:root {
  --primary-color: #3b82f6;
  --secondary-color: #1e293b;
  --accent-color: #10b981;
}
Mengubah Font
Edit file style.css di bagian body:

css
Salin
Edit
body {
  font-family: 'Poppins', 'Inter', sans-serif;
}
Menambah Kategori Produk
Update file database_setup.sql dan tambahkan kategori di sample data:

sql
Salin
Edit
INSERT INTO products (..., category, ...)
VALUES (..., 'new-category', ...);
Kustomisasi Pesan WhatsApp
Edit template di tabel settings:

sql
Salin
Edit
UPDATE settings 
SET whatsapp_message_template = 'Template pesan Anda: %ORDER_DETAILS%'
WHERE id = 1;
Mengubah Teks Hero & Footer
Nama toko dan detail kontak yang Anda atur melalui menu Pengaturan Toko akan digunakan secara otomatis pada halaman utama. Aplikasi memanfaatkan fungsi updateFooter() di app.js untuk menulis nilai store_name, store_email, store_address, dan store_phone ke elemen footer dengan id footer-store-name, footer-email, footer-address, footer-phone, dan footer-copy yang ada di index.html. Pastikan elemen-elemen ini ada di HTML Anda agar data tampil secara dinamis.

Untuk menampilkan nama toko secara dinamis pada hero section, ganti string statis “Selamat Datang di TokoProfesional” di fungsi renderHomeView() dengan ekspresi template berikut:

javascript
Salin
Edit
<h2 class="text-3xl md:text-4xl font-bold mb-4">
  Selamat Datang di ${appState.settings.store_name || 'TokoProfesional'}
</h2>
Dengan modifikasi ini, judul hero otomatis menggunakan nama toko yang tersimpan di Supabase. Jika nilai belum diatur, fallback ke “TokoProfesional”.

Mengatur Durasi Toast / Notifikasi
Toast (notifikasi) ditampilkan melalui fungsi showToast() di app.js. Secara default, toast akan hilang setelah 4000 ms (4 detik). Anda dapat menyesuaikan durasi ini dengan menambahkan parameter opsional, misalnya:

javascript
Salin
Edit
function showToast(message, type = 'success', duration = 2000) {
  const toast = document.createElement('div');
  // … atur konten dan animasi toast …
  setTimeout(() => {
    // hilangkan dan hapus toast
  }, duration);
}
Ketika dipanggil dengan showToast('Produk ditambahkan!', 'success', 1500), toast akan hilang setelah 1,5 detik. Jika parameter duration tidak diberikan, durasi default dapat ditetapkan di dalam fungsi.

📊 Fitur Analytics (Coming Soon)
Dashboard penjualan dengan grafik

Laporan produk terlaris

Analytics traffic website

Export data ke Excel/CSV

🔐 Keamanan
Implementasi Keamanan
✅ Row Level Security (RLS) - Data protection di level database

✅ Input Sanitization - Validasi semua input user

✅ SQL Injection Prevention - Menggunakan prepared statements

✅ XSS Protection - Escape HTML output

✅ CSRF Protection - Token validation untuk actions

✅ Secure File Upload - Validasi file type dan size

✅ Authentication - Session-based auth dengan JWT

Best Practices
Selalu gunakan HTTPS di production

Backup database secara berkala

Monitor logs untuk aktivitas mencurigakan

Update dependencies secara rutin

Gunakan environment variables untuk API keys

🐛 Troubleshooting
Website Tidak Load
Cek Console Browser (F12 → Console)

Error koneksi Supabase → Periksa URL dan API key

CORS error → Update Site URL di Supabase

Cek Network Tab (F12 → Network)

Request gagal → Periksa endpoint dan authentication

Database Error
Jalankan ulang database_setup.sql

Periksa RLS policies di Supabase → Authentication → Policies

Cek Storage bucket di Supabase → Storage

Upload File Gagal
Periksa Storage policies di Supabase

Cek file size (maksimal 10MB)

Verifikasi file type (jpg, png, webp, mp4)

Login Admin Gagal
Periksa user di Supabase → Authentication → Users

Cek email confirmation status

Reset password jika perlu

🚀 Performance Optimization
Yang Sudah Diimplementasi
✅ Lazy loading images

✅ CSS minification via Tailwind

✅ JavaScript ES6+ modern syntax

✅ CDN untuk static assets

✅ Gzip compression (Netlify)

✅ Browser caching

✅ Optimized images dengan WebP

Rekomendasi Tambahan
Implementasi Service Worker untuk offline support

Image optimization dengan next-gen formats

Code splitting untuk JavaScript

Database query optimization

Redis caching untuk data yang sering diakses

🤝 Contributing
Kami menerima kontribusi! Silakan:

Fork repository ini

Buat feature branch (git checkout -b feature/AmazingFeature)

Commit changes (git commit -m 'Add some AmazingFeature')

Push branch (git push origin feature/AmazingFeature)

Buat Pull Request

Development Guidelines
Gunakan conventional commits

Tulis kode yang readable dan documented

Test semua fitur sebelum PR

Update README jika menambah fitur

📥 Download Berkas Pembaruan
Untuk mempermudah akses terhadap versi terbaru dari file HTML dan JavaScript yang telah diperbarui, berikut tautan unduhnya (file‑file ini terdapat di repositori Anda):

index_updated.html: index_updated.html

app_updated.js: app_updated.js

📝 Changelog
v2.0.0 (Latest)
✨ Complete database schema dengan orders tracking

🎨 Enhanced UI dengan modern design

🔧 Improved error handling dan debugging

📱 Better mobile responsiveness

♿ Enhanced accessibility features

🚀 Performance optimizations

v1.0.0
🎉 Initial release

✅ Basic CRUD operations

💳 QRIS payment integration

🛒 Shopping cart functionality

📞 Support
Butuh bantuan? Hubungi kami melalui:

Email: support@tokoprofesional.com

GitHub Issues: Create Issue

Documentation: Wiki

📄 License
Project ini menggunakan MIT License. Lihat file LICENSE untuk detail lengkap.

sql
Salin
Edit
MIT License

Copyright (c) 2024 TokoProfesional

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
🌟 Credits
Dibuat dengan ❤️ menggunakan:

Supabase - The Open Source Firebase Alternative

Tailwind CSS - Utility-first CSS framework

Netlify - Deploy modern static websites

Heroicons - Beautiful hand-crafted SVG icons

<div align="center">
⭐ Jika project ini bermanfaat, berikan star di GitHub!

🔗 Live Demo • 📚 Documentation • 🐛 Report Bug

Made with ❤️ for Indonesian E-Commerce

</div>
