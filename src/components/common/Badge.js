// src/components/common/Badge.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';

export const Badge = ({ 
  text, 
  variant = 'default',
  icon,
  style 
}) => {
  const getBadgeStyle = () => {
    switch(variant) {
      case 'success':
        return styles.successBadge;
      case 'error':
        return styles.errorBadge;
      case 'warning':
        return styles.warningBadge;
      case 'info':
        return styles.infoBadge;
      default:
        return styles.defaultBadge;
    }
  };

  return (
    <View style={[styles.badge, getBadgeStyle(), style]}>
      <Text style={styles.badgeText}>
        {icon && `${icon} `}{text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  defaultBadge: {
    backgroundColor: COLORS.lightGray,
  },
  successBadge: {
    backgroundColor: COLORS.sslValid,
  },
  errorBadge: {
    backgroundColor: COLORS.sslInvalid,
  },
  warningBadge: {
    backgroundColor: '#fff3cd',
  },
  infoBadge: {
    backgroundColor: '#cfe2ff',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
