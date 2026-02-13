import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch, ScrollView } from "react-native";
import COLORS from "../constants/colors";

export const SettingsScreen = ({ sslSettings, onSettingsChange }) => {
  return (
    <ScrollView style={styles.scrollView}>
    <View style={styles.settingsContainer}>
      <Text style={styles.settingsTitle}>⚙️ Request Settings</Text>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>🔒 Verify SSL Certificate</Text>
          <Text style={styles.settingDescription}>
            Validasi SSL certificate sebelum mengirim request. Disable untuk
            bypass error SSL (not recommended).
          </Text>
        </View>
        <Switch
          value={sslSettings.verifySsl}
          onValueChange={(value) => {
            onSettingsChange("verifySsl", value);
          }}
          trackColor={{ false: "#d1d5db", true: "#667eea" }}
          thumbColor={sslSettings.verifySsl ? "#fff" : "#f4f3f4"}
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>🔍 Detailed Handshake Logging</Text>
          <Text style={styles.settingDescription}>
            Log detail TLS handshake termasuk DNS, TCP, Certificate, Key
            Exchange, dan Renegotiation info
          </Text>
        </View>
        <Switch
          value={sslSettings.logHandshake}
          onValueChange={(value) => {
            onSettingsChange("Detailed Handshake", value);
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
            onSettingsChange("Follow Redirects", value);
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
                  sslSettings.timeout === timeout && styles.timeoutOptionActive,
                ]}
                onPress={() => {
                  setSslSettings({ ...sslSettings, timeout });
                  addLog(
                    "info",
                    "⚙️ Settings Changed",
                    `Timeout: ${timeout / 1000}s`,
                  );
                }}
              >
                <Text
                  style={[
                    styles.timeoutOptionText,
                    sslSettings.timeout === timeout &&
                      styles.timeoutOptionTextActive,
                  ]}
                >
                  {timeout / 1000}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.settingsInfo}>
        <Text style={styles.settingsInfoTitle}>
          ℹ️ About TLS Handshake & Renegotiation
        </Text>
        <Text style={styles.settingsInfoText}>
          <Text style={styles.settingsInfoBold}>TLS Handshake</Text> adalah
          proses awal untuk establish secure connection. Tahapannya:
          {"\n\n"}1. 🌐 DNS Resolution - Resolve hostname ke IP address
          {"\n"}2. 🔌 TCP Connection - Establish TCP socket
          {"\n"}3. 🤝 TLS Handshake - Negosiasi cipher & certificate
          {"\n"}4. 🔑 Key Exchange - Generate shared secret
          {"\n"}5. ✅ Encrypted Connection Ready
          {"\n\n"}
          <Text style={styles.settingsInfoBold}>TLS Renegotiation</Text>{" "}
          memungkinkan client dan server untuk re-negotiate connection
          parameters tanpa memutus koneksi. Berguna untuk:
          {"\n"}• Refresh encryption keys
          {"\n"}• Change cipher suite
          {"\n"}• Request client certificates
          {"\n\n"}
          ⚠️{" "}
          <Text style={styles.settingsInfoBold}>
            React Native Limitation:
          </Text>{" "}
          Detail certificate seperti expiry date, issuer, dan renegotiation
          events tidak bisa diakses langsung. Logs ini adalah simulasi
          berdasarkan connection behavior.
          {"\n\n"}
          💡 Untuk monitoring real TLS handshake di production, gunakan native
          module seperti react-native-ssl-pinning atau proxy tools seperti
          Charles/mitmproxy.
        </Text>
      </View>
    </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  settingsContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  scrollView: {
    flex: 1
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
});
