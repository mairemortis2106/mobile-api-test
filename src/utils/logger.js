// src/utils/logger.js

import { formatTimestamp } from './formatters';

export class Logger {
  constructor(logCallback) {
    this.logCallback = logCallback;
  }

  log(type, title, message, data = null) {
    const timestamp = formatTimestamp();
    
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp,
      type,
      title,
      message,
      data: data ? JSON.stringify(data, null, 2) : null,
    };
    
    if (this.logCallback) {
      this.logCallback(logEntry);
    }
    
    console.log(`[${timestamp}] ${title}:`, message, data || '');
    
    return logEntry;
  }

  info(title, message, data) {
    return this.log('info', title, message, data);
  }

  success(title, message, data) {
    return this.log('success', title, message, data);
  }

  error(title, message, data) {
    return this.log('error', title, message, data);
  }

  request(title, message, data) {
    return this.log('request', title, message, data);
  }

  response(title, message, data) {
    return this.log('response', title, message, data);
  }

  ssl(title, message, data) {
    return this.log('ssl', title, message, data);
  }

  handshake(title, message, data) {
    return this.log('handshake', title, message, data);
  }

  dns(title, message, data) {
    return this.log('dns', title, message, data);
  }

  tcp(title, message, data) {
    return this.log('tcp', title, message, data);
  }
}
