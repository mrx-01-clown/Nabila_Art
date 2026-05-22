import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';

interface CategoryItemProps {
  label: string;
  isActive?: boolean;
  onPress?: () => void;
}

export const CategoryItem = ({ label, isActive, onPress }: CategoryItemProps) => {
  return (
    <TouchableOpacity 
      style={[styles.container, isActive && styles.activeContainer]} 
      onPress={onPress}
    >
      <Text style={[styles.text, isActive && styles.activeText]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
  },
  activeContainer: {
    backgroundColor: Colors.pink.primary,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.pink.text,
  },
  activeText: {
    color: '#fff',
  },
});
