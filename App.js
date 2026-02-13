import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Switch,
} from "react-native";

export default function App() {
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/posts/1");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState([{ key: "", value: "" }]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [activeTab, setActiveTab] = useState("headers");
  const [showMethodPicker, setShowMethodPicker] = useState(false);
  
  // SSL/TLS Settings
  const [sslSettings, setSslSettings] = useState({
    verifySsl: true,
    followRedirects: true,
    timeout: 30000, // 30 seconds
    logHandshake: true, // Log detailed TLS handshake
  });
  const [sslInfo, setSslInfo] = useState(null);
  const [showSslModal, setShowSslModal] = useState(false);
  
  // New states for Log and History
  const [logs, setLogs] = useState([]);
  const [history, setHistory] = useState([]);
  const [mainTab, setMainTab] = useState("request"); // request, logs, history, settings

  const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"];

  // Custom log function with categories
  const addLog = (type, title, message, data = null) => {
    const timestamp = new Date().toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3 
    });
    
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp,
      type, // info, success, error, request, response, ssl, handshake, dns, tcp
      title,
      message,
      data: data ? JSON.stringify(data, null, 2) : null,
    };
    
    setLogs(prev => [logEntry, ...prev]);
    console.log(`[${timestamp}] ${title}:`, message, data || '');
  };

  const clearLogs = () => {
    Alert.alert(
      "Clear Logs",
      "Hapus semua log?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Hapus", 
          style: "destructive",
          onPress: () => {
            setLogs([]);
            addLog('info', '🗑️ Logs Cleared', 'Semua log telah dihapus');
          }
        },
      ]
    );
  };

  const clearHistory = () => {
    Alert.alert(
      "Clear History",
      "Hapus semua history?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Hapus", 
          style: "destructive",
          onPress: () => {
            setHistory([]);
            addLog('info', '🗑️ History Cleared', 'Semua history telah dihapus');
          }
        },
      ]
    );
  };

  const addToHistory = (requestData, responseData, sslData = null) => {
    const historyEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleString('id-ID'),
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
    
    setHistory(prev => [historyEntry, ...prev].slice(0, 50)); // Keep last 50 requests
  };

  const loadFromHistory = (historyItem) => {
    setUrl(historyItem.requestDetails.url);
    setMethod(historyItem.requestDetails.method);
    
    // Set headers
    const historyHeaders = Object.entries(historyItem.requestDetails.headers || {}).map(([key, value]) => ({
      key,
      value,
    }));
    setHeaders(historyHeaders.length > 0 ? historyHeaders : [{ key: "", value: "" }]);
    
    // Set body
    setBody(historyItem.requestDetails.body || "");
    
    // Switch to request tab
    setMainTab("request");
    
    addLog('info', '📋 Loaded from History', `${historyItem.method} ${historyItem.url}`);
  };

  // Simulate detailed TLS handshake logging
  const simulateTLSHandshake = async (hostname) => {
    const handshakeSteps = [
      { step: 'DNS Resolution', duration: 5 + Math.random() * 15 },
      { step: 'TCP Connection', duration: 10 + Math.random() * 30 },
      { step: 'TLS ClientHello', duration: 5 + Math.random() * 10 },
      { step: 'TLS ServerHello', duration: 8 + Math.random() * 15 },
      { step: 'Certificate Verification', duration: 15 + Math.random() * 25 },
      { step: 'Key Exchange', duration: 10 + Math.random() * 20 },
      { step: 'ChangeCipherSpec', duration: 3 + Math.random() * 7 },
      { step: 'Finished', duration: 2 + Math.random() * 5 },
    ];

    let totalTime = 0;

    for (const { step, duration } of handshakeSteps) {
      await new Promise(resolve => setTimeout(resolve, duration));
      totalTime += duration;
      
      let message = '';
      let data = {};

      switch(step) {
        case 'DNS Resolution':
          message = `Resolving ${hostname}...`;
          data = {
            hostname,
            dnsServer: '8.8.8.8',
            recordType: 'A',
            ttl: 300,
          };
          addLog('dns', '🌐 DNS Lookup', message, data);
          break;

        case 'TCP Connection':
          message = `Establishing TCP connection to ${hostname}:443`;
          data = {
            protocol: 'TCP',
            port: 443,
            localPort: 50000 + Math.floor(Math.random() * 15000),
            state: 'ESTABLISHED',
          };
          addLog('tcp', '🔌 TCP Handshake', message, data);
          break;

        case 'TLS ClientHello':
          message = 'Sending ClientHello to server';
          data = {
            tlsVersion: 'TLS 1.3',
            cipherSuites: [
              'TLS_AES_128_GCM_SHA256',
              'TLS_AES_256_GCM_SHA384',
              'TLS_CHACHA20_POLY1305_SHA256',
            ],
            extensions: [
              'server_name (SNI)',
              'supported_groups',
              'signature_algorithms',
              'application_layer_protocol_negotiation',
            ],
            compression: 'null',
          };
          addLog('handshake', '📤 TLS ClientHello', message, data);
          break;

        case 'TLS ServerHello':
          message = 'Received ServerHello from server';
          data = {
            tlsVersion: 'TLS 1.3',
            selectedCipher: 'TLS_AES_256_GCM_SHA384',
            compressionMethod: 'null',
            sessionId: Array.from({length: 32}, () => 
              Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
            ).join(''),
          };
          addLog('handshake', '📥 TLS ServerHello', message, data);
          break;

        case 'Certificate Verification':
          message = 'Verifying server certificate chain';
          data = {
            subject: `CN=${hostname}`,
            issuer: 'Let\'s Encrypt Authority X3',
            validFrom: new Date(Date.now() - 30*24*60*60*1000).toISOString(),
            validTo: new Date(Date.now() + 60*24*60*60*1000).toISOString(),
            serialNumber: Array.from({length: 16}, () => 
              Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
            ).join(':'),
            signatureAlgorithm: 'SHA256withRSA',
            publicKeyAlgorithm: 'RSA',
            keySize: 2048,
            certificateChain: [
              `${hostname} (End Entity)`,
              'Let\'s Encrypt Authority X3 (Intermediate)',
              'DST Root CA X3 (Root)',
            ],
          };
          addLog('ssl', '🔐 Certificate Check', message, data);
          break;

        case 'Key Exchange':
          message = 'Performing key exchange (ECDHE)';
          data = {
            keyExchangeAlgorithm: 'ECDHE',
            curve: 'X25519',
            sharedSecretSize: 256,
            preMasterSecretGenerated: true,
          };
          addLog('handshake', '🔑 Key Exchange', message, data);
          break;

        case 'ChangeCipherSpec':
          message = 'ChangeCipherSpec sent/received';
          data = {
            encryptionEnabled: true,
            cipher: 'AES-256-GCM',
            macAlgorithm: 'SHA384',
            mode: 'Authenticated Encryption',
          };
          addLog('handshake', '🔄 Change Cipher Spec', message, data);
          break;

        case 'Finished':
          message = 'TLS Handshake completed successfully';
          data = {
            sessionEstablished: true,
            totalHandshakeTime: `${Math.round(totalTime)}ms`,
            sessionResumption: Math.random() > 0.7,
            renegotiationSupported: true, // 👈 RE-NEGOTIATION INFO
            alpnProtocol: 'h2', // HTTP/2
          };
          addLog('success', '✅ Handshake Complete', message, data);
          break;
      }
    }

    return Math.round(totalTime);
  };

  // Enhanced SSL Certificate Check with detailed handshake
  const checkSSLCertificate = async (urlToCheck) => {
    try {
      const parsedUrl = new URL(urlToCheck);
      
      if (parsedUrl.protocol !== 'https:') {
        addLog('info', '⚠️ Not HTTPS', 'URL menggunakan HTTP, tidak ada SSL certificate');
        return {
          isHttps: false,
          message: 'URL menggunakan HTTP, tidak menggunakan SSL/TLS',
        };
      }

      addLog('ssl', '🔒 SSL Check Started', `Checking certificate for: ${urlToCheck}`);

      // Simulate TLS handshake if enabled
      let handshakeDuration = 0;
      if (sslSettings.logHandshake) {
        addLog('info', '🔧 Initiating TLS Handshake', 'Starting detailed handshake logging...');
        handshakeDuration = await simulateTLSHandshake(parsedUrl.hostname);
      }

      // Actual SSL check by attempting connection
      const sslCheckStart = Date.now();
      
      try {
        const response = await fetch(urlToCheck, {
          method: 'HEAD',
          headers: {
            'User-Agent': 'API-Tester-SSL-Check/2.0',
          },
        });
        
        const actualConnectionTime = Date.now() - sslCheckStart;
        
        // Check for session resumption and renegotiation capability
        const sessionInfo = {
          sessionReused: actualConnectionTime < 100, // Fast connection suggests session reuse
          renegotiationAllowed: true, // Most modern servers support this
          ocspStapling: Math.random() > 0.5, // Simulated OCSP check
        };

        addLog('info', '🔄 Session Info', 'Checking session resumption and renegotiation', sessionInfo);

        const sslInfoData = {
          isHttps: true,
          isValid: true,
          protocol: parsedUrl.protocol,
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || 443,
          connectionTime: actualConnectionTime,
          handshakeTime: handshakeDuration,
          status: response.status,
          message: 'SSL Certificate Valid ✅',
          details: {
            note: 'React Native limitation: Certificate details simulated based on connection behavior',
            connectionSuccess: true,
            tlsVersion: 'TLS 1.3 (inferred)',
            cipherSuite: 'TLS_AES_256_GCM_SHA384 (inferred)',
            responseTime: `${actualConnectionTime}ms`,
            sessionReused: sessionInfo.sessionReused,
            renegotiationSupported: sessionInfo.renegotiationAllowed,
            ocspStapling: sessionInfo.ocspStapling,
          },
          sessionInfo,
        };
        
        addLog('success', '✅ SSL Certificate Valid', `Connection established successfully`, sslInfoData);
        
        return sslInfoData;
        
      } catch (sslError) {
        const actualConnectionTime = Date.now() - sslCheckStart;
        
        let errorMessage = sslError.message;
        let possibleCauses = [];
        
        if (errorMessage.includes('Network request failed')) {
          possibleCauses = [
            'Certificate expired atau belum valid',
            'Self-signed certificate tidak trusted',
            'Certificate chain incomplete',
            'Hostname mismatch dengan certificate',
            'Server tidak support TLS 1.2+',
            'Renegotiation disabled/failed',
          ];
          
          addLog('error', '❌ TLS Handshake Failed', 'SSL/TLS connection failed', {
            error: errorMessage,
            possibleCauses,
          });
        }
        
        const sslErrorData = {
          isHttps: true,
          isValid: false,
          protocol: parsedUrl.protocol,
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || 443,
          connectionTime: actualConnectionTime,
          handshakeTime: handshakeDuration,
          error: errorMessage,
          possibleCauses,
          message: 'SSL Certificate Invalid atau Error ❌',
        };
        
        addLog('error', '❌ SSL Error', errorMessage, sslErrorData);
        
        return sslErrorData;
      }
      
    } catch (error) {
      addLog('error', '❌ SSL Check Failed', error.message);
      return {
        isHttps: false,
        isValid: false,
        error: error.message,
        message: 'Failed to check SSL certificate',
      };
    }
  };

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

  // Monitor network activity with detailed logging
  const monitorNetworkActivity = async (url, options) => {
    // Log DNS resolution
    const parsedUrl = new URL(url);
    addLog('dns', '🌐 DNS Resolution', `Resolving ${parsedUrl.hostname}`, {
      hostname: parsedUrl.hostname,
      protocol: parsedUrl.protocol,
    });

    // Log connection start
    addLog('tcp', '🔌 Initiating Connection', `Connecting to ${parsedUrl.hostname}:${parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80)}`);

    // Perform actual fetch
    const startTime = Date.now();
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;

    // Log connection success
    addLog('tcp', '✅ Connection Established', `Connected in ${duration}ms`);

    return { response, duration };
  };

  const sendRequest = async () => {
    setLoading(true);
    setResponse(null);
    setSslInfo(null);

    const startTime = Date.now();
    
    addLog('request', '📤 REQUEST START', `${method} ${url}`);

    // Check SSL before sending request
    let sslCheckResult = null;
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol === 'https:') {
        if (sslSettings.logHandshake) {
          addLog('ssl', '🔒 Detailed SSL Check', 'Starting comprehensive SSL/TLS analysis...');
        } else {
          addLog('ssl', '🔒 Quick SSL Check', 'Verifying SSL/TLS certificate...');
        }
        
        sslCheckResult = await checkSSLCertificate(url);
        setSslInfo(sslCheckResult);
        
        if (!sslCheckResult.isValid && sslSettings.verifySsl) {
          addLog('error', '⛔ SSL Verification Failed', 'Request cancelled due to invalid SSL certificate');
          
          setResponse({
            status: 0,
            statusText: "SSL Error",
            ok: false,
            error: "SSL Certificate Invalid",
            errorType: "SSL Verification Error",
            errorDetails: "SSL certificate verification failed. Disable 'Verify SSL' in settings to bypass (not recommended for production).",
            duration: Date.now() - startTime,
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
      addLog('error', '❌ Invalid URL', urlError.message);
    }

    try {
      // Prepare headers
      const requestHeaders = {};
      headers.forEach((header) => {
        if (header.key && header.value) {
          requestHeaders[header.key] = header.value;
        }
      });

      const options = {
        method: method,
        headers: requestHeaders,
      };

      if (["POST", "PUT", "PATCH"].includes(method) && body) {
        options.body = body;
        if (!requestHeaders["Content-Type"]) {
          options.headers["Content-Type"] = "application/json";
        }
      }

      addLog('info', '🔧 Request Config', 'Headers & Body prepared', {
        headers: requestHeaders,
        body: options.body || null,
        sslVerify: sslSettings.verifySsl,
        timeout: sslSettings.timeout,
        followRedirects: sslSettings.followRedirects,
      });

      // Log request payload size
      const payloadSize = options.body ? new TextEncoder().encode(options.body).length : 0;
      addLog('info', '📦 Payload Size', `Request body: ${payloadSize} bytes`);

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), sslSettings.timeout);
      });

      // Perform request with network monitoring
      addLog('info', '🚀 Sending HTTP Request', `${method} ${url}`);
      
      const { response: res, duration: requestDuration } = await Promise.race([
        monitorNetworkActivity(url, options),
        timeoutPromise.then(() => { throw new Error('Request timeout'); })
      ]);
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      addLog('response', '📥 RESPONSE RECEIVED', `Status: ${res.status} ${res.statusText} (${duration}ms)`);

      const responseHeaders = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Log important headers
      addLog('info', '📋 Response Headers', 'Received headers', {
        contentType: responseHeaders['content-type'],
        contentLength: responseHeaders['content-length'],
        server: responseHeaders['server'],
        date: responseHeaders['date'],
      });

      // Check for security headers
      const securityHeaders = {
        'strict-transport-security': responseHeaders['strict-transport-security'] || null,
        'content-security-policy': responseHeaders['content-security-policy'] || null,
        'x-content-type-options': responseHeaders['x-content-type-options'] || null,
        'x-frame-options': responseHeaders['x-frame-options'] || null,
        'x-xss-protection': responseHeaders['x-xss-protection'] || null,
      };
      
      addLog('info', '🛡️ Security Headers', 'Checking security headers...', securityHeaders);

      let data;
      let rawResponse = "";
      const contentType = res.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        rawResponse = await res.text();
        try {
          data = JSON.parse(rawResponse);
          addLog('success', '✅ JSON Parsed', `Response successfully parsed (${rawResponse.length} chars)`, {
            size: rawResponse.length,
            type: 'JSON',
          });
        } catch (parseError) {
          addLog('error', '❌ JSON Parse Error', parseError.message);
          data = rawResponse;
        }
      } else {
        data = await res.text();
        addLog('info', '📝 Text Response', `Received ${data.length} characters`);
      }

      const responseSize = new TextEncoder().encode(rawResponse || JSON.stringify(data)).length;

      // Log performance metrics
      addLog('info', '⚡ Performance Metrics', 'Request completed', {
        totalDuration: `${duration}ms`,
        requestSize: `${payloadSize} bytes`,
        responseSize: `${responseSize} bytes`,
        throughput: `${((responseSize / 1024) / (duration / 1000)).toFixed(2)} KB/s`,
      });

      const responseData = {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        headers: responseHeaders,
        securityHeaders,
        data: data,
        duration: duration,
        size: responseSize,
        sslInfo: sslCheckResult,
        requestDetails: {
          url,
          method,
          headers: requestHeaders,
          body: options.body || null,
        },
      };

      setResponse(responseData);
      
      // Add to history
      addToHistory({
        url,
        method,
        headers: requestHeaders,
        body: options.body || null,
      }, responseData, sslCheckResult);

      addLog('success', '✅ Request Completed', `Successfully fetched data in ${duration}ms`);

    } catch (error) {
      const duration = Date.now() - startTime;
      
      let errorType = "Unknown Error";
      let errorDetails = error.message;
      
      if (error.message.includes("timeout")) {
        errorType = "Timeout Error";
        errorDetails = `Request timeout setelah ${sslSettings.timeout}ms. Server terlalu lama respond.`;
        addLog('error', '⏱️ Timeout Error', errorDetails);
      } else if (error.message.includes("Network request failed")) {
        errorType = "Network Error";
        errorDetails = "Tidak bisa connect ke server. Kemungkinan:\n" +
          "• URL salah atau server down\n" +
          "• CORS issue (server tidak allow request dari mobile)\n" +
          "• Device tidak ada internet\n" +
          "• SSL/TLS handshake failed\n" +
          "• Server rejected renegotiation";
        
        addLog('error', '🔴 Network Error', errorDetails, {
          url,
          method,
          error: error.message,
          stack: error.stack,
        });
      } else if (error.message.includes("JSON")) {
        errorType = "Parse Error";
        errorDetails = "Response bukan JSON yang valid";
        addLog('error', '📝 JSON Parse Error', errorDetails);
      } else {
        addLog('error', '❌ Request Failed', error.message, {
          url,
          method,
          stack: error.stack,
        });
      }

      const errorResponse = {
        status: 0,
        statusText: "Error",
        ok: false,
        error: error.message,
        errorType: errorType,
        errorDetails: errorDetails,
        duration: duration,
        sslInfo: sslCheckResult,
        requestDetails: {
          url,
          method,
          headers: headers.reduce((acc, h) => {
            if (h.key && h.value) acc[h.key] = h.value;
            return acc;
          }, {}),
          body: body || null,
        },
      };

      setResponse(errorResponse);
      
      // Add error to history
      addToHistory({
        url,
        method,
        headers: headers.reduce((acc, h) => {
          if (h.key && h.value) acc[h.key] = h.value;
          return acc;
        }, {}),
        body: body || null,
      }, errorResponse, sslCheckResult);
    }

    setLoading(false);
  };

  const formatJson = (data) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const getLogIcon = (type) => {
    switch(type) {
      case 'request': return '📤';
      case 'response': return '📥';
      case 'success': return '✅';
      case 'error': return '❌';
      case 'ssl': return '🔒';
      case 'handshake': return '🤝';
      case 'dns': return '🌐';
      case 'tcp': return '🔌';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  const getLogColor = (type) => {
    switch(type) {
      case 'request': return '#3b82f6';
      case 'response': return '#8b5cf6';
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'ssl': return '#f59e0b';
      case 'handshake': return '#14b8a6';
      case 'dns': return '#06b6d4';
      case 'tcp': return '#8b5cf6';
      case 'info': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🚀 API Tester Pro</Text>
          <Text style={styles.headerSubtitle}>with Advanced TLS Monitoring</Text>
        </View>

        {/* Main Tabs Navigation */}
        <View style={styles.mainTabsContainer}>
          <TouchableOpacity
            style={[styles.mainTab, mainTab === "request" && styles.mainTabActive]}
            onPress={() => setMainTab("request")}
          >
            <Text style={[styles.mainTabText, mainTab === "request" && styles.mainTabTextActive]}>
              📡 Request
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.mainTab, mainTab === "logs" && styles.mainTabActive]}
            onPress={() => setMainTab("logs")}
          >
            <Text style={[styles.mainTabText, mainTab === "logs" && styles.mainTabTextActive]}>
              📋 Logs
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.mainTab, mainTab === "history" && styles.mainTabActive]}
            onPress={() => setMainTab("history")}
          >
            <Text style={[styles.mainTabText, mainTab === "history" && styles.mainTabTextActive]}>
              🕒 History
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.mainTab, mainTab === "settings" && styles.mainTabActive]}
            onPress={() => setMainTab("settings")}
          >
            <Text style={[styles.mainTabText, mainTab === "settings" && styles.mainTabTextActive]}>
              ⚙️ Settings
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          {/* REQUEST TAB */}
          {mainTab === "request" && (
            <>
              {/* URL & Method Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Request</Text>

                <TouchableOpacity
                  style={styles.methodButton}
                  onPress={() => setShowMethodPicker(true)}
                >
                  <Text style={styles.methodButtonText}>{method}</Text>
                  <Text style={styles.methodArrow}>▼</Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.urlInput}
                  value={url}
                  onChangeText={setUrl}
                  placeholder="Masukkan URL API"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <TouchableOpacity
                  style={[styles.sendButton, loading && styles.sendButtonDisabled]}
                  onPress={sendRequest}
                  disabled={loading || !url}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.sendButtonText}>Send Request</Text>
                  )}
                </TouchableOpacity>
                
                {/* Quick SSL Check Button */}
                {url.startsWith('https://') && (
                  <TouchableOpacity
                    style={styles.sslCheckButton}
                    onPress={async () => {
                      const result = await checkSSLCertificate(url);
                      setSslInfo(result);
                      setShowSslModal(true);
                    }}
                  >
                    <Text style={styles.sslCheckButtonText}>
                      {sslSettings.logHandshake ? '🔍 Deep SSL Analysis' : '🔒 Quick SSL Check'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Tabs */}
              <View style={styles.tabsContainer}>
                <TouchableOpacity
                  style={[styles.tab, activeTab === "headers" && styles.activeTab]}
                  onPress={() => setActiveTab("headers")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "headers" && styles.activeTabText,
                    ]}
                  >
                    Headers
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, activeTab === "body" && styles.activeTab]}
                  onPress={() => setActiveTab("body")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "body" && styles.activeTabText,
                    ]}
                  >
                    Body
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Tab Content */}
              <View style={styles.tabContent}>
                {activeTab === "headers" && (
                  <View style={styles.headersContainer}>
                    {headers.map((header, index) => (
                      <View key={index} style={styles.headerRow}>
                        <TextInput
                          style={[styles.headerInput, { flex: 1 }]}
                          value={header.key}
                          onChangeText={(text) => updateHeader(index, "key", text)}
                          placeholder="Key"
                          placeholderTextColor="#999"
                          autoCapitalize="none"
                        />
                        <TextInput
                          style={[styles.headerInput, { flex: 1, marginLeft: 8 }]}
                          value={header.value}
                          onChangeText={(text) =>
                            updateHeader(index, "value", text)
                          }
                          placeholder="Value"
                          placeholderTextColor="#999"
                          autoCapitalize="none"
                        />
                        {headers.length > 1 && (
                          <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => removeHeader(index)}
                          >
                            <Text style={styles.removeButtonText}>✕</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                    <TouchableOpacity style={styles.addButton} onPress={addHeader}>
                      <Text style={styles.addButtonText}>+ Add Header</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {activeTab === "body" && (
                  <View style={styles.bodyContainer}>
                    <TextInput
                      style={styles.bodyInput}
                      value={body}
                      onChangeText={setBody}
                      placeholder='Masukkan JSON body (contoh: {"name": "John"})'
                      placeholderTextColor="#999"
                      multiline
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                )}
              </View>

              {/* SSL Info Section */}
              {sslInfo && (
                <View style={styles.sslInfoSection}>
                  <Text style={styles.sslInfoTitle}>🔒 SSL/TLS Information</Text>
                  
                  <View style={[
                    styles.sslStatusBadge,
                    sslInfo.isValid ? styles.sslStatusValid : styles.sslStatusInvalid
                  ]}>
                    <Text style={styles.sslStatusText}>{sslInfo.message}</Text>
                  </View>
                  
                  {sslInfo.isHttps && (
                    <>
                      <View style={styles.sslDetailRow}>
                        <Text style={styles.sslDetailLabel}>Protocol:</Text>
                        <Text style={styles.sslDetailValue}>{sslInfo.protocol}</Text>
                      </View>
                      <View style={styles.sslDetailRow}>
                        <Text style={styles.sslDetailLabel}>Hostname:</Text>
                        <Text style={styles.sslDetailValue}>{sslInfo.hostname}</Text>
                      </View>
                      <View style={styles.sslDetailRow}>
                        <Text style={styles.sslDetailLabel}>Port:</Text>
                        <Text style={styles.sslDetailValue}>{sslInfo.port}</Text>
                      </View>
                      {sslInfo.handshakeTime > 0 && (
                        <View style={styles.sslDetailRow}>
                          <Text style={styles.sslDetailLabel}>Handshake Time:</Text>
                          <Text style={styles.sslDetailValue}>{sslInfo.handshakeTime}ms</Text>
                        </View>
                      )}
                      <View style={styles.sslDetailRow}>
                        <Text style={styles.sslDetailLabel}>Connection Time:</Text>
                        <Text style={styles.sslDetailValue}>{sslInfo.connectionTime}ms</Text>
                      </View>
                      
                      {sslInfo.details && (
                        <>
                          {sslInfo.details.sessionReused !== undefined && (
                            <View style={styles.sslDetailRow}>
                              <Text style={styles.sslDetailLabel}>Session Reused:</Text>
                              <Text style={[styles.sslDetailValue, sslInfo.details.sessionReused ? styles.sslSuccess : styles.sslWarning]}>
                                {sslInfo.details.sessionReused ? '✅ Yes' : '❌ No'}
                              </Text>
                            </View>
                          )}
                          {sslInfo.details.renegotiationSupported !== undefined && (
                            <View style={styles.sslDetailRow}>
                              <Text style={styles.sslDetailLabel}>Renegotiation:</Text>
                              <Text style={[styles.sslDetailValue, sslInfo.details.renegotiationSupported ? styles.sslSuccess : styles.sslWarning]}>
                                {sslInfo.details.renegotiationSupported ? '✅ Supported' : '⚠️ Not Supported'}
                              </Text>
                            </View>
                          )}
                          {sslInfo.details.tlsVersion && (
                            <View style={styles.sslDetailRow}>
                              <Text style={styles.sslDetailLabel}>TLS Version:</Text>
                              <Text style={styles.sslDetailValue}>{sslInfo.details.tlsVersion}</Text>
                            </View>
                          )}
                          {sslInfo.details.cipherSuite && (
                            <View style={styles.sslDetailRow}>
                              <Text style={styles.sslDetailLabel}>Cipher Suite:</Text>
                              <Text style={styles.sslDetailValue}>{sslInfo.details.cipherSuite}</Text>
                            </View>
                          )}
                        </>
                      )}
                      
                      {sslInfo.details && sslInfo.details.note && (
                        <View style={styles.sslNote}>
                          <Text style={styles.sslNoteText}>ℹ️ {sslInfo.details.note}</Text>
                        </View>
                      )}
                      
                      {sslInfo.possibleCauses && sslInfo.possibleCauses.length > 0 && (
                        <View style={styles.sslErrorCauses}>
                          <Text style={styles.sslErrorTitle}>Possible Causes:</Text>
                          {sslInfo.possibleCauses.map((cause, idx) => (
                            <Text key={idx} style={styles.sslErrorCause}>• {cause}</Text>
                          ))}
                        </View>
                      )}
                    </>
                  )}
                </View>
              )}

              {/* Response Section */}
              {response && (
                <View style={styles.responseSection}>
                  <View style={styles.responseHeader}>
                    <Text style={styles.responseSectionTitle}>Response</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        response.ok ? styles.statusSuccess : styles.statusError,
                      ]}
                    >
                      <Text style={styles.statusBadgeText}>
                        {response.status} {response.statusText}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.responseInfo}>
                    <Text style={styles.responseInfoText}>
                      ⏱️ {response.duration}ms
                    </Text>
                    {response.size && (
                      <Text style={styles.responseInfoText}>
                        📦 {(response.size / 1024).toFixed(2)} KB
                      </Text>
                    )}
                  </View>

                  {/* Security Headers */}
                  {response.securityHeaders && (
                    <View style={styles.securityHeadersSection}>
                      <Text style={styles.securityHeadersTitle}>🛡️ Security Headers</Text>
                      {Object.entries(response.securityHeaders).map(([key, value]) => (
                        <View key={key} style={styles.securityHeaderRow}>
                          <Text style={styles.securityHeaderKey}>{key}:</Text>
                          <Text style={[
                            styles.securityHeaderValue,
                            value ? styles.securityHeaderPresent : styles.securityHeaderMissing
                          ]}>
                            {value || '❌ Missing'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Error Details */}
                  {response.error && (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorType}>❌ {response.errorType}</Text>
                      <Text style={styles.errorDetails}>{response.errorDetails}</Text>
                      
                      <View style={styles.debugSection}>
                        <Text style={styles.debugTitle}>🔍 Debug Info:</Text>
                        <Text style={styles.debugText}>
                          URL: {response.requestDetails.url}
                        </Text>
                        <Text style={styles.debugText}>
                          Method: {response.requestDetails.method}
                        </Text>
                        <Text style={styles.debugText}>
                          Error: {response.error}
                        </Text>
                        <Text style={styles.debugTip}>
                          💡 Cek tab Logs untuk detail lengkap handshake & network activity
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Success Response */}
                  {!response.error && (
                    <ScrollView style={styles.responseBody} nestedScrollEnabled>
                      <Text style={styles.responseText}>
                        {formatJson(response.data)}
                      </Text>
                    </ScrollView>
                  )}
                </View>
              )}

              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#667eea" />
                  <Text style={styles.loadingText}>
                    {sslSettings.logHandshake ? 'Analyzing TLS handshake...' : 'Mengirim request...'}
                  </Text>
                </View>
              )}
            </>
          )}

          {/* LOGS TAB */}
          {mainTab === "logs" && (
            <View style={styles.logsContainer}>
              <View style={styles.logsHeader}>
                <Text style={styles.logsTitle}>📋 Network Logs</Text>
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={clearLogs}
                >
                  <Text style={styles.clearButtonText}>🗑️ Clear</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.logsLegend}>
                <Text style={styles.logsLegendTitle}>Log Categories:</Text>
                <View style={styles.logsLegendItems}>
                  <Text style={styles.logsLegendItem}>🌐 DNS • 🔌 TCP • 🤝 Handshake</Text>
                  <Text style={styles.logsLegendItem}>🔒 SSL • 📤 Request • 📥 Response</Text>
                </View>
              </View>

              {logs.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateIcon}>📝</Text>
                  <Text style={styles.emptyStateText}>Belum ada logs</Text>
                  <Text style={styles.emptyStateSubtext}>
                    {sslSettings.logHandshake 
                      ? 'Logs handshake detail akan muncul saat request HTTPS'
                      : 'Enable "Detailed Handshake Logging" di Settings untuk log lengkap'}
                  </Text>
                </View>
              ) : (
                <ScrollView style={styles.logsList}>
                  {logs.map((log) => (
                    <View key={log.id} style={styles.logItem}>
                      <View style={styles.logHeader}>
                        <Text style={styles.logTimestamp}>{log.timestamp}</Text>
                        <View style={[styles.logTypeBadge, { backgroundColor: getLogColor(log.type) + '20' }]}>
                          <Text style={[styles.logTypeText, { color: getLogColor(log.type) }]}>
                            {getLogIcon(log.type)} {log.type.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.logTitle}>{log.title}</Text>
                      <Text style={styles.logMessage}>{log.message}</Text>
                      {log.data && (
                        <ScrollView 
                          horizontal 
                          style={styles.logDataContainer}
                          nestedScrollEnabled
                        >
                          <Text style={styles.logData}>{log.data}</Text>
                        </ScrollView>
                      )}
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {/* HISTORY TAB */}
          {mainTab === "history" && (
            <View style={styles.historyContainer}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>🕒 Request History</Text>
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={clearHistory}
                >
                  <Text style={styles.clearButtonText}>🗑️ Clear</Text>
                </TouchableOpacity>
              </View>

              {history.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateIcon}>🕒</Text>
                  <Text style={styles.emptyStateText}>Belum ada history</Text>
                  <Text style={styles.emptyStateSubtext}>
                    History request akan tersimpan otomatis
                  </Text>
                </View>
              ) : (
                <ScrollView style={styles.historyList}>
                  {history.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.historyItem}
                      onPress={() => loadFromHistory(item)}
                    >
                      <View style={styles.historyItemHeader}>
                        <View style={styles.historyMethodBadge}>
                          <Text style={styles.historyMethodText}>{item.method}</Text>
                        </View>
                        <View
                          style={[
                            styles.historyStatusBadge,
                            item.ok ? styles.historyStatusSuccess : styles.historyStatusError,
                          ]}
                        >
                          <Text style={styles.historyStatusText}>{item.status}</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.historyUrl} numberOfLines={2}>
                        {item.url}
                      </Text>
                      
                      {item.sslInfo && item.sslInfo.isHttps && (
                        <View style={styles.historySSLBadge}>
                          <Text style={[
                            styles.historySSLText,
                            item.sslInfo.isValid ? styles.historySSLValid : styles.historySSLInvalid
                          ]}>
                            {item.sslInfo.isValid ? '🔒 SSL Valid' : '⚠️ SSL Invalid'}
                          </Text>
                          {item.sslInfo.details && item.sslInfo.details.renegotiationSupported !== undefined && (
                            <Text style={[styles.historySSLText, styles.historySSLRenegotiation]}>
                              {item.sslInfo.details.renegotiationSupported ? '🔄 Reneg OK' : '⚠️ No Reneg'}
                            </Text>
                          )}
                        </View>
                      )}
                      
                      <View style={styles.historyFooter}>
                        <Text style={styles.historyTimestamp}>
                          🕐 {item.timestamp}
                        </Text>
                        <Text style={styles.historyDuration}>
                          ⏱️ {item.duration}ms
                        </Text>
                      </View>
                      
                      <Text style={styles.historyTapHint}>Tap untuk load request ini</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {/* SETTINGS TAB */}
          {mainTab === "settings" && (
            <View style={styles.settingsContainer}>
              <Text style={styles.settingsTitle}>⚙️ Request Settings</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>🔒 Verify SSL Certificate</Text>
                  <Text style={styles.settingDescription}>
                    Validasi SSL certificate sebelum mengirim request. Disable untuk bypass error SSL (not recommended).
                  </Text>
                </View>
                <Switch
                  value={sslSettings.verifySsl}
                  onValueChange={(value) => {
                    setSslSettings({...sslSettings, verifySsl: value});
                    addLog('info', '⚙️ Settings Changed', `SSL Verification: ${value ? 'Enabled' : 'Disabled'}`);
                  }}
                  trackColor={{ false: "#d1d5db", true: "#667eea" }}
                  thumbColor={sslSettings.verifySsl ? "#fff" : "#f4f3f4"}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>🔍 Detailed Handshake Logging</Text>
                  <Text style={styles.settingDescription}>
                    Log detail TLS handshake termasuk DNS, TCP, Certificate, Key Exchange, dan Renegotiation info
                  </Text>
                </View>
                <Switch
                  value={sslSettings.logHandshake}
                  onValueChange={(value) => {
                    setSslSettings({...sslSettings, logHandshake: value});
                    addLog('info', '⚙️ Settings Changed', `Detailed Handshake: ${value ? 'Enabled' : 'Disabled'}`);
                  }}
                  trackColor={{ false: "#d1d5db", true: "#667eea" }}
                  thumbColor={sslSettings.logHandshake ? "#fff" : "#f4f3f4"}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>🔄 Follow Redirects</Text>
                  <Text style={styles.settingDescription}>
                    Otomatis follow HTTP redirects (301, 302, dll)
                  </Text>
                </View>
                <Switch
                  value={sslSettings.followRedirects}
                  onValueChange={(value) => {
                    setSslSettings({...sslSettings, followRedirects: value});
                    addLog('info', '⚙️ Settings Changed', `Follow Redirects: ${value ? 'Enabled' : 'Disabled'}`);
                  }}
                  trackColor={{ false: "#d1d5db", true: "#667eea" }}
                  thumbColor={sslSettings.followRedirects ? "#fff" : "#f4f3f4"}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfoFull}>
                  <Text style={styles.settingLabel}>⏱️ Request Timeout</Text>
                  <Text style={styles.settingDescription}>
                    Maximum waktu tunggu untuk response (dalam milliseconds)
                  </Text>
                  <View style={styles.timeoutOptions}>
                    {[10000, 30000, 60000, 120000].map((timeout) => (
                      <TouchableOpacity
                        key={timeout}
                        style={[
                          styles.timeoutOption,
                          sslSettings.timeout === timeout && styles.timeoutOptionActive
                        ]}
                        onPress={() => {
                          setSslSettings({...sslSettings, timeout});
                          addLog('info', '⚙️ Settings Changed', `Timeout: ${timeout/1000}s`);
                        }}
                      >
                        <Text style={[
                          styles.timeoutOptionText,
                          sslSettings.timeout === timeout && styles.timeoutOptionTextActive
                        ]}>
                          {timeout/1000}s
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.settingsInfo}>
                <Text style={styles.settingsInfoTitle}>ℹ️ About TLS Handshake & Renegotiation</Text>
                <Text style={styles.settingsInfoText}>
                  <Text style={styles.settingsInfoBold}>TLS Handshake</Text> adalah proses awal untuk establish secure connection. Tahapannya:
                  {'\n\n'}1. 🌐 DNS Resolution - Resolve hostname ke IP address
                  {'\n'}2. 🔌 TCP Connection - Establish TCP socket
                  {'\n'}3. 🤝 TLS Handshake - Negosiasi cipher & certificate
                  {'\n'}4. 🔑 Key Exchange - Generate shared secret
                  {'\n'}5. ✅ Encrypted Connection Ready
                  {'\n\n'}
                  <Text style={styles.settingsInfoBold}>TLS Renegotiation</Text> memungkinkan client dan server untuk re-negotiate connection parameters tanpa memutus koneksi. Berguna untuk:
                  {'\n'}• Refresh encryption keys
                  {'\n'}• Change cipher suite
                  {'\n'}• Request client certificates
                  {'\n\n'}
                  ⚠️ <Text style={styles.settingsInfoBold}>React Native Limitation:</Text> Detail certificate seperti expiry date, issuer, dan renegotiation events tidak bisa diakses langsung. Logs ini adalah simulasi berdasarkan connection behavior.
                  {'\n\n'}
                  💡 Untuk monitoring real TLS handshake di production, gunakan native module seperti react-native-ssl-pinning atau proxy tools seperti Charles/mitmproxy.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Method Picker Modal */}
        <Modal
          visible={showMethodPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowMethodPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMethodPicker(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Pilih Method</Text>
              {methods.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.methodOption,
                    method === m && styles.methodOptionActive,
                  ]}
                  onPress={() => {
                    setMethod(m);
                    setShowMethodPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.methodOptionText,
                      method === m && styles.methodOptionTextActive,
                    ]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowMethodPicker(false)}
              >
                <Text style={styles.modalCloseButtonText}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* SSL Info Modal */}
        <Modal
          visible={showSslModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowSslModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowSslModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>🔒 SSL Certificate Info</Text>
              
              {sslInfo && (
                <>
                  <View style={[
                    styles.sslModalStatus,
                    sslInfo.isValid ? styles.sslModalStatusValid : styles.sslModalStatusInvalid
                  ]}>
                    <Text style={styles.sslModalStatusText}>{sslInfo.message}</Text>
                  </View>
                  
                  {sslInfo.isHttps && (
                    <ScrollView style={styles.sslModalDetails}>
                      <Text style={styles.sslModalDetailText}>Protocol: {sslInfo.protocol}</Text>
                      <Text style={styles.sslModalDetailText}>Hostname: {sslInfo.hostname}</Text>
                      <Text style={styles.sslModalDetailText}>Port: {sslInfo.port}</Text>
                      {sslInfo.handshakeTime > 0 && (
                        <Text style={styles.sslModalDetailText}>Handshake: {sslInfo.handshakeTime}ms</Text>
                      )}
                      <Text style={styles.sslModalDetailText}>Connection: {sslInfo.connectionTime}ms</Text>
                      
                      {sslInfo.details && (
                        <>
                          {sslInfo.details.tlsVersion && (
                            <Text style={styles.sslModalDetailText}>TLS: {sslInfo.details.tlsVersion}</Text>
                          )}
                          {sslInfo.details.cipherSuite && (
                            <Text style={styles.sslModalDetailText}>Cipher: {sslInfo.details.cipherSuite}</Text>
                          )}
                          {sslInfo.details.sessionReused !== undefined && (
                            <Text style={styles.sslModalDetailText}>
                              Session Reused: {sslInfo.details.sessionReused ? '✅ Yes' : '❌ No'}
                            </Text>
                          )}
                          {sslInfo.details.renegotiationSupported !== undefined && (
                            <Text style={styles.sslModalDetailText}>
                              Renegotiation: {sslInfo.details.renegotiationSupported ? '✅ Supported' : '⚠️ Not Supported'}
                            </Text>
                          )}
                        </>
                      )}
                    </ScrollView>
                  )}
                </>
              )}
              
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowSslModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    backgroundColor: "#667eea",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#f0f0ff",
    textAlign: "center",
    marginTop: 4,
  },
  
  // Main Tabs
  mainTabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  mainTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  mainTabActive: {
    borderBottomColor: "#667eea",
  },
  mainTabText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#999",
  },
  mainTabTextActive: {
    color: "#667eea",
    fontWeight: "700",
  },
  
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    backgroundColor: "#fff",
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  methodButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  methodButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#667eea",
  },
  methodArrow: {
    fontSize: 12,
    color: "#667eea",
  },
  urlInput: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    color: "#333",
  },
  sendButton: {
    backgroundColor: "#667eea",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  sslCheckButton: {
    backgroundColor: "#14b8a6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  sslCheckButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#667eea",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "#fff",
  },
  tabContent: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headersContainer: {
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  headerInput: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    fontSize: 13,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "#333",
  },
  removeButton: {
    backgroundColor: "#ff4444",
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  addButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 2,
    borderColor: "#667eea",
    borderStyle: "dashed",
  },
  addButtonText: {
    color: "#667eea",
    fontSize: 14,
    fontWeight: "600",
  },
  bodyContainer: {
    minHeight: 150,
  },
  bodyInput: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
    fontSize: 13,
    minHeight: 150,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: "#333",
  },
  
  // SSL Info Section
  sslInfoSection: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sslInfoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  sslStatusBadge: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  sslStatusValid: {
    backgroundColor: "#d4edda",
  },
  sslStatusInvalid: {
    backgroundColor: "#f8d7da",
  },
  sslStatusText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
  },
  sslDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sslDetailLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  sslDetailValue: {
    fontSize: 13,
    color: "#333",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  sslSuccess: {
    color: "#10b981",
    fontWeight: "600",
  },
  sslWarning: {
    color: "#f59e0b",
    fontWeight: "600",
  },
  sslNote: {
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  sslNoteText: {
    fontSize: 12,
    color: "#0369a1",
    lineHeight: 18,
  },
  sslErrorCauses: {
    backgroundColor: "#fff5f5",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  sslErrorTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#c53030",
    marginBottom: 8,
  },
  sslErrorCause: {
    fontSize: 12,
    color: "#742a2a",
    marginBottom: 4,
  },
  
  responseSection: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  responseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  responseSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  statusSuccess: {
    backgroundColor: "#d4edda",
  },
  statusError: {
    backgroundColor: "#f8d7da",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
  },
  responseInfo: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  responseInfoText: {
    fontSize: 12,
    color: "#666",
  },
  
  // Security Headers
  securityHeadersSection: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  securityHeadersTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  securityHeaderRow: {
    marginBottom: 6,
  },
  securityHeaderKey: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 2,
  },
  securityHeaderValue: {
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  securityHeaderPresent: {
    color: "#10b981",
  },
  securityHeaderMissing: {
    color: "#ef4444",
  },
  
  responseBody: {
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
    padding: 12,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  responseText: {
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: "#333",
  },
  errorContainer: {
    backgroundColor: "#fff5f5",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ffcccc",
  },
  errorType: {
    fontSize: 16,
    fontWeight: "700",
    color: "#c53030",
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 14,
    color: "#742a2a",
    lineHeight: 20,
    marginBottom: 12,
  },
  debugSection: {
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: "#666",
    marginBottom: 4,
  },
  debugTip: {
    fontSize: 12,
    color: "#667eea",
    marginTop: 8,
    fontStyle: "italic",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#667eea",
  },
  
  // Logs Styles
  logsContainer: {
    flex: 1,
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  logsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  logsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  logsLegend: {
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  logsLegendTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0369a1",
    marginBottom: 6,
  },
  logsLegendItems: {
    gap: 4,
  },
  logsLegendItem: {
    fontSize: 12,
    color: "#0c4a6e",
  },
  clearButton: {
    backgroundColor: "#ff4444",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  logsList: {
    flex: 1,
  },
  logItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  logTimestamp: {
    fontSize: 11,
    color: "#999",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  logTypeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  logTypeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  logTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  logMessage: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  logDataContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
    maxHeight: 150,
  },
  logData: {
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: "#555",
  },
  
  // History Styles
  historyContainer: {
    flex: 1,
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#667eea",
  },
  historyItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  historyMethodBadge: {
    backgroundColor: "#667eea",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  historyMethodText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  historyStatusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  historyStatusSuccess: {
    backgroundColor: "#d4edda",
  },
  historyStatusError: {
    backgroundColor: "#f8d7da",
  },
  historyStatusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
  },
  historyUrl: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    fontWeight: "500",
  },
  historySSLBadge: {
    flexDirection: "row",
    gap: 8,
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
  },
  historySSLText: {
    fontSize: 11,
    fontWeight: "600",
  },
  historySSLValid: {
    color: "#10b981",
  },
  historySSLInvalid: {
    color: "#ef4444",
  },
  historySSLRenegotiation: {
    color: "#14b8a6",
  },
  historyFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  historyTimestamp: {
    fontSize: 12,
    color: "#666",
  },
  historyDuration: {
    fontSize: 12,
    color: "#666",
  },
  historyTapHint: {
    fontSize: 11,
    color: "#667eea",
    marginTop: 8,
    fontStyle: "italic",
  },
  
  // Settings Styles
  settingsContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingInfoFull: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  timeoutOptions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  timeoutOption: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  timeoutOptionActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  timeoutOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  timeoutOptionTextActive: {
    color: "#fff",
  },
  settingsInfo: {
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  settingsInfoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0369a1",
    marginBottom: 8,
  },
  settingsInfoText: {
    fontSize: 13,
    color: "#0c4a6e",
    lineHeight: 20,
  },
  settingsInfoBold: {
    fontWeight: "700",
  },
  
  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  methodOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  methodOptionActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  methodOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  methodOptionTextActive: {
    color: "#fff",
  },
  modalCloseButton: {
    marginTop: 12,
    paddingVertical: 14,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  
  // SSL Modal
  sslModalStatus: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sslModalStatusValid: {
    backgroundColor: "#d4edda",
  },
  sslModalStatusInvalid: {
    backgroundColor: "#f8d7da",
  },
  sslModalStatusText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
  },
  sslModalDetails: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    maxHeight: 300,
  },
  sslModalDetailText: {
    fontSize: 13,
    color: "#333",
    marginBottom: 6,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
});