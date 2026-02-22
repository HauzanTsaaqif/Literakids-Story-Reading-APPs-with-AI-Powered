# Fast Refresh Guide - LiteraKids

## 🔥 Apa itu Fast Refresh?

Fast Refresh adalah fitur React Native yang memungkinkan perubahan kode langsung terlihat di aplikasi **TANPA** kehilangan state atau kembali ke halaman awal.

## ✅ Konfigurasi yang Sudah Dibuat

### 1. Metro Config (`metro.config.js`)

- Mengaktifkan Fast Refresh
- Menonaktifkan cache untuk hot reload yang lebih baik
- Konfigurasi transformer untuk JSX

### 2. VS Code Settings (`.vscode/settings.json`)

- Auto-save setelah 1 detik
- Format on save
- Auto import updates

### 3. App.js

- Menambahkan DEV mode detection
- Logging untuk Fast Refresh

## 🚀 Cara Menggunakan

### Menjalankan Development Server

```bash
# Jalankan dengan Expo
npm start

# Atau langsung untuk web
npm run web
```

### Untuk Web Browser

1. **Jalankan server**: `npm run web`
2. **Buka browser**: Biasanya di `http://localhost:8081` atau `http://localhost:19006`
3. **Edit file**: Simpan perubahan di VSCode
4. **Lihat hasilnya**: Browser akan update otomatis tanpa reload penuh

### Untuk Mobile (Expo Go/Emulator)

1. **Jalankan server**: `npm start`
2. **Scan QR Code** dengan Expo Go atau jalankan emulator
3. **Edit file**: Simpan perubahan
4. **Lihat hasilnya**: Aplikasi update otomatis dengan state tetap terjaga

## ⚡ Tips Fast Refresh

### ✅ Yang Akan Auto-Reload (Dengan State Tetap):

- Perubahan pada function components
- Perubahan pada hooks
- Perubahan pada styles
- Perubahan pada JSX/markup
- Perubahan pada export default

**Contoh:**

```javascript
// SEBELUM
export default function HomeScreen() {
  const [count, setCount] = useState(0);
  return <Text>Count: {count}</Text>;
}

// SESUDAH - Fast Refresh akan update tanpa reset count
export default function HomeScreen() {
  const [count, setCount] = useState(0);
  return <Text style={{ color: 'blue' }}>Count: {count}</Text>;
}
```

### ⚠️ Yang Memerlukan Full Reload:

- Perubahan pada class components
- Menambah/menghapus export
- Perubahan pada file di luar src/
- Perubahan pada native modules
- Perubahan pada dependencies

**Contoh yang perlu full reload:**

```javascript
// Menambah export baru
export const newFunction = () => {}; // ❌ Perlu reload

// Perubahan class component
class MyComponent extends React.Component {} // ❌ Perlu reload
```

## 🔧 Troubleshooting

### Fast Refresh Tidak Bekerja?

1. **Restart Metro Bundler**:

   ```bash
   # Tekan CTRL+C di terminal
   # Kemudian jalankan ulang
   npm start -- --reset-cache
   ```

2. **Cek Console Browser/Expo**:

   - Buka Developer Tools (F12) di browser
   - Lihat apakah ada error

3. **Pastikan Component Diekspor dengan Benar**:

   ```javascript
   // ✅ BENAR
   export default function MyScreen() {}

   // ✅ BENAR
   function MyScreen() {}
   export default MyScreen;

   // ❌ SALAH (tidak akan Fast Refresh)
   const MyScreen = () => {}
   module.exports = MyScreen;
   ```

4. **Force Reload**:
   - **Web**: Tekan `CTRL+R` atau refresh browser
   - **Mobile**: Shake device → "Reload"
   - **Emulator Android**: Double-tap `R`
   - **Emulator iOS**: `Cmd+R`

### Error "Fast Refresh had to perform a full reload"

Ini normal terjadi jika Anda:

- Mengubah export/import statements
- Menambah/menghapus hooks
- Mengubah class components

**Solusi**: Tidak perlu khawatir, ini hanya sekali saat perubahan tersebut.

## 📱 Best Practices

### 1. Gunakan Function Components

```javascript
// ✅ RECOMMENDED - Fast Refresh friendly
export default function HomeScreen() {
  return <View><Text>Hello</Text></View>;
}

// ❌ AVOID - Tidak Fast Refresh friendly
export default class HomeScreen extends Component {
  render() {
    return <View><Text>Hello</Text></View>;
  }
}
```

### 2. Export Default di Akhir File

```javascript
// ✅ RECOMMENDED
function HomeScreen() {
  return (
    <View>
      <Text>Hello</Text>
    </View>
  );
}

export default HomeScreen;
```

### 3. Pisahkan Logic dari Component

```javascript
// ✅ RECOMMENDED - Helper functions di luar component
const calculateScore = data => {
  return data.reduce((sum, item) => sum + item.score, 0);
};

export default function ScoreScreen() {
  const score = calculateScore(data);
  return <Text>Score: {score}</Text>;
}
```

### 4. Gunakan Named Exports untuk Utilities

```javascript
// utils/helpers.js
export const formatDate = date => {
  /* ... */
};
export const validateEmail = email => {
  /* ... */
};

// Perubahan di file ini memerlukan reload,
// tapi jika diubah di component akan Fast Refresh
```

## 🎯 Workflow Optimal

1. **Start Dev Server**: `npm run web`
2. **Open Browser**: Navigate ke localhost
3. **Open Editor**: VSCode dengan file yang ingin diedit
4. **Edit & Save**: VSCode auto-save setelah 1 detik
5. **See Changes**: Browser update otomatis tanpa reload penuh
6. **Repeat**: Edit lagi sepuasnya!

## 🔍 Monitoring Fast Refresh

Buka Console di browser/Expo untuk melihat:

```
Fast Refresh enabled for App.js
[Fast Refresh] Performing refresh...
[Fast Refresh] Rebuilt App.js
```

## ⌨️ Keyboard Shortcuts

### VS Code:

- `CTRL+S`: Save file (trigger Fast Refresh)
- `CTRL+SHIFT+P` → "Reload Window": Reload VS Code

### Browser:

- `CTRL+R`: Force reload (jika Fast Refresh gagal)
- `F12`: Open Developer Tools
- `CTRL+SHIFT+R`: Hard reload (clear cache)

### Expo/Metro:

- Press `r`: Reload app
- Press `d`: Open dev menu
- Press `c`: Clear cache and restart

## 📊 Performance Tips

1. **File Size**: Keep components small (<300 lines)
2. **Memoization**: Gunakan `useMemo` dan `useCallback` untuk prevent unnecessary rerenders
3. **Code Splitting**: Lazy load screens yang jarang digunakan

## 🐛 Known Issues

### Issue: "Perubahan tidak terdeteksi"

**Solusi**:

- Pastikan file sudah ter-save (`CTRL+S`)
- Check auto-save is enabled
- Restart Metro: `npm start -- --reset-cache`

### Issue: "State hilang setelah save"

**Penyebab**: Kemungkinan mengubah export/import atau hooks
**Solusi**: Ini expected behavior, state akan reset

### Issue: "Browser tidak auto-reload"

**Solusi**:

1. Cek console untuk errors
2. Restart Metro Bundler
3. Clear browser cache
4. Try different browser

## 🎓 Resources

- [React Native Fast Refresh Docs](https://reactnative.dev/docs/fast-refresh)
- [Expo Fast Refresh Guide](https://docs.expo.dev/workflow/development-mode/)
- [Metro Bundler Config](https://facebook.github.io/metro/docs/configuration)

## ✨ Summary

Fast Refresh sudah aktif! Sekarang Anda bisa:

- ✅ Edit component dan lihat perubahan instant
- ✅ State tetap terjaga (tidak kembali ke awal)
- ✅ Auto-save setiap 1 detik
- ✅ Format code otomatis saat save

**Happy Coding! 🚀**
