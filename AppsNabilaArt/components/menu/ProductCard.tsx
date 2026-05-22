import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '@/utils/format';

interface ProductCardProps {
  title: string;
  weight: string;
  price: number;
  tags: string[];
  image?: any;       // local asset require()
  imageUrl?: string; // remote URL string
  onPress?: () => void;
  onAddPress?: () => void;
}

export const ProductCard = ({ title, weight, price, tags, image, imageUrl, onPress, onAddPress }: ProductCardProps) => {
  const imageSource = imageUrl ? { uri: imageUrl } : image;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        {imageSource ? (
          <Image source={imageSource} style={styles.image} contentFit="contain" />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="flower-outline" size={40} color={Colors.pink.text} />
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.weight}>{weight}</Text>
        <Text style={styles.price}>{formatCurrency(price)}</Text>
        
        <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
          <Text style={styles.addButtonText}>+ Tambah</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 170,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FEEAF1',
    shadowColor: Colors.pink.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    height: 120,
    backgroundColor: Colors.pink.secondary,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  image: {
    width: '80%',
    height: '80%',
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.pink.text,
  },
  weight: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.pink.text,
  },
  addButton: {
    backgroundColor: Colors.pink.primary,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  }
});
