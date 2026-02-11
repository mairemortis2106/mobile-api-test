import React, { useState } from "react";
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

  const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"];

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

  const sendRequest = async () => {
    setLoading(true);
    setResponse(null);

    const startTime = Date.now();

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

      // 🔍 LOG REQUEST DETAILS
      console.log("=== 📤 REQUEST START ===");
      console.log("URL:", url);
      console.log("Method:", method);
      console.log("Headers:", JSON.stringify(requestHeaders, null, 2));
      if (options.body) {
        console.log("Body:", options.body);
      }
      console.log("========================\n");

      const res = await fetch(url, options);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // 🔍 LOG RESPONSE HEADERS
      console.log("=== 📥 RESPONSE RECEIVED ===");
      console.log("Status:", res.status, res.statusText);
      console.log("Duration:", duration + "ms");
      
      const responseHeaders = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
        console.log(`Header [${key}]:`, value);
      });

      let data;
      let rawResponse = "";
      const contentType = res.headers.get("content-type");

      console.log("\n--- Response Body ---");
      
      if (contentType && contentType.includes("application/json")) {
        rawResponse = await res.text();
        console.log("Raw JSON Response:", rawResponse);
        try {
          data = JSON.parse(rawResponse);
          console.log("Parsed JSON:", JSON.stringify(data, null, 2));
        } catch (parseError) {
          console.error("❌ JSON Parse Error:", parseError.message);
          data = rawResponse;
        }
      } else {
        data = await res.text();
        console.log("Text Response:", data);
      }

      console.log("========================\n");

      const responseSize = new TextEncoder().encode(rawResponse || JSON.stringify(data)).length;

      setResponse({
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        headers: responseHeaders,
        data: data,
        duration: duration,
        size: responseSize,
        requestDetails: {
          url,
          method,
          headers: requestHeaders,
          body: options.body || null,
        },
      });

      console.log("✅ Request completed successfully\n");

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // 🔍 DETAILED ERROR LOGGING
      console.log("=== ❌ REQUEST FAILED ===");
      console.log("Error Name:", error.name);
      console.log("Error Message:", error.message);
      console.log("Error Stack:", error.stack);
      console.log("Duration:", duration + "ms");
      console.log("URL:", url);
      console.log("Method:", method);
      
      // Check common error types
      let errorType = "Unknown Error";
      let errorDetails = error.message;
      
      if (error.message.includes("Network request failed")) {
        errorType = "Network Error";
        errorDetails = "Tidak bisa connect ke server. Kemungkinan:\n" +
          "• URL salah atau server down\n" +
          "• CORS issue (server tidak allow request dari mobile)\n" +
          "• Device tidak ada internet\n" +
          "• Server certificate invalid (SSL/HTTPS)";
        console.log("🔴 Network Error Detected");
        console.log("Possible causes:");
        console.log("- Invalid URL or server is down");
        console.log("- CORS policy blocking the request");
        console.log("- No internet connection");
        console.log("- SSL/TLS certificate issues");
      } else if (error.message.includes("timeout")) {
        errorType = "Timeout Error";
        errorDetails = "Request timeout - server terlalu lama respond";
        console.log("⏱️ Timeout Error");
      } else if (error.message.includes("JSON")) {
        errorType = "Parse Error";
        errorDetails = "Response bukan JSON yang valid";
        console.log("📝 JSON Parse Error");
      }
      
      console.log("========================\n");

      setResponse({
        status: 0,
        statusText: "Error",
        ok: false,
        error: error.message,
        errorType: errorType,
        errorDetails: errorDetails,
        duration: duration,
        requestDetails: {
          url,
          method,
          headers: headers.reduce((acc, h) => {
            if (h.key && h.value) acc[h.key] = h.value;
            return acc;
          }, {}),
          body: body || null,
        },
      });
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🚀 API Tester</Text>
          <Text style={styles.headerSubtitle}>Mobile Edition</Text>
        </View>

        <ScrollView style={styles.scrollView}>
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
                    {Object.keys(response.requestDetails.headers).length > 0 && (
                      <Text style={styles.debugText}>
                        Headers: {JSON.stringify(response.requestDetails.headers, null, 2)}
                      </Text>
                    )}
                    {response.requestDetails.body && (
                      <Text style={styles.debugText}>
                        Body: {response.requestDetails.body}
                      </Text>
                    )}
                    <Text style={styles.debugText}>
                      Error: {response.error}
                    </Text>
                    <Text style={styles.debugTip}>
                      💡 Cek console/terminal VS Code untuk log detail
                    </Text>
                  </View>
                </View>
              )}

              {/* Success Response */}
              {!response.error && (
                <>
                  <ScrollView style={styles.responseBody} nestedScrollEnabled>
                    <Text style={styles.responseText}>
                      {formatJson(response.data)}
                    </Text>
                  </ScrollView>
                  
                  {/* Request Details Collapsible */}
                  <TouchableOpacity
                    style={styles.debugToggle}
                    onPress={() => {
                      console.log("=== 📋 REQUEST/RESPONSE SUMMARY ===");
                      console.log("Request URL:", response.requestDetails.url);
                      console.log("Request Method:", response.requestDetails.method);
                      console.log("Request Headers:", response.requestDetails.headers);
                      console.log("Request Body:", response.requestDetails.body);
                      console.log("Response Status:", response.status);
                      console.log("Response Headers:", response.headers);
                      console.log("Response Data:", response.data);
                      console.log("===================================\n");
                    }}
                  >
                    <Text style={styles.debugToggleText}>
                      🔍 Log full request/response to console
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Mengirim request...</Text>
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
    fontSize: 14,
    color: "#f0f0ff",
    textAlign: "center",
    marginTop: 4,
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
  debugToggle: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#667eea",
  },
  debugToggleText: {
    fontSize: 13,
    color: "#667eea",
    textAlign: "center",
    fontWeight: "600",
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
});