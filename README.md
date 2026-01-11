# 📚 LiteraKids - Aplikasi Pembelajaran Literasi untuk Anak

Aplikasi mobile berbasis **Expo & React Native** untuk membantu anak-anak belajar membaca dengan cara yang menyenangkan dan interaktif.

## 🚀 Fitur Utama

- 🔤 Pembelajaran Huruf A-Z
- 📝 Latihan Membaca Kata
- 📚 Cerita Interaktif
- 🎮 Permainan Edukatif
- ⭐ Sistem Reward & Badge
- 📊 Tracking Progress Belajar
- 👤 Profil Pengguna

## 📁 Struktur Folder

```
literakids/
├── .github/
│   └── copilot-instructions.md
├── android/                    # Konfigurasi Android native
├── ios/                       # Konfigurasi iOS native
├── src/
│   ├── assets/               # Gambar, font, dan asset lainnya
│   │   ├── images/
│   │   └── fonts/
│   ├── components/           # Komponen reusable
│   │   ├── Button.js
│   │   ├── Card.js
│   │   └── index.js
│   ├── config/              # Konfigurasi aplikasi
│   │   └── index.js
│   ├── constants/           # Konstanta (theme, colors, dll)
│   │   └── theme.js
│   ├── hooks/               # Custom React hooks
│   ├── navigation/          # Konfigurasi navigasi
│   │   └── AppNavigator.js
│   ├── screens/             # Layar-layar aplikasi
│   │   ├── SplashScreen.js
│   │   ├── HomeScreen.js
│   │   ├── LearningScreen.js
│   │   └── ProfileScreen.js
│   ├── services/            # Service layer (API, storage)
│   │   ├── api.js
│   │   └── storage.js
│   ├── utils/               # Utility functions
│   │   └── helpers.js
│   └── App.js               # Root component
├── .eslintrc.js
├── .gitignore
├── .prettierrc.js
├── app.json
├── babel.config.js
├── index.js                 # Entry point
├── metro.config.js
├── package.json
└── README.md
```

## 🛠️ Teknologi yang Digunakan

- **Expo** ~52.0.0 - Development platform untuk React Native
- **React Native** 0.76.5 - Framework mobile cross-platform
- **React** 18.3.1 - Library UI
- **React Navigation** v6 - Routing & navigasi
  - Stack Navigator - Navigasi antar layar
  - Bottom Tab Navigator - Tab bar navigation
- **Axios** - HTTP client untuk API calls
- **AsyncStorage** - Local storage
- **Expo Status Bar** - Status bar styling
- **Expo Font** - Custom fonts support
- **Expo Splash Screen** - Splash screen management

## 📋 Prerequisites

Pastikan Anda sudah menginstall:

- **Node.js** >= 18
- **npm** atau **yarn**
- **Expo CLI** (akan terinstall otomatis)
- **Expo Go App** di smartphone (untuk testing)
- **EAS CLI** (untuk build production)

## ⚙️ Instalasi

1. **Clone repository atau setup project**
   ```bash
   cd d:\Kampus\Skripsi\Saya\app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # atau
   yarn install
   ```

3. **Start development server**
   ```bash
   npm start
   # atau
   npx expo start
   ```

## 🏃‍♂️ Menjalankan Aplikasi

### Development Mode (Expo Go)

```bash
# Start Metro Bundler
npm start

# Atau langsung run
npm run android    # Android Emulator
npm run ios        # iOS Simulator
npm run web        # Browser
```

**Scan QR Code:**
- Android: Scan dengan Expo Go app
- iOS: Scan dengan Camera app

### 📱 Testing di Device

1. Install **Expo Go** dari Play Store/App Store
2. Jalankan `npm start`
3. Scan QR code yang muncul
4. App akan running di device Anda

## 📦 Build APK/IPA

### Build APK (Android) - Tanpa Android Studio!

**1. Install EAS CLI:**
```bash
npm install -g eas-cli
```

**2. Login ke Expo:**
```bash
eas login
```

**3. Configure project:**
```bash
eas build:configure
```

**4. Build APK (Preview/Debug):**
```bash
npm run build:apk
# atau
eas build -p android --profile preview
```

**5. Build AAB (Production untuk Play Store):**
```bash
npm run build:android
# atau
eas build -p android --profile production
```

**Download:** Link download akan muncul di terminal dan di https://expo.dev

### Build IPA (iOS)

```bash
npm run build:ios
# atau
eas build -p ios --profile production
```

**Catatan:** Build iOS memerlukan Apple Developer Account ($99/tahun)

## 🌐 Deploy ke Web (Bonus!)

Expo mendukung web out-of-the-box:

```bash
npm run web

# Build for production
npx expo export:web

# Deploy ke Vercel/Netlify
# Upload folder web-build/
```

**Deploy otomatis ke Vercel:**
```bash
npm install -g vercel
vercel --prod
```

## 📤 Cara Deploy/Publish

### 1. **Expo Updates (Over-the-Air)**
```bash
eas update --branch production
```
Update app tanpa build ulang!

### 2. **Google Play Store**
- Build AAB: `eas build -p android --profile production`
- Upload ke Play Console
- Biaya: $25 sekali seumur hidup

### 3. **Apple App Store**
- Build IPA: `eas build -p ios --profile production`
- Upload via App Store Connect
- Biaya: $99/tahun

### 4. **Direct APK Download**
- Build APK preview
- Share link download ke user
- User install manual (gratis!)

### 5. **Expo Web**
- Deploy ke Vercel/Netlify
- User akses via browser
- Gratis!

## 📱 EAS Build Profiles

File `eas.json` sudah dikonfigurasi dengan 3 profiles:

```json
{
  "development": "Development build",
  "preview": "APK untuk testing (Android)",
  "production": "AAB/IPA untuk store"
}
```

**Contoh penggunaan:**
```bash
# Development
eas build --profile development

# Preview APK
eas build --profile preview --platform android

# Production
eas build --profile production --platform android
```

## 📱 Struktur Navigasi

```
App
└── Stack Navigator
    ├── Splash Screen (Initial)
    └── Main Tab Navigator
        ├── Home (Beranda)
        ├── Learning (Belajar)
        └── Profile (Profil)
```

## 🎨 Design System

### Colors
- Primary: `#FF6B6B` (Merah)
- Secondary: `#4ECDC4` (Tosca)
- Accent: `#FFD93D` (Kuning)
- Background: `#FFF8F0` (Krem)

### Typography
- System default fonts
- Sizes: 12, 16, 20, 24, 32

## 🔧 Konfigurasi

File konfigurasi utama:

- **babel.config.js** - Babel configuration
- **metro.config.js** - Metro bundler configuration
- **.eslintrc.js** - ESLint rules
- **.prettierrc.js** - Prettier formatting
- **app.json** - App metadata

## 📦 Scripts Available

```bash
npm start              # Start Expo dev server
npm run android        # Run on Android
npm run ios           # Run on iOS
npm run web           # Run on web browser
npm test              # Run tests
npm run lint          # Run ESLint
npm run build:apk     # Build APK (preview)
npm run build:android # Build AAB (production)
npm run build:ios     # Build IPA (production)
```

## 🚧 Development Guidelines

### Menambah Screen Baru

1. Buat file baru di `src/screens/NamaScreen.js`
2. Import dan tambahkan ke navigator di `src/navigation/AppNavigator.js`

### Menambah Component Baru

1. Buat file di `src/components/NamaComponent.js`
2. Export dari `src/components/index.js`

### Menggunakan API

```javascript
import api from '../services/api';

const fetchData = async () => {
  try {
    const data = await api.get('/endpoint');
    return data;
  } catch (error) {
    console.error(error);
  }
};
```

### Menggunakan Storage

```javascript
import { saveData, getData, STORAGE_KEYS } from '../services/storage';

// Save
await saveData(STORAGE_KEYS.USER_DATA, userData);

// Get
const userData = await getData(STORAGE_KEYS.USER_DATA);
```

## 🐛 Troubleshooting

### Metro Bundler Cache Issues
```bash
npx expo start -c
# atau
npm start -- -c
```

### Clear Expo Cache
```bash
npx expo start -c --clear
```

### Reset Everything
```bash
rm -rf node_modules
rm package-lock.json
npm install
npx expo start -c
```

### Build Issues
```bash
# Clear EAS build cache
eas build --clear-cache
```

## 📝 TODO / Next Steps

- [ ] Setup EAS Build account
- [ ] Upload icon & splash screen assets
- [ ] Implementasi autentikasi user
- [ ] Integrasi dengan backend API
- [ ] Tambah fitur audio untuk pembelajaran
- [ ] Implementasi gamification lebih lanjut
- [ ] Tambah animasi dan transisi
- [ ] Setup unit testing
- [ ] Publish ke Play Store
- [ ] Setup Expo Updates (OTA)

## 🎁 Keuntungan Menggunakan Expo

✅ **Tidak perlu Android Studio/Xcode** untuk development
✅ **Build APK di cloud** tanpa setup local
✅ **Hot reload** super cepat
✅ **Over-the-Air Updates** - update app tanpa build ulang
✅ **Web support** built-in - deploy ke Vercel gratis
✅ **Expo Go** - test langsung di device real
✅ **EAS Build** - build di cloud untuk semua platform
✅ **Managed workflow** - konfigurasi minimal

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Guide](https://docs.expo.dev/build/introduction/)
- [React Navigation Docs](https://reactnavigation.org/)
- [Expo Go App](https://expo.dev/client)

## 👥 Tim Pengembang

- Developer: [Nama Anda]
- Project: Skripsi - LiteraKids

## 📄 License

Copyright © 2026 LiteraKids

## 📞 Kontak

Untuk pertanyaan atau masukan, silakan hubungi:
- Email: [email@example.com]
- GitHub: [github.com/username]

---

Made with ❤️ for children's education
