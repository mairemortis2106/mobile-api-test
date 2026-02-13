# Migration Guide - API Tester Pro

## 🎯 Tujuan Refactoring

Memecah monolithic component menjadi struktur yang:
- ✅ Mudah dimaintain
- ✅ Reusable components
- ✅ Separation of concerns
- ✅ Testable
- ✅ Scalable

## 📁 Struktur Folder Baru

```
api-tester-pro/
├── App.js                          # Main app (refactored)
└── src/
    ├── components/                 # Reusable UI components
    │   ├── common/                # Generic components
    │   │   ├── Button.js
    │   │   ├── Badge.js
    │   │   └── EmptyState.js
    │   ├── request/               # Request-specific
    │   │   └── HeadersEditor.js
    │   ├── logs/                  # Logs-specific
    │   │   └── LogsList.js
    │   ├── history/               # History-specific
    │   │   └── HistoryList.js
    │   ├── settings/              # Settings-specific (to be created)
    │   └── index.js               # Export barrel
    │
    ├── screens/                   # Screen-level components
    │   ├── Header.js
    │   ├── MainTabs.js
    │   ├── RequestScreen.js       # (to be created)
    │   ├── LogsScreen.js
    │   ├── HistoryScreen.js
    │   └── SettingsScreen.js      # (to be created)
    │
    ├── services/                  # Business logic
    │   ├── apiService.js          # API call logic
    │   └── sslService.js          # SSL/TLS logic
    │
    ├── hooks/                     # Custom React hooks
    │   ├── useLogger.js           # Logging state & logic
    │   └── useHistory.js          # History state & logic
    │
    ├── utils/                     # Helper functions
    │   ├── formatters.js          # Formatting utilities
    │   └── logger.js              # Logger class
    │
    └── constants/                 # Constants
        ├── app.js                 # App constants
        └── colors.js              # Color palette
```

## 🔄 Component Mapping

### Dari Monolithic ke Modular

| Old (Single File) | New (Multiple Files) |
|------------------|---------------------|
| All state in App.js | Split into hooks (useLogger, useHistory) |
| All API logic in component | Moved to services/ |
| All UI in one file | Split into components/ and screens/ |
| Hardcoded values | Moved to constants/ |
| Inline formatters | Moved to utils/ |

## 📝 Yang Sudah Dibuat

### ✅ Constants
- `constants/app.js` - App constants (HTTP methods, tabs, etc)
- `constants/colors.js` - Color palette

### ✅ Utils
- `utils/formatters.js` - Formatting functions
- `utils/logger.js` - Logger class

### ✅ Services
- `services/sslService.js` - SSL/TLS checking & handshake simulation
- `services/apiService.js` - API request handling

### ✅ Hooks
- `hooks/useLogger.js` - Logging state management
- `hooks/useHistory.js` - History state management

### ✅ Components - Common
- `components/common/Button.js` - Reusable button
- `components/common/Badge.js` - Status badges
- `components/common/EmptyState.js` - Empty state display

### ✅ Components - Specific
- `components/request/HeadersEditor.js` - Headers editing
- `components/logs/LogsList.js` - Logs display
- `components/history/HistoryList.js` - History display

### ✅ Screens
- `screens/Header.js` - App header
- `screens/MainTabs.js` - Main navigation tabs
- `screens/LogsScreen.js` - Logs screen
- `screens/HistoryScreen.js` - History screen

### ✅ Main App
- `App.js` - Refactored main component

## 🚧 Yang Masih Perlu Dibuat

### 1. RequestScreen.js
Screen untuk request tab yang berisi:
- URL input
- Method picker
- Headers editor
- Body editor
- Send button
- Response display
- SSL info display
- Method picker modal
- SSL info modal

### 2. SettingsScreen.js
Screen untuk settings tab yang berisi:
- SSL settings toggles
- Timeout selector
- Info text

### 3. Response Components
- `components/response/ResponseViewer.js`
- `components/response/SecurityHeaders.js`
- `components/response/ErrorDisplay.js`
- `components/response/SSLInfo.js`

### 4. Request Components (Additional)
- `components/request/MethodPicker.js`
- `components/request/URLInput.js`
- `components/request/BodyEditor.js`

### 5. Settings Components
- `components/settings/SettingItem.js`
- `components/settings/TimeoutSelector.js`

## 🎨 Keuntungan Struktur Baru

### 1. **Reusability**
```jsx
// Sebelum: Copy-paste code
// Sesudah: Import component
import { Button, Badge } from './src/components';

<Button title="Send" onPress={sendRequest} />
<Badge text="200 OK" variant="success" />
```

### 2. **Maintainability**
```jsx
// Sebelum: Edit 1 file besar (2000+ lines)
// Sesudah: Edit file kecil yang spesifik
// src/services/sslService.js (fokus SSL logic saja)
```

### 3. **Testability**
```jsx
// Sebelum: Sulit test individual logic
// Sesudah: Test per module
import { formatJson } from './utils/formatters';
test('formatJson works', () => {
  expect(formatJson({a: 1})).toBe('{\n  "a": 1\n}');
});
```

### 4. **Separation of Concerns**
```jsx
// Business Logic    → services/
// State Management  → hooks/
// UI Components     → components/
// Utilities         → utils/
// Constants         → constants/
```

## 🔧 Cara Menggunakan

### Install Dependencies
```bash
# Same as before
npm install
# or
yarn install
```

### Run Project
```bash
# Same as before
npm start
# or
yarn start
```

## 📖 Best Practices

### 1. Import Order
```jsx
// External libraries
import React from 'react';

// Constants
import { TABS } from './constants/app';

// Hooks
import { useLogger } from './hooks/useLogger';

// Services
import { checkSSL } from './services/sslService';

// Components
import { Button } from './components';
```

### 2. Props Drilling Alternative
Jika props drilling terlalu dalam, gunakan:
- Context API untuk global state
- Redux untuk complex state management
- Zustand untuk simple state management

### 3. File Naming
- Components: PascalCase (Button.js, HeadersEditor.js)
- Utilities: camelCase (formatters.js, logger.js)
- Constants: camelCase (app.js, colors.js)
- Hooks: usePrefix (useLogger.js, useHistory.js)

## 🚀 Next Steps

1. Buat remaining screens:
   - RequestScreen.js
   - SettingsScreen.js

2. Buat remaining components:
   - Response components
   - Additional request components
   - Settings components

3. Optional improvements:
   - Add TypeScript
   - Add tests (Jest + React Testing Library)
   - Add Storybook for component documentation
   - Add error boundaries
   - Add performance optimization (React.memo, useMemo)

## 💡 Tips

### Jika Masih Pakai Code Lama:
1. Copy paste seluruh folder `src/` ke project
2. Update import di App.js
3. Jalakan dan test

### Jika Mau Full Migration:
1. Buat remaining components satu per satu
2. Test setiap component secara isolated
3. Integrate ke main App.js
4. Remove old code setelah yakin works

## ⚠️ Notes

- Styles tetap inline di setiap component untuk memudahkan development
- Bisa dipindah ke separate stylesheet file jika prefer
- Logger class membantu centralize logging logic
- Hooks membantu reuse stateful logic
- Services membantu isolate business logic dari UI

## 📞 Support

Jika ada pertanyaan tentang struktur atau cara migration, feel free to ask!
