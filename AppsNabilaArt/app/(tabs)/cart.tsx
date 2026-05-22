import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, StatusBar as RNStatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/utils/format';

export default function CartScreen() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity } = useCart();
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);

  // Initialize selected items with all cart items
  React.useEffect(() => {
    if (selectedItems.length === 0 && cart.length > 0) {
      setSelectedItems(cart.map(item => item.id));
    }
  }, [cart.length]);

  const toggleSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map(item => item.id));
    }
  };

  const selectedTotal = cart
    .filter(item => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const selectedCount = selectedItems.length;

  if (cart.length === 0) {
    // ... empty state remains the same ...
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Keranjang</Text>
        </View>
        <ScrollView contentContainerStyle={styles.emptyContent}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="cart-outline" size={80} color={Colors.pink.primary} />
          </View>
          <Text style={styles.emptyTitle}>Keranjang Kosong</Text>
          <Text style={styles.emptySubtitle}>Wah, sepertinya kamu belum memilih bunga cantik untuk hari ini.</Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/catalog')}>
            <Text style={styles.shopButtonText}>Belanja Sekarang</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Keranjang ({cart.length})</Text>
        <TouchableOpacity onPress={toggleSelectAll}>
          <Text style={styles.selectAllText}>
            {selectedItems.length === cart.length ? 'Batal Semua' : 'Pilih Semua'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.cartList}>
        {cart.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <TouchableOpacity 
              style={[styles.checkbox, selectedItems.includes(item.id) && styles.checkboxActive]}
              onPress={() => toggleSelect(item.id)}
            >
              {selectedItems.includes(item.id) && <Ionicons name="checkmark" size={14} color="#fff" />}
            </TouchableOpacity>

            <View style={styles.itemImagePlaceholder}>
              <Ionicons name="flower-outline" size={24} color={Colors.pink.dark} />
            </View>

            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
              
              <View style={styles.quantityContainer}>
                <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.qtyBtn}>
                  <Ionicons name="remove" size={16} color={Colors.pink.dark} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={styles.qtyBtn}>
                  <Ionicons name="add" size={16} color={Colors.pink.dark} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeButton}>
              <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>Total ({selectedCount} item)</Text>
            <Text style={styles.totalAmount}>{formatCurrency(selectedTotal)}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.checkoutButton, selectedCount === 0 && styles.btnDisabled]}
            onPress={() => selectedCount > 0 && router.push('/checkout')}
            disabled={selectedCount === 0}
          >
            <Text style={styles.checkoutText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FBFAFC',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  header: { 
    padding: 20, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111' },
  selectAllText: { color: Colors.pink.dark, fontWeight: '700' },
  emptyContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIconContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.pink.soft, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 10 },
  emptySubtitle: { textAlign: 'center', color: '#999', lineHeight: 22, marginBottom: 30 },
  shopButton: { backgroundColor: Colors.pink.dark, paddingHorizontal: 30, paddingVertical: 15, borderRadius: 30 },
  shopButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cartList: { padding: 20 },
  cartItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  checkboxActive: { backgroundColor: Colors.pink.primary, borderColor: Colors.pink.primary },
  itemImagePlaceholder: { width: 60, height: 60, borderRadius: 12, backgroundColor: Colors.pink.soft, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  itemPrice: { fontSize: 14, color: Colors.pink.dark, marginTop: 2, fontWeight: '700' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.pink.soft, justifyContent: 'center', alignItems: 'center' },
  qtyText: { marginHorizontal: 15, fontSize: 16, fontWeight: '700' },
  removeButton: { padding: 5, alignSelf: 'flex-start' },
  footer: { backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingBottom: 35 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, color: '#666', fontWeight: '600' },
  totalAmount: { fontSize: 20, fontWeight: '900', color: Colors.pink.dark },
  checkoutButton: { backgroundColor: Colors.pink.primary, paddingHorizontal: 35, paddingVertical: 15, borderRadius: 15 },
  btnDisabled: { backgroundColor: '#E5E7EB' },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});
