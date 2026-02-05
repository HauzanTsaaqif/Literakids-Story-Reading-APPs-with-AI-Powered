# 🚀 Quick Start - LiteraKids Firebase Setup

## ⚠️ Error yang Anda alami: `CONFIGURATION_NOT_FOUND`

**Penyebab**: Firebase Authentication belum diaktifkan di Firebase Console.

---

## 🔧 Langkah Perbaikan (5 Menit)

### 1️⃣ Aktifkan Firebase Authentication

1. Buka: **https://console.firebase.google.com/**
2. Pilih project: **literakids-a05b3**
3. Klik menu **"Authentication"** (sidebar kiri)
4. Klik **"Get Started"** (jika pertama kali)
5. Klik tab **"Sign-in method"**
6. Aktifkan **"Email/Password"**:
   - Klik baris "Email/Password"
   - Toggle ON
   - Klik **"Save"**

### 2️⃣ Aktifkan Firestore Database

1. Masih di Firebase Console
2. Klik menu **"Firestore Database"**
3. Klik **"Create database"**
4. Pilih **"Start in test mode"**
5. Lokasi: **asia-southeast1** atau **asia-east1**
6. Klik **"Enable"**

### 3️⃣ Inject Data Awal (1 Akun + 6 Buku)

Setelah langkah 1 & 2 selesai, jalankan di terminal:

```bash
npm run seed
```

✅ Script akan membuat:
- 1 akun orang tua
- 6 buku cerita anak
- Koneksi antara akun dan buku

---

## 🔑 Kredensial Login Default

```
Email    : orangtua@literakids.com
Password : Password123
Username : orangtua1
```

---

## ✅ Setelah Selesai

1. **Refresh browser** Anda (F5)
2. Klik tab **"Orang Tua"**
3. Login dengan kredensial di atas
4. Explore fitur admin panel!

---

## 📚 Detail Lengkap

Baca file: [FIREBASE_SETUP_QUICK.md](FIREBASE_SETUP_QUICK.md)

---

**Total waktu setup: ~5 menit** ⏱️
