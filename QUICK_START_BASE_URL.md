# Quick Start: Dynamic BASE_URL Setup

## 🚀 Setup Firestore (Sekali aja)

### Cara Manual via Firestore Console:

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project **literakids**
3. Klik **Firestore Database**
4. Klik **Start collection**
   - Collection ID: `settings`
5. Add first document:
   - Document ID: `0`
   - Field: `base_url` (type: string)
   - Value: `https://uninfinite-shantae-vanadious.ngrok-free.dev`
6. Click **Save**

### Atau via Code (Otomatis):

```javascript
// Di App.js atau file pertama kali load
import { initializeBaseUrlSetting } from './src/services/firestoreSetup';

// Panggil sekali saat app start
useEffect(() => {
  initializeBaseUrlSetting();
}, []);
```

## 🔄 Update BASE_URL (Setiap ngrok restart)

### Cara 1: Via Firestore Console

1. Buka Firestore Console
2. Klik collection `settings` → document `0`
3. Edit field `base_url` dengan URL ngrok baru
4. Save

### Cara 2: Via Code

```javascript
import { updateBaseUrl } from './src/services/firestoreSetup';

// Update dengan URL baru
await updateBaseUrl('https://new-ngrok-url.ngrok-free.dev');

// Refresh API
import { refreshBaseUrl } from './src/services/api';
await refreshBaseUrl();
```

### Cara 3: Via React Native Debugger Console

```javascript
// Paste di console
import('./src/services/firestoreSetup').then(m =>
  m.updateBaseUrl('https://new-ngrok-url.ngrok-free.dev'),
);
```

## ✅ Verifikasi

Check console logs untuk memastikan URL sudah benar:

- `🚀 API initialized with BASE_URL:` - Success
- `✅ BASE_URL loaded from Firestore:` - URL dari Firestore
- `⚠️ BASE_URL not found...` - Perlu setup Firestore

## 📝 Catatan Penting

- **Cache 5 menit**: Setelah update, tunggu 5 menit atau restart app
- **Default URL**: Jika Firestore error, otomatis pakai default URL
- **No .env needed**: Tidak perlu update `.env` file lagi!

## 🆘 Troubleshooting

**Q: API masih pakai URL lama?**

- Tunggu 5 menit atau restart app
- Atau call `refreshBaseUrl()` untuk force refresh

**Q: Error Firestore permission?**

- Update Firestore Rules:
  ```
  match /settings/{document=**} {
    allow read: if true;
    allow write: if request.auth != null;
  }
  ```

**Q: Mau test dengan URL sementara?**

```javascript
import { setCustomBaseUrl } from './src/services/api';
setCustomBaseUrl('http://localhost:3000');
```

## 📚 Dokumentasi Lengkap

Lihat [DYNAMIC_BASE_URL_GUIDE.md](./DYNAMIC_BASE_URL_GUIDE.md) untuk detail lengkap.
