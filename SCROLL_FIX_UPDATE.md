# Updates - Dashboard Auto-Refresh & Scroll Fixes

## Changes Made

### 1. Dashboard Auto-Refresh ✅

**File**: `src/screens/parent/DashboardScreen.js`

- Added `useFocusEffect` from `@react-navigation/native`
- Dashboard now automatically reloads data every time the screen is focused
- Ensures stats, trivia, and charts are always up-to-date when navigating back

```javascript
// Before
useEffect(() => {
  loadDashboard();
}, []);

// After
useFocusEffect(
  React.useCallback(() => {
    loadDashboard();
  }, []),
);
```

### 2. GlobalBookListScreen Scroll Fix ✅

**File**: `src/screens/parent/GlobalBookListScreen.js`

- Added `flexGrow: 1` to `listContent` style
- Added `nestedScrollEnabled={true}` to FlatList
- Fixed: List dapat di-scroll bahkan tanpa perlu didaftarkan di bottom tab navigator

**Changes**:

- `listContent` style: Added `flexGrow: 1`
- FlatList props: Added `nestedScrollEnabled={true}`

### 3. GenerateStoryScreen Scroll Fix ✅

**File**: `src/screens/parent/GenerateStoryScreen.js`

- Added `scrollContentContainer` style with `flexGrow: 1`
- Added `nestedScrollEnabled={true}` to ScrollView
- Fixed: Content dapat di-scroll dengan lancar

**Changes**:

- ScrollView: Added `contentContainerStyle={styles.scrollContentContainer}`
- ScrollView: Added `nestedScrollEnabled={true}`
- New style: `scrollContentContainer` dengan `flexGrow: 1`

### 4. AppNavigatorDev Cleanup ✅

**File**: `src/navigation/AppNavigatorDev.js`

- Removed GlobalBookList dari bottom tab (karena seharusnya hanya diakses via modal dari BookListScreen)
- Keep 3 tabs: Dashboard, Buku, Pengaturan

## Root Cause Analysis

**Scroll Issue**:

- FlatList/ScrollView needs `contentContainerStyle` with `flexGrow: 1` untuk ensure content dapat di-scroll
- `nestedScrollEnabled={true}` membantu saat ada scrollable content di dalam scrollable parent

**Why it worked when added to navigator**:

- When registered as a tab, React Navigation automatically wraps the screen dengan proper container yang memiliki flex layout
- Solusi: Tambahkan `flexGrow: 1` dan `nestedScrollEnabled` langsung di component

## Testing Checklist

- [x] Dashboard auto-refresh saat navigate back dari screen lain
- [x] GlobalBookListScreen dapat di-scroll tanpa perlu tab registration
- [x] GenerateStoryScreen dapat di-scroll dengan lancar
- [x] Stats, trivia, dan chart di Dashboard selalu up-to-date
- [x] No compilation errors

## Files Modified

1. `src/screens/parent/DashboardScreen.js`
2. `src/screens/parent/GlobalBookListScreen.js`
3. `src/screens/parent/GenerateStoryScreen.js`
4. `src/navigation/AppNavigatorDev.js`
