// src/constants/app.js

export const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export const DEFAULT_URL = "https://jsonplaceholder.typicode.com/posts/1";

export const TIMEOUT_OPTIONS = [10000, 30000, 60000, 120000];

export const LOG_TYPES = {
  REQUEST: 'request',
  RESPONSE: 'response',
  SUCCESS: 'success',
  ERROR: 'error',
  SSL: 'ssl',
  HANDSHAKE: 'handshake',
  DNS: 'dns',
  TCP: 'tcp',
  INFO: 'info',
};

export const LOG_ICONS = {
  [LOG_TYPES.REQUEST]: '📤',
  [LOG_TYPES.RESPONSE]: '📥',
  [LOG_TYPES.SUCCESS]: '✅',
  [LOG_TYPES.ERROR]: '❌',
  [LOG_TYPES.SSL]: '🔒',
  [LOG_TYPES.HANDSHAKE]: '🤝',
  [LOG_TYPES.DNS]: '🌐',
  [LOG_TYPES.TCP]: '🔌',
  [LOG_TYPES.INFO]: 'ℹ️',
};

export const LOG_COLORS = {
  [LOG_TYPES.REQUEST]: '#3b82f6',
  [LOG_TYPES.RESPONSE]: '#8b5cf6',
  [LOG_TYPES.SUCCESS]: '#10b981',
  [LOG_TYPES.ERROR]: '#ef4444',
  [LOG_TYPES.SSL]: '#f59e0b',
  [LOG_TYPES.HANDSHAKE]: '#14b8a6',
  [LOG_TYPES.DNS]: '#06b6d4',
  [LOG_TYPES.TCP]: '#8b5cf6',
  [LOG_TYPES.INFO]: '#6b7280',
};

export const TABS = {
  REQUEST: 'request',
  LOGS: 'logs',
  HISTORY: 'history',
  SETTINGS: 'settings',
};

export const REQUEST_TABS = {
  HEADERS: 'headers',
  BODY: 'body',
};

export const DEFAULT_SSL_SETTINGS = {
  verifySsl: true,
  followRedirects: true,
  timeout: 30000,
  logHandshake: true,
};

export const MAX_HISTORY_ITEMS = 50;
