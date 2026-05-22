import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface ToastProps {
  visible: boolean;
  message: string;
  onHide: () => void;
}

export const Toast = ({ visible, message, onHide }: ToastProps) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 50,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        hide();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hide = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onHide());
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.content}>
        <View style={styles.iconBox}>
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
        </View>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    zIndex: 1000,
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  iconBox: {
    marginRight: 10,
  },
  message: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
