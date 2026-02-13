// src/utils/formatters.js

export const formatJson = (data) => {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
};

export const formatTimestamp = () => {
  return new Date().toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    fractionalSecondDigits: 3 
  });
};

export const formatDateTime = () => {
  return new Date().toLocaleString('id-ID');
};

export const formatBytes = (bytes) => {
  return (bytes / 1024).toFixed(2) + ' KB';
};

export const formatDuration = (ms) => {
  return `${ms}ms`;
};

export const generateSessionId = (length = 32) => {
  return Array.from({length}, () => 
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('');
};

export const generateSerialNumber = (length = 16) => {
  return Array.from({length}, () => 
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join(':');
};
