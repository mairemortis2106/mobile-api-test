# Component Architecture Diagram

## 🏗️ Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         App.js                               │
│  • Main application state                                    │
│  • Orchestrates screens & services                           │
│  • Handles navigation between tabs                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ uses
                              ▼
        ┌─────────────────────────────────────────┐
        │           Custom Hooks                   │
        ├─────────────────────────────────────────┤
        │  • useLogger()    → Logging state       │
        │  • useHistory()   → History state       │
        └─────────────────────────────────────────┘
                              │
                              │ calls
                              ▼
        ┌─────────────────────────────────────────┐
        │            Services                      │
        ├─────────────────────────────────────────┤
        │  • apiService     → HTTP requests       │
        │  • sslService     → SSL/TLS checks      │
        └─────────────────────────────────────────┘
                              │
                              │ uses
                              ▼
        ┌─────────────────────────────────────────┐
        │             Utils                        │
        ├─────────────────────────────────────────┤
        │  • formatters     → Data formatting     │
        │  • logger         → Logger class        │
        └─────────────────────────────────────────┘
```

## 📱 Screen Structure

```
App
├── Header (always visible)
│   └── App title & subtitle
│
├── MainTabs (navigation)
│   ├── Request Tab
│   ├── Logs Tab
│   ├── History Tab
│   └── Settings Tab
│
└── Content (conditional rendering based on active tab)
    │
    ├── RequestScreen (when Request tab active)
    │   ├── URLInput
    │   ├── MethodPicker
    │   ├── RequestTabs (Headers/Body)
    │   │   ├── HeadersEditor
    │   │   └── BodyEditor
    │   ├── Button (Send Request)
    │   ├── Button (SSL Check)
    │   ├── ResponseViewer
    │   │   ├── StatusBadge
    │   │   ├── SecurityHeaders
    │   │   └── ResponseBody
    │   └── SSLInfo
    │
    ├── LogsScreen (when Logs tab active)
    │   ├── Header (title + clear button)
    │   ├── Legend
    │   └── LogsList
    │       └── LogItem (repeated)
    │
    ├── HistoryScreen (when History tab active)
    │   ├── Header (title + clear button)
    │   └── HistoryList
    │       └── HistoryItem (repeated)
    │
    └── SettingsScreen (when Settings tab active)
        ├── SettingItem (SSL verify)
        ├── SettingItem (Handshake logging)
        ├── SettingItem (Follow redirects)
        ├── TimeoutSelector
        └── InfoSection
```

## 🔄 Data Flow

### Request Flow
```
User Input
    │
    ▼
RequestScreen
    │
    ├──► HeadersEditor ──► Update headers state
    ├──► BodyEditor ────► Update body state
    ├──► URLInput ──────► Update URL state
    └──► MethodPicker ──► Update method state
    │
    ▼
Send Request Button Clicked
    │
    ▼
App.js (sendRequest)
    │
    ├──► sslService.checkSSLCertificate()
    │    │
    │    ├──► logger.ssl()
    │    └──► Returns SSL info
    │
    └──► apiService.sendAPIRequest()
         │
         ├──► logger.request()
         ├──► fetch()
         ├──► logger.response()
         └──► Returns response data
    │
    ▼
Update Response State
    │
    ├──► ResponseViewer renders
    ├──► SSLInfo renders
    └──► Add to History
         │
         └──► useHistory.addToHistory()
```

### Logging Flow
```
Any Action
    │
    ▼
Service/Component calls logger
    │
    ▼
logger.info/error/ssl/etc()
    │
    ▼
Logger class
    │
    └──► Calls logCallback
         │
         ▼
useLogger hook
    │
    └──► Updates logs state
         │
         ▼
LogsScreen re-renders
    │
    └──► LogsList displays new logs
```

### History Flow
```
Request Completed
    │
    ▼
App.js
    │
    └──► addToHistory(requestData, responseData, sslData)
         │
         ▼
useHistory hook
    │
    ├──► Creates history entry
    ├──► Updates history state (max 50 items)
    └──► Triggers re-render
         │
         ▼
HistoryScreen
    │
    └──► HistoryList displays entries
         │
         └──► User taps item
              │
              ▼
         loadFromHistory()
              │
              ▼
         Updates request states
              │
              └──► Switches to Request tab
```

## 🧩 Component Relationships

### Common Components (Shared)
```
Button ◄────┬─── RequestScreen
            ├─── LogsScreen
            ├─── HistoryScreen
            └─── SettingsScreen

Badge ◄─────┬─── ResponseViewer
            ├─── SSLInfo
            └─── HistoryItem

EmptyState ◄┬─── LogsList (when empty)
            └─── HistoryList (when empty)
```

### Request Components
```
RequestScreen
    ├─── uses ───► URLInput
    ├─── uses ───► MethodPicker
    ├─── uses ───► HeadersEditor
    ├─── uses ───► BodyEditor
    ├─── uses ───► ResponseViewer
    └─── uses ───► SSLInfo
```

### Service Dependencies
```
apiService
    ├─── uses ───► logger (from utils)
    └─── returns ─► { success, data }

sslService
    ├─── uses ───► logger (from utils)
    ├─── uses ───► formatters (from utils)
    └─── returns ─► sslInfo object
```

## 📦 Module Dependencies

```
App.js
    │
    ├──► imports constants/app
    ├──► imports constants/colors
    │
    ├──► imports hooks/useLogger
    ├──► imports hooks/useHistory
    │
    ├──► imports services/sslService
    ├──► imports services/apiService
    │
    ├──► imports screens/Header
    ├──► imports screens/MainTabs
    ├──► imports screens/RequestScreen
    ├──► imports screens/LogsScreen
    ├──► imports screens/HistoryScreen
    └──► imports screens/SettingsScreen

Screens
    │
    ├──► import components (from components/index)
    └──► import constants/colors

Components
    │
    └──► import constants/colors

Hooks
    │
    ├──► import utils/logger
    ├──► import utils/formatters
    └──► import constants/app

Services
    │
    ├──► import utils/logger
    └──► import utils/formatters

Utils
    │
    └──► import constants/app (logger only)
```

## 🎨 State Management

```
App.js State Tree
│
├── Request State
│   ├── url: string
│   ├── method: string
│   ├── headers: Array<{key, value}>
│   ├── body: string
│   ├── loading: boolean
│   ├── response: object | null
│   └── activeTab: string
│
├── SSL State
│   ├── sslSettings: object
│   └── sslInfo: object | null
│
├── UI State
│   ├── mainTab: string
│   ├── showMethodPicker: boolean
│   └── showSslModal: boolean
│
├── Logger State (from useLogger hook)
│   └── logs: Array<LogEntry>
│
└── History State (from useHistory hook)
    └── history: Array<HistoryEntry>
```

## 🔍 Component Props Flow

### RequestScreen Props
```jsx
<RequestScreen
  // Input states
  url={url}
  setUrl={setUrl}
  method={method}
  setMethod={setMethod}
  headers={headers}
  body={body}
  setBody={setBody}
  
  // Header management
  addHeader={addHeader}
  removeHeader={removeHeader}
  updateHeader={updateHeader}
  
  // Tab state
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  
  // Actions
  loading={loading}
  onSendRequest={sendRequest}
  onSSLCheck={handleSSLCheck}
  
  // Response data
  response={response}
  sslInfo={sslInfo}
  sslSettings={sslSettings}
  
  // Modal states
  showMethodPicker={showMethodPicker}
  setShowMethodPicker={setShowMethodPicker}
  showSslModal={showSslModal}
  setShowSslModal={setShowSslModal}
  
  // Constants
  methods={HTTP_METHODS}
/>
```

### LogsScreen Props
```jsx
<LogsScreen
  logs={logs}
  onClearLogs={handleClearLogs}
  sslSettings={sslSettings}
/>
```

### HistoryScreen Props
```jsx
<HistoryScreen
  history={history}
  onClearHistory={handleClearHistory}
  onLoadHistory={handleLoadFromHistory}
/>
```

### SettingsScreen Props
```jsx
<SettingsScreen
  sslSettings={sslSettings}
  onSettingsChange={handleSSLSettingsChange}
/>
```

---

## 💡 Key Principles

1. **Single Responsibility**: Each component has one job
2. **Unidirectional Data Flow**: Props down, events up
3. **Separation of Concerns**: UI ≠ Logic ≠ Data
4. **Reusability**: DRY (Don't Repeat Yourself)
5. **Composability**: Small pieces, combined together
6. **Predictability**: Same input → Same output

---

This diagram helps understand:
- How components are organized
- How data flows through the app
- Which components depend on which
- Where to add new features
- How to debug issues
