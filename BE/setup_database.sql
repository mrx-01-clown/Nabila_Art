-- ============================================================
--  NABILA ART — Database Setup Script
--  Jalankan: mysql -u root -padmin < setup_database.sql
-- ============================================================

-- Buat database jika belum ada
CREATE DATABASE IF NOT EXISTS nabila_art
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nabila_art;

-- Verifikasi
SELECT 'Database nabila_art berhasil dibuat!' AS status;
SHOW TABLES;
