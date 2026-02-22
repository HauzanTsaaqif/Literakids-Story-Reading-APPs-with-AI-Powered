# 📦 EAS Build Guide - LiteraKids

## 🎯 Icon Configuration

✅ **Icon sudah configured:**

- **App Icon**: `./src/assets/images/logo.png`
- **iOS Icon**: `./src/assets/images/logo.png`
- **Android Icon**: `./src/assets/images/logo.png`
- **Android Adaptive Icon**: Foreground menggunakan logo.png dengan background putih
- **Splash Screen**: Logo dengan background putih

## 🚀 EAS Build Commands

### 📱 Build Preview APK (Android)

```bash
# Build preview APK untuk testing
eas build --platform android --profile preview

# Build dengan clear cache (jika ada masalah)
eas build --platform android --profile preview --clear-cache
```

### 🍎 Build Preview for iOS

```bash
# Build preview untuk iOS simulator
eas build --platform ios --profile preview
```

### 🌐 Build untuk Semua Platform

```bash
# Build preview untuk Android & iOS sekaligus
eas build --platform all --profile preview
```

### 🏭 Production Build

```bash
# Android (App Bundle untuk Play Store)
eas build --platform android --profile production

# iOS (untuk App Store)
eas build --platform ios --profile production

# Semua platform
eas build --platform all --profile production
```

## 📋 Prerequisites

### 1️⃣ Install EAS CLI

```bash
npm install -g eas-cli
```

### 2️⃣ Login ke Expo

```bash
eas login
```

### 3️⃣ Configure Project (First Time Only)

```bash
# Configure EAS untuk project
eas build:configure
```

## 🔧 Build Profiles

### Preview Profile (Testing)

- **Android**: Builds APK file yang bisa langsung di-install
- **iOS**: Builds untuk simulator atau ad-hoc distribution
- **Purpose**: Internal testing, QA, stakeholder demos

### Production Profile (Release)

- **Android**: Builds AAB (Android App Bundle) untuk Play Store
- **iOS**: Builds untuk App Store submission
- **Purpose**: Production release ke stores

## 📥 Download & Install Preview Build

### Setelah Build Selesai:

1. **Via EAS CLI:**

```bash
# List all builds
eas build:list

# Download specific build
eas build:download --id <build-id>
```

2. **Via Expo Dashboard:**

   - Buka https://expo.dev
   - Navigate ke project > Builds
   - Download APK/IPA file
   - Untuk Android: Transfer APK ke device dan install
   - Untuk iOS: Use TestFlight atau ad-hoc provisioning

3. **QR Code Install:**
   - Setelah build selesai, scan QR code dari terminal
   - Install langsung ke device

## 🎨 Icon Requirements

### Rekomendasi Ukuran:

- **App Icon**: 1024x1024 px (PNG dengan transparency)
- **Adaptive Icon (Android)**: 1024x1024 px foreground
- **Splash Screen**: Minimal 2048x2048 px

### Current Setup:

- ✅ Logo: `logo.png` (main colored version)
- ✅ Logo White: `logo_white.png` (white version untuk dark backgrounds)
- ✅ Background: White (#FFFFFF)

### Jika Perlu Update Icon:

1. Replace file di `src/assets/images/logo.png`
2. Pastikan ukuran minimal 1024x1024 px
3. Format PNG dengan transparency
4. Run `eas build` lagi

## 🔍 Useful Commands

```bash
# Check build status
eas build:list

# View build logs
eas build:view <build-id>

# Cancel running build
eas build:cancel

# Configure credentials (iOS)
eas credentials

# Update app version before build
# Edit app.json > version dan android.versionCode

# Submit to Play Store (after production build)
eas submit --platform android

# Submit to App Store (after production build)
eas submit --platform ios
```

## 📊 Build Process Flow

```
1. Run: eas build --platform android --profile preview
   ↓
2. EAS uploads code to Expo servers
   ↓
3. Expo builds APK in cloud
   ↓
4. Build completes (5-15 minutes)
   ↓
5. Download via link/QR code
   ↓
6. Install on device & test
```

## ⚡ Quick Start - First Build

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Build preview untuk Android
eas build --platform android --profile preview

# 4. Tunggu sampai selesai (check email untuk notifikasi)

# 5. Download & install APK
```

## 🐛 Troubleshooting

### Build Failed?

```bash
# Clear cache and rebuild
eas build --platform android --profile preview --clear-cache
```

### Credentials Issue (iOS)?

```bash
# Reconfigure credentials
eas credentials
```

### Icon Not Showing?

- Pastikan logo.png ada dan minimal 1024x1024 px
- Check app.json configuration
- Clear cache: `eas build --clear-cache`

### APK Not Installing?

- Enable "Install from Unknown Sources" di Android
- Check Android version compatibility
- Try uninstall old version first

## 📱 Testing Preview Build

### Android:

1. Download APK dari build link
2. Transfer ke Android device
3. Enable "Install Unknown Apps"
4. Install APK
5. Open & test

### iOS:

1. Download IPA atau use TestFlight
2. Install via Xcode atau TestFlight
3. Trust developer certificate (Settings > General > Device Management)
4. Open & test

## 🎉 Next Steps After Preview

1. **Test thoroughly** pada device
2. **Fix bugs** jika ada
3. **Update version** di app.json
4. **Build production**: `eas build --platform android --profile production`
5. **Submit to stores**: `eas submit`

## 📞 Resources

- EAS Build Docs: https://docs.expo.dev/build/introduction/
- Expo Dashboard: https://expo.dev
- Icon Generator: https://icon.kitchen

---

**Project**: LiteraKids
**Bundle ID (iOS)**: com.literakids.app
**Package (Android)**: com.hauzanedu.literakids
**EAS Project ID**: ac3c7688-f573-49ef-9540-a125fa5d1f3c
