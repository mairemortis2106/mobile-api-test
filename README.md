# 🚀 API Tester Pro - Refactored

A professional React Native API testing application with advanced TLS/SSL monitoring capabilities.

## ✨ Features

- 📡 **Full HTTP Methods** - GET, POST, PUT, PATCH, DELETE
- 🔒 **Advanced SSL/TLS Monitoring** - Detailed handshake logging
- 📋 **Network Activity Logs** - DNS, TCP, Handshake tracking
- 🕒 **Request History** - Automatically saved (last 50 requests)
- ⚙️ **Customizable Settings** - SSL verification, timeout, etc
- 🛡️ **Security Headers Check** - HSTS, CSP, X-Frame-Options
- 📊 **Performance Metrics** - Duration, payload size, throughput

## 📁 Project Structure

```
api-tester-pro/
├── App.js                          # Main application
├── src/
│   ├── components/                 # Reusable UI components
│   │   ├── common/                # Generic components
│   │   ├── request/               # Request-specific
│   │   ├── logs/                  # Logs-specific
│   │   ├── history/               # History-specific
│   │   └── index.js               # Export barrel
│   ├── screens/                   # Screen components
│   │   ├── Header.js
│   │   ├── MainTabs.js
│   │   ├── LogsScreen.js
│   │   └── HistoryScreen.js
│   ├── services/                  # Business logic
│   │   ├── apiService.js
│   │   └── sslService.js
│   ├── hooks/                     # Custom React hooks
│   │   ├── useLogger.js
│   │   └── useHistory.js
│   ├── utils/                     # Utilities
│   │   ├── formatters.js
│   │   └── logger.js
│   └── constants/                 # Constants
│       ├── app.js
│       └── colors.js
├── MIGRATION_GUIDE.md             # Migration documentation
└── README.md                      # This file
```

## 🏗️ Architecture

### Separation of Concerns

1. **Components** - Pure UI, no business logic
2. **Services** - Business logic, API calls, SSL checks
3. **Hooks** - Stateful logic reuse
4. **Utils** - Pure functions, helpers
5. **Constants** - Configuration, enums

### Component Hierarchy

```
App
├── Header
├── MainTabs
├── RequestScreen (to be created)
│   ├── URLInput
│   ├── MethodPicker
│   ├── HeadersEditor
│   ├── BodyEditor
│   ├── ResponseViewer
│   └── SSLInfo
├── LogsScreen
│   └── LogsList
├── HistoryScreen
│   └── HistoryList
└── SettingsScreen (to be created)
    └── SettingsList
```

## 🔧 Installation

```bash
# Clone repository
git clone <your-repo-url>

# Navigate to directory
cd api-tester-pro

# Install dependencies
npm install
# or
yarn install

# Run on iOS
npx react-native run-ios

# Run on Android
npx react-native run-android
```

## 📚 Usage

### Basic Request

1. Enter API URL
2. Select HTTP method
3. (Optional) Add headers
4. (Optional) Add request body
5. Click "Send Request"
6. View response

### SSL/TLS Monitoring

1. Enter HTTPS URL
2. Enable "Detailed Handshake Logging" in Settings
3. Send request
4. View detailed logs in Logs tab

### Using History

1. View past requests in History tab
2. Tap any history item to reload request
3. Modify and resend

## 🎯 Key Components

### Hooks

#### `useLogger`
Manages logging state and provides logger instance.

```jsx
const { logs, logger, clearLogs } = useLogger();

logger.info('Title', 'Message', { data: 'value' });
logger.error('Error Title', 'Error message');
```

#### `useHistory`
Manages request history state.

```jsx
const { 
  history, 
  addToHistory, 
  clearHistory, 
  loadFromHistory 
} = useHistory();

addToHistory(requestData, responseData, sslData);
const loaded = loadFromHistory(historyItem);
```

### Services

#### `apiService.js`
Handles HTTP requests with monitoring.

```jsx
import { sendAPIRequest } from './services/apiService';

const result = await sendAPIRequest(
  url, method, headers, body, 
  sslSettings, logger, sslCheckResult
);
```

#### `sslService.js`
Handles SSL/TLS checks and handshake simulation.

```jsx
import { checkSSLCertificate } from './services/sslService';

const sslInfo = await checkSSLCertificate(
  url, sslSettings, logger
);
```

### Utils

#### `formatters.js`
Formatting utilities.

```jsx
import { formatJson, formatTimestamp } from './utils/formatters';

const json = formatJson({ key: 'value' });
const time = formatTimestamp();
```

#### `logger.js`
Logger class for centralized logging.

```jsx
import { Logger } from './utils/logger';

const logger = new Logger(logCallback);
logger.info('Title', 'Message');
logger.error('Error', 'Error message');
```

## 🎨 Customization

### Colors

Edit `src/constants/colors.js`:

```jsx
export const COLORS = {
  primary: '#667eea',    // Main theme color
  secondary: '#14b8a6',  // Secondary actions
  success: '#10b981',    // Success states
  error: '#ef4444',      // Error states
  // ...
};
```

### App Constants

Edit `src/constants/app.js`:

```jsx
export const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
export const TIMEOUT_OPTIONS = [10000, 30000, 60000, 120000];
export const MAX_HISTORY_ITEMS = 50;
```

## 🧪 Testing (Coming Soon)

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📦 Build

```bash
# Build for Android
cd android && ./gradlew assembleRelease

# Build for iOS
cd ios && xcodebuild -configuration Release
```

## 🔐 SSL/TLS Features

### Handshake Steps Logged

1. 🌐 **DNS Resolution** - Hostname to IP
2. 🔌 **TCP Connection** - Socket establishment
3. 📤 **TLS ClientHello** - Cipher negotiation
4. 📥 **TLS ServerHello** - Server response
5. 🔐 **Certificate Verification** - Chain validation
6. 🔑 **Key Exchange** - ECDHE key generation
7. 🔄 **ChangeCipherSpec** - Encryption enabled
8. ✅ **Finished** - Handshake complete

### TLS Information Tracked

- Protocol version (TLS 1.2/1.3)
- Cipher suite used
- Certificate details (simulated)
- Session resumption
- Renegotiation support
- OCSP stapling

## ⚠️ Important Notes

### React Native Limitations

Due to React Native limitations:
- **Certificate details are simulated** based on connection behavior
- Cannot access actual certificate chain
- Cannot see real cipher negotiation
- Cannot detect actual renegotiation events

For production SSL monitoring, consider:
- Native modules (react-native-ssl-pinning)
- Proxy tools (Charles, mitmproxy)
- Network monitoring tools

### CORS Issues

React Native apps may encounter CORS issues when:
- Server doesn't allow mobile requests
- Missing proper CORS headers
- Development vs production environments

## 🐛 Troubleshooting

### Network Request Failed

Possible causes:
- Invalid URL or server down
- CORS restrictions
- No internet connection
- SSL/TLS handshake failed
- Server rejected connection

**Solutions:**
1. Check URL validity
2. Verify server is running
3. Check internet connection
4. Try disabling SSL verification (not recommended for production)

### SSL Certificate Error

**Solutions:**
1. Ensure URL uses HTTPS
2. Check certificate validity on server
3. Disable "Verify SSL" in settings (testing only)
4. Check server TLS version support

## 🚧 Roadmap

- [ ] Complete RequestScreen component
- [ ] Complete SettingsScreen component
- [ ] Add TypeScript support
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Add E2E tests
- [ ] Add performance monitoring
- [ ] Add offline mode
- [ ] Add request collections
- [ ] Add environment variables
- [ ] Add export/import functionality
- [ ] Add GraphQL support
- [ ] Add WebSocket support

## 📄 License

MIT License - see LICENSE file

## 👥 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check MIGRATION_GUIDE.md for refactoring details

## 🙏 Acknowledgments

Built with:
- React Native
- React Hooks
- Modern JavaScript (ES6+)

---

**Note:** This is a refactored version focusing on clean architecture and maintainability. See MIGRATION_GUIDE.md for details on the refactoring process.
