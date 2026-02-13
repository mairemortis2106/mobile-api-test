// src/components/logs/LogsList.js

import React from 'react';
import { ScrollView, View, Text, StyleSheet, Platform } from 'react-native';
import { LOG_ICONS, LOG_COLORS } from '../../constants/app';
import COLORS from '../../constants/colors';
import { EmptyState } from '../common/EmptyState';

export const LogsList = ({ logs, sslSettings }) => {
  if (logs.length === 0) {
    return (
      <EmptyState
        icon="📝"
        title="Belum ada logs"
        subtitle={
          sslSettings.logHandshake 
            ? 'Logs handshake detail akan muncul saat request HTTPS'
            : 'Enable "Detailed Handshake Logging" di Settings untuk log lengkap'
        }
      />
    );
  }

  return (
    <ScrollView style={styles.logsList}>
      {logs.map((log) => (
        <View key={log.id} style={styles.logItem}>
          <View style={styles.logHeader}>
            <Text style={styles.logTimestamp}>{log.timestamp}</Text>
            <View style={[
              styles.logTypeBadge, 
              { backgroundColor: LOG_COLORS[log.type] + '20' }
            ]}>
              <Text style={[
                styles.logTypeText, 
                { color: LOG_COLORS[log.type] }
              ]}>
                {LOG_ICONS[log.type]} {log.type.toUpperCase()}
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
  );
};

const styles = StyleSheet.create({
  logsList: {
    flex: 1,
  },
  logItem: {
    backgroundColor: COLORS.white,
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
    color: COLORS.textMuted,
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
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  logMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  logDataContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
    maxHeight: 150,
  },
  logData: {
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: '#555',
  },
});
