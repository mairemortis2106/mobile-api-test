// src/hooks/useLogger.js

import { useState, useCallback } from 'react';
import { Logger } from '../utils/logger';

export const useLogger = () => {
  const [logs, setLogs] = useState([]);

  const addLog = useCallback((logEntry) => {
    setLogs(prev => [logEntry, ...prev]);
  }, []);

  const logger = new Logger(addLog);

  const clearLogs = useCallback(() => {
    setLogs([]);
    logger.info('🗑️ Logs Cleared', 'Semua log telah dihapus');
  }, []);

  return {
    logs,
    logger,
    clearLogs,
  };
};
