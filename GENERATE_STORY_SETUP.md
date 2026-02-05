# Setup Environment Variables dan Generate Story Feature

## 📦 Instalasi Package

Package `react-native-dotenv` telah diinstall untuk mendukung environment variables di React Native.

## 🔧 Konfigurasi

### 1. File `.env`
File `.env` telah dibuat di root project dengan konfigurasi:
```
BASE_URL=https://your-api-domain.com
```

**PENTING:** Ganti `https://your-api-domain.com` dengan URL API Anda yang sebenarnya.

### 2. Babel Configuration
File `babel.config.js` telah diupdate dengan plugin `react-native-dotenv` untuk mendukung import environment variables.

## 🎨 Fitur Baru

### 1. Generate Story dengan API
[GenerateStoryScreen.js](src/screens/parent/GenerateStoryScreen.js) telah diupdate dengan:
- ✅ Hit API `{{BASE_URL}}/generate` dengan method POST
- ✅ Request body JSON format:
  ```json
  {
    "moral": "Rasa Hormat",
    "theme": "Kekeluargaan",
    "word": 300
  }
  ```
- ✅ Loading indicator saat proses generate
- ✅ Simpan response ke local storage
- ✅ Redirect ke halaman editor setelah berhasil

### 2. Story Editor Screen (Baru)
[StoryEditorScreen.js](src/screens/parent/StoryEditorScreen.js) telah dibuat dengan fitur:
- ✅ Slider halaman seperti StoryReaderScreen
- ✅ Text editable untuk setiap halaman
- ✅ Auto-save ke local storage saat edit
- ✅ Preview gambar cover berdasarkan genre/theme
- ✅ Tombol navigasi: Previous & Next
- ✅ Tombol Generate Gambar (coming soon)
- ✅ Style konsisten dengan parent dashboard theme (pink #E91E63)
- ✅ Tombol save di header untuk publish cerita

### 3. Navigation
[AppNavigator.js](src/navigation/AppNavigator.js) telah diupdate dengan route:
- `StoryEditorScreen` - Halaman editor cerita untuk parent

## 🚀 Cara Menggunakan

### 1. Setup Environment Variable
Edit file `.env` dan ganti BASE_URL dengan API Anda:
```bash
BASE_URL=https://api.yourdomain.com
```

### 2. Restart Metro Bundler
Setelah mengubah `.env` atau `babel.config.js`, restart metro bundler:
```bash
# Stop metro bundler (Ctrl+C)
# Kemudian jalankan ulang
npm start -- --reset-cache
```

### 3. Flow Penggunaan
1. User membuka halaman Generate Story
2. User memilih tema, nilai moral, dan panjang cerita
3. User klik tombol "Generate Cerita ✨"
4. Loading indicator muncul saat hit API
5. Setelah response diterima:
   - Data disimpan ke local storage
   - User otomatis redirect ke StoryEditorScreen
6. Di StoryEditorScreen:
   - User dapat mengedit teks cerita per halaman
   - User dapat navigate prev/next
   - User dapat generate gambar (coming soon)
   - User dapat save cerita dengan tombol 💾

## 📝 Response API Format
API harus mengembalikan JSON dengan format:
```json
{
  "cerita": {
    "1": "Teks halaman 1...",
    "2": "Teks halaman 2...",
    ...
  },
  "estimasi_waktu": "2 Menit",
  "full_story": "Full text...",
  "judul": "Judul Cerita",
  "moral": "Rasa Hormat",
  "theme": "Kekeluargaan"
}
```

## 🎨 Styling
StoryEditorScreen menggunakan:
- Primary color: #E91E63 (Pink - konsisten dengan parent theme)
- Background: #FAFAFA
- Card: #FFFFFF dengan shadow
- Font sizes dari FONTS.sizes (theme.js)
- Spacing dari SPACING (theme.js)

## 📸 Assets
Menggunakan cover images dan icons yang sama dengan StoryReaderScreen:
- Cover: `assets/images/cover/[genre].png`
- Icons: `assets/images/icon/[icon_name].png`

## 🔄 Auto-Save Feature
Setiap perubahan text di StoryEditorScreen otomatis disimpan ke local storage menggunakan:
- Service: `services/storage.js`
- Key format: `@generated_story_[timestamp]`

## ⚠️ Notes
1. Pastikan restart metro bundler setelah setup `.env`
2. Fitur generate image masih placeholder (coming soon)
3. Fitur save to Firebase masih placeholder (coming soon)
4. Pastikan API endpoint sudah ready dengan format yang benar
