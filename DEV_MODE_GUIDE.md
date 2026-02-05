# Development vs Production Mode

## Quick Toggle

Edit `src/App.js` and change this line:

```javascript
const USE_DEV_MODE = true; // Development mode
// OR
const USE_DEV_MODE = false; // Production mode
```

## Development Mode (`USE_DEV_MODE = true`)

- **Initial Route**: Langsung ke `ParentAdmin` (Dashboard)
- **Benefits**:
  - Tidak perlu melalui Splash Screen
  - Fast Refresh langsung ke halaman parent
  - Hemat waktu development
- **File**: `src/navigation/AppNavigatorDev.js`

## Production Mode (`USE_DEV_MODE = false`)

- **Initial Route**: `Splash` → `Main` → normal flow
- **Flow**: Splash Screen → Child Home → Parent Login → Parent Admin
- **File**: `src/navigation/AppNavigator.js`

## How to Use

### Saat Development:

```javascript
// src/App.js
const USE_DEV_MODE = true;
```

Save dan refresh - app akan langsung buka di ParentAdmin Dashboard

### Saat Production/Testing:

```javascript
// src/App.js
const USE_DEV_MODE = false;
```

Save dan refresh - app akan buka dari Splash Screen seperti biasa

## Files Modified

1. **src/App.js** - Toggle between navigators
2. **src/navigation/AppNavigator.js** - Production navigator (dengan Splash)
3. **src/navigation/AppNavigatorDev.js** - Development navigator (skip Splash)
4. **src/services/firebaseService.js** - Added `removeBookByMasterBookId` function
5. **src/screens/parent/GlobalBookListScreen.js** - Fixed auto-checklist & scroll

## Fixed Issues

✅ Global book list sekarang bisa scroll dengan lancar
✅ Auto-checklist untuk existing books berfungsi
✅ Splash screen enabled di production mode
✅ Development mode langsung build ke ParentAdmin
✅ Remove book functionality using masterBookId
