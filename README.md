# 🎨 Nabila Art Fullstack Project 🛍️

[![Tech Stack](https://img.shields.io/badge/Stack-Fullstack-brightgreen.svg)](#-tech-stack)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20TypeScript-blue.svg)](#-backend-be)
[![Mobile App](https://img.shields.io/badge/Mobile-React%20Native%20%7C%20Expo-orange.svg)](#-mobile-app-appsnabilaart)
[![Database](https://img.shields.io/badge/Database-Prisma%20%7C%20MySQL-lightblue.svg)](#)
[![Security](https://img.shields.io/badge/Security-Authorized%20%26%20Rate%20Limited-red.svg)](#-fitur-keamanan-security)

---

## 📝 Deskripsi Project

**Nabila Art** adalah platform e-commerce dan katalog seni modern berbasis mobile yang dirancang khusus untuk menjembatani seniman dengan penikmat seni. Aplikasi ini memungkinkan pengguna menjelajahi karya seni berkualitas, menambahkannya ke keranjang belanja, dan melakukan checkout langsung ke WhatsApp penjual melalui integrasi **WhatsApp Service** yang instan dan praktis.

Dengan arsitektur **Monorepo**, proyek ini terbagi menjadi dua bagian utama:
1. **`BE/` (Backend)**: API Server berkinerja tinggi dengan fokus utama pada keamanan siber, manajemen autentikasi, serta pembatasan laju permintaan (Rate Limiting).
2. **`AppsNabilaArt/` (Mobile)**: Aplikasi mobile modern menggunakan React Native (Expo) dengan sistem navigasi responsif, keranjang belanja dinamis, dan state management yang tangguh.

---

## 🛠️ Tech Stack

### 📱 Frontend (Mobile Application)
* **Framework:** React Native & Expo SDK 54 (dengan Expo Router berbasis File Routing)
* **Language:** TypeScript
* **State Management:** React Context API (`AuthContext` & `CartContext`)
* **Styling & UI:** React Native stylesheet dengan animasi fluid (Reanimated)
* **Icons:** `@expo/vector-icons`

### ⚙️ Backend (API Server)
* **Runtime:** Node.js
* **Framework:** Express.js (TypeScript engine)
* **Database ORM:** Prisma ORM (Mendukung MySQL / TiDB Cloud)
* **Loggers:** Winston & Morgan

### 🔒 Security Framework (Backend)
* **Authentication:** JSON Web Tokens (JWT) & Bcryptjs untuk enkripsi password
* **HTTP Headers Guard:** Helmet.js (Melindungi dari serangan umum web)
* **CORS Guard:** Configured CORS origins
* **Rate Limiter:** `express-rate-limit` (Mencegah serangan Brute Force / DDoS)
* **Data Sanitizer:** `express-validator` (Validasi input payload)

---

## 📂 Struktur Project (Monorepo)

Berikut adalah struktur direktori yang bersih dan modular dari Nabila Art Project:

```text
Nabila_Art/
│
├── BE/                           # ⚙️ BACKEND API DIRECTORY
│   ├── prisma/                   # Skema database Prisma
│   │   └── schema.prisma
│   ├── src/
│   │   ├── index.ts              # Entry point Express API Server
│   │   ├── middleware/           # Middleware (Auth token checker, dll.)
│   │   └── security/             # Security configurations & rate limiters
│   ├── .env.example              # Template file Environment Variables
│   ├── package.json              # Backend dependencies & scripts
│   └── tsconfig.json             # Konfigurasi TypeScript compiler
│
├── AppsNabilaArt/                # 📱 MOBILE APP DIRECTORY (EXPO)
│   ├── app/                      # Expo Router Pages (Layout, Catalog, Auth pages)
│   ├── assets/                   # Gambar, splash screen, dan font assets
│   ├── components/               # Komponen UI Reusable (ProductCard, Button, dll.)
│   ├── context/                  # Global State (AuthContext.tsx, CartContext.tsx)
│   ├── services/                 # Whatsapp.ts & API Service Integrator
│   ├── constants/                # Tema warna, tipografi, dan konfigurasi API URL
│   ├── package.json              # Mobile dependencies & scripts
│   └── tsconfig.json             # Konfigurasi TypeScript mobile
│
└── README.md                     # File dokumentasi utama ini
```

---

## ⚙️ Panduan Instalasi & Jalankan Aplikasi

> [!IMPORTANT]
> Pastikan Anda sudah menginstal **Node.js LTS (versi 18+)** dan **Git** di perangkat Anda sebelum memulai instalasi.

---

### 1. ⚙️ Langkah Setup: Backend (`BE/`)

Arahkan terminal ke dalam folder `BE` dan ikuti langkah di bawah:

```bash
# Pindah ke direktori Backend
cd BE

# Install seluruh dependencies backend
npm install
```

#### 📦 Konfigurasi Environment Variables (`.env`)
Buat file baru bernama `.env` di dalam folder `BE` (atau salin dari `.env.example`) dan isi variabel berikut sesuai dengan database Anda:

```env
# Port Server
PORT=3000
NODE_ENV=development

# URL Database (MySQL atau TiDB Cloud)
DATABASE_URL="mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME?ssl=true"

# Keamanan Token JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Asal request yang diperbolehkan (CORS)
CORS_ORIGIN=http://localhost:8081
```

#### 🗄️ Sinkronisasi Database (Prisma DB Push)
Setelah `.env` terkonfigurasi dengan benar, jalankan sinkronisasi schema Prisma ke database Anda:

```bash
# Push skema database Prisma
npx prisma db push

# (Opsional) Buka Prisma Studio untuk memvisualisasikan database di browser
npm run db:studio
```

#### 🚀 Menjalankan Server Backend
Jalankan server backend dalam mode development:

```bash
npm run dev
```
Server backend Anda akan aktif di alamat `http://localhost:3000` (atau port sesuai `.env` Anda).

---

### 2. 📱 Langkah Setup: Mobile App (`AppsNabilaArt/`)

Arahkan terminal ke dalam folder `AppsNabilaArt` dan lakukan instalasi:

```bash
# Pindah ke direktori Mobile App
cd ../AppsNabilaArt

# Install dependencies React Native & Expo
npm install
```

#### 🎯 Memulai Server Expo Go
Jalankan bundler Expo untuk memulai proses testing aplikasi:

```bash
# Jalankan Expo bundler
npm run start
```

Setelah server Expo menyala, Anda dapat menjalankan aplikasi melalui:
* **Smartphone Fisik:** Download aplikasi **Expo Go** di Play Store / App Store, lalu scan QR Code yang muncul di terminal/browser Anda.
* **Android Emulator:** Tekan tombol `a` pada terminal untuk membuka di Android emulator.
* **iOS Simulator:** Tekan tombol `i` pada terminal untuk membuka di iOS simulator.

---

## 🌟 Fitur Unggulan

### 🔒 Fitur Keamanan (Security) di Backend
Untuk menjamin keamanan data pengguna dan ketahanan server, backend dirancang dengan standar tinggi:
* **Token-Based Authentication:** Pengamanan route sensitif menggunakan JWT (JSON Web Tokens). Hanya pengguna terautentikasi yang dapat mengakses resource tertentu.
* **DDoS & Brute Force Prevention:** Menggunakan `express-rate-limit` untuk membatasi jumlah request dari satu IP address dalam kurun waktu tertentu.
* **HTTP Security Headers:** Diperkuat dengan `helmet` untuk menyembunyikan informasi teknologi server dan menangkal serangan XSS, Clickjacking, dan sniffing data.
* **Input Sanitization:** Proteksi ekstra menggunakan `express-validator` sehingga setiap request payload yang masuk disaring agar bersih dari SQL Injection.

### 📱 Fitur Utama Aplikasi Mobile (`AppsNabilaArt`)
* **Catalog Explorer:** Tampilan karya seni yang memanjakan mata, dilengkapi informasi detail, harga, nama seniman, dan foto beresolusi tinggi.
* **Direct-to-WhatsApp Checkout:** Fitur checkout otomatis menggunakan WhatsApp Service. Data item belanja di keranjang akan diformat menjadi pesan teks yang rapi dan dikirim langsung ke nomor WhatsApp admin/seniman untuk transaksi lebih lanjut.
* **Global AuthContext:** Mengatur status masuk, daftar, serta session token JWT secara persisten sehingga pengguna tidak perlu login berulang kali saat membuka aplikasi kembali.
* **Interactive CartContext:** Manajemen keranjang belanja dinamis berbasis local state. Pengguna dapat dengan mudah menambah, mengurangi jumlah, atau menghapus item seni dari keranjang secara real-time.

---

## 🤝 Kontribusi & Kolaborasi

Project ini dikembangkan sebagai pemenuhan tugas besar perkuliahan sekaligus portofolio profesional untuk platform e-commerce katalog seni berbasis mobile yang aman. Jika dosen, asisten praktikum, atau kolaborator ingin memberikan feedback, dipersilakan untuk:
1. Membuka **Issue** jika menemukan bug atau celah keamanan.
2. Mengajukan **Pull Request** dengan peningkatan fitur baru.

---

> 💻 **Nabila Art Team** - *Seni Bertemu Kemudahan Teknologi.*
