import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export default function AboutUsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.pink.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tentang Kami</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imagePlaceholder}>
          <Ionicons name="flower-outline" size={80} color={Colors.pink.primary} />
        </View>
        
        <Text style={styles.title}>Nabila Art</Text>
        <Text style={styles.description}>
          Nabila Art adalah penyedia bunga premium dan dekorasi artistik yang berdedikasi untuk menghadirkan keindahan di setiap momen spesial Anda. Kami percaya bahwa setiap bunga menceritakan sebuah kisah.
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="location-outline" size={24} color={Colors.pink.dark} />
          </View>
          <View>
            <Text style={styles.infoLabel}>Alamat</Text>
            <Text style={styles.infoText}>Jakarta, Indonesia</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="call-outline" size={24} color={Colors.pink.dark} />
          </View>
          <View>
            <Text style={styles.infoLabel}>Telepon</Text>
            <Text style={styles.infoText}>+62 812-3456-7890</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail-outline" size={24} color={Colors.pink.dark} />
          </View>
          <View>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoText}>info@nabilaart.com</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    marginRight: 15,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: Colors.pink.soft,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.pink.dark,
  },
  content: {
    padding: 25,
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.pink.soft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.pink.primary,
    borderStyle: 'dashed',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.pink.dark,
    marginBottom: 10,
  },
  description: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 24,
    color: '#6B7280',
    marginBottom: 35,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFAFC',
    width: '100%',
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: Colors.pink.soft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '700',
    marginTop: 2,
  }
});
