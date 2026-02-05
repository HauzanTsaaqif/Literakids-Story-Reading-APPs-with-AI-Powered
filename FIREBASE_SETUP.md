# LiteraKids - Aplikasi Baca Interaktif untuk Anak 📚✨

Aplikasi mobile interaktif untuk membantu anak usia 3-9 tahun belajar membaca dengan cara yang menyenangkan.

## 🌟 Fitur Utama

### Untuk Anak

- **Ruang Baca Interaktif**: Interface yang colorful dan ramah anak
- **Cerita Bergambar**: Setiap halaman dengan emoji yang menarik
- **Kategori Genre**: Hewan, Petualangan, Fantasi, Edukasi, Persahabatan
- **Kontrol Mudah**: Tombol besar, swipe antar halaman
- **Auto-play**: Otomatis pindah halaman (bisa diatur orang tua)

### Untuk Orang Tua

- **Dashboard Statistik**:

  - Jumlah buku yang sudah dibaca anak
  - Total waktu membaca
  - Jumlah sesi belajar
  - Rata-rata durasi per sesi

- **Manajemen Buku**:

  - Tambah buku dari koleksi global
  - Buat buku cerita sendiri
  - Hapus buku dari koleksi
  - Setiap buku memiliki nilai moral

- **Pengaturan**:
  - Ukuran font (Kecil/Sedang/Besar)
  - Toggle auto-play
  - Toggle suara

## 🔐 Autentikasi & Database

### Firebase Firestore Structure

```
masterBooks/
  └── {bookId}
      ├── title: string
      ├── content: array<string>  // Array of pages
      ├── genre: string
      ├── moralValue: string
      ├── coverEmoji: string
      ├── ageRange: string
      ├── estimatedDuration: number
      ├── isGlobal: boolean
      └── createdAt: timestamp

parents/
  └── {userId}
      ├── email: string
      ├── username: string
      ├── gender: string
      ├── birthDate: string
      ├── childAge: string
      ├── createdAt: timestamp
      └── settings:
          ├── fontSize: "small" | "medium" | "large"
          ├── autoPlay: boolean
          └── soundEnabled: boolean

parentBooks/
  └── {parentBookId}
      ├── parentId: string  // Reference to parents collection
      ├── masterBookId: string  // Reference to masterBooks collection
      └── addedAt: timestamp

readingSessions/
  └── {sessionId}
      ├── parentId: string
      ├── bookId: string
      ├── duration: number  // in minutes
      └── completedAt: timestamp
```

## 🚀 Setup & Installation

### Prerequisites

- Node.js >= 16
- npm atau yarn
- Expo CLI
- Android Studio (untuk Android) / Xcode (untuk iOS)
- Firebase Project dengan Firestore enabled

### Installation Steps

1. **Clone & Install Dependencies**

```bash
cd app
npm install
```

2. **Firebase Setup**

   - Buat project di [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Enable Cloud Firestore
   - Download `google-services.json` dan letakkan di root project
   - Update `src/config/firebase.js` dengan konfigurasi Firebase Anda

3. **Populate Initial Data**

   - Buka Firebase Console > Firestore
   - Jalankan script di `src/constants/initialData.js` untuk menambahkan 6 buku sampel

4. **Run Development**

```bash
# Start Expo
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

5. **Build APK**

```bash
# Build preview APK
npm run build:apk

# Build production AAB
eas build --platform android --profile production
```

## 📱 Navigasi Struktur

```
App
├── Splash Screen (3 detik)
└── Main (Tab Navigator)
    ├── Ruang Baca (HomeScreen)
    │   ├── Genre Filter
    │   ├── List Buku
    │   └── → StoryReader
    │       ├── Horizontal Swipe Pages
    │       └── Prev/Next/Auto/Audio Controls
    └── Orang Tua (LoginScreen)
        ├── Login/Register
        └── → ParentAdmin (Tab Navigator)
            ├── Dashboard
            │   ├── Statistik Anak
            │   └── Info & Tips
            ├── Buku
            │   ├── List Buku Koleksi
            │   ├── + Tambah dari Global
            │   └── + Buat Buku Baru
            └── Pengaturan
                ├── Ukuran Font
                ├── Auto Play
                └── Suara
```

## 🎨 Design Philosophy

### UX untuk Anak (3-9 tahun)

- **Warna Cerah**: Primary pink (#FF6B9D), palette penuh warna
- **Font Besar**: 20-48px untuk readability
- **Emoji Everywhere**: Visual feedback yang menarik
- **Touch Target Besar**: Minimum 44x44px untuk tombol
- **Animasi Smooth**: Spring animations untuk feedback
- **Navigasi Sederhana**: Maksimal 2 level depth

### UX untuk Orang Tua

- **Clean & Professional**: Warna lebih soft, layout terstruktur
- **Data Visualization**: Stats cards dengan icon intuitif
- **Easy CRUD**: Modal untuk add/create, swipe/tap untuk delete
- **Settings Accessibility**: Toggle switches, visual font preview
- **Tips & Guidance**: Helpful tips untuk mendampingi anak

## 📊 Firebase Services

### Authentication Service

```javascript
import { authService } from './services/firebaseService';

// Register
await authService.register(email, password, userData);

// Login (support email atau username)
await authService.login(emailOrUsername, password);

// Logout
await authService.logout();

// Get current user
const user = authService.getCurrentUser();
```

### Books Service

```javascript
import { booksService } from './services/firebaseService';

// Get all master books
const books = await booksService.getAllMasterBooks();

// Create new book
const bookId = await booksService.createMasterBook(bookData);
```

### Parent Books Service

```javascript
import { parentBooksService } from './services/firebaseService';

// Get parent's book collection
const books = await parentBooksService.getParentBooks(parentId);

// Add book to collection
await parentBooksService.addBookToParent(parentId, masterBookId);

// Remove book
await parentBooksService.removeBookFromParent(parentBookId);
```

### Stats Service

```javascript
import { statsService } from './services/firebaseService';

// Record reading session
await statsService.recordReading(parentId, bookId, durationMinutes);

// Get statistics
const stats = await statsService.getReadingStats(parentId);
// Returns: { totalBooks, totalMinutes, totalSessions, averageSessionTime }
```

## 🔧 Configuration

### Theme Customization

Edit `src/constants/theme.js`:

```javascript
export const COLORS = {
  primary: '#FF6B9D', // Pink for kids
  secondary: '#4ECDC4', // Teal for parents
  // ... more colors
};

export const FONTS = {
  sizes: {
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 24,
    xxlarge: 32,
    xxxlarge: 40,
  },
};
```

### Genre Configuration

Edit `src/constants/stories.js`:

```javascript
export const GENRES = [
  { id: 'animals', name: 'Hewan', icon: '🐾', color: '#FFE5B4' },
  // Add more genres
];
```

## 📚 Adding Custom Books

### Via Parent Admin Panel

1. Login sebagai orang tua
2. Buka tab "Buku"
3. Tekan tombol FAB (+)
4. Pilih "Buat Buku Baru"
5. Isi form:
   - Judul Buku
   - Genre
   - Nilai Moral
   - Emoji Cover
   - Usia
   - Isi Cerita per halaman
6. Tekan "Buat Buku"

### Via Firestore Console

1. Buka Firebase Console > Firestore
2. Collection: `masterBooks`
3. Add Document:

```json
{
  "title": "Judul Cerita",
  "content": [
    "Halaman 1 cerita...",
    "Halaman 2 cerita...",
    "Halaman 3 cerita..."
  ],
  "genre": "Hewan",
  "moralValue": "Kejujuran",
  "coverEmoji": "🐶",
  "ageRange": "3-6",
  "estimatedDuration": 5,
  "isGlobal": true,
  "createdAt": "SERVER_TIMESTAMP"
}
```

## 🧪 Testing

### Manual Testing Checklist

**Anak Flow:**

- [ ] Splash screen muncul 3 detik
- [ ] Tab "Ruang Baca" menampilkan buku
- [ ] Genre filter bekerja
- [ ] Buku bisa dibuka dan di-swipe
- [ ] Kontrol prev/next berfungsi
- [ ] Pull to refresh bekerja

**Orang Tua Flow:**

- [ ] Register dengan semua field
- [ ] Login dengan email
- [ ] Login dengan username
- [ ] Dashboard menampilkan statistik
- [ ] Tambah buku dari global
- [ ] Buat buku baru lengkap
- [ ] Hapus buku dari koleksi
- [ ] Ubah ukuran font
- [ ] Toggle auto-play & sound
- [ ] Logout berhasil

## 🚨 Troubleshooting

### Firebase Connection Issues

```javascript
// Check Firebase initialization
import app from './src/config/firebase';
console.log('Firebase App:', app);
```

### Build Errors

```bash
# Clear cache
npx expo start -c

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Firestore Permissions

Pastikan Firestore Rules mengizinkan read/write:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📈 Future Enhancements

- [ ] Audio narration untuk setiap halaman
- [ ] Gamifikasi dengan badge dan reward
- [ ] Leaderboard antar anak
- [ ] Rekomendasi buku berdasarkan usia
- [ ] Offline mode dengan sync
- [ ] Multi-language support
- [ ] Text-to-speech untuk anak yang belum bisa baca
- [ ] Parent dashboard analytics lebih detail
- [ ] Export laporan PDF

## 👥 Team

- **Developer**: LiteraKids Team
- **Version**: 1.0.0
- **License**: MIT

## 📞 Support

Untuk pertanyaan atau bug report, hubungi:

- Email: support@literakids.app
- GitHub Issues: [literakids/issues](https://github.com/literakids/issues)

---

**Built with ❤️ for Indonesian Children**
