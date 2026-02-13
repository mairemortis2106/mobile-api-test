// src/screens/LogsScreen.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LogsList } from '../components';
import COLORS from '../constants/colors';

export const LogsScreen = ({ logs, onClearLogs, sslSettings }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Network Logs</Text>
        <TouchableOpacity style={styles.clearButton} onPress={onClearLogs}>
          <Text style={styles.clearButtonText}>🗑️ Clear</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Log Categories:</Text>
        <View style={styles.legendItems}>
          <Text style={styles.legendItem}>🌐 DNS • 🔌 TCP • 🤝 Handshake</Text>
          <Text style={styles.legendItem}>🔒 SSL • 📤 Request • 📥 Response</Text>
        </View>
      </View>

      <LogsList logs={logs} sslSettings={sslSettings} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  clearButton: {
    backgroundColor: COLORS.error,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  clearButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
  },
  legend: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: '#0369a1',
    marginBottom: 6,
  },
  legendItems: {
    gap: 4,
  },
  legendItem: {
    fontSize: 12,
    color: '#0c4a6e',
  },
});
