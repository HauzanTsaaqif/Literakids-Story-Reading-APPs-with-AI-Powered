# Panduan Rebuild Aplikasi untuk Audio Player

## Status Saat Ini
✅ Kode sudah siap dengan expo-av
⚠️ Aplikasi perlu **rebuild** karena expo-av adalah **native module**

## Sementara Waktu (Tanpa Rebuild)
Aplikasi akan berjalan dengan **fallback mode**:
- Generate audio tetap berfungsi ✅
- Save cerita dengan audioUrl tetap berfungsi ✅  
- UI audio player tetap muncul ✅
- **Audio playback tidak akan bekerja** ❌ (butuh rebuild)
- Akan muncul alert dengan link audio yang bisa dibuka di browser 📱

## Untuk Mengaktifkan Audio Player Penuh

### Pilihan 1: Rebuild dengan Expo CLI (Recommended)
```bash
# 1. Stop Metro bundler (Ctrl+C)

# 2. Prebuild native code
npx expo prebuild --clean

# 3. Build untuk Android
npx expo run:android

# Atau untuk iOS  
npx expo run:ios
```

### Pilihan 2: Build Development Build Baru
```bash
# 1. Install EAS CLI jika belum
npm install -g eas-cli

# 2. Build development build
eas build --profile development --platform android

# 3. Install APK hasil build ke device
```

### Pilihan 3: Gunakan Expo Go (Paling Mudah tapi Terbatas)
⚠️ **TIDAK DIREKOMENDASIKAN** - Expo Go tidak support custom native modules seperti expo-av yang sudah kita install

## Setelah Rebuild Selesai
Audio player akan **fully functional**:
- ✅ Play/Pause audio dari generated speech
- ✅ Progress bar realtime
- ✅ Auto-slide sinkron dengan audio
- ✅ Timer display

## File yang Sudah Diupdate
1. `src/screens/parent/StorySettingsScreen.js` - Audio player dengan controls
2. `src/screens/StoryReaderScreen.js` - Auto-play dengan audio sync
3. `src/config/firebase.js` - Firebase Auth dengan AsyncStorage

## Dependencies Terpasang
- ✅ expo-av (untuk audio playback)
- ✅ @react-native-async-storage/async-storage (untuk Firebase Auth)

## Catatan Penting
- Setiap kali install **native module baru**, perlu rebuild
- Development build hanya perlu rebuild sekali
- Setelah rebuild, hot reload akan berfungsi normal lagi
