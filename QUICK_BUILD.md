# 🚀 Quick EAS Build Commands - LiteraKids

## ⚡ Most Used Commands

### Build Preview APK (Recommended untuk Testing)

```bash
eas build --platform android --profile preview
```

### Build dengan Clear Cache

```bash
eas build --platform android --profile preview --clear-cache
```

### Build Production

```bash
eas build --platform android --profile production
```

---

## 📦 Prerequisites (First Time Only)

```bash
# 1. Install EAS CLI globally
npm install -g eas-cli

# 2. Login to Expo account
eas login

# 3. Configure project (if not done yet)
eas build:configure
```

---

## 📋 Workflow untuk Preview Build

```bash
# Step 1: Build preview APK
eas build --platform android --profile preview

# Step 2: Wait for build (5-15 minutes)
# Anda akan mendapat notifikasi via email

# Step 3: Download APK
# Klik link di terminal atau email
# Atau gunakan: eas build:list

# Step 4: Install di device
# Transfer APK ke Android device
# Enable "Install Unknown Apps"
# Install & test
```

---

## 🔍 Check Build Status

```bash
# List all builds
eas build:list

# View specific build details
eas build:view <build-id>

# Download build artifact
eas build:download --id <build-id>
```

---

## 📱 Profile Differences

| Profile        | Android Output         | Use Case                     |
| -------------- | ---------------------- | ---------------------------- |
| **preview**    | APK (ready to install) | Internal testing, demos      |
| **production** | AAB (App Bundle)       | Google Play Store submission |

---

## 🎯 Current Configuration

- ✅ **App Icon**: logo.png (configured)
- ✅ **Splash**: logo.png with white background
- ✅ **Android Package**: com.hauzanedu.literakids
- ✅ **iOS Bundle**: com.literakids.app
- ✅ **Preview Profile**: Ready untuk build APK

---

## 🐛 Common Issues & Fixes

### Build Failed

```bash
eas build --platform android --profile preview --clear-cache
```

### Update Icon/Assets

1. Update file di `src/assets/images/`
2. Rebuild: `eas build --platform android --profile preview`

### APK Not Installing

- Enable "Install from Unknown Sources"
- Uninstall old version first
- Check Android version compatibility (min SDK)

---

## 📞 Helpful Links

- **EAS Dashboard**: https://expo.dev
- **Full Guide**: Baca `EAS_BUILD_GUIDE.md`
- **Expo Docs**: https://docs.expo.dev/build/introduction/

---

**Ready to build?**

```bash
eas build --platform android --profile preview
```
