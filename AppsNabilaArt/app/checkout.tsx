import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/utils/format';
import { Toast } from '@/components/ui/Toast';
import { sendOrderConfirmation } from '@/services/whatsapp';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart, totalPrice, clearCart } = useCart();
  const [toastVisible, setToastVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('transfer');

  const handleOrder = () => {
    if (!form.name || !form.phone || !form.address) {
      alert('Mohon isi semua data wajib.');
      return;
    }
    setToastVisible(true);
    
    // Generate Random Order ID
    const orderId = `INV-${Math.floor(100000 + Math.random() * 900000)}`;

    setTimeout(() => {
      clearCart();
      sendOrderConfirmation(orderId, formatCurrency(totalPrice));
      router.replace('/(tabs)');
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : insets.top }]}>
      <Toast
        visible={toastVisible}
        message="Pesanan berhasil dibuat! Admin akan segera menghubungi Anda."
        onHide={() => { }}
      />

      {/* Header dengan Back Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Konfirmasi Pesanan</Text>
        <View style={{ width: 30 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Penerima</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan nama Anda"
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nomor Telepon / WhatsApp</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: 08123456789"
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(text) => setForm({ ...form, phone: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Alamat Lengkap</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Masukkan alamat pengiriman detail"
                multiline
                numberOfLines={4}
                value={form.address}
                onChangeText={(text) => setForm({ ...form, address: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Catatan (Opsional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Misal: Titip di satpam"
                value={form.notes}
                onChangeText={(text) => setForm({ ...form, notes: text })}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
            
            <TouchableOpacity 
              style={[styles.paymentMethod, paymentMethod === 'transfer' && styles.paymentMethodActive]}
              onPress={() => setPaymentMethod('transfer')}
            >
              <View style={styles.paymentLeft}>
                <Ionicons name="card-outline" size={24} color={paymentMethod === 'transfer' ? Colors.pink.primary : Colors.pink.dark} />
                <Text style={[styles.paymentText, paymentMethod === 'transfer' && styles.paymentTextActive]}>Transfer Bank</Text>
              </View>
              {paymentMethod === 'transfer' && <Ionicons name="checkmark-circle" size={24} color={Colors.pink.primary} />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.paymentMethod, paymentMethod === 'qris' && styles.paymentMethodActive]}
              onPress={() => setPaymentMethod('qris')}
            >
              <View style={styles.paymentLeft}>
                <Ionicons name="qr-code-outline" size={24} color={paymentMethod === 'qris' ? Colors.pink.primary : Colors.pink.dark} />
                <Text style={[styles.paymentText, paymentMethod === 'qris' && styles.paymentTextActive]}>QRIS (E-Wallet)</Text>
              </View>
              {paymentMethod === 'qris' && <Ionicons name="checkmark-circle" size={24} color={Colors.pink.primary} />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.paymentMethod, paymentMethod === 'cod' && styles.paymentMethodActive]}
              onPress={() => setPaymentMethod('cod')}
            >
              <View style={styles.paymentLeft}>
                <Ionicons name="cash-outline" size={24} color={paymentMethod === 'cod' ? Colors.pink.primary : Colors.pink.dark} />
                <Text style={[styles.paymentText, paymentMethod === 'cod' && styles.paymentTextActive]}>Cash on Delivery (COD)</Text>
              </View>
              {paymentMethod === 'cod' && <Ionicons name="checkmark-circle" size={24} color={Colors.pink.primary} />}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Pembayaran</Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalPrice)}</Text>
        </View>
        <TouchableOpacity style={styles.orderButton} onPress={handleOrder}>
          <Text style={styles.orderButtonText}>Konfirmasi Pesanan</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pink.secondary,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111' },
  scrollContent: { padding: 20 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 15 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, color: '#666', marginBottom: 8, fontWeight: '600' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#333'
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10
  },
  paymentMethodActive: {
    borderColor: Colors.pink.primary,
    backgroundColor: Colors.pink.soft,
  },
  paymentLeft: { flexDirection: 'row', alignItems: 'center' },
  paymentText: { marginLeft: 12, fontSize: 16, fontWeight: '600', color: '#333' },
  paymentTextActive: { color: Colors.pink.primary },
  footer: { backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingBottom: 35 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  totalLabel: { fontSize: 16, color: '#666' },
  totalAmount: { fontSize: 22, fontWeight: '900', color: Colors.pink.dark },
  orderButton: { backgroundColor: Colors.pink.primary, paddingVertical: 18, borderRadius: 20, alignItems: 'center' },
  orderButtonText: { color: '#fff', fontSize: 18, fontWeight: '800' }
});
