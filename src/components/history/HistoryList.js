// src/components/history/HistoryList.js

import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';
import { EmptyState } from '../common/EmptyState';

export const HistoryList = ({ history, onLoadHistory }) => {
  if (history.length === 0) {
    return (
      <EmptyState
        icon="🕒"
        title="Belum ada history"
        subtitle="History request akan tersimpan otomatis"
      />
    );
  }

  return (
    <ScrollView style={styles.historyList}>
      {history.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.historyItem}
          onPress={() => onLoadHistory(item)}
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
  );
};

const styles = StyleSheet.create({
  historyList: {
    flex: 1,
  },
  historyItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  historyItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  historyMethodBadge: {
    backgroundColor: COLORS.primary,
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
    backgroundColor: COLORS.sslValid,
  },
  historyStatusError: {
    backgroundColor: COLORS.sslInvalid,
  },
  historyStatusText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  historyUrl: {
    fontSize: 14,
    color: COLORS.textPrimary,
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
    backgroundColor: COLORS.lightGray,
  },
  historySSLText: {
    fontSize: 11,
    fontWeight: "600",
  },
  historySSLValid: {
    color: COLORS.success,
  },
  historySSLInvalid: {
    color: COLORS.error,
  },
  historySSLRenegotiation: {
    color: COLORS.secondary,
  },
  historyFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  historyTimestamp: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  historyDuration: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  historyTapHint: {
    fontSize: 11,
    color: COLORS.primary,
    marginTop: 8,
    fontStyle: "italic",
  },
});
