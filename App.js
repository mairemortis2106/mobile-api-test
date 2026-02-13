// App.js - Refactored Version

import React, { useState } from "react";
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from "react-native";

// Constants
import { 
  HTTP_METHODS, 
  DEFAULT_URL, 
  DEFAULT_SSL_SETTINGS, 
  TABS, 
  REQUEST_TABS 
} from "./src/constants/app";
import COLORS from "./src/constants/colors";

// Hooks
import { useLogger } from "./src/hooks/useLogger";
import { useHistory } from "./src/hooks/useHistory";

// Services
import { checkSSLCertificate } from "./src/services/sslService";
import { sendAPIRequest } from "./src/services/apiService";

// Screens
import { Header } from "./src/screens/Header";
import { MainTabs } from "./src/screens/MainTabs";
import { RequestScreen } from "./src/screens/RequestScreen";
import { LogsScreen } from "./src/screens/LogsScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";

export default function App() {
  // Main state
  const [url, setUrl] = useState(DEFAULT_URL);
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState([{ key: "", value: "" }]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [activeTab, setActiveTab] = useState(REQUEST_TABS.HEADERS);
  const [mainTab, setMainTab] = useState(TABS.REQUEST);
  
  // SSL state
  const [sslSettings, setSslSettings] = useState(DEFAULT_SSL_SETTINGS);
  const [sslInfo, setSslInfo] = useState(null);
  
  // Modals
  const [showMethodPicker, setShowMethodPicker] = useState(false);
  const [showSslModal, setShowSslModal] = useState(false);
  
  // Custom hooks
  const { logs, logger, clearLogs } = useLogger();
  const { history, addToHistory, clearHistory, loadFromHistory } = useHistory();

  // Header management
  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const removeHeader = (index) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index, field, value) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  // Handle SSL check
  const handleSSLCheck = async () => {
    const result = await checkSSLCertificate(url, sslSettings, logger);
    setSslInfo(result);
    setShowSslModal(true);
  };

  // Main request handler
  const sendRequest = async () => {
    setLoading(true);
    setResponse(null);
    setSslInfo(null);

    // Check SSL before sending request
    let sslCheckResult = null;
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol === 'https:') {
        if (sslSettings.logHandshake) {
          logger.ssl('🔒 Detailed SSL Check', 'Starting comprehensive SSL/TLS analysis...');
        } else {
          logger.ssl('🔒 Quick SSL Check', 'Verifying SSL/TLS certificate...');
        }
        
        sslCheckResult = await checkSSLCertificate(url, sslSettings, logger);
        setSslInfo(sslCheckResult);
        
        if (!sslCheckResult.isValid && sslSettings.verifySsl) {
          logger.error('⛔ SSL Verification Failed', 'Request cancelled due to invalid SSL certificate');
          
          setResponse({
            status: 0,
            statusText: "SSL Error",
            ok: false,
            error: "SSL Certificate Invalid",
            errorType: "SSL Verification Error",
            errorDetails: "SSL certificate verification failed. Disable 'Verify SSL' in settings to bypass (not recommended for production).",
            duration: 0,
            sslInfo: sslCheckResult,
            requestDetails: {
              url,
              method,
              headers: {},
              body: null,
            },
          });
          
          setLoading(false);
          return;
        }
      }
    } catch (urlError) {
      logger.error('❌ Invalid URL', urlError.message);
    }

    // Send the actual request
    const result = await sendAPIRequest(
      url,
      method,
      headers,
      body,
      sslSettings,
      logger,
      sslCheckResult
    );

    setResponse(result.data);
    
    // Add to history
    const requestData = {
      url,
      method,
      headers: headers.reduce((acc, h) => {
        if (h.key && h.value) acc[h.key] = h.value;
        return acc;
      }, {}),
      body: body || null,
    };
    
    addToHistory(requestData, result.data, sslCheckResult);
    setLoading(false);
  };

  // Handle load from history
  const handleLoadFromHistory = (historyItem) => {
    const loaded = loadFromHistory(historyItem);
    setUrl(loaded.url);
    setMethod(loaded.method);
    setHeaders(loaded.headers.length > 0 ? loaded.headers : [{ key: "", value: "" }]);
    setBody(loaded.body);
    setMainTab(TABS.REQUEST);
    logger.info('📋 Loaded from History', `${historyItem.method} ${historyItem.url}`);
  };

  // Handle clear logs with confirmation
  const handleClearLogs = () => {
    Alert.alert(
      "Clear Logs",
      "Hapus semua log?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Hapus", 
          style: "destructive",
          onPress: clearLogs
        },
      ]
    );
  };

  // Handle clear history with confirmation
  const handleClearHistory = () => {
    Alert.alert(
      "Clear History",
      "Hapus semua history?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Hapus", 
          style: "destructive",
          onPress: () => {
            clearHistory();
            logger.info('🗑️ History Cleared', 'Semua history telah dihapus');
          }
        },
      ]
    );
  };

  // Handle SSL settings change
  const handleSSLSettingsChange = (key, value) => {
    setSslSettings(prev => ({ ...prev, [key]: value }));
    logger.info('⚙️ Settings Changed', `${key}: ${value}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <Header />
        
        <MainTabs 
          activeTab={mainTab} 
          onTabChange={setMainTab} 
        />

        {mainTab === TABS.REQUEST && (
          <RequestScreen
            url={url}
            setUrl={setUrl}
            method={method}
            setMethod={setMethod}
            headers={headers}
            addHeader={addHeader}
            removeHeader={removeHeader}
            updateHeader={updateHeader}
            body={body}
            setBody={setBody}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            loading={loading}
            onSendRequest={sendRequest}
            onSSLCheck={handleSSLCheck}
            response={response}
            sslInfo={sslInfo}
            sslSettings={sslSettings}
            showMethodPicker={showMethodPicker}
            setShowMethodPicker={setShowMethodPicker}
            showSslModal={showSslModal}
            setShowSslModal={setShowSslModal}
            methods={HTTP_METHODS}
          />
        )}

        {mainTab === TABS.LOGS && (
          <LogsScreen
            logs={logs}
            onClearLogs={handleClearLogs}
            sslSettings={sslSettings}
          />
        )}

        {mainTab === TABS.HISTORY && (
          <HistoryScreen
            history={history}
            onClearHistory={handleClearHistory}
            onLoadHistory={handleLoadFromHistory}
          />
        )}

        {mainTab === TABS.SETTINGS && (
          <SettingsScreen
            sslSettings={sslSettings}
            onSettingsChange={handleSSLSettingsChange}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
});
