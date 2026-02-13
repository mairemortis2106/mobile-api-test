// src/hooks/useHistory.js

import { useState, useCallback } from 'react';
import { formatDateTime } from '../utils/formatters';
import { MAX_HISTORY_ITEMS } from '../constants/app';

export const useHistory = () => {
  const [history, setHistory] = useState([]);

  const addToHistory = useCallback((requestData, responseData, sslData = null) => {
    const historyEntry = {
      id: Date.now(),
      timestamp: formatDateTime(),
      method: requestData.method,
      url: requestData.url,
      status: responseData.status,
      statusText: responseData.statusText,
      duration: responseData.duration,
      ok: responseData.ok,
      requestDetails: requestData,
      responseDetails: responseData,
      sslInfo: sslData,
    };
    
    setHistory(prev => [historyEntry, ...prev].slice(0, MAX_HISTORY_ITEMS));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const loadFromHistory = useCallback((historyItem) => {
    return {
      url: historyItem.requestDetails.url,
      method: historyItem.requestDetails.method,
      headers: Object.entries(historyItem.requestDetails.headers || {}).map(([key, value]) => ({
        key,
        value,
      })),
      body: historyItem.requestDetails.body || "",
    };
  }, []);

  return {
    history,
    addToHistory,
    clearHistory,
    loadFromHistory,
  };
};
