# 📱 Mobile Frontend — Nabila Art App
**Version:** 3.0.0 | **Last Updated:** 2026-05-22

---

## 📝 Deskripsi Sistem
Dokumentasi ini mencakup arsitektur, standar keamanan, alur kerja, dan pedoman teknis untuk **Mobile Frontend Nabila Art** yang dibangun menggunakan **React Native** dan **Expo SDK 54**. Aplikasi ini berfungsi sebagai katalog interaktif, pengelola keranjang belanja, serta media komunikasi pemesanan instan ke penjual melalui WhatsApp.

---

## 🛡️ Mobile Client Security

Aplikasi Mobile Nabila Art menerapkan standar keamanan tinggi pada tingkat *client-side* untuk mengimbangi keamanan di tingkat server backend (`BE/`). Berikut adalah ringkasan kontrol keamanan yang diimplementasikan:

| Dimensi Keamanan | Mekanisme & Kontrol | Keterangan Teknis |
|---|---|---|
| **Penanganan JWT (Secure Storage)** | Session Token Isolation | Token JWT disimpan di memori runtime (`useState` di dalam `AuthContext`). Untuk deployment produksi, token dapat dimigrasikan ke **`expo-secure-store`** yang memanfaatkan enkripsi hardware (*Keychain* di iOS dan *Keystore* di Android). |
| **Validasi Input Client-side** | Sanitasi Pra-Kirim & Form Guards | Seluruh input dari form pendaftaran dan login diproteksi menggunakan pembersihan string (`trim()`), konversi ke lowercase untuk email, pembatasan karakter kosong, serta validasi pola teks dasar sebelum dikirim ke API Server. |
| **WhatsApp Deep Linking** | Scheme Sanitization & URL Checking | Sebelum melakukan navigasi ke aplikasi WhatsApp, client melakukan *Pre-flight check* menggunakan `Linking.canOpenURL`. Parameter pesan diformat secara aman menggunakan `encodeURIComponent()` untuk mencegah eksploitasi manipulasi URL (*URL Injection*). |

---

## 🏗️ Arsitektur Aplikasi & Navigation

### 1. Global State Management (Context API)
Aplikasi memisahkan logic global menjadi dua domain Context utama yang bekerja secara independen namun selaras:

```text
               ┌──────────────────────────────────────┐
               │              App.tsx                 │
               │   (Root layout & provider wrapper)   │
               └──────────────────┬───────────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
┌──────────────────┐                              ┌──────────────────┐
│   AuthContext    │                              │   CartContext    │
├──────────────────┤                              ├──────────────────┤
│ State:           │                              │ State:           │
│ - user           │                              │ - cart           │
│ - token          │                              │ - totalItems     │
│ - isLoading      │                              │ - totalPrice     │
│                  │                              │                  │
│ Actions:         │                              │ Actions:         │
│ - login()        │                              │ - addToCart()    │
│ - register()     │                              │ - removeFromCart()│
│ - logout()       │                              │ - updateQuantity()│
│ - updateProfile()│                              │ - clearCart()    │
└──────────────────┘                              └──────────────────┘
```

* **`AuthContext.tsx`**: Mengelola session token, informasi profil user aktif, serta *action* API autentikasi (login, register, logout, update profile).
* **`CartContext.tsx`**: Mengelola status item di keranjang belanja, penambahan kuantitas produk, serta kalkulasi otomatis total item dan total nominal belanja secara *real-time*.

---

### 2. File-Based Routing (Expo Router)
Aplikasi ini menggunakan **Expo Router** untuk navigasi native yang lebih deklaratif berbasis struktur file di direktori `app/`:

```text
app/
├── (auth)/                  # Grup Rute Terproteksi Autentikasi
│   ├── login.tsx            # Halaman Form Login User
│   └── register.tsx         # Halaman Pendaftaran Akun Baru
│
├── (tabs)/                  # Grup Rute Navigasi Bottom Tabs
│   ├── _layout.tsx          # Konfigurasi Navigator Tabs & Icon
│   ├── index.tsx            # Halaman Dashboard / Catalog
│   ├── cart.tsx             # Halaman Keranjang & Checkout
│   └── profile.tsx          # Halaman Management Profil User
│
├── _layout.tsx              # Root Layout, Global Providers (Auth & Cart)
└── help.tsx                 # Halaman FAQ & Bantuan Umum
```

Setiap pergantian screen menggunakan hook native dari `expo-router` seperti `useRouter` untuk keamanan transisi antar halaman.

---

## ✨ Fitur Utama (Feature List)

### 🎨 1. Catalog Explorer
* Menyajikan koleksi seni berkualitas tinggi dengan performa *rendering* optimal menggunakan **`expo-image`** yang mendukung caching gambar pintar.
* Tata letak responsif yang menyesuaikan ukuran layar perangkat Android maupun iOS.

### 🛒 2. Interactive Cart
* Menambah item baru ke dalam keranjang, menambah/mengurangi kuantitas secara langsung, serta menghapus item secara instan.
* Kalkulasi harga akhir dan diskon dilakukan secara reaktif pada *client state*.

### 💬 3. WhatsApp Checkout Service
* Mengonversi isi keranjang belanja yang terpilih menjadi pesan konfirmasi berformat rapi (*markdown style* WhatsApp).
* Integrasi langsung menggunakan protokol deep link `whatsapp://send` dengan validasi penanganan error jika aplikasi WhatsApp tidak terinstal di perangkat pengguna.

---

## 🛠️ Panduan Teknis & Konfigurasi

### 1. Instalasi Dependencies
Arahkan terminal ke dalam direktori `AppsNabilaArt/` kemudian instal seluruh dependensi yang diperlukan:

```bash
# Masuk ke folder Frontend Mobile
cd AppsNabilaArt

# Install dependencies
npm install
```

### 2. ⚠️ PENTING: Konfigurasi BASE_URL API Backend
Untuk menghubungkan aplikasi mobile dengan server backend (`BE/`), silakan perhatikan konfigurasi **`API_BASE`** di file [AuthContext.tsx](file:///c:/ProjectKampus/FrontendNabila_Art/AppsNabilaArt/context/AuthContext.tsx#L26-L30):

```typescript
const API_BASE = Platform.OS === 'android'
  ? 'http://10.0.2.2:3000'
  : 'http://localhost:3000';
```

> [!WARNING]
> **PENGGUNAAN HP FISIK (Testing via Real Device):**
> Jika Anda melakukan testing menggunakan smartphone fisik melalui Expo Go, nilai `localhost` atau `10.0.2.2` tidak akan dapat diakses oleh HP Anda. 
> 
> **Solusi:**
> 1. Dapatkan IP Address lokal laptop/komputer Anda (misal: `192.168.1.15`).
> 2. Pastikan HP dan laptop Anda berada dalam **satu jaringan Wi-Fi yang sama**.
> 3. Ubah konfigurasi `API_BASE` menjadi IP lokal laptop Anda:
>    ```typescript
>    const API_BASE = 'http://192.168.1.15:3000';
>    ```

### 3. Menjalankan Aplikasi
Mulai metro bundler Expo dengan menjalankan:

```bash
# Jalankan Expo bundler
npx expo start
```

Pilih platform target pengujian Anda:
* Tekan `a` untuk membuka di Emulator Android.
* Tekan `i` untuk membuka di Simulator iOS.
* Tekan `w` untuk membuka di Web Browser.
* Scan QR Code di terminal menggunakan kamera HP Anda (iOS) atau aplikasi Expo Go (Android).

---

## ✅ Checklist Quality Assurance (QA)

Gunakan checklist ini untuk menguji kelayakan fungsionalitas dan keamanan aplikasi sebelum melakukan rilis:

### 🔑 1. Autentikasi & Session (Auth)
- [ ] **Registrasi Baru:** Memastikan user dapat mendaftar dengan format email yang valid.
- [ ] **Validasi Form Kosong:** Form login/register memunculkan toast/alert saat input kosong dikirim.
- [ ] **Login Valid:** Berhasil mendapatkan token JWT dan menyimpannya di auth state.
- [ ] **Login Invalid:** Muncul pesan kesalahan yang deskriptif saat password atau email salah.
- [ ] **Logout Session:** Seluruh data user dan token langsung dibersihkan dari state ketika tombol logout ditekan.

### 🛒 2. Keranjang Belanja (Cart)
- [ ] **Add to Cart:** Menekan tombol beli di Catalog berhasil menambah produk ke keranjang.
- [ ] **Kuantitas Increment/Decrement:** Tombol `+` menambah jumlah item dan tombol `-` mengurangi item. Jika item bernilai `0`, item otomatis terhapus dari keranjang.
- [ ] **Total Calculation:** Jumlah total nominal (total harga * kuantitas) dan total item terupdate secara real-time.
- [ ] **Clear Cart:** Keranjang belanja langsung kosong ketika transaksi berhasil dikirim ke WhatsApp.

### 💬 3. WhatsApp Checkout Integrasi
- [ ] **WhatsApp Installed:** Melakukan checkout membuka aplikasi WhatsApp secara instan dengan teks pesanan terisi otomatis.
- [ ] **WhatsApp Not Installed:** Muncul pop-up penanganan error (Alert) ketika mendeteksi aplikasi WhatsApp tidak terinstal di sistem.
- [ ] **URL Encoding Check:** Pesan yang dikirim tidak mengalami kerusakan karakter (spasi, karakter khusus, emoji ter-encode dengan aman).

---

## 🔗 Navigasi Project
* [⬅️ Kembali ke Menu Utama Root Repository](../README.md)
* [🔒 Lihat Security Policy Backend (BE/SECURITY.md)](../BE/SECURITY.md)
