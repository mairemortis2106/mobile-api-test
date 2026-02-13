// src/screens/Header.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../constants/colors';

export const Header = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>🚀 API Tester Pro</Text>
      <Text style={styles.headerSubtitle}>with Advanced TLS Monitoring</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
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
});
