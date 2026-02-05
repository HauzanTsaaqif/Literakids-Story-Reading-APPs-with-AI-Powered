# 🔧 Setup Firebase untuk LiteraKids

## ❗ ERROR: CONFIGURATION_NOT_FOUND

Error ini muncul karena **Firebase Authentication belum diaktifkan** di Firebase Console.

## 📋 Langkah-Langkah Mengaktifkan Firebase Authentication

### 1. Buka Firebase Console
- Kunjungi: https://console.firebase.google.com/
- Login dengan akun Google Anda

### 2. Pilih Project LiteraKids
- Klik project: **literakids-a05b3**

### 3. Aktifkan Authentication
1. Klik menu **"Authentication"** di sidebar kiri
2. Klik tombol **"Get Started"** (jika baru pertama kali)
3. Klik tab **"Sign-in method"**
4. Cari provider **"Email/Password"**
5. Klik pada baris "Email/Password"
6. Toggle switch untuk **mengaktifkan** Email/Password
7. Klik **"Save"**

### 4. Aktifkan Firestore Database
1. Klik menu **"Firestore Database"** di sidebar kiri
2. Klik tombol **"Create database"**
3. Pilih **"Start in test mode"** (untuk development)
4. Pilih lokasi: **asia-southeast1** atau **asia-east1**
5. Klik **"Enable"**

### 5. Atur Security Rules (Opsional untuk Development)
Setelah Firestore aktif, ganti rules dengan:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**PENTING untuk Production**: Ganti dengan rules yang lebih ketat!

---

## 🌱 Inject Data Awal

Setelah Firebase Authentication dan Firestore diaktifkan, jalankan script seeding:

```bash
npm run seed
```

Script ini akan:
- ✅ Membuat 1 akun orang tua
- ✅ Menambahkan 6 buku cerita awal
- ✅ Menghubungkan buku dengan akun orang tua

### 📋 Kredensial Akun Default

```
Email: orangtua@literakids.com
Password: Password123
Username: orangtua1
```

Gunakan kredensial di atas untuk login ke aplikasi!

---

## 🚀 Testing Aplikasi

### 1. Jalankan Development Server
```bash
npm start
```

### 2. Pilih Platform
- **Web**: Tekan `w` atau buka http://localhost:8081
- **Android**: Tekan `a` (butuh emulator)
- **iOS**: Tekan `i` (butuh simulator)
- **Expo Go**: Scan QR code dengan app Expo Go

### 3. Test Flow
1. Buka aplikasi
2. Klik tab **"Orang Tua"**
3. Login dengan kredensial di atas
4. Explore dashboard, book list, dan settings

---

## 📚 Struktur Data Firestore

### Collection: `masterBooks`
```javascript
{
  title: "Si Kelinci Putih",
  content: ["...", "...", "..."],
  genre: "petualangan",
  moralValue: "...",
  coverEmoji: "🐰",
  ageRange: "3-5",
  estimatedDuration: 5,
  isGlobal: true,
  createdAt: Timestamp
}
```

### Collection: `parents`
```javascript
{
  email: "orangtua@literakids.com",
  username: "orangtua1",
  gender: "female",
  birthDate: "1990-01-15",
  childAge: 5,
  settings: {
    fontSize: "medium",
    autoPlay: false,
    soundEnabled: true
  },
  createdAt: Timestamp
}
```

### Collection: `parentBooks` (Junction Table)
```javascript
{
  parentId: "userId123",
  masterBookId: "book1",
  addedAt: Timestamp
}
```

### Collection: `readingSessions`
```javascript
{
  parentId: "userId123",
  bookId: "book1",
  duration: 300, // seconds
  completedAt: Timestamp
}
```

---

## 🔒 Security Rules untuk Production

Sebelum deploy ke production, ganti Firestore rules dengan:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Master books - read all, write authenticated only
    match /masterBooks/{bookId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Parent profiles - only owner can access
    match /parents/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Parent books - only owner can access
    match /parentBooks/{parentBookId} {
      allow read, write: if request.auth != null && 
                           resource.data.parentId == request.auth.uid;
    }
    
    // Reading sessions - only owner can access
    match /readingSessions/{sessionId} {
      allow read, write: if request.auth != null && 
                           resource.data.parentId == request.auth.uid;
    }
  }
}
```

---

## 🐛 Troubleshooting

### Error: "auth/operation-not-allowed"
➡️ Authentication belum diaktifkan. Ikuti langkah 3 di atas.

### Error: "auth/email-already-in-use"
➡️ Email sudah terdaftar. Gunakan email lain atau hapus user di Firebase Console > Authentication > Users.

### Error: "Missing or insufficient permissions"
➡️ Firestore rules terlalu ketat. Gunakan test mode dulu untuk development.

### Error: "Network error"
➡️ Cek koneksi internet dan pastikan Firebase project aktif.

---

## 📞 Support

Jika masih ada masalah:
1. Cek console browser (F12) untuk error detail
2. Cek Firebase Console > Authentication > Users untuk memastikan user terdaftar
3. Cek Firebase Console > Firestore Database untuk memastikan data tersimpan

---

**Happy Coding! 🎉**
