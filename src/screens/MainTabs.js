// src/screens/MainTabs.js

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { TABS } from '../constants/app';
import COLORS from '../constants/colors';

export const MainTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { key: TABS.REQUEST, icon: '📡', label: 'Request' },
    { key: TABS.LOGS, icon: '📋', label: 'Logs' },
    { key: TABS.HISTORY, icon: '🕒', label: 'History' },
    { key: TABS.SETTINGS, icon: '⚙️', label: 'Settings' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          onPress={() => onTabChange(tab.key)}
        >
          <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
            {tab.icon} {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});
