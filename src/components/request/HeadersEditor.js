// src/components/request/HeadersEditor.js

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';

export const HeadersEditor = ({ headers, onUpdate, onAdd, onRemove }) => {
  return (
    <View style={styles.container}>
      {headers.map((header, index) => (
        <View key={index} style={styles.headerRow}>
          <TextInput
            style={[styles.headerInput, { flex: 1 }]}
            value={header.key}
            onChangeText={(text) => onUpdate(index, "key", text)}
            placeholder="Key"
            placeholderTextColor="#999"
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.headerInput, { flex: 1, marginLeft: 8 }]}
            value={header.value}
            onChangeText={(text) => onUpdate(index, "value", text)}
            placeholder="Value"
            placeholderTextColor="#999"
            autoCapitalize="none"
          />
          {headers.length > 1 && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onRemove(index)}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={onAdd}>
        <Text style={styles.addButtonText}>+ Add Header</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  headerInput: {
    backgroundColor: COLORS.background,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    fontSize: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
  },
  removeButton: {
    backgroundColor: COLORS.error,
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
    backgroundColor: COLORS.lightGray,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
  },
  addButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});
