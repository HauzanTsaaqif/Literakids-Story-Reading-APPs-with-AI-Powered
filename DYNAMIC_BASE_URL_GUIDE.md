# Dynamic BASE_URL Configuration

## Overview
Aplikasi ini menggunakan sistem BASE_URL dinamis yang diambil dari Firestore. Ini sangat berguna untuk ngrok URL yang sering berubah-ubah.

## Setup Firestore

### 1. Buat Collection dan Document
Di Firestore Console, buat:
- **Collection**: `settings`
- **Document ID**: `0`
- **Field**: 
  - Name: `base_url`
  - Type: `string`
  - Value: `https://uninfinite-shantae-vanadious.ngrok-free.dev`

### 2. Struktur Firestore
```
settings (collection)
  └── 0 (document)
      └── base_url: "https://uninfinite-shantae-vanadious.ngrok-free.dev"
```

### 3. Update BASE_URL
Setiap kali ngrok URL berubah:
1. Buka Firestore Console
2. Edit document `settings/0`
3. Update field `base_url` dengan URL ngrok baru
4. Aplikasi akan otomatis menggunakan URL baru dalam 5 menit (atau restart app)

## How It Works

### Automatic Loading
- Saat aplikasi melakukan API request pertama kali, BASE_URL akan otomatis di-fetch dari Firestore
- BASE_URL akan di-cache selama 5 menit untuk mengurangi pembacaan Firestore
- Jika Firestore tidak tersedia atau kosong, akan menggunakan default URL

### Default URL
Jika tidak ada data di Firestore atau terjadi error:
```javascript
DEFAULT_BASE_URL = 'https://uninfinite-shantae-vanadious.ngrok-free.dev'
```

### Caching
- Cache duration: 5 menit
- Cache otomatis di-refresh setelah 5 menit
- Cache dapat di-clear manual jika diperlukan

## Usage

### Import API Service
```javascript
import api from '../services/api';
```

### Make API Calls
```javascript
// GET request
const response = await api.get('/endpoint');

// POST request
const response = await api.post('/endpoint', data);
```

### Utility Functions

#### Refresh BASE_URL (Force Reload)
```javascript
import { refreshBaseUrl } from '../services/api';

// Force refresh BASE_URL dari Firestore
await refreshBaseUrl();
```

#### Get Current BASE_URL
```javascript
import { getCurrentBaseUrl } from '../services/api';

const currentUrl = getCurrentBaseUrl();
console.log('Current BASE_URL:', currentUrl);
```

#### Set Custom BASE_URL (Testing)
```javascript
import { setCustomBaseUrl } from '../services/api';

// Untuk testing atau override sementara
setCustomBaseUrl('https://test-url.ngrok-free.dev');
```

## Files Structure

```
src/
├── config/
│   ├── index.js           # Default BASE_URL config
│   └── firebase.js        # Firebase config
├── services/
│   ├── api.js            # Axios instance dengan dynamic BASE_URL
│   └── apiConfig.js      # Service untuk fetch BASE_URL dari Firestore
```

## Key Features

✅ **Dynamic BASE_URL** - URL diambil dari Firestore
✅ **Caching** - Mengurangi pembacaan Firestore (cache 5 menit)
✅ **Fallback** - Otomatis menggunakan default URL jika Firestore error
✅ **Auto-refresh** - Cache otomatis di-refresh setelah 5 menit
✅ **Manual Refresh** - Function untuk force refresh BASE_URL
✅ **Logging** - Console log untuk tracking URL yang digunakan

## Testing

### Test dengan Default URL
1. Hapus document `settings/0` di Firestore
2. Restart aplikasi
3. Aplikasi akan menggunakan default URL

### Test dengan Custom URL
1. Set field `base_url` di Firestore dengan URL baru
2. Tunggu 5 menit atau call `refreshBaseUrl()`
3. Aplikasi akan menggunakan URL baru

### Test Manual Override
```javascript
import { setCustomBaseUrl } from '../services/api';

// Set untuk testing
setCustomBaseUrl('http://localhost:3000');

// API calls akan menggunakan localhost
await api.get('/test');
```

## Troubleshooting

### BASE_URL tidak berubah
- Tunggu 5 menit untuk cache expire
- Atau call `refreshBaseUrl()` untuk force refresh
- Restart aplikasi

### API Error setelah ngrok restart
1. Update `base_url` di Firestore dengan ngrok URL baru
2. Call `refreshBaseUrl()` atau restart app
3. Atau set manual dengan `setCustomBaseUrl(newUrl)`

### Firestore permission error
- Pastikan Firestore rules mengizinkan read pada collection `settings`
- Contoh rule:
  ```
  match /settings/{document=**} {
    allow read: if true;
    allow write: if request.auth != null;
  }
  ```

## Console Logs

Watch for these logs:
- `🚀 API initialized with BASE_URL:` - BASE_URL berhasil di-load
- `✅ BASE_URL loaded from Firestore:` - URL di-fetch dari Firestore
- `⚠️ BASE_URL not found in Firestore, using default:` - Menggunakan default
- `🔄 Using cached BASE_URL:` - Menggunakan cache
- `❌ Error fetching BASE_URL from Firestore:` - Error saat fetch

## Best Practices

1. **Update di Firestore** - Selalu update `base_url` di Firestore saat ngrok restart
2. **Monitor Logs** - Perhatikan console logs untuk memastikan URL yang benar
3. **Test First** - Test API connection setelah update BASE_URL
4. **Keep Default Updated** - Update default URL di `config/index.js` jika ada URL stable

## Example Firestore Setup Script

Jika ingin setup via code:
```javascript
import { firestore } from './config/firebase';
import { doc, setDoc } from 'firebase/firestore';

const initializeSettings = async () => {
  const settingsRef = doc(firestore, 'settings', '0');
  await setDoc(settingsRef, {
    base_url: 'https://uninfinite-shantae-vanadious.ngrok-free.dev',
    updated_at: new Date().toISOString(),
  });
  console.log('✅ Settings initialized');
};
```
