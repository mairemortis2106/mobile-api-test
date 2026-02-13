import React from "react";
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
import COLORS from "../constants/colors";

const formatJson = (data) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

export const RequestScreen = ({
  url,
  setUrl,
  method,
  setMethod,
  headers,
  addHeader,
  removeHeader,
  updateHeader,
  body,
  setBody,
  activeTab,
  setActiveTab,
  loading,
  onSendRequest,
  onSSLCheck,
  response,
  sslInfo,
  sslSettings,
  showMethodPicker,
  setShowMethodPicker,
  showSslModal,
  setShowSslModal,
  methods,
}) => {
  return (
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
          onPress={onSendRequest}
          disabled={loading || !url}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Send Request</Text>
          )}
        </TouchableOpacity>

        {/* Quick SSL Check Button */}
        {url.startsWith("https://") && (
          <TouchableOpacity
            style={styles.sslCheckButton}
            onPress={onSSLCheck}
          >
            <Text style={styles.sslCheckButtonText}>
              {sslSettings.logHandshake
                ? "🔍 Deep SSL Analysis"
                : "🔒 Quick SSL Check"}
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
                  onChangeText={(text) => updateHeader(index, "value", text)}
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

          <View
            style={[
              styles.sslStatusBadge,
              sslInfo.isValid ? styles.sslStatusValid : styles.sslStatusInvalid,
            ]}
          >
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
                  <Text style={styles.sslDetailValue}>
                    {sslInfo.handshakeTime}ms
                  </Text>
                </View>
              )}
              <View style={styles.sslDetailRow}>
                <Text style={styles.sslDetailLabel}>Connection Time:</Text>
                <Text style={styles.sslDetailValue}>
                  {sslInfo.connectionTime}ms
                </Text>
              </View>

              {sslInfo.details && (
                <>
                  {sslInfo.details.sessionReused !== undefined && (
                    <View style={styles.sslDetailRow}>
                      <Text style={styles.sslDetailLabel}>Session Reused:</Text>
                      <Text
                        style={[
                          styles.sslDetailValue,
                          sslInfo.details.sessionReused
                            ? styles.sslSuccess
                            : styles.sslWarning,
                        ]}
                      >
                        {sslInfo.details.sessionReused ? "✅ Yes" : "❌ No"}
                      </Text>
                    </View>
                  )}
                  {sslInfo.details.renegotiationSupported !== undefined && (
                    <View style={styles.sslDetailRow}>
                      <Text style={styles.sslDetailLabel}>Renegotiation:</Text>
                      <Text
                        style={[
                          styles.sslDetailValue,
                          sslInfo.details.renegotiationSupported
                            ? styles.sslSuccess
                            : styles.sslWarning,
                        ]}
                      >
                        {sslInfo.details.renegotiationSupported
                          ? "✅ Supported"
                          : "⚠️ Not Supported"}
                      </Text>
                    </View>
                  )}
                  {sslInfo.details.tlsVersion && (
                    <View style={styles.sslDetailRow}>
                      <Text style={styles.sslDetailLabel}>TLS Version:</Text>
                      <Text style={styles.sslDetailValue}>
                        {sslInfo.details.tlsVersion}
                      </Text>
                    </View>
                  )}
                  {sslInfo.details.cipherSuite && (
                    <View style={styles.sslDetailRow}>
                      <Text style={styles.sslDetailLabel}>Cipher Suite:</Text>
                      <Text style={styles.sslDetailValue}>
                        {sslInfo.details.cipherSuite}
                      </Text>
                    </View>
                  )}
                </>
              )}

              {sslInfo.details && sslInfo.details.note && (
                <View style={styles.sslNote}>
                  <Text style={styles.sslNoteText}>
                    ℹ️ {sslInfo.details.note}
                  </Text>
                </View>
              )}

              {sslInfo.possibleCauses && sslInfo.possibleCauses.length > 0 && (
                <View style={styles.sslErrorCauses}>
                  <Text style={styles.sslErrorTitle}>Possible Causes:</Text>
                  {sslInfo.possibleCauses.map((cause, idx) => (
                    <Text key={idx} style={styles.sslErrorCause}>
                      • {cause}
                    </Text>
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
              <Text style={styles.securityHeadersTitle}>
                🛡️ Security Headers
              </Text>
              {Object.entries(response.securityHeaders).map(([key, value]) => (
                <View key={key} style={styles.securityHeaderRow}>
                  <Text style={styles.securityHeaderKey}>{key}:</Text>
                  <Text
                    style={[
                      styles.securityHeaderValue,
                      value
                        ? styles.securityHeaderPresent
                        : styles.securityHeaderMissing,
                    ]}
                  >
                    {value || "❌ Missing"}
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
                <Text style={styles.debugText}>Error: {response.error}</Text>
                <Text style={styles.debugTip}>
                  💡 Cek tab Logs untuk detail lengkap handshake & network
                  activity
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
            {sslSettings.logHandshake
              ? "Analyzing TLS handshake..."
              : "Mengirim request..."}
          </Text>
        </View>
      )}
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
                <View
                  style={[
                    styles.sslModalStatus,
                    sslInfo.isValid
                      ? styles.sslModalStatusValid
                      : styles.sslModalStatusInvalid,
                  ]}
                >
                  <Text style={styles.sslModalStatusText}>
                    {sslInfo.message}
                  </Text>
                </View>

                {sslInfo.isHttps && (
                  <ScrollView style={styles.sslModalDetails}>
                    <Text style={styles.sslModalDetailText}>
                      Protocol: {sslInfo.protocol}
                    </Text>
                    <Text style={styles.sslModalDetailText}>
                      Hostname: {sslInfo.hostname}
                    </Text>
                    <Text style={styles.sslModalDetailText}>
                      Port: {sslInfo.port}
                    </Text>
                    {sslInfo.handshakeTime > 0 && (
                      <Text style={styles.sslModalDetailText}>
                        Handshake: {sslInfo.handshakeTime}ms
                      </Text>
                    )}
                    <Text style={styles.sslModalDetailText}>
                      Connection: {sslInfo.connectionTime}ms
                    </Text>

                    {sslInfo.details && (
                      <>
                        {sslInfo.details.tlsVersion && (
                          <Text style={styles.sslModalDetailText}>
                            TLS: {sslInfo.details.tlsVersion}
                          </Text>
                        )}
                        {sslInfo.details.cipherSuite && (
                          <Text style={styles.sslModalDetailText}>
                            Cipher: {sslInfo.details.cipherSuite}
                          </Text>
                        )}
                        {sslInfo.details.sessionReused !== undefined && (
                          <Text style={styles.sslModalDetailText}>
                            Session Reused:{" "}
                            {sslInfo.details.sessionReused ? "✅ Yes" : "❌ No"}
                          </Text>
                        )}
                        {sslInfo.details.renegotiationSupported !==
                          undefined && (
                          <Text style={styles.sslModalDetailText}>
                            Renegotiation:{" "}
                            {sslInfo.details.renegotiationSupported
                              ? "✅ Supported"
                              : "⚠️ Not Supported"}
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
    </ScrollView>
  );
};
const styles = StyleSheet.create({
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